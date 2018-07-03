let xres = 20;
let yres = 20;
const pixels = getPixels(xres, yres);
let colors;
let labeledPoints = [];
let xt;
let labels = [];
let yt;
let currentLabelChoice = 1;
let losses = [];
let maxLoss = 0;

// defining the model
let model;
const layerSizes = [2, 3, 3, 1];
const activations = ['tanh', 'tanh', 'tanh'];
const learningRate = 0.01;
const optimizer = tf.train.adam(learningRate);
const loss = 'meanSquaredError';

function setup() {
  let myCanvas = createCanvas(400, 400);
  myCanvas.parent('inter_class_sketch');
  model = makeModel(layerSizes, activations, optimizer, loss);
  setTimeout(getColors, 10);
  setTimeout(train, 10);
}

function getPixels(xres, yres) {
  let pixels = [];
  for (let i = 0; i < xres; i ++) {
    for (let j = 0; j < yres; j ++) {
      pixels.push([i / xres, j / yres]);
    }
  }
  return tf.tensor(pixels);
}

function getColors() {
  tf.tidy(() => {
    model.predict(pixels).data().then(result => {colors = result});
  });

  setTimeout(getColors, 10);
}

function train() {
  if (labeledPoints.length > 0) {
    model
      .fit(xt, yt)
      .then(result => {
        let newLoss = result.history.loss[0];
        losses.push(newLoss);
        if (newLoss > maxLoss) {
          maxLoss = newLoss;
        }
      });
  }
  setTimeout(train, 10);
}

function keyPressed() {
  // S for "switch"
  if (keyCode == 83) {
    currentLabelChoice *= -1;
  }
}

function mouseClicked() {
  labeledPoints.push([map(mouseX, 0, width, 0, 1), map(mouseY, 0, height, 0, 1)]);
  labels.push([currentLabelChoice]);
  if (xt) {
    xt.dispose();
  }
  if (yt) {
    yt.dispose();
  }
  xt = tf.tensor2d(labeledPoints);
  yt = tf.tensor2d(labels);
}


function drawPixels(xres, yres, colors, w, h) {
  noStroke();
  for (let i = 0; i < xres; i ++) {
    for (let j = 0; j < yres; j ++) {

      fill(makeInbetweenColor(
        myLightColors[0],
        myLightColors[1],
        map(colors[i * xres + j], -1, 1, 0, 1),
        255
      ));

      let x = map(i / xres, 0, 1, 0, w);
      let y = map(j / yres, 0, 1, 0, h);
      rect(x, y, w / xres, h / yres);
    }
  }
}

function drawLabeledPoints(labeledPoints, labels, s, w, h) {
  for (let i = 0; i < labeledPoints.length; i ++) {
    fill(myDarkColors[map(labels[i], -1, 1, 0, 1)]);
    let x = map(labeledPoints[i][0], 0, 1, 0, w);
    let y = map(labeledPoints[i][1], 0, 1, 0, h);
    rect(x, y, s, s);
  }
}

function draw() {
  if (colors) {
    drawPixels(xres, yres, colors, width, height);
  }
  if (labeledPoints.length > 0) {
    drawLabeledPoints(labeledPoints, labels, 5, width, height);
  }
  plot(losses, maxLoss, 0, 0, width / 4, height / 4, myDarkColors[2]);

  noStroke();
  fill(myDarkColors[2]);
  text("label choice = " + currentLabelChoice, width - 100, 12);
}
