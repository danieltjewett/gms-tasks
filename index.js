var log = require('fancy-log');
var fs = require('fs');
var globby = require('globby');
  
globby(["./tasks/**/index.js"]).then(function(paths) {
  var availableTasks = paths.map(function(path) {
    return path.substring(8, path.lastIndexOf("/"));
  });
  
  log("available tasks:");
  log(availableTasks);
  
  log("look at for installation and how to run.");
});