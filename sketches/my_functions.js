function makeModel(layerSizes, activations) {
  let model = tf.sequential();
  for (let i = 1; i < layerSizes.length; i ++) {
    model.add(
      tf.layers.dense({
        // kernelInitializer: 'zeros',
        activation: activations[i - 1],
        units: layerSizes[i],
        inputShape: [layerSizes[i - 1]]}));
  }
  return model;
}


function makeColor(rgbString, colorAlpha = 255) {
  let col = color(rgbString);
  return color(red(col), green(col), blue(col), colorAlpha);
}

function makeInbetweenColor(rgbString1, rgbString2, weight, colorAlpha = 255) {
  let col1 = color(rgbString1);
  let col2 = color(rgbString2);
  return color(
    weight * red(col1) + (1 - weight) * red(col2),
    weight * green(col1) + (1 - weight) * green(col2),
    weight * blue(col1) + (1 - weight) * blue(col2),
    colorAlpha);
}
