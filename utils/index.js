exports.cleanInstanceCreationsArr = function(json, instanceCreationOrderId_InsertAt) {
  json.instanceCreationOrderIDs.length = instanceCreationOrderId_InsertAt;
  return json;
}

exports.findLayerPointer = function(json, layerToInsertName) {
  var layerPointer;
  
  for (var i=0; i<json.layers.length; i++)
  {
    var layer = json.layers[i];
    
    if (layer.name === layerToInsertName)
    {
      layerPointer = layer;
    }
  }
  
  return layerPointer;
}

exports.cleanLayerPointerLayers = function(layerPointer) {
  layerPointer.layers = [];
}

exports.concatIgnoreRoom = function(roomDir, dir) {
  return "!" + roomDir + dir + "/**/*";
}