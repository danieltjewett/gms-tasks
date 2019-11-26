var gulp = require('gulp');
var log = require('fancy-log');
var fs = require('fs');
var globby = require('globby');
var jimp = require('jimp');

var config = JSON.parse(fs.readFileSync('./gms-gulp-tasks-config.json'))['export-gm-sprites-as-strips'];

gulp.task('export-gm-sprites-as-strips', function(callback) {
  return exportImages(callback);
});

function exportImages(callback)
{
  var pattern = [
    config.spriteDirectory + "*/*.yy"
  ];
  
  log("importing", pattern);
  
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

function exportImage(path)
{
  log("exporting", path);
  
  return new Promise(function(resolve, reject) {
    var data = JSON.parse(fs.readFileSync(path));
    
    var width = data.width;
    var height = data.height;
    var frameLength = data.frames.length;
    
    var imagePath = path.substring(0, path.lastIndexOf("/")) + "/";
    
    var fileNameYY = path.split('\\').pop().split('/').pop();
    var fileName = fileNameYY.substring(0, fileNameYY.lastIndexOf("."));
    
    new jimp(data.width * frameLength, height, function(err, image) {
      var promises = [];
      
      for (var i=0; i<frameLength; i++)
      {
        var imageName = data.frames[i].id + ".png";
        
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