var log = require('fancy-log');
var fs = require('fs');
var globby = require('globby');
var jimp = require('jimp');
var uuidv1 = require('uuid/v1');

var args = process.argv.splice(process.execArgv.length + 2);
var configPath = args[0] || './gms-tasks-config.json';

var scriptName = 'make-gm-sprites-from-strips';
var config = JSON.parse(fs.readFileSync(configPath))[scriptName];

log("Starting `" + scriptName + "`");
var time = new Date();

start(function(){
  log("Finished `" + scriptName + "` after", (((new Date()) - time) / 1000), "seconds");
});

function start(callback)
{
  log(Object.keys(config.animations).length, "animations");
  
  var pattern = [
    config.stripDirectory + "**/*.png"
  ];
  
  var stripNames = [];
  
  log("importing", pattern);
  
  //make temp out directory
  config.tempImagesDirectory = './tmp/';
  if (!fs.existsSync(config.tempImagesDirectory)){
    fs.mkdirSync(config.tempImagesDirectory);
  }
  
  //get all the strips in the directory
  return globby(pattern).then(function(paths){
    var allImports = [];
    
    log("found", paths.length, "strips");
    
    //for each path, get the strip name, and import it
    for (var i=0; i<paths.length; i++)
    {
      var path = paths[i];
      
      var stripName1 = path.substr(path.lastIndexOf("/") + 1); //get file name (with extension)
      var stripName = stripName1.substring(0, stripName1.lastIndexOf(".")); //get file name (without extension)
      
      stripNames.push(stripName);
      
      allImports.push(importStrip(path, stripName));
    }
    
    return Promise.all(allImports).then(function(){
      log("imported strips");
      
      //add name dynamically later
      var templateData = {
        "bboxMode": 0,
        "collisionKind": 1,
        "type": 0,
        "origin": 0,
        "premultiplyAlpha": false,
        "edgeFiltering": false,
        "collisionTolerance": 0,
        "swfPrecision": 2.525,
        "bbox_left": 7,
        "bbox_right": 23,
        "bbox_top": 3,
        "bbox_bottom": 31,
        "HTile": false,
        "VTile": false,
        "For3D": false,
        "width": config.grid,
        "height": config.grid,
        "textureGroupId": {
          "name": "Default",
          "path": "texturegroups/Default",
        },
        "swatchColours": null,
        "gridX": 0,
        "gridY": 0,
        "frames": [], //add more later
        "sequence": { //update keyframes later (adds spriteId and parent dynamically later)
          "timeUnits": 1,
          "playback": 1,
          "playbackSpeed": 1.0,
          "playbackSpeedType": 1,
          "autoRecord": true,
          "volume": 1.0,
          "length": 1.0, //gets updated as there are more frames
          "events": {
            "Keyframes": [],
            "resourceVersion": "1.0",
            "resourceType": "KeyframeStore<MessageEventKeyframe>",
          },
          "moments": {
            "Keyframes": [],
            "resourceVersion": "1.0",
            "resourceType": "KeyframeStore<MomentsEventKeyframe>",
          },
          "tracks": [
            {
              "name": "frames",
              "spriteId": null,
              "keyframes": {
                "Keyframes": [],
                "resourceVersion": "1.0",
                "resourceType": "KeyframeStore<SpriteFrameKeyframe>",
              },
              "trackColour": 0,
              "inheritsTrackColour": true,
              "builtinName": 0,
              "traits": 0,
              "interpolation": 1,
              "tracks": [],
              "events": [],
              "modifiers": [],
              "isCreationTrack": false,
              "resourceVersion": "1.0",
              "tags": [],
              "resourceType": "GMSpriteFramesTrack",
            },
          ],
          "visibleRange": {
            "x": 0.0,
            "y": 0.0,
          },
          "lockOrigin": true,
          "showBackdrop": true,
          "showBackdropImage": false,
          "backdropImagePath": "",
          "backdropImageOpacity": 0.5,
          "backdropWidth": 1920,
          "backdropHeight": 1080,
          "backdropXOffset": 0.0,
          "backdropYOffset": 0.0,
          "xorigin": 16,
          "yorigin": 24,
          "eventToFunction": {},
          "eventStubScript": null,
          "resourceVersion": "1.3",
          "name": "",
          "tags": [],
          "resourceType": "GMSequence",
        },
        "layers": [], //add more later
        "parent": {
          "name": config.spritesFolder,
          "path": "folders/" + config.spritesFolder + ".yy",
        },
        "resourceVersion": "1.0",
        "tags": [],
        "resourceType": "GMSprite",
      };
      
      var allSprites = [];
      
      log("Making sprites");
      
      for (var i=0; i<stripNames.length; i++)
      {
        var stripName = stripNames[i];
        
        for (var animationName in config.animations)
        {
          var data = config.animations[animationName];
          var yyData = JSON.parse(JSON.stringify(templateData));
          
          allSprites.push(makeSprites(stripName, animationName, yyData, data));
        }
      }
      
      //clean up
      return Promise.all(allSprites).then(function(){
        return globby([config.tempImagesDirectory + "**/*.png"]).then(function(tempPaths){
          for (var i=0; i<tempPaths.length; i++)
          {
            fs.unlinkSync(tempPaths[i]);
          }
          fs.rmdirSync(config.tempImagesDirectory);
        
          return callback();
        });
      });
    });
  });
}

//import the strip image, creating seperate images for yy data later
function importStrip(path, stripName)
{
  log("importing", path, stripName);

  return new Promise(function(resolve, reject) {
    jimp.read(path).then(function(strip) {
      //TODO we are resizing -- not sure if the public would want that
      strip.resize(strip.bitmap.width * .5, strip.bitmap.height * .5, jimp.RESIZE_NEAREST_NEIGHBOR, function(err, stripImage) {        
        var promises = [];
        
        //for each animation
        for (var animationName in config.animations)
        {
          var data = config.animations[animationName];
          
          //for each frame in the animation
          for (var i=0; i<data.frames; i++)
          {
            //make a seperate image
            promises.push(makeImage(stripImage, stripName, animationName, i, data.index, data.frames, data.reverse));
          }
        }
        
        Promise.all(promises).then(function() {
          resolve();
        });
      });
    });
  });
}

//make a seperate image for each frame of the animation
function makeImage(stripImage, stripName, animationName, frameIndex, verticalOffset, length, reverse)
{
  return new Promise(function(resolve, reject) {
    new jimp(config.grid, config.grid, function(err, image) {
      var wStart = frameIndex * config.grid; //the start of the strip image
      var hStart = verticalOffset * config.grid; //the start of the strip image
      
      var wEnd = wStart + config.grid; //how far to copy
      var hEnd = hStart + config.grid; //how far to copy
      
      for (var w=wStart; w<wEnd; w++)
      {
        for (var h=hStart; h<hEnd; h++)
        {
          var hex = stripImage.getPixelColor(w, h);
          image.setPixelColor(hex, w - wStart, h - hStart);
        }
      }
      
      var actualIndex = frameIndex;
      if (reverse)
      {
        actualIndex = -frameIndex + length - 1;
      }
      
      //write out the file in the temp directory, with the sprite prefix, the strip name, the animation name and the actual index
      image.write(config.tempImagesDirectory + config.prefixStr + stripName + "_" + animationName + "_" + actualIndex + ".png", function(){
        resolve();
      });
    });
  });
}

//takes a strip file name, and creates the yy data necessary for game maker studio 2's sprites
function makeSprites(stripName, animationName, yyData, data)
{
  log("making", stripName, animationName);
  
  return new Promise(function(resolve, reject) {
    var promises = [];
    
    var spriteName = config.prefixStr + stripName + "_" + animationName;
    
    yyData.name = spriteName;
    
    var layerId = uuidv1();
    
    var layerData = {
      "visible": true,
      "isLocked": false,
      "blendMode": 0,
      "opacity": 100.0,
      "displayName": "default",
      "resourceVersion": "1.0",
      "name": layerId,
      "tags": [],
      "resourceType": "GMImageLayer",
    };
    
    yyData.layers.push(layerData);
    
    //for each frame data, make seperate image data, since that is how yy files work
    for (var i=0; i<data.frames; i++)
    {
      promises.push(writeSpriteImage(i, yyData, spriteName, layerId));
    }
    
    Promise.all(promises).then(function() {
      log("Made " + config.outputDirectory + spriteName + "/" + spriteName + ".yy");
      
      //write out the json file, or yy file
      var str = JSON.stringify(yyData);
      fs.writeFileSync(config.outputDirectory + spriteName + "/" + spriteName + ".yy", str);
      
      resolve();
    });
  });
}

//makes a sprite image data for yy files
function writeSpriteImage(imageIndex, yyData, spriteName, layerId)
{
  return new Promise(function(mainResolve, mainReject) {
    jimp.read(config.tempImagesDirectory + spriteName + "_" + imageIndex + ".png").then(function(image) {
      var promises = [];
      
      var frameId = uuidv1();
      var keyframeId = uuidv1();
      
      var path = config.spritesFolder.toLowerCase() + "/" + spriteName + "/" + spriteName + ".yy";
      
      var frameIdObj = {
        "name": frameId,
        "path": path
      };
      
      var spriteNameObj = {
        "name": spriteName,
        "path": path,
      };
      
      var frameData = {
        "compositeImage": {
          "FrameId": frameIdObj,
          "LayerId": null,
          "resourceVersion": "1.0",
          "name": "imported",
          "tags": [],
          "resourceType": "GMSpriteBitmap",
        },
        "images": [
          {
            "FrameId": frameIdObj,
            "LayerId": {
              "name": layerId,
              "path": path,
            },
            "resourceVersion": "1.0",
            "name": "",
            "tags": [],
            "resourceType": "GMSpriteBitmap",
          }
        ],
        "parent": spriteNameObj,
        "resourceVersion": "1.0",
        "name": frameId,
        "tags": [],
        "resourceType": "GMSpriteFrame",
      };
      
      yyData.frames.push(frameData);
      
      var keyframeData = {
        "id": keyframeId,
        "Key": yyData.sequence.tracks[0].keyframes.Keyframes.length - 1,
        "Length": 1.0,
        "Stretch": false,
        "Disabled": false,
        "IsCreationKey": false,
        "Channels": {
          "0": {
            "Id": {
              "name": frameId,
              "path": path,
            },
            "resourceVersion": "1.0",
            "resourceType": "SpriteFrameKeyframe",
          },
        },
        "resourceVersion": "1.0",
        "resourceType": "Keyframe<SpriteFrameKeyframe>",
      };
      
      yyData.sequence.spriteId = spriteNameObj;
      yyData.sequence.parent = spriteNameObj;
      yyData.sequence.tracks[0].keyframes.Keyframes.push(keyframeData);
      yyData.sequence.length = yyData.sequence.tracks[0].keyframes.Keyframes.length;
      
      //yy files have both the image in root of the sprite file, as well as in each layers folder
      //so that is what these two blocks are doing
      promises.push(new Promise(function(resolve, reject) {
        image.write(config.outputDirectory + spriteName + "/" + frameId + ".png", function(){
          resolve();
        });
      }));
      
      promises.push(new Promise(function(resolve, reject) {
        image.write(config.outputDirectory + spriteName + "/layers/" + frameId + "/" + layerId + ".png", function(){
          resolve();
        });
      }));
      
      Promise.all(promises).then(function() {
        mainResolve();
      });
    });
  });
}