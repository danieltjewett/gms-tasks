var log = require('fancy-log');
var fs = require('fs');
var globby = require('globby');

var cleanInstanceCreationsArr = require('../../utils/').cleanInstanceCreationsArr;
var cleanLayerPointerLayers = require('../../utils/').cleanLayerPointerLayers;
var findLayerPointer = require('../../utils/').findLayerPointer;

var args = process.argv.splice(process.execArgv.length + 2);
var configPath = args[0] || './gms-tasks-config.json';

var scriptName = 'clean';
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
        
        var str = JSON.stringify(finalJSON);
        fs.writeFileSync(exportRoomPath, str);
        
        return deleteInstanceCreationCode(callback);
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

function deleteInstanceCreationCode(callback)
{
  return globby(config.roomDir + config.exportRoom + "/*.gml").then(function(paths){
    for (var i=0; i<paths.length; i++)
    {
      fs.unlinkSync(paths[i]);
    }
    
    return callback();
  });
}