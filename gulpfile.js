var gulp = require('gulp');
var HubRegistry = require('gulp-hub');

var log = require('fancy-log');

//load some files into the registry
var hub = new HubRegistry(['tasks/**/index.js']);

//tell gulp to use the tasks just loaded
gulp.registry(hub);

gulp.task('default', function(callback) {
  log("Use gulp --tasks for the list of tasks");
  
  return callback();
});