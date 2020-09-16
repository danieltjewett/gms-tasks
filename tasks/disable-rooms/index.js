var log = require('fancy-log');
var fs = require('fs');
var globby = require('globby');

var concatIgnoreRoom = require('../../utils/').concatIgnoreRoom;

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
    fs.mkdirSync(config.restoreDir + "views/");
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
      
      var yyp = JSON.parse(fs.readFileSync(projectPath));
      var resources = yyp.resources;
      
      var roomsHash = {};
      var viewsHash = {};
      
      //dig through project file to get all folders and rooms
      for (var i=0; i<resources.length; i++)
      {
        var obj = resources[i];
        switch (obj.Value.resourceType)
        {
          case "GMFolder":
            viewsHash[obj.Key] = obj.Value.resourcePath;
            break;
          
          case "GMRoom":
            roomsHash[obj.Key] = obj.Value.resourcePath;
            break;
        }
      }
      
      //go through rooms, keeping rooms that we want to disable
      for (var roomId in roomsHash)
      {
        var path = roomsHash[roomId];
        
        var foundRoom = false;
        
        var roomName = path.split("\\")[1];
        
        for (var i=0; i<config.rooms.length; i++)
        {
          if (config.rooms[i] === roomName)
          {
            foundRoom = true;
            break;
          }
        }
        
        if (!foundRoom)
        {
          delete roomsHash[roomId];
        }
      }
      
      //go through views, keeping views with room data
      for (viewId in viewsHash)
      {
        var viewPath = viewsHash[viewId];
        
        var foundView = false;
        
        var viewChildren = JSON.parse(fs.readFileSync(viewPath)).children;
        
        for (var roomId in roomsHash)
        {
          for (var i=0; i<viewChildren.length; i++)
          {
            if (viewChildren[i] === roomId)
            {
              foundView = true;
              break;
            }
          }
          
          if (foundView)
          {
            break;
          }
        }
        
        if (!foundView)
        {
          delete viewsHash[viewId];
        }
      }
      
      //go through views, backing up original views to restore later
      for (viewId in viewsHash)
      {
        var viewPath = viewsHash[viewId];
        var fileName = viewPath.substr(viewPath.lastIndexOf("\\") + 1); //get file name with extension
        
        var viewData = JSON.parse(fs.readFileSync(viewPath));
        var strViewData = JSON.stringify(viewData, null, 4);
        
        log("Backing up", config.restoreDir + "views/" + fileName);
        fs.writeFileSync(config.restoreDir + "views/" + fileName, strViewData);
      }
      
      //remove resource from project
      //save sources to restore later
      //save room to restore later
      //delete room yy file
      var savedResources = [];
      for (var i=0; i<resources.length; i++)
      {
        var obj = resources[i];
        
        switch (obj.Value.resourceType)
        {          
          case "GMRoom":
            for (var roomId in roomsHash)
            {
              if (roomId === obj.Key)
              {                
                savedResources.push(obj);
                resources.splice(i, 1);
                
                i --;
                break;
              }
            }
          
            break;
        }
      }
      //write out the json file, or yy file
      var strSavedResources = JSON.stringify(savedResources, null, 2);
      log("Backing up", config.restoreDir + "resources.json");
      fs.writeFileSync(config.restoreDir + "resources.json", strSavedResources);
      //save actual resources to original yyp project
      yyp.resources = resources;
      var strYYP = JSON.stringify(yyp, null, 4);
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