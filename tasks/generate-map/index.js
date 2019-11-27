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

start(function(){
  log("Finished `" + scriptName + "` after", (((new Date()) - time) / 1000), "seconds");
});

function start(callback)
{
  var pattern = [
    config.imagesDirectory + "**/*.png"
  ];
  
  log("importing", pattern);
  
  //get all the images in the directory
  return globby(pattern).then(function(paths) {
    log("found", paths.length, "paths");
    
    //sort because globby may not return in alphabetical order
    //assumes are folder and file names are padded with enough zeroes that the numbers will be sorted alphabetically
    paths.sort();
    
    //first part sets the paths for each row
    var paths2d = {};
    for (var i=0; i<paths.length; i++)
    {
      var path = paths[i];
      
      //since files should be nested in a padded row folder number, this gets that
      var tempName = path.substring(0, path.lastIndexOf("/"));
      var folderName = tempName.substr(tempName.lastIndexOf("/") + 1);
      
      if (!paths2d[folderName])
      {
        paths2d[folderName] = [];
      }
      
      paths2d[folderName].push(path);
    }
    //
    
    log("rows determined");
    
    //make temp out directory
    var tempOutputDirectory = './tmp/';
    if (!fs.existsSync(tempOutputDirectory)){
      fs.mkdirSync(tempOutputDirectory);
    }
    
    var promises = [];
    
    //second part does the montage
    for (var i in paths2d)
    {
      promises.push(new Promise(function(resolve, reject) {
        var rowPaths = paths2d[i];
        
        var gmData = gm();
        for (var j=0; j<rowPaths.length; j++)
        {
          gmData.montage(rowPaths[j]);
        }
        
        log("montaging", tempOutputDirectory + i + '.png');
        
        //set the graphicmagic data to be rows x1 and write it out to the name of the folder
        gmData
        .geometry('+0+0')
        .tile(rowPaths.length + 'x1')
        .write(tempOutputDirectory + i + '.png', function(err) {
          if (err) log(err);
          resolve();
        });
      }));
    }
    //
    
    return Promise.all(promises).then(function(){
      return mongtageRowImages(tempOutputDirectory, callback);
    });
  });
}

//takes all the row images and montages them into columns
function mongtageRowImages(tempOutputDirectory, callback)
{
  var pattern = [
    tempOutputDirectory + "**/*.png"
  ];
  
  log("importing", pattern);
  
  return globby(pattern).then(function(paths) {
    log("found", paths.length, "paths");
    
    //sort because globby may not return in alphabetical order
    paths.sort();
    
    var gmData = gm();
    
    //montage all the rows into columns
    for (var i=0; i<paths.length; i++)
    {
      gmData.montage(paths[i]);
    }
    
    //make out directory
    if (!fs.existsSync(config.outputDirectory)){
      fs.mkdirSync(config.outputDirectory);
    }
    
    var promises = [];
    
    promises.push(new Promise(function(resolve, reject) {
      log("montaging", config.outputDirectory + "map.png");
      
      //set the graphicmagic data to be 1x however many row pictures there were
      //write it out to map
      gmData
      .geometry('+0+0')
      .tile('1x' + paths.length)
      .write(config.outputDirectory + 'map.png', function (err) {
        if (err) log(err);
        
        log("Running Sepia and Final Resizer");
        
        //make the map image look like a "map"
        //and size it down to it's final size
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
    
    //clean up temp directory
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