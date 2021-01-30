var log = require('fancy-log');
var fs = require('fs');
var globby = require('globby');

var cleanInstanceCreationsArr = require('../../utils/').cleanInstanceCreationsArr;
var cleanLayerPointerLayers = require('../../utils/').cleanLayerPointerLayers;
var concatIgnoreRoom = require('../../utils/').concatIgnoreRoom;
var findLayerPointer = require('../../utils/').findLayerPointer;
var fixYYFile = require('../../utils/').fixYYFile;

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
      
      var finalJSON = JSON.parse(fixYYFile(fs.readFileSync(exportRoomPath, {encoding:'utf8', flag:'r'})));
      finalJSON = cleanInstanceCreationsArr(finalJSON, config.instanceCreationOrder_InsertAt);
      
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
  var workingJSON = JSON.parse(fixYYFile(fs.readFileSync(path, {encoding:'utf8', flag:'r'})));

  var workingLayerPointer = findLayerPointer(workingJSON, config.layerToInsertName);
  
  //section rooms still have the first few objects in creation
  var workingInstanceCreationOrder = workingJSON.instanceCreationOrder.slice(config.instanceCreationOrder_InsertAt);
  
  //gms 2.3 added a pathing object that needs to be updated to the main export room
  for (var i=0; i<workingInstanceCreationOrder.length; i++)
  {
    var obj = workingInstanceCreationOrder[i];
    obj.path = config.roomDir + config.exportRoom + "/" + config.exportRoom + ".yy";
  }
  
  finalJSON.instanceCreationOrder = finalJSON.instanceCreationOrder.concat(workingInstanceCreationOrder);
  
  layerPointer.layers = layerPointer.layers.concat(workingLayerPointer.layers);
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