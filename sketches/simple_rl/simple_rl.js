let states = [];
const actions = ['up', 'down', 'left', 'right'];
const posUpdAmnt = 0.005;
let rand = 1;
let randDecayFactor = 1.005;

let losses = [];
let maxLoss = 0;

let rewards = [];
let maxReward = 0;


// defining the model
// input = ball pos + target pos + action
// output = predicted reward
let model;
const layerSizes = [8, 4, 4, 1];
const activations = ['tanh', 'tanh', 'tanh'];
const learningRate = 0.01;
const optimizer = tf.train.adam(learningRate);

function setup() {
  let myCanvas = createCanvas(400, 400);
  myCanvas.parent('simple_rl_sketch');
  states.push({
    'ball_pos': [0.5, 0.5], // getRandPos(),
    'target_pos': [0.5, 0.5] // getRandPos()
  });
  model = makeModel(layerSizes, activations);
}

function getRandPos() {
  return [random(), random()];
}

function drawBall(states) {
  noStroke();
  fill(myDarkColors[1]);
  ellipse(
    map(states[states.length - 1]['ball_pos'][0], 0, 1, 0, width),
    map(states[states.length - 1]['ball_pos'][1], 0, 1, 0, height),
    10);
}

function drawTarget(states) {
  noStroke();
  fill(makeColor(myDarkColors[2]));
  ellipse(
    map(states[states.length - 1]['target_pos'][0], 0, 1, 0, width),
    map(states[states.length - 1]['target_pos'][1], 0, 1, 0, height),
    10);
}

function oneHot(action, actions) {
  let vec = [];
  for (let i = 0; i < actions.length; i ++) {
    if (actions[i] == action) {
      vec.push(1);
    }
    else {
      vec.push(0);
    }
  }
  return vec;
}

function getModelInputArr(state, action, actions) {
  return state['ball_pos'].concat(state['target_pos']).concat(oneHot(action, actions));
}

function getBestAction(actions, rewards) {
  let best = 0;
  for (let i = 1; i < rewards.length; i ++) {
    if (rewards[i] > rewards[best]) {
      best = i;
    }
  }
  return actions[best];
}

function getAction(actions, rewards, rand) {
  if (random() < rand) {
    return random(actions);
  }
  else {
    return getBestAction(actions, rewards);
  }
}

function getReward(ballPos, targetPos) {
  return 1 / (1 + 2 * dist(ballPos[0], ballPos[1], targetPos[0], targetPos[1]));
}


function updateBall(states, model, rand, actions) {
  let lastState = states[states.length - 1];
  let input = [];
  for (let i = 0; i < actions.length; i ++) {
    input.push(getModelInputArr(lastState, actions[i], actions));
  }
  let predRewards = model.predict(tf.tensor(input)).dataSync();
  let action = getAction(actions, predRewards, rand);
  let lastPos = lastState['ball_pos'];
  let nextPos = [];

  if (action == 'up') {
    nextPos = [lastPos[0], lastPos[1] - posUpdAmnt];
  }
  else if (action == 'down') {
    nextPos = [lastPos[0], lastPos[1] + posUpdAmnt];
  }
  else if (action == 'left') {
    nextPos = [lastPos[0] - posUpdAmnt, lastPos[1]];
  }
  else if (action == 'right') {
    nextPos = [lastPos[0] + posUpdAmnt, lastPos[1]];
  }

  states[states.length - 1]['action'] = action;
  states[states.length - 1]['reward'] = getReward(nextPos, lastState['target_pos']);
  states.push({
    'ball_pos': nextPos,
    'target_pos': lastState['target_pos']
  });

  return states;
}

function getXYs(states, actions){
  let xs = [];
  let ys = [];
  for (let i = 0; i < states.length - 1; i ++) {
    xs.push(getModelInputArr(states[i], states[i]['action'], actions));
    ys.push([states[i]['reward']]);
  }
  return [xs, ys];
}

function getLoss(model, states, actions) {
  let [xs, ys] = getXYs(states, actions);
  let predictions = model.predict(tf.tensor(xs));
  return tf.losses.meanSquaredError(tf.tensor(ys), predictions).dataSync();
}


function trainModel(model, states, actions) {
  let [xs, ys] = getXYs(states, actions);
  optimizer.minimize(() => {
    let pred = model.predict(tf.tensor(xs));
    return tf.losses.meanSquaredError(tf.tensor(ys), pred);
  })
}

function draw() {
  background(myLightColors[0]);
  drawBall(states);
  drawTarget(states);
  states = updateBall(states, model, rand, actions);
  trainModel(model, states, actions);

  let currLoss = getLoss(model, states, actions);
  losses.push(currLoss);
  if (currLoss > maxLoss) {
    maxLoss = currLoss;
  }
  plot(losses, maxLoss, 0, 0, width / 4, height / 4, myDarkColors[3]);

  let currReward = states[states.length - 2]['reward'];
  rewards.push(currReward);
  if (currReward > maxReward) {
    maxReward = currReward;
  }
  plot(rewards, maxReward, 0, height / 4 + 20, width / 4, height / 4, myDarkColors[4]);


  rand = rand / randDecayFactor;
}
