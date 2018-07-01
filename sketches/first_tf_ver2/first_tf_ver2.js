const numTrainingPoints = 200;
let losses = [];
let maxLoss = 0;
let predictions = [];
trail = 10;

let xs;
let ys;
let xt;
let yt;

// defining the model
let model;
const layerSizes = [1, 2, 1];
const activations = ['tanh', null];
const learningRate = 0.005;
const optimizer = tf.train.adam(learningRate);
const loss = 'meanSquaredError';


function setup() {
  let myCanvas = createCanvas(400, 400);
  myCanvas.parent('first_tf_sketch');

  [xs, ys] = makeTrainingPoints(numTrainingPoints);
  [xt, yt] = [tf.tensor(xs), tf.tensor(ys)];


  model = makeModel(layerSizes, activations, optimizer, loss);

  setTimeout(() => {tf.tidy(() => {train(model, xt, yt)})}, 10);
}

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


function train(model, xt, yt) {
  trainModel(model, xt, yt).then(result => {
    losses.push(result);
    if (result > maxLoss) {
      maxLoss = result;
    }
    setTimeout(() => {tf.tidy(() => {train(model, xt, yt)})}, 10);
  });
}

function trainModel(model, xt, yt) {
  return model.fit(xt, yt, {
    shuffle: true,
    epochs: 1
  }).then(result => {return result.history.loss[0]});
}

function makeTrainingPoints(numTrainingPoints) {
  let xs = [];
  let ys = [];

  for (let i = 0; i < numTrainingPoints; i ++) {
    let x = i / numTrainingPoints;
    let y = 0.5 + 0.5 * sin(TWO_PI * x) + randomGaussian(0, 0.1);
    xs.push([x]);
    ys.push([y]);
  }

  return [xs, ys];
}

function plotPredictions(predictions, w, h, c) {
  for (let i = 0; i < predictions.length; i++) {
    plotPoints(xs, predictions[i], w, h, makeColor(c, (255 / predictions.length) * i), 0, 2);
  }
}

function getPredictions(model, xt, predictions, trail) {
  // get predictions
  tf.tidy(() => {
    predictions.push(model.predict(xt).dataSync());
  });

  if (predictions.length > trail) {
      predictions = predictions.slice(1);
  }

  return predictions;
}

function draw() {
  background(myLightColors[0]);

  // plot training points
  plotPoints(xs, ys, width, height, myDarkColors[1], 6, 0);

  // get predictions
  predictions = getPredictions(model, xt, predictions, trail);

  // plot predictions
  plotPredictions(predictions, width, height, myDarkColors[2]);

  // plot losses
  plot(losses, maxLoss, 0, 0, width / 4, height / 4, myDarkColors[3]);
}
