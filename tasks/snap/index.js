var log = require('fancy-log');
var fs = require('fs');
var globby = require('globby');

var concatIgnoreRoom = require('../../utils/').concatIgnoreRoom;
var findLayerPointer = require('../../utils/').findLayerPointer;

var args = process.argv.splice(process.execArgv.length + 2);
var configPath = args[0] || './gms-tasks-config.json';

var scriptName = 'snap';
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
  var pattern = [
    config.roomDir + "**/*",
  ]
  .concat(updateIgnoreRoomsSnap());
  
  return globby(pattern).then(function(paths){
    for (var i=0; i<paths.length; i++)
    {
      var path = paths[i];
      
      var workingJSON = JSON.parse(fs.readFileSync(path));
  
      var workingLayerPointer = findLayerPointer(workingJSON, config.layerToInsertName);
      
      fixPositions(workingLayerPointer);
      
      var str = JSON.stringify(workingJSON);
      fs.writeFileSync(path, str);
    }
    
    return callback();
  });
}

function fixPositions(jsonLayer, searchId, replaceId, nested)
{
  var gridSize = config.gridSize * .5;

	for (var i=0; i<jsonLayer.layers.length; i++)
	{
		var layer = jsonLayer.layers[i];
    
		if (layer.instances)
		{
			for (var j=0; j<layer.instances.length; j++)
			{
				var inst = layer.instances[j];
				
        //log("Still need to check if instance is a wall");
        //process.exit();
        
				inst.x = Math.round(inst.x / gridSize) * gridSize;
        inst.y = Math.round(inst.y / gridSize) * gridSize;
			}
		}
		
		fixPositions(layer);
	}
}

function updateIgnoreRoomsSnap()
{
  var arr = [];
  
  for (var i in config.ignoreRoomsSnap)
  {
    var room = config.ignoreRoomsSnap[i];
    arr.push(concatIgnoreRoom(config.roomDir, room));
  }
  
  return arr;
}