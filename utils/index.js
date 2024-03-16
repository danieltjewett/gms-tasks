exports.shiftPositions = function(jsonLayer, left, top) {
  for (var i=0; i<jsonLayer.layers.length; i++)
  {
    var layer = jsonLayer.layers[i];
    
    if (layer.instances)
    {
      for (var j=0; j<layer.instances.length; j++)
      {
        var inst = layer.instances[j];
        
        inst.x += left;
        inst.y += top;
      }
    }
    
    exports.shiftPositions(layer, left, top);
  }
}

exports.getSectionNumFromPath = function(path) {    
  //returns the file name with the yy
  var roomNameYY = path.split('\\').pop().split('/').pop();
    
  //returns the file name without the yy
  var roomName = roomNameYY.substring(0, roomNameYY.lastIndexOf("."));
  
  //assumes sections are in form ixj
  var arr = roomName.split("x");
  
  var left = parseInt(exports.string_digits(arr[0]), 10); //get just the number (e.g. room_Kick_3x3) returns just the first 3
  var top = parseInt(exports.string_digits(arr[1]), 10); //get the second number (e.g. room_Kick_3x3) returns just the second 3
  
  return {
    left: left,
    top: top,
  };
}

exports.cleanInstanceCreationsArr = function(json, instanceCreationOrder_InsertAt) {
  json.instanceCreationOrder.length = instanceCreationOrder_InsertAt;
  return json;
}

exports.findLayerPointer = function(json, layerToInsertName) {
  var layerPointer = undefined;
  
  for (var i=0; i<json.layers.length; i++)
  {
    var layer = json.layers[i];
    
    if (layer.name === layerToInsertName)
    {
      layerPointer = layer;
      break;
    }
  }
  
  return layerPointer;
}

exports.findLayerPointerRecursive = function(json, layerToInsertName) {
  var layerPointer = undefined;
  
  var lP = exports.findLayerPointer(json, layerToInsertName);
  if (lP === undefined)
  {
    for (var i=0; i<json.layers.length; i++)
    {
      var layer = json.layers[i];
      
      lP = exports.findLayerPointerRecursive(layer, layerToInsertName);
      if (lP !== undefined)
      {
        layerPointer = lP;
        break;
      }
    }
  }
  else
  {
    layerPointer = lP;
  }
  
  return layerPointer;
}

exports.cleanLayerPointerLayers = function(layerPointer) {
  layerPointer.layers = [];
}

exports.concatIgnoreRoom = function(roomDir, dir) {
  return "!" + roomDir + dir + "/**/*";
}

exports.fixYYFile = function(input) {
  var regex = /\,(?!\s*?[\{\[\"\'\w\-])/g;
  return input.replace(regex, ''); // remove all trailing commas
}

exports.string_digits = function(str) {
  return str.replace(/\D/g, "");
}

exports.sortObject = function(obj) {
  return Object.keys(obj)
	.sort()
	.reduce(function (acc, key) { 
	  acc[key] = obj[key];
	  return acc;
	}, {});
}

exports.compressTiles = function(arr) {
  var newArr = [];
  var tempArr = [];
  
  var num = -1;
  var previousData = arr[0];
  
  for (var i=1; i<arr.length; i++)
  {
    //if the previous data is the same as the current data
    if (previousData === arr[i])
    {
      //if we have a streak again, but we have data on the tempArr, we need to push the data from the tempArr onto our real array
      if (tempArr.length > 0)
      {
        //first push the current positive number
        newArr.push(num);
        
        //then push all the unique values
        for (var j=0; j<tempArr.length; j++)
        {
          newArr.push(tempArr[j]);
        }
        
        //reset
        tempArr = [];
        num = -1;
      }
      
      num --;
    }
    else //the data is not the same and need to write most likely
    {
      //values of num less than -1 means we have a streak, so we're going to push something like -10, 5 which means there are 10 streaks of 5
      if (num < -1)
      {
        newArr.push(num, previousData);
        
        //reset
        num = -1;
        previousData = arr[i];
      }
      else //if we have numbers not the same more than once, we'll do one of two things:
      {
        //if it is the first time, (num == -1), we'll change to positive world (by resetting num to 0).
        if (num == -1)
        {
          num = 0;
        }
        
        //All other unique number scenarios will increment num (as oppose to decrement) and will push the unique val onto a tempArr
        num ++;
        tempArr.push(previousData);
        
        previousData = arr[i];
      }
    }
  }
  
  //terminating, push on whatever is left
  if (tempArr.length > 0)
  {
    //first push the current positive number
    newArr.push(num);
    
    //then push all the unique values
    for (var j=0; j<tempArr.length; j++)
    {
      newArr.push(tempArr[j]);
    }
  }
  else
  {
    //steak
    newArr.push(num, previousData);
  }
  
  return newArr;
}

exports.uncompressTiles = function(arr) {
  var newArr = [];
  
  var i=0;
  while (i<arr.length)
  {
    //negative cases means "steak", so we're going to put data on n times.
    if (arr[i] < 0)
    {
      var num = Math.abs(arr[i]);
      var data = arr[i + 1];
      
      for (var j=0; j<num; j++)
      {
        newArr.push(data);
      }
      
      i += 2;
    }
    else //positive cases mean unique numbers n times.  So for n, we push on the unique value in arr
    {
      var num = arr[i];
      for (var j=0; j<num; j++)
      {
        i++;
        newArr.push(arr[i]);
      }
      
      i++;
    }
  }
  
  return newArr;
}