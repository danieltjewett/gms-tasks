var log = require('fancy-log');
var fs = require('fs');
var globby = require('globby');

var shiftPositions = require('../../utils/').shiftPositions;
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
  .concat(updateIgnoreRoomsShift());
  
  return globby(pattern).then(function(paths){
    for (var i=0; i<paths.length; i++)
    {
      var path = paths[i];
      
      var workingJSON = JSON.parse(fs.readFileSync(path));
  
      var workingLayerPointer = findLayerPointer(workingJSON, config.layerToInsertName);
      
      shiftPositions(workingLayerPointer, config.left, config.top);
      
      var str = JSON.stringify(workingJSON);
      fs.writeFileSync(path, str);
    }
    
    return callback();
  });
}

function updateIgnoreRoomsShift()
{
  var arr = [];
  
  for (var i in config.ignoreRooms)
  {
    var room = config.ignoreRooms[i];
    arr.push(concatIgnoreRoom(config.roomDir, room));
  }
  
  return arr;
}