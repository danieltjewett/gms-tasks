var log = require('fancy-log');
var fs = require('fs');
var globby = require('globby');

var fixYYFile = require('../../utils/').fixYYFile;

var args = process.argv.splice(process.execArgv.length + 2);
var configPath = args[0] || './gms-tasks-config.json';

var scriptName = 'disable-rooms';
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
    fs.mkdirSync(config.restoreDir);
  }
  else
  {
    log("restoreDir already exists.  Run `enable-rooms` to restore.");
    return callback();
  }
  
  return globby("*.yyp").then(function(paths){
    if (paths.length == 1)
    {
      var projectPath = paths[0];
      
      var yyp = JSON.parse(fixYYFile(fs.readFileSync(projectPath, {encoding:'utf8'})));
      var resources = yyp.resources;
      var roomOrderNodes = yyp.RoomOrderNodes;
      
      //back up entire roomOrderNodes, to restore later
      var strRoomOrder = JSON.stringify(roomOrderNodes, null, 2);
      log("Backing up", config.restoreDir + "roomOrderNodes.json");
      fs.writeFileSync(config.restoreDir + "roomOrderNodes.json", strRoomOrder);
      
      //dig through the roomOrderNodes to remove
      for (var i=0; i<roomOrderNodes.length; i++)
      {
        var obj = roomOrderNodes[i];
        
        for (var j=0; j<config.rooms.length; j++)
        {
          var roomName = config.rooms[j];
          
          if (obj.roomId.name === roomName)
          {
            roomOrderNodes.splice(i, 1);
            i--;
            
            break;
          }
        }
      }
      
      var savedResources = [];
      
      //dig through the resources to and add all the rooms and remove from resources
      for (var i=0; i<resources.length; i++)
      {
        var obj = resources[i];
        
        for (var j=0; j<config.rooms.length; j++)
        {
          var roomName = config.rooms[j];
          
          if (obj.id.name === roomName)
          {
            savedResources.push(obj);
            resources.splice(i, 1);
            i--;
            
            break;
          }
        }
      }
      
      //write out the json file, or yy file
      var strSavedResources = JSON.stringify(savedResources, null, 2);
      log("Backing up", config.restoreDir + "resources.json");
      fs.writeFileSync(config.restoreDir + "resources.json", strSavedResources);
      
      //save actual resources to original yyp project
      yyp.resources = resources;
      yyp.RoomOrderNodes = roomOrderNodes;
      var strYYP = JSON.stringify(yyp, null, 2);
      log("Saving", projectPath);
      fs.writeFileSync(projectPath, strYYP);
      
      return callback();
    }
    else
    {
      log("Couldn't find main project");
      return callback();
    }
  });
}