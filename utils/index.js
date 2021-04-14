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
  var regex = /\,(?!\s*?[\{\[\"\'\w])/g;
  return input.replace(regex, ''); // remove all trailing commas
}

exports.string_digits = function(str) {
  return str.replace(/\D/g, "");
}