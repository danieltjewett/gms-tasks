exports.cleanInstanceCreationsArr = function(json, instanceCreationOrder_InsertAt) {
  json.instanceCreationOrder.length = instanceCreationOrder_InsertAt;
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

exports.fixYYFile = function(input) {
  var regex = /\,(?!\s*?[\{\[\"\'\w])/g;
  return input.replace(regex, ''); // remove all trailing commas
}