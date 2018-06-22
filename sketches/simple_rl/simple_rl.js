let states = [];
const actions = ['up', 'down', 'left', 'right'];
const posUpdAmnt = 0.001;
let rand = 1;

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
    'ball_pos': getRandPos(),
    'target_pos': getRandPos()
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
  return 1 / (1 + dist(ballPos[0], ballPos[1], targetPos[0], targetPos[1]));
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


function getXs(ballPos, targetPos) {

}

function trainModel(model, labeledPoints) {
  let [xs, ys] = getXYs(labeledPoints);

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
  rand = rand / 1.001;
}
