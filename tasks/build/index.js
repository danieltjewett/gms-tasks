var log = require('fancy-log');
var fs = require('fs');
var globby = require('globby');

var shiftPositions = require('../../utils/').shiftPositions;
var getSectionNumFromPath = require('../../utils/').getSectionNumFromPath;
var cleanInstanceCreationsArr = require('../../utils/').cleanInstanceCreationsArr;
var cleanLayerPointerLayers = require('../../utils/').cleanLayerPointerLayers;
var concatIgnoreRoom = require('../../utils/').concatIgnoreRoom;
var findLayerPointer = require('../../utils/').findLayerPointer;
var findLayerPointerRecursive = require('../../utils/').findLayerPointerRecursive;
var fixYYFile = require('../../utils/').fixYYFile;
var sortObject = require('../../utils/').sortObject;
var compressTiles = require('../../utils/').compressTiles;
var uncompressTiles = require('../../utils/').uncompressTiles;

var args = process.argv.splice(process.execArgv.length + 2);
var configPath = args[0] || './gms-tasks-config.json';

var scriptName = 'build';
var bigConfig = JSON.parse(fs.readFileSync(configPath));
var config = bigConfig['build-clean'];
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
      
      var layerPointer = findLayerPointer(finalJSON, config.instanceLayerToInsertName);
      var tilePointer = findLayerPointer(finalJSON, config.tileLayerToInsertName);
    
      if (layerPointer && tilePointer)
      {
        cleanLayerPointerLayers(layerPointer);
        cleanLayerPointerLayers(tilePointer);
        
        constructTilePointer(tilePointer, config.tiles);
        
        var newPattern = [
          config.roomDir + config.copyRoomPattern + "*/*.yy",
        ]
        .concat(updateIgnoreRoomsBuild())
        .concat([concatIgnoreRoom(config.exportRoom, '')]);
        
        return globby(newPattern).then(function(paths) {          
          for (var i=0; i<paths.length; i++)
          {
            copyInstancesFromRoomToTheRoom(finalJSON, layerPointer, paths[i]);
            copyTilesFromRoomToTheRoom(tilePointer, paths[i], config.tiles);
          }
          
          compressBuildRoomTiles(tilePointer);
          
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
      var fileNameWithExt = path.substr(path.lastIndexOf("/") + 1); //get file name with extension
      var fileName = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf(".")); //just the filename
      var extension = fileNameWithExt.substr(fileNameWithExt.lastIndexOf(".") + 1); //just the extension
      
      fs.copyFileSync(path, config.roomDir + config.exportRoom + "/" + fileName + "." + extension);
    }
    
    return callback();
  });
}

function copyTilesFromRoomToTheRoom(layerPointer, path, tiles)
{  
  var workingJSON = JSON.parse(fixYYFile(fs.readFileSync(path, {encoding:'utf8', flag:'r'})));

  var workingLayerPointer = findLayerPointer(workingJSON, config.tileLayerToInsertName);
    
  var sectionObj = getSectionNumFromPath(path);
  var shiftObj = getShift(sectionObj);
  
  var entireRoomRowTiles = (config.sectionWidth * config.horizontalSectionsCount) / config.gridSize;
  
  //sections are assumed to be 3x3 in size
  var entireSectionRowTiles = (config.sectionWidth * 3) / config.gridSize;
  
  var sectionRowTiles = config.sectionWidth / config.gridSize;
  var sectionColumnTiles = config.sectionHeight / config.gridSize;
  
  for (var k=0; k<tiles.length; k++)
  {
    var obj = tiles[k];
    
    if (obj.layers)
    {
      copyTilesFromRoomToTheRoom(layerPointer, path, obj.layers);
    }
    else
    {
      var workingTileLayer = findLayerPointerRecursive(workingLayerPointer, obj.name);
      
      //optimization -- if we don't have that layer in this room section, then don't run the code
      if (workingTileLayer)
      {
        var currentTileLayer = findLayerPointerRecursive(layerPointer, obj.name);
        
        if (obj.tileset)
        {
          //Game Maker 2022.8 introduced compressed tiles, so we're going uncompress it
          workingTileLayer.tiles.TileSerialiseData = uncompressTiles(workingTileLayer.tiles.TileCompressedData);
          
          for (var i=0; i<sectionColumnTiles; i++)
          {
            for (var j=0; j<sectionRowTiles; j++)
            {        
              //assumed at 1x1 right now -- which is why the shift
              var workingIndex = (1 * entireSectionRowTiles * sectionColumnTiles) + (1 * sectionRowTiles);
              workingIndex += (i * entireSectionRowTiles) + j;
              
              var currentIndex = (sectionObj.top * entireRoomRowTiles * sectionColumnTiles) + (sectionObj.left * sectionRowTiles);
              currentIndex += (i * entireRoomRowTiles) + j;
              
              var tile = workingTileLayer.tiles.TileSerialiseData[workingIndex];
              currentTileLayer.tiles.TileSerialiseData[currentIndex] = tile;
            }
          }
          
          delete workingTileLayer.tiles.TileSerialiseData;
        }
        else
        {          
          //copy asset and shift its position
          for (var i=0; i<workingTileLayer.assets.length; i++)
          {
            var obj = workingTileLayer.assets[i];
            
            obj.x += shiftObj.left;
            obj.y += shiftObj.top;
            
            currentTileLayer.assets.push(obj);
          }
        }
      }
    }
  }
}

function constructTilePointer(tilePointer, tiles)
{
  //Game Maker 2024.2 introduced alphabetizing keys (WHY?)
  var tileLayer = {
	"$GMRTileLayer":"",
	"%Name": undefined,//"bg_outside_overlay",
    "depth": undefined, //2400,
    "effectEnabled":true,
    "effectType":null,
	"gridX": config.gridSize,
    "gridY": config.gridSize,
	"hierarchyFrozen": false,
    "inheritLayerDepth": false,
    "inheritLayerSettings": false,
    "inheritSubLayers": true,
    "inheritVisibility": true,
    "layers": [],
	"name": undefined,//"bg_outside_overlay",
    "properties": [],
    "resourceType": "GMRTileLayer",
    "resourceVersion": "2.0",
    "tags": [],
	"tiles": {
	  "SerialiseHeight": (config.verticalSectionsCount * config.sectionHeight) / config.gridSize,
	  "SerialiseWidth": (config.horizontalSectionsCount * config.sectionWidth) / config.gridSize,
	  "TileCompressedData": [],
      "TileDataFormat": 1,
    },
	"tilesetId": {
      "name": undefined, //"tls_overlay_backgrounds",
      "path": undefined, //"tilesets/tls_overlay_backgrounds/tls_overlay_backgrounds.yy",
    },
	"userdefinedDepth": false,
	"visible":true,
	"x": 0,
	"y": 0,
  };
  
  //Game Maker 2024.2 introduced alphabetizing keys (WHY?)
  var assetLayer = {
	"$GMRAssetLayer":"",
	"%Name": undefined,//"bg_outside_sprite_layerDepth1",
    "assets": [],
    "depth": undefined, //1600
    "effectEnabled": true,
    "effectType": null,
    "gridX": config.gridSize,
    "gridY": config.gridSize,
	"hierarchyFrozen": false,
    "inheritLayerDepth": false,
    "inheritLayerSettings":false,
    "inheritSubLayers": true,
    "inheritVisibility": true,
    "layers": [],
    "name": undefined, //"bg_outside_sprite_layerDepth1",
	"properties":[],
	"resourceType": "GMRAssetLayer",
    "resourceVersion": "2.0",
    "tags":[],
	"userdefinedDepth": false,
	"visible": true,
  };
  
  //Game Maker 2024.2 introduced alphabetizing keys (WHY?)
  var folderLayer = {
	"$GMRLayer": "",
	"%Name": undefined, //"tiles"
    "depth": undefined, //600,
    "effectEnabled": true,
    "effectType": null,
	"gridX": config.gridSize,
    "gridY": config.gridSize,
	"hierarchyFrozen": false,
    "inheritLayerDepth":false,
    "inheritLayerSettings":false,
    "inheritSubLayers": true,
    "inheritVisibility": true,
    "layers": [],
	"name": undefined, //"tiles"
    "properties":[],
	"resourceType": "GMRLayer",
    "resourceVersion": "2.0",
    "tags": [],
	"userdefinedDepth":false,
	"visible": true,
  };
  
  for (var i=0; i<tiles.length; i++)
  {
    var obj = tiles[i];
    
    if (obj.layers)
    {      
      var folder = JSON.parse(JSON.stringify(folderLayer));
      folder.name = obj.name;
	  folder["%Name"] = obj.name;
      folder.depth = obj.depth;
      
	  //Game Maker 2024.2 introduced alphabetizing keys (WHY?)
      tilePointer.layers.push(sortObject(folder));
      
      constructTilePointer(folder, obj.layers);
    }
    else
    {
      if (obj.tileset)
      {
        var layer = JSON.parse(JSON.stringify(tileLayer));
        layer.name = obj.name;
		layer["%Name"] = obj.name;
        layer.depth = obj.depth;
        
        layer.tilesetId.name = obj.tileset.name;
        layer.tilesetId.path = obj.tileset.path;
        
        //Game Maker 2022.8 introduced compressed tiles, so we're going to temporarily keep it serialized
        layer.tiles.TileSerialiseData = [];
        
        //fill array with empty 0
        var length = layer.tiles.SerialiseWidth * layer.tiles.SerialiseHeight;
        for (var j=0; j<length; j++)
        {
          layer.tiles.TileSerialiseData[j] = 0;
        }
		
		//Game Maker 2024.2 introduced alphabetizing keys (WHY?)
		layer.tiles = sortObject(layer.tiles);
        
        tilePointer.layers.push(sortObject(layer));
      }
      else
      {
        var layer = JSON.parse(JSON.stringify(assetLayer));
        layer.name = obj.name;
		layer["%Name"] = obj.name;
        layer.depth = obj.depth;
        
		//Game Maker 2024.2 introduced alphabetizing keys (WHY?)
        tilePointer.layers.push(sortObject(layer));
      }
    }
  }
}

function compressBuildRoomTiles(tilePointer)
{
  for (var i=0; i<tilePointer.layers.length; i++)
  {
    var obj = tilePointer.layers[i];
    
    if (obj.layers.length > 0)
    {
      compressBuildRoomTiles(obj);
    }
    else if (obj.tiles)
    {
      obj.tiles.TileCompressedData = compressTiles(obj.tiles.TileSerialiseData);
      delete obj.tiles.TileSerialiseData;
    }
  }
}

function copyInstancesFromRoomToTheRoom(finalJSON, layerPointer, path)
{
  var workingJSON = JSON.parse(fixYYFile(fs.readFileSync(path, {encoding:'utf8', flag:'r'})));

  var workingLayerPointer = findLayerPointer(workingJSON, config.instanceLayerToInsertName);
  
  var shiftObj = getShift(getSectionNumFromPath(path));
  
  shiftPositions(workingLayerPointer, shiftObj.left, shiftObj.top);
  
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

function getShift(sectionObj)
{
  var left = sectionObj.left * config.sectionWidth;
  var top = sectionObj.top * config.sectionHeight
  
  //since all rooms start at section 1x1, even in room sections, we need to offset that
  return {
    left: -config.sectionWidth + left,
    top: -config.sectionHeight + top,
  };
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