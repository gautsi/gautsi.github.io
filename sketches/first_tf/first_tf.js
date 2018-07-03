const numTrainingPoints = 150;
let losses = [];
let maxLossPlot = 500;
let predictions = [];
trail = 5;

let xs;
let ys;
let xt;
let yt;

// defining the model
let model;
const layerSizes = [1, 2, 1];
const activations = ['tanh', null];
const learningRate = 0.01;
const optimizer = tf.train.adam(learningRate);
const loss = 'meanSquaredError';


function setup() {
  let myCanvas = createCanvas(400, 400);
  myCanvas.parent('first_tf_sketch');

  randomSeed(0);
  [xs, ys] = makeTrainingPoints(numTrainingPoints);
  [xt, yt] = [tf.tensor(xs), tf.tensor(ys)];


  model = makeModel(layerSizes, activations, optimizer, loss);

  setTimeout(() => {train(model, xt, yt)}, 10);
  setTimeout(() => {getPredictions(model, xt, trail)}, 10);
}

function train(model, xt, yt) {
  tf.tidy(() => {
    trainModel(model, xt, yt).then(result => {
      losses.push(result);
    });
  });

  setTimeout(() => {train(model, xt, yt)}, 10);
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
    let y = 0.5 + 0.3 * sin(TWO_PI * x) + randomGaussian(0, 0.08);
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

function getPredictions(model, xt, trail) {
  // get predictions
  tf.tidy(() => {
    model.predict(xt).data().then(result => {
      predictions.push(result);
      if (predictions.length > trail) {
        predictions = predictions.slice(1);
      }
    });
  });

  setTimeout(() => {getPredictions(model, xt, trail)}, 10);
}

function draw() {
  background(myLightColors[0]);

  // plot training points
  plotPoints(xs, ys, width, height, myDarkColors[1], 6, 0);

  // plot predictions
  plotPredictions(predictions, width, height, myDarkColors[2]);

  // plot losses
  plot(losses, maxLossPlot, 0, 0, width / 4, height / 4, myDarkColors[3]);
}
