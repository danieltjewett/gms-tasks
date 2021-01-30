var log = require('fancy-log');
var fs = require('fs');
var globby = require('globby');
var jimp = require('jimp');

var fixYYFile = require('../../utils/').fixYYFile;

var args = process.argv.splice(process.execArgv.length + 2);
var configPath = args[0] || './gms-tasks-config.json';

var scriptName = 'export-gm-sprites-as-strips';
var config = JSON.parse(fs.readFileSync(configPath))[scriptName];

log("Starting `" + scriptName + "`");
var time = new Date();

start(function(){
  log("Finished `" + scriptName + "` after", (((new Date()) - time) / 1000), "seconds");
});

function start(callback)
{
  var pattern = [
    config.spriteDirectory + "*/*.yy"
  ];
  
  log("importing", pattern);
  
  //most likely, get all the sprites in the sprites directory
  return globby(pattern).then(function(paths){
    var allExports = [];
    
    log("found", paths.length, "yy files needing to be turned into strips");
    
    for (var i=0; i<paths.length; i++)
    {
      allExports.push(exportImage(paths[i]));
    }
    
    return Promise.all(allExports).then(function(){
      return callback();
    });
  });
}

//exports a path of a sprite into a strip
function exportImage(path)
{
  log("exporting", path);
  
  return new Promise(function(resolve, reject) {
    //get the yy data
    var data = JSON.parse(fixYYFile(fs.readFileSync(path, {encoding:'utf8'})));
    
    var width = data.width;
    var height = data.height;
    var frameLength = data.frames.length;
    
    //returns the path of the image, without the file name
    var imagePath = path.substring(0, path.lastIndexOf("/")) + "/";
    
    //returns the file name with the yy
    var fileNameYY = path.split('\\').pop().split('/').pop();
    
    //returns the file name without the yy
    var fileName = fileNameYY.substring(0, fileNameYY.lastIndexOf("."));
    
    new jimp(data.width * frameLength, height, function(err, image) {
      var promises = [];
      
      //loops through each frame's image and copies to the main image
      for (var i=0; i<frameLength; i++)
      {
        var imageName = data.frames[i].name + ".png";
        
        promises.push(copyImage(imagePath, imageName, image, width, i));
      }
      
      return Promise.all(promises).then(function() {
        log("writing", config.exportDirectory + fileName + ".png");
        image.write(config.exportDirectory + fileName + ".png", function(){
          resolve();
        });
      });
    });
  });
}

//copies an image into a subimage, or frame of the strip
function copyImage(imagePath, imageName, image, width, index)
{
  return jimp.read(imagePath + imageName).then(function(frameImage) {
    for (var w=0; w<frameImage.bitmap.width; w++)
    {
      for (var h=0; h<frameImage.bitmap.height; h++)
      {
        var hex = frameImage.getPixelColor(w, h);            
        image.setPixelColor(hex, width * index + w, h);
      }
    }
  });
}