const boardLength = 10;
let games = [];
const discount = 0.9;
let losses = [];
let maxLossPlot = 500;
const numGames = 100;
const numTrainGames = 10;

const plotModelQValues = [0, 5, 9];
const modelQValueTensor = makeModelQValueTensor(plotModelQValues);
let modelQValues;

let xt;
let yt;
let qvaluesxt;

let playerPos;
let targetPos;

// defining the model
let model;
const layerSizes = [3, 3, 3, 1];
const activations = ['tanh', 'tanh', 'tanh'];
const learningRate = 0.01;
const optimizer = tf.train.adam(learningRate);
const loss = 'meanSquaredError';

function setup() {
  let myCanvas = createCanvas(400, 400);
  myCanvas.parent('simple_rl_sketch');

  console.log(modelQValueTensor);

  model = makeModel(layerSizes, activations, optimizer, loss);
  startNewGame();
  setTimeout(getQValues, 10);
  setTimeout(makeTensors, 10);
  setTimeout(trainModel, 10);
  setTimeout(getModelQValues, 10);
}

function makeModelQValueTensor(plotModelQValues) {
  let xs = [];
  for (let i = 0; i < plotModelQValues.length; i ++) {
    for (let j = 0; j < boardLength; j ++) {
      xs.push(...[0, 1].map(e => [j / boardLength,  plotModelQValues[i] / boardLength, e]));
    }
  }
  return tf.tensor(xs);
}

function getModelQValues() {
  tf.tidy(() => {
    model.predict(modelQValueTensor).data().then(result => {modelQValues = result});
  });
  setTimeout(getModelQValues, 10);
}

function startNewGame() {
  playerPos = floor(random(0, boardLength));
  targetPos = floor(random(0, boardLength));
  games.push({
    "states": [{
      "player pos": playerPos,
      "target pos": targetPos
    }],
    "actions": [],
    "rewards": [],
    "qvalues": [],
    "ended": false
  });
}

function getQValues() {

  if (qvaluesxt) {
    qvaluesxt.dispose();
  }

  qvaluesxt = tf.tensor([0, 1].map(e => [playerPos / boardLength, targetPos / boardLength, e]));
  tf.tidy(() => {
    model.predict(qvaluesxt).data().then(result => {move([result[0], result[1]])});
  });
}


function move(qvalues) {
  if (games[games.length - 1]["ended"]) {
    startNewGame();
  }
  else {
    let currGame = games[games.length - 1];
    let currState = currGame["states"][currGame["states"].length - 1];
    let action = getAction(qvalues, randFactor = max(0, 1 - 0.01 * games.length));
    playerPos = getNewPos(action);
    let reward = getReward();
    currGame["states"].push({"player pos": playerPos, "target pos": targetPos});
    currGame["actions"].push(action);
    currGame["rewards"].push(reward);
    currGame["qvalues"].push(qvalues);
    if (reward == 1 || currGame["states"].length > 20) {
      currGame["ended"] = true;
    }
  }
  if (games.length < numGames) {
    setTimeout(getQValues, 10);
  }
}

function actionNum(action) {
  if (action == "l") {
    return 0;
  }
  else {
    return 1;
  }
}

function makeTensors() {
  if (xt) {
    xt.dispose();
  }
  if (yt) {
    yt.dispose();
  }

  let xs = [];
  let ys = [];

  for (let i = max(0, games.length - numTrainGames); i < games.length; i ++) {
  // if (games.length > 1 && games[games.length - 1]["ended"]) {
    let game = games[i]; // games[games.length - 1];
    for (let j = 0; j < game["states"].length - 1; j ++) {
      let currState = game["states"][j];
      xs.push([
        currState["player pos"] / boardLength,
        currState["target pos"] / boardLength,
        actionNum(game["actions"][j])]);

      let nextQValues = [0, 0];
      if (j < game["states"].length - 2) {
        nextQValues = game["qvalues"][j + 1];
      }

      ys.push([game["rewards"][j] + discount * max(...nextQValues)]);
    }
  }

  if (xs.length > 0 && ys.length > 0) {
    xt = tf.tensor(xs);
    yt = tf.tensor(ys);
  }

  setTimeout(makeTensors, 10);
}

function trainModel() {
  if (xt && yt) {
    tf.tidy(() => {
      model.fit(xt, yt).then(result => {losses.push(result.history.loss[0])});
    });
  }

  setTimeout(trainModel, 10);
}

function getNewPos(action) {
  if (action == "l" && playerPos > 0) {
    return playerPos - 1;
  }
  else if (action == "r" && playerPos < boardLength - 1) {
    return playerPos + 1;
  }
  else {
    return playerPos;
  }
}

function getReward() {
  if (playerPos == targetPos) {
    return 1;
  }
  else {
    return 0;
  }
}

function getAction(qvalues, randFactor) {
  if (random() < randFactor) {
    return randomAction();
  }
  else {
    if (qvalues[0] > qvalues[1]) {
      return "l";
    }
    else {
      return "r";
    }
  }
}


function randomAction() {
  if (random() < 0.5) {
    return "l";
  }
  else {
    return "r";
  }
}

function drawBoard(x, y, w, h, discrete = false) {
  if (modelQValues) {
    let maxQValue = max(...modelQValues);
    let minQValue = min(...modelQValues);
    for (let i = 0; i < plotModelQValues.length; i ++) {
      for (let j = 0; j < boardLength; j ++) {
        let relQValue = map(
          modelQValues[2 * (boardLength * i + j)] - modelQValues[2 * (boardLength * i + j) + 1],
          minQValue - maxQValue,
          maxQValue - minQValue,
          0,
          1
        )
        noStroke();
        if (discrete) {
          if (modelQValues[2 * (boardLength * i + j)] > modelQValues[2 * (boardLength * i + j) + 1]) {
            fill(myDarkColors[1]);
          }
          else {
            fill(myDarkColors[2]);
          }
        }
        else {
          fill(makeInbetweenColor(myDarkColors[2], myDarkColors[1], relQValue));
        }
        rect(x + j * w / boardLength, y + i * 25, w / boardLength - 2, 20);
      }
      fill(myDarkColors[0]);
      stroke(myDarkColors[0]);
      strokeWeight(3);
      rect(x + plotModelQValues[i] * w / boardLength, y + i * 25, w / boardLength - 2, 20);
    }
  }
}

function draw() {
  background(myLightColors[0]);

  drawBoard(0, 150, width, height, discrete = false);

  drawBoard(0, 275, width, height, discrete = true);

  // plot losses
  plot(losses, maxLossPlot, 10, 10, width / 4, height / 4, myDarkColors[3]);

  text(games.length, 100, 100);
}
