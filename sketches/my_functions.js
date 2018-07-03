function makeModel(layerSizes, activations, optimizer, loss) {
  let model = tf.sequential();
  for (let i = 1; i < layerSizes.length; i ++) {
    model.add(
      tf.layers.dense({
        // kernelInitializer: 'zeros',
        activation: activations[i - 1],
        units: layerSizes[i],
        inputShape: [layerSizes[i - 1]]}));
  }

  model.compile({
    optimizer: optimizer,
    loss: loss
  });

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
    (1 - weight) * red(col1) + weight * red(col2),
    (1 - weight) * green(col1) + weight * green(col2),
    (1 - weight) * blue(col1) + weight * blue(col2),
    colorAlpha);
}

function roundPlaces(num, places) {
  return Math.round(num * Math.pow(10, places)) / Math.pow(10, places);
}

function plotPoints(xs, ys, w, h, c, ps, lw) {
  noStroke();
  fill(c);

  for (let i = 0; i < xs.length; i ++) {
    let x = xs[i];
    let y = ys[i];

    if (ps > 0) {
      ellipse(
        map(x, 0, 1, 0, w),
        map(y, 0, 1, 0, h),
        ps
      );
    }

    if (lw > 0 && i < (xs.length - 1)) {
      stroke(c);
      strokeWeight(lw);

      let nextX = xs[i + 1];
      let nextY = ys[i + 1];

      line(
        map(x, 0, 1, 0, w),
        map(y, 0, 1, 0, h),
        map(nextX, 0, 1, 0, w),
        map(nextY, 0, 1, 0, h)
      );
    }
  }
}


function plot(values, maxVal, x, y, w, h, c) {
  stroke(c);
  noFill();
  rect(x, y, w, h);
  noStroke();
  fill(c);
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
