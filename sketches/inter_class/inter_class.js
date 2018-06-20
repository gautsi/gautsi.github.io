const numPixelRows = 30;
const numPixelCols = 30;
const colorDict = {"yes": 0, "no": 1};

const pixelArray = makePixelArray(numPixelRows, numPixelCols);

let labeledPoints = {"yes": [], "no": []};
let numLabeledPoints = 0;

let labelChoice = "yes";

// defining the model
let model;
const layerSizes = [2, 2, 1];
const activations = ['tanh', 'tanh'];
const learningRate = 0.01;
const optimizer = tf.train.adam(learningRate);

function setup() {
  let myCanvas = createCanvas(400, 400);
  myCanvas.parent('inter_class_sketch');
  model = makeModel(layerSizes, activations);
}

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

function makePixelArray(numPixelRows, numPixelCols) {
  let pix = [];
  for (let i = 0; i < numPixelRows; i ++) {
    for (let j = 0; j < numPixelCols; j ++){
      pix.push([i / numPixelRows, j / numPixelCols]);
    }
  }
  return pix;
}

function keyPressed() {
  // S for "switch"
  if (keyCode == 83) {
    if (labelChoice == "yes") {
      labelChoice = "no";
    }
    else {
      labelChoice = "yes";
    }
  }
}

function mouseClicked() {
  labeledPoints[labelChoice].push([map(mouseX, 0, width, 0, 1), map(mouseY, 0, height, 0, 1)]);
  numLabeledPoints += 1;
}

function getPixelColors(pixelArray) {
  let pixColors = [];
  let predictions = model.predict(tf.tensor(pixelArray)).dataSync();
  for (let i = 0; i < pixelArray.length; i ++) {
    // if (predictions[i] > 0.5) {
    //   pixColors.push([pixelArray[i], "yes"]);
    // }
    // else {
    //   pixColors.push([pixelArray[i], "no"]);
    // }
    pixColors.push([pixelArray[i], predictions[i]]);
  }
  return pixColors;
}

function drawPixels(numPixelRows, numPixelCols, pixelColors) {
  noStroke();
  for (let i = 0; i < pixelColors.length; i ++) {
    // fill(myLightColors[colorDict[pixelColors[i][1]]]);
    // fill(map(pixelColors[i][1], -1, 1, 0, 255));
    fill(makeInbetweenColor(
      myLightColors[0],
      myLightColors[1],
      map(pixelColors[i][1], -1, 1, 0, 1),
      255
    ));
    let x = map(pixelColors[i][0][0], 0, 1, 0, width);
    let y = map(pixelColors[i][0][1], 0, 1, 0, height);
    rect(x, y, width / numPixelRows, height / numPixelCols);
  }
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


function drawLabeledPoints(labeledPoints) {
  noStroke();
  for (const [label, points] of Object.entries(labeledPoints)) {
    for(let i = 0; i < points.length; i ++) {
      fill(makeColor(myDarkColors[colorDict[label]], 170));
      let x = map(points[i][0], 0, 1, 0, width);
      let y = map(points[i][1], 0, 1, 0, height);
      rect(x, y, width / numPixelRows, height / numPixelCols);

    }
  }
}

function loss(pred, training) {
  let error = 0;
  for(let i = 0; i < pred.length; i++) {
    error += Math.pow(pred[i] - training[i], 2);
  }
  return error / pred.length;
}

function modelLoss(pred, label) {
  return pred.sub(label).square().mean();
}

function getLoss(model, labeledPoints) {
  let [xs, ys] = getXYs(labeledPoints);
  let predictions = model.predict(tf.tensor(xs));
  return tf.losses.meanSquaredError(tf.tensor(ys), predictions).dataSync();
}

function getXYs(labeledPoints) {
  let xs = [];
  let ys = [];
  for (const [label, points] of Object.entries(labeledPoints)) {
    for(let i = 0; i < points.length; i ++) {
      xs.push(points[i]);
      if (label == "yes") {
        ys.push([1]);
      }
      else {
        ys.push([-1]);
      }
    }
  }
  return [xs, ys];
}

function trainModel(model, labeledPoints) {
  let [xs, ys] = getXYs(labeledPoints);

  optimizer.minimize(() => {
    let pred = model.predict(tf.tensor(xs));
    return tf.losses.meanSquaredError(tf.tensor(ys), pred);
  })
}

function roundPlaces(num, places) {
  return Math.round(num * Math.pow(10, places)) / Math.pow(10, places);
}


function draw() {
  // background(myLightColors[0]);
  drawPixels(numPixelRows, numPixelCols, getPixelColors(pixelArray));
  if (numLabeledPoints > 0) {
    drawLabeledPoints(labeledPoints);
    trainModel(model, labeledPoints);
    noStroke();
    fill(myDarkColors[2]);
    let currLoss = getLoss(model, labeledPoints);
    text("loss = " + roundPlaces(currLoss, 3), 10, 20);
  }
  noStroke();
  fill(myDarkColors[2]);
  text("label choice = " + labelChoice, 10, 10);
}