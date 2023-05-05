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
    config.spriteDirectory + "*/*.yy",
  ];
  
  log("importing", pattern);
  
  //most likely, get all the sprites in the sprites directory
  return globby(pattern).then(function(paths){
    var allExports = [];
    
    log("found", paths.length, "yy files preMultiplyAlpha");
    
    for (var i=0; i<paths.length; i++)
    {
      var data = JSON.parse(fixYYFile(fs.readFileSync(paths[i], {encoding:'utf8'})));
      
      log("updating", paths[i]);
      
      data.preMultiplyAlpha = true;
      
      var strData = JSON.stringify(data);
      fs.writeFileSync(paths[i], strData);
    }
    
    return Promise.all(allExports).then(function(){
      return callback();
    });
  });
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