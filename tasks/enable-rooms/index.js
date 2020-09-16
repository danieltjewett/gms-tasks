var log = require('fancy-log');
var fs = require('fs');
var globby = require('globby');

var concatIgnoreRoom = require('../../utils/').concatIgnoreRoom;

var args = process.argv.splice(process.execArgv.length + 2);
var configPath = args[0] || './gms-tasks-config.json';

var scriptName = 'enable-rooms';
var bigConfig = JSON.parse(fs.readFileSync(configPath));
var config = bigConfig['enable-disable-rooms'];
Object.assign(config, bigConfig[scriptName]);

log("Starting `" + scriptName + "`");
var time = new Date();

start(function(){
  log("Finished `" + scriptName + "` after", (((new Date()) - time) / 1000), "seconds");
});

function start(callback)
{
  if (!fs.existsSync(config.restoreDir))
  {
    log("restoreDir doesn't exist.  Run `disable-rooms` to disable.");
    return callback();
  }
  
  return globby("*.yyp").then(function(paths){
    if (paths.length == 1)
    {
      var projectPath = paths[0];
      
      var yyp = JSON.parse(fs.readFileSync(projectPath));
      
      return globby(config.restoreDir + "views/*.yy").then(function(viewPaths){
        //dig through project file to restore views
        for (var i=0; i<viewPaths.length; i++)
        {
          var viewPath = viewPaths[i];
          var fileName = viewPath.substr(viewPath.lastIndexOf("/") + 1); //get file name (with extension)
          
          log("Restoring", projectPath);
          fs.copyFileSync(viewPath, "./views/" + fileName, 0);
          
          //clean up view file
          fs.unlinkSync(viewPath);
        }
        
        //clean up view folder
        fs.rmdirSync(config.restoreDir + "views/");
        
        //restore yyp
        var restoreResources = JSON.parse(fs.readFileSync(config.restoreDir + "resources.json"));
        
        yyp.resources = yyp.resources.concat(restoreResources);
        
        var strYYP = JSON.stringify(yyp, null, 4);
        log("Saving", projectPath);
        fs.writeFileSync(projectPath, strYYP);
        
        //clean up resources.json and restoreDir
        fs.unlinkSync(config.restoreDir + "resources.json");
        fs.rmdirSync(config.restoreDir);
        
        return callback();
      });
    }
    else
    {
      log("Couldn't find main project");
      return callback();
    }
  });
}