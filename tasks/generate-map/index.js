var log = require('fancy-log');
var fs = require('fs');
var globby = require('globby');
var gm = require('gm');

var args = process.argv.splice(process.execArgv.length + 2);
var configPath = args[0] || './gms-tasks-config.json';

var scriptName = 'generate-map';
var config = JSON.parse(fs.readFileSync(configPath))[scriptName];

log("Starting `" + scriptName + "`");
var time = new Date();

importImages(function(){
  log("Finished `" + scriptName + "` after", (((new Date()) - time) / 1000), "seconds");
});

function importImages(callback)
{
  var pattern = [
    config.imagesDirectory + "**/*.png"
  ];
  
  log("importing", pattern);
  
  return globby(pattern).then(function(paths) {
    log("found", paths.length, "paths");
    
    paths.sort();
    
    var length = paths.length;
    var rowSize = Math.sqrt(length);
    
    if (rowSize * rowSize !== length)
    {
      log(length, "is not a valid square.");
      return callback();
    }
    
    log("row size is valid at ", rowSize);
    
    //first part sets the paths for each row
    var paths2d = [];
    for (var i=0; i<rowSize; i++)
    {
      paths2d[i] = [];
      
      var pathStartIndex = i * rowSize;
      
      for (var j=0; j<rowSize; j++)
      {
        paths2d[i].push(paths[pathStartIndex + j]);
      }
    }
    //
    
    log("rows determined");
    
    var tempOutputDirectory = './tmp/';
    if (!fs.existsSync(tempOutputDirectory)){
      fs.mkdirSync(tempOutputDirectory);
    }
    
    var promises = [];
    
    //second part does the montage
    for (var i=0; i<rowSize; i++)
    {
      promises.push(new Promise(function(resolve, reject) {
        var gmData = gm();
        for (var j=0; j<rowSize; j++)
        {
          gmData.montage(paths2d[i][j]);
        }
        
        var padIndex = ("" + i).padStart(5, "0");
        
        log("montaging", tempOutputDirectory + padIndex + '.png');
        
        gmData
        .geometry('+0+0')
        .tile(rowSize + 'x1')
        .write(tempOutputDirectory + padIndex + '.png', function(err) {
          if (err) log(err);
          resolve();
        });
      }));
    }
    //
    
    return Promise.all(promises).then(function(){
      return importOutputImages(tempOutputDirectory, rowSize, callback);
    });
  });
}

function importOutputImages(tempOutputDirectory, rowSize, callback)
{
  var pattern = [
    tempOutputDirectory + "**/*.png"
  ];
  
  log("outputting", pattern);
  
  return globby(pattern).then(function(paths) {
    if (paths.length !== rowSize)
    {
      log("did not find output paths correctly.");
      return callback();
    }
    
    log("found", paths.length, "paths correctly");
    
    paths.sort();
    
    var gmData = gm();
    
    for (var i=0; i<paths.length; i++)
    {
      gmData.montage(paths[i]);
    }
    
    var promises = [];
    
    promises.push(new Promise(function(resolve, reject) {
      log("montaging", config.outputDirectory, "map.png");
      
      gmData
      .geometry('+0+0')
      .tile('1x' + rowSize)
      .write('map.png', function (err) {
        if (err) log(err);
        
        log("Running Sepia and Final Resizer");
        
        gm(config.outputDirectory + 'map.png')
        .modulate(90, 0, 100)
        .colorize(20, 30, 50)
        .filter("point")
        .resize(config.finalWidth, config.finalHeight)
        .write(config.outputDirectory + 'final-map.png', function(err) {
          if (err) log(err);
          
          resolve();
        });
      });
    }));
    
    //clean up
    return Promise.all(promises).then(function() {
      for (var i=0; i<paths.length; i++)
      {
        fs.unlinkSync(paths[i]);
      }
      fs.rmdirSync(tempOutputDirectory);
      
      return callback();
    });
  });
}