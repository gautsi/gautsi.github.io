// defining global variables
const trainingPoints = [];
const numTraining = 200;
const predictions = [];
const saveFirstFrame = false;

// defining the model
const model = tf.sequential();
const layerSizes = [1, 2, 1];
const activations = ['tanh', null];
const learningRate = 0.01;
const optimizer = tf.train.adam(learningRate);

function setup() {
  createCanvas(400, 400);
  makeTrainingPoints();
  makeModel();
}

function makeModel() {
  for (let i = 1; i < layerSizes.length; i ++) {
    model.add(
      tf.layers.dense({
        activation: activations[i - 1],
        units: layerSizes[i],
        inputShape: [layerSizes[i - 1]]}));
  }
}

function makeTrainingPoints() {
  for (let i = 0; i < numTraining; i ++) {
    let x = random();
    let y = sin(TWO_PI * x) + 0.5 * random();
    trainingPoints.push([x, y]);
  }
}

function drawTrainingPoints() {
  noStroke();
  fill(myDarkColors[1]);
  for (var i = 0; i < numTraining; i ++) {
    ellipse(
      map(trainingPoints[i][0], 0, 1, 0, width),
      map(trainingPoints[i][1], -1.5, 2, 0, height),
      6
    );
  }
}

function modelLoss(pred, label) {
  const error = pred.sub(label).square().mean();
  return error;
}

function pickRandomTraining(numPoints) {
  var rand_index;
  var xs = [];
  var ys = [];
  for (var i = 0; i < numPoints; i ++) {
    rand_index = int(random(0, numTraining));
    xs.push([trainingPoints[rand_index][0]]);
    ys.push([trainingPoints[rand_index][1]]);
  }

  return [xs, ys];
}

function trainModel() {

  // pick random training set
  var xs, ys

  optimizer.minimize(() => {
    const pred = model.predict(tf.tensor(xs));
    return modelLoss(pred, tf.tensor(ys));
  })
}

function getPredictions() {
  for (var i = 0; i < num_training; i ++) {
    predictions[i] = model.predict(tf.tensor([[i / num_training]])).dataSync()[0];
  }
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

function draw() {
  background(myLightColors[0]);
  drawTrainingPoints();

  if (frameCount == 1 && saveFirstFrame) {
    saveCanvas("training_points", "jpg");
  }

//  if (frameCount % 10 == 0) {
//    getPredictions();
//  }
//  drawPredictionLine();
//  trainModel();
}
