var log = require('fancy-log');
var fs = require('fs');
var globby = require('globby');
var uuidv1 = require('uuid/v1');

var cleanInstanceCreationsArr = require('../../utils/').cleanInstanceCreationsArr;
var cleanLayerPointerLayers = require('../../utils/').cleanLayerPointerLayers;
var concatIgnoreRoom = require('../../utils/').concatIgnoreRoom;
var findLayerPointer = require('../../utils/').findLayerPointer;

var args = process.argv.splice(process.execArgv.length + 2);
var configPath = args[0] || './gms-tasks-config.json';

var scriptName = 'build';
var bigConfig = JSON.parse(fs.readFileSync(configPath));
var config = bigConfig['build-clean-snap'];
Object.assign(config, bigConfig[scriptName]);

log("Starting `" + scriptName + "`");
var time = new Date();

start(function(){
  log("Finished `" + scriptName + "` after", (((new Date()) - time) / 1000), "seconds");
});

function start(callback)
{
  return globby(config.roomDir + config.exportRoom + "/*.yy").then(function(paths){
    if (paths.length == 1)
    {
      var exportRoomPath = paths[0];
      
      var finalJSON = JSON.parse(fs.readFileSync(exportRoomPath));
      finalJSON = cleanInstanceCreationsArr(finalJSON, config.instanceCreationOrderId_InsertAt);
      
      var layerPointer = findLayerPointer(finalJSON, config.layerToInsertName);
    
      if (layerPointer)
      {
        cleanLayerPointerLayers(layerPointer);
        
        var newPattern = [
          config.roomDir + config.copyRoomPattern + "*/*.yy",
        ]
        .concat(updateIgnoreRoomsBuild())
        .concat([concatIgnoreRoom(config.exportRoom)]);
        
        return globby(newPattern).then(function(paths) {
          for (var i=0; i<paths.length; i++)
          {
            copyRoomToTheRoom(finalJSON, layerPointer, paths[i]);
          }
          
          var str = JSON.stringify(finalJSON);
          fs.writeFileSync(exportRoomPath, str);
          
          return copyInstanceCreationCode(callback);
        });
      }
      else
      {
        log("Couldn't find the layer.");
        return callback();
      }
    }
    else
    {
      log("Couldn't find export room");
      return callback();
    }
  });
}

function copyInstanceCreationCode(callback)
{
  var pattern = [
    config.roomDir + config.copyRoomPattern + "*/*.gml",
  ]
  .concat(updateIgnoreRoomsBuild())
  .concat([concatIgnoreRoom(config.exportRoom)]);
  
  return globby(pattern).then(function(paths){
    for (var i=0; i<paths.length; i++)
    {
      var path = paths[i];
      var fileName = path.substr(path.lastIndexOf("/") + 1); //get file name with extension
      
      fs.copyFileSync(path, config.roomDir + config.exportRoom + "/" + fileName);
    }
    
    return callback();
  });
}

function copyRoomToTheRoom(finalJSON, layerPointer, path)
{
  var workingJSON = JSON.parse(fs.readFileSync(path));

  var workingLayerPointer = findLayerPointer(workingJSON, config.layerToInsertName);
  
  //section rooms still have the first few objects in creation
  var workingInstanceCreationOrderIDs = workingJSON.instanceCreationOrderIDs.slice(config.instanceCreationOrderId_InsertAt);
  
  //replace the uuid with a real uuid, because the previous uuid is a copy/paste, not making it unique
  for (var i=0; i<workingInstanceCreationOrderIDs.length; i++)
  {
    var workingInstanceId = workingInstanceCreationOrderIDs[i];
    
    var uuid = uuidv1(); 
    
    replaceInstanceWithId(workingLayerPointer, workingInstanceId, uuid, false);
    workingInstanceCreationOrderIDs[i] = uuid;
  }
  
  finalJSON.instanceCreationOrderIDs = finalJSON.instanceCreationOrderIDs.concat(workingInstanceCreationOrderIDs);
  
  layerPointer.layers = layerPointer.layers.concat(workingLayerPointer.layers);
}

function replaceInstanceWithId(jsonLayer, searchId, replaceId, nested)
{
	var found = false;
	
	for (var i=0; i<jsonLayer.layers.length; i++)
	{
		var layer = jsonLayer.layers[i];
    
		if (layer.instances)
		{
			for (var j=0; j<layer.instances.length; j++)
			{
				var inst = layer.instances[j];
				
				if (inst.id === searchId)
				{
					inst.id = replaceId;
					return true;
				}
			}
		}
		
		found = replaceInstanceWithId(layer, searchId, replaceId, true);
		
		if (found)
		{
			break;
		}
	}
	
	if (!found && !nested)
	{
		log("Couldn't find the id in " + searchId + " the json.");
    process.exit();
	}
  
  return found;
}

function updateIgnoreRoomsBuild()
{
  var arr = [];
  
  for (var i in config.ignoreRoomsBuild)
  {
    var room = config.ignoreRoomsBuild[i];
    arr.push(concatIgnoreRoom(config.roomDir, room));
  }
  
  return arr;
}