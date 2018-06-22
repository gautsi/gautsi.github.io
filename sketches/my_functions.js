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

function roundPlaces(num, places) {
  return Math.round(num * Math.pow(10, places)) / Math.pow(10, places);
}

function plot(values, maxVal, x, y, w, h, c) {
  stroke(myDarkColors[3]);
  noFill();
  rect(x, y, w, h);
  noStroke();
  fill(myDarkColors[3]);
  for(let i = 0; i < values.length; i++) {
    ellipse(
      map(i, 0, values.length, x, x + w),
      map(values[i], maxVal, 0, y, y + h),
      1
    );
  }
  text(values.length, x + w - 10, y + h + 14);
  text(
    roundPlaces(values[values.length - 1], 2),
    x + w + 4,
    map(values[values.length - 1], maxVal, 0, y, y + h));

}
