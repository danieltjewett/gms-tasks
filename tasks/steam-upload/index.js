var log = require('fancy-log');
var fs = require('fs');
var resolve = require('path').resolve;
var spawn = require('child_process').spawn;
require('dotenv').config();

var args = process.argv.splice(process.execArgv.length + 2);
var configPath = args[0] || './gms-tasks-config.json';

var scriptName = 'steam-upload';
var config = JSON.parse(fs.readFileSync(configPath))[scriptName];

log("Starting `" + scriptName + "`");
var time = new Date();

start(function(){
  log("Finished `" + scriptName + "` after", (((new Date()) - time) / 1000), "seconds");
});

function start(callback)
{
  var steamArgs = [
    "+login",
    process.env.steam_username,
    process.env.steam_password,
    "+run_app_build",
    resolve(config.simpleAppBuildVDF),
    "+quit"
  ];
  
  var cmd;
  switch (process.platform)
  {
    case "win32":
      cmd = spawn(config.sdkDir + "tools/ContentBuilder/builder/steamcmd.exe", steamArgs);
      break;
    
    case "darwin":
      cmd = spawn(config.sdkDir + "tools/ContentBuilder/builder_osx/steamcmd.sh", steamArgs);
      break;
      
    case "linux":
      cmd = spawn(config.sdkDir + "tools/ContentBuilder/builder_linux/steamcmd.sh", steamArgs);
      break;
      
    default:
      log("Unsupported OS", process.platform);
      break;
  }
  
  cmd.stdout.setEncoding('utf8');
  cmd.stdout.on("data", function(data) {
    var str = data.toString();
    var lines = str.split(/(\r?\n)/g);
    log(lines.join(""));
  });

  cmd.stderr.setEncoding('utf8');
  cmd.stderr.on("data", function(data) {
    var str = data.toString();
    var lines = str.split(/(\r?\n)/g);
    log(lines.join(""));
  });

  cmd.on('error', function(error) {
    log("error", error);
    return callback();
  });

  cmd.on("close", function(code) {
    log("child process exited with code", code);
    return callback();
  });
}