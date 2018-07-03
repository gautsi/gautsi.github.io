let path = [];
let sgmntLength = 5;
let lineLength = 10;
let showLength = 100;

let mdlPath = [];
let losses = [];
let maxLossPlot = 500;

let timeoutTime = 100;


let xt;
let yt;

// defining the model
let model;
const layerSizes = [10, 3, 3, 2];
const activations = ['tanh', 'tanh', 'tanh'];
const learningRate = 0.01;
const optimizer = tf.train.adam(learningRate);
const loss = 'meanSquaredError';


function setup() {
  let myCanvas = createCanvas(400, 400);
  myCanvas.parent('seq_mdl_sketch');
  model = makeModel(layerSizes, activations, optimizer, loss);
  setTimeout(getTensors, timeoutTime);
  setTimeout(train, timeoutTime);
  setTimeout(predPath, timeoutTime);
}

function getTensors() {
  if (path.length > sgmntLength) {
    if (xt) {
      xt.dispose();
    }
    if (yt) {
      yt.dispose();
    }
    let xs = [];
    let ys = [];
    for (let i = 0; i < path.length - sgmntLength; i ++) {
      let x = [];
      for (let j = 0; j < sgmntLength; j ++) {
        x.push(...path[i + j]);
      }
      let y = path[i + sgmntLength];
      xs.push(x);
      ys.push(y);
    }

    xt = tf.tensor(xs);
    yt = tf.tensor(ys);
  }
  setTimeout(getTensors, timeoutTime);
}

function train() {
  if (path.length > sgmntLength && xt && yt) {
    model
      .fit(xt, yt)
      .then(result => {
        losses.push(result.history.loss[0]);
      });
  }
  setTimeout(train, timeoutTime);
}

function predPath() {
  if (mdlPath.length >= sgmntLength) {
    tf.tidy(() => {
      let inputPath = tf.tensor([mdlPath.slice(mdlPath.length - sgmntLength).reduce((a, c) => a.concat(c))]);
      model.predict(inputPath).data().then(result => {mdlPath.push([result[0], result[1]])});
      inputPath.dispose();
    });
  }
  setTimeout(predPath, timeoutTime);
}

function keyPressed() {
  let dir = [0, 0];
  switch(keyCode) {
    case 87: // W
      dir = [0, -1];
      break;
    case 68: // D
      dir = [1, 0];
      break;
    case 83: // S
      dir = [0, 1];
      break;
    case 65: // A
      dir = [-1, 0];
      break;
  }
  path.push(dir);
  if (mdlPath.length < sgmntLength) {
    mdlPath.push(dir);
  }
}

function drawPath(startX, startY, path, lineLength, c, lw) {
  let currPoint = [startX, startY];
  for (let i = 0; i < path.length; i ++) {
    let nextPoint = [currPoint[0] + lineLength * path[i][0], currPoint[1] + lineLength * path[i][1]];
    stroke(makeColor(c, 255 * (i / path.length)));
    strokeWeight(lw);
    line(currPoint[0], currPoint[1], nextPoint[0], nextPoint[1]);
    currPoint = nextPoint;
  }
}

function draw() {
  noStroke();
  fill(myLightColors[0]);
  rect(0, 0, width / 2, height);
  fill(myLightColors[1]);
  rect(width/2, 0, width / 2, height);
  drawPath(width / 4, height / 2, path, lineLength, myDarkColors[1], 2);
  let showMdlPath = mdlPath.slice(Math.max(0, mdlPath.length  - showLength));
  drawPath(3 * width / 4, height / 2, showMdlPath, lineLength,myDarkColors[0], 2);
  plot(losses, maxLossPlot, 10, 10, width / 4, height / 4, myDarkColors[2]);
}
