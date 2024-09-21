var log = require('fancy-log');
var fs = require('fs');
var globby = require('globby');
var jimp = require('jimp');

var fixYYFile = require('../../utils/').fixYYFile;
var findLayerPointer = require('../../utils/').findLayerPointer;

var args = process.argv.splice(process.execArgv.length + 2);
var configPath = args[0] || './gms-tasks-config.json';

var scriptName = 'manipulate';
var config = JSON.parse(fs.readFileSync(configPath))[scriptName];

log("Starting `" + scriptName + "`");
var time = new Date();

start(function(){
  log("Finished `" + scriptName + "` after", (((new Date()) - time) / 1000), "seconds");
});


function start(callback)
{
  var pattern = [
    config.roomDirectory + "*/*.yy",
  ];
  
  log("importing", pattern);
  
  //most likely, get all the sprites in the sprites directory
  return globby(pattern).then(function(paths){
    var allExports = [];
    
    log("found", paths.length, "yy files manipulate");
    
    for (var i=0; i<paths.length; i++)
    {
      var data = JSON.parse(fixYYFile(fs.readFileSync(paths[i], {encoding:'utf8'})));
	  
	  var tilePointer = findLayerPointer(data, "tiles");
	  manipulateTilesFromRoom(tilePointer);
      
      var strData = JSON.stringify(data);
      fs.writeFileSync(paths[i], strData);
    }
    
    return Promise.all(allExports).then(function(){
      return callback();
    });
  });
}

function manipulateTilesFromRoom(layerPointer)
{
	if (layerPointer)
	{
		for (var k=0; k<layerPointer.layers.length; k++)
		{
			var obj = layerPointer.layers[k];
			manipulateTilesFromRoom(obj);
		}
		
		var lowercased = layerPointer.name.toLowerCase();
		if (lowercased.indexOf("walls_solid_") > -1 && lowercased.indexOf("overlay") == -1 && layerPointer.tiles)
		{
			manipulateTiles(layerPointer.tiles.TileCompressedData);
		}
	}
}

function manipulateTiles(arr)
{
	var newArr = [];

	var i=0;
	while (i<arr.length)
	{
		//negative cases means "steak", so we're going to put data on n times.
		if (arr[i] < 0)
		{
			var data = arr[i + 1];
			
			var mask = (1 << 18) - 1;
			var index = data & mask;
			
			mask = 1 << 28;
			var mirror = (data & mask) >> 28;
			
			mask = 1 << 29;
			var flip = (data & mask) >> 29;
			
			mask = 1 << 30;
			var rotate = (data & mask) >> 30;
			
			if (index >= 17 && index <= 31)
			{
				index += 8;
			}
			else if (index >= 33 && index <= 47)
			{
				index += 16;
			}
			else if (index >= 49 && index <= 63)
			{
				index += 24;
			}
			
			data = index;
			if (mirror)
			{
				data += 1 << 28;
			}
			if (flip)
			{
				data += 1 << 29;
			}
			if (rotate)
			{
				data += 1 << 30;
			}
			
			arr[i + 1] = data;

			i += 2;
		}
		else //positive cases mean unique numbers n times.  So for n, we push on the unique value in arr
		{
			var num = arr[i];
			for (var j=0; j<num; j++)
			{
				i++;
				
				var data = arr[i];
				
				var mask = (1 << 18) - 1;
				var index = data & mask;
				
				mask = 1 << 28;
				var mirror = (data & mask) >> 28;
				
				mask = 1 << 29;
				var flip = (data & mask) >> 29;
				
				mask = 1 << 30;
				var rotate = (data & mask) >> 30;
				
				if (index >= 17 && index <= 31)
				{
					index += 8;
				}
				else if (index >= 33 && index <= 47)
				{
					index += 16;
				}
				else if (index >= 49 && index <= 63)
				{
					index += 24;
				}
				
				data = index;
				if (mirror)
				{
					data += 1 << 28;
				}
				if (flip)
				{
					data += 1 << 29;
				}
				if (rotate)
				{
					data += 1 << 30;
				}
				
				arr[i] = data;
			}

			i++;
		}
	}
}

//function start(callback)
//{
  //var pattern = [
    //config.spriteDirectory + "spr_Portrait*/*.yy",
  //];
  
  /*
  var name = "Portraits";
  
  log("importing", pattern);
  
  //most likely, get all the sprites in the sprites directory
  return globby(pattern).then(function(paths){
    var allExports = [];
    
    log("found", paths.length, "yy files updating texture group");
    
    for (var i=0; i<paths.length; i++)
    {
      var data = JSON.parse(fixYYFile(fs.readFileSync(paths[i], {encoding:'utf8'})));
      
      log("updating", paths[i]);
      
      data.textureGroupId.name = name;
      data.textureGroupId.path = "texturegroups/" + name;
      
      var strData = JSON.stringify(data);
      fs.writeFileSync(paths[i], strData);
    }
    
    return Promise.all(allExports).then(function(){
      return callback();
    });
  });
}
*/