// defining global variables
let trainingPoints = [];
const numTraining = 400;
let predictions = [];
let losses = [];
const saveFirstFrame = false;
let xs = [];
let xt;
let trainingSteps = 0;
let batchSize = 100;
let trail = 10;

// defining the model
let model;
const layerSizes = [1, 2, 1];
const activations = ['tanh', null];
const learningRate = 0.01;
const optimizer = tf.train.adam(learningRate);

function setup() {
  let myCanvas = createCanvas(400, 400);
  myCanvas.parent('first_tf_sketch');
  randomSeed(0);
  xs = getXs(numTraining);
  xt = getXTensor(numTraining);
  trainingPoints = makeTrainingPoints(xs, numTraining);
  model = makeModel(layerSizes, activations);
  addPredictions(model, xt, predictions, trainingPoints);
}

function getXs(numPoints) {
  let xs = [];
  for (let i = 0; i < numPoints; i++) {
    xs.push(i/numPoints);
  }
  return xs;
}

function getXTensor(numPoints) {
  let xt = [];
  for (let i = 0; i < numPoints; i++) {
    xt.push([i/numPoints]);
  }
  return tf.tensor(xt);
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

function makeTrainingPoints(xs, numPoints) {
  let points = [];

  for (let i = 0; i < numPoints; i ++) {
    let x = xs[i];
    let y = sin(TWO_PI * x) + 0.5 * randomGaussian(0, 0.4);
    points.push([x, y]);
  }

  return points;
}

function makeColor(rgbString, colorAlpha = 255) {
  let col = color(rgbString);
  return color(red(col), green(col), blue(col), colorAlpha);
}

function drawPoints(points, pointColor, size) {
  noStroke();
  fill(pointColor);
  for (var i = 0; i < points.length; i ++) {
    ellipse(
      map(points[i][0], 0, 1, 0, width),
      map(points[i][1], -1.5, 2, 0, height),
      size
    );
  }
}

function addPredictions(model, xt, predictions, trainingPoints, trail) {
  let modelPred = model.predict(xt).dataSync();
  let ltstPred = [];
  for (var i = 0; i < trainingPoints.length; i ++) {
    ltstPred.push([xs[i], modelPred[i]]);
  }
  predictions.push(ltstPred);
  losses.push(loss(ltstPred, trainingPoints));
  if (predictions.length > trail) {
    predictions = predictions.slice(1);
  }

  return predictions;
}

function loss(pred, training) {
  let error = 0;
  for(let i = 0; i < pred.length; i++) {
    error += Math.pow(pred[i][1] - training[i][1], 2);
  }
  return error / pred.length;
}

function modelLoss(pred, label) {
  return pred.sub(label).square().mean();
}

function pickRandomPoints(points, numPoints) {
  var rand_index;
  var xs = [];
  var ys = [];
  for (var i = 0; i < numPoints; i ++) {
    rand_index = int(random(0, points.length));
    xs.push([points[rand_index][0]]);
    ys.push([points[rand_index][1]]);
  }

  return [xs, ys];
}

function trainModel(model, trainingPoints, batchSize) {

  // pick random training batch
  let [xs, ys] = pickRandomPoints(trainingPoints, batchSize);

  optimizer.minimize(() => {
    let pred = model.predict(tf.tensor(xs));
    return modelLoss(pred, tf.tensor(ys));
  })
}

function drawPredictionLine() {
  strokeWeight(2);
  stroke(my_dark_colors[2]);
  var current_pred = predictions[0];
  for (var i = 0; i < num_training - 1; i ++) {
    var new_pred = predictions[i + 1];
    line(
      map(i / num_training, 0, 1, 0, width),
      map(current_pred, -1, 2, 0, height),
      map((i + 1) / num_training, 0, 1, 0, width),
      map(new_pred, -1, 2, 0, height)
    );

    current_pred = new_pred;
  }
}

function roundPlaces(num, places) {
  return Math.round(num * Math.pow(10, places)) / Math.pow(10, places);
}

function draw() {
  background(myLightColors[0]);
  drawPoints(trainingPoints, makeColor(myDarkColors[1]), 6);
  for (let i = 0; i < predictions.length; i++) {
    drawPoints(
      predictions[i],
      makeColor(myDarkColors[2], (255 / trail) * i), 2);
  }

  // draw loss graph
  stroke(myDarkColors[3]);
  noFill();
  rect(0, 0, width / 4, height / 4);
  noStroke();
  fill(myDarkColors[3]);
  for(let i = 0; i < losses.length; i++) {
    ellipse(
      map(i, 0, losses.length, 0, width / 4),
      map(losses[i], losses[0], 0, 0, height / 4),
      1
    );
  }
  text(trainingSteps, width / 4 - 10, height / 4 + 14);
  text(roundPlaces(losses[losses.length - 1], 2), width / 4 + 4,  map(losses[losses.length - 1], losses[0], 0, 0, height / 4));

  if (frameCount == 1 && saveFirstFrame) {
    saveCanvas("training_points", "jpg");
  }

  // if (frameCount % 5 == 0) {
    trainModel(model, trainingPoints, batchSize);
    trainingSteps += 1;
    predictions = addPredictions(model, xt, predictions, trainingPoints, trail);
  // }

//  if (frameCount % 10 == 0) {
//    getPredictions();
//  }
//  drawPredictionLine();
//  trainModel();
}
