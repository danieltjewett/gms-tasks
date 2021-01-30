var log = require('fancy-log');
var fs = require('fs');
var globby = require('globby');

var fixYYFile = require('../../utils/').fixYYFile;

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
      
      var yyp = JSON.parse(fixYYFile(fs.readFileSync(projectPath, {encoding:'utf8'})));
      
      //replace RoomOrderNodes
      var roomOrderNodes = JSON.parse(fs.readFileSync(config.restoreDir + "roomOrderNodes.json"));
      yyp.RoomOrderNodes = roomOrderNodes;
        
      //restore yyp
      var restoreResources = JSON.parse(fs.readFileSync(config.restoreDir + "resources.json"));
      yyp.resources = yyp.resources.concat(restoreResources);
      
      var strYYP = JSON.stringify(yyp, null, 2);
      log("Saving", projectPath);
      fs.writeFileSync(projectPath, strYYP);
      
      //clean up roomOrderNodes.json, resources.json and restoreDir
      fs.unlinkSync(config.restoreDir + "roomOrderNodes.json");
      fs.unlinkSync(config.restoreDir + "resources.json");
      fs.rmdirSync(config.restoreDir);
      
      return callback();
    }
    else
    {
      log("Couldn't find main project");
      return callback();
    }
  });
}