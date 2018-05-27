var training_points = [];
var num_training = 200;
var rand_point;
var predictions = [];
const model = tf.sequential();
const learningRate = 0.01;
const optimizer = tf.train.adam(learningRate);

function setup() {
  createCanvas(400, 400);
  makeTrainingPoints();
  makeModel();
}

function makeModel() {
  model.add(tf.layers.dense({activation: 'tanh', units: 2, inputShape: [1]}));
  model.add(tf.layers.dense({activation: 'tanh', units: 2, inputShape: [2]}));
  model.add(tf.layers.dense({units: 1, inputShape: [2]}));
}

function makeTrainingPoints() {
  for (var i = 0; i < num_training; i ++) {
    var x = random();
    var y = sin(TWO_PI * x) + 0.5 * random();
    training_points[i] = [x, y];
  }
}

function drawTrainingPoints() {
  noStroke();
  fill(my_dark_colors[1]);
  for (var i = 0; i < num_training; i ++) {
    ellipse(
      map(training_points[i][0], 0, 1, 0, width),
      map(training_points[i][1], -1, 2, 0, height),
      5
    );
  }
}

function modelLoss(pred, label) {
  const error = pred.sub(label).square().mean();
  return error;
}

function trainModel() {
  // pick random points
  var rand_index;
  var xs = [];
  var ys = [];
  for (var i = 0; i < 40; i ++) {
    rand_index = int(random(0, num_training));
    xs.push([training_points[rand_index][0]]);
    ys.push([training_points[rand_index][1]]);
  }

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
  background(my_light_colors[0]);
  drawTrainingPoints();
  if (frameCount % 50 == 0) {
    getPredictions();
  }
  drawPredictionLine();
  trainModel();
}
