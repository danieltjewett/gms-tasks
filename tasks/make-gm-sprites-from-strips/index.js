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
      
      var templateData = {
        "id": "",
        "modelName": "GMSprite",
        "mvc": "1.12",
        "name": "",
        "For3D": false,
        "HTile": false,
        "VTile": false,
        "bbox_bottom": 31,
        "bbox_left": 7,
        "bbox_right": 23,
        "bbox_top": 3,
        "bboxmode": 0,
        "colkind": 1,
        "coltolerance": 0,
        "edgeFiltering": false,
        "frames": [],
        "gridX": 0,
        "gridY": 0,
        "height": 32,
        "layers": [],
        "origin": 9,
        "originLocked": true,
        "playbackSpeed": 1,
        "playbackSpeedType": 1,
        "premultiplyAlpha": false,
        "sepmasks": false,
        "swatchColours": null,
        "swfPrecision": 2.525,
        "textureGroupId": "1225f6b0-ac20-43bd-a82e-be73fa0b6f4f",
        "type": 0,
        "width": 32,
        "xorig": 16,
        "yorig": 24
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
    
    var spriteId = uuidv1();
    var spriteName = config.prefixStr + stripName + "_" + animationName;
    
    yyData.id = spriteId;
    yyData.name = spriteName;
    
    var layerId = uuidv1();
    
    var layerData = {
      "id": layerId,
      "modelName": "GMImageLayer",
      "mvc": "1.0",
      "SpriteId": spriteId,
      "blendMode": 0,
      "isLocked": false,
      "name": "default",
      "opacity": 100,
      "visible": true
    };
    
    yyData.layers.push(layerData);
    
    //for each frame data, make seperate image data, since that is how yy files work
    for (var i=0; i<data.frames; i++)
    {
      promises.push(writeSpriteImage(i, yyData, spriteName, spriteId, layerId));
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
function writeSpriteImage(imageIndex, yyData, spriteName, spriteId, layerId)
{
  return new Promise(function(mainResolve, mainReject) {
    jimp.read(config.tempImagesDirectory + spriteName + "_" + imageIndex + ".png").then(function(image) {
      var promises = [];
      
      var frameId = uuidv1();
      
      var compositeId = uuidv1();
      var imageId = uuidv1();
      
      var frameData = {
        "id": frameId,
        "modelName": "GMSpriteFrame",
        "mvc": "1.0",
        "SpriteId": spriteId,
        "compositeImage": {
          "id": compositeId,
          "modelName": "GMSpriteImage",
          "mvc": "1.0",
          "FrameId": frameId,
          "LayerId": "00000000-0000-0000-0000-000000000000"
        },
        "images": [
          {
            "id": imageId,
            "modelName": "GMSpriteImage",
            "mvc": "1.0",
            "FrameId": frameId,
            "LayerId": layerId,
          }
        ]
      };
      
      yyData.frames.push(frameData);
      
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