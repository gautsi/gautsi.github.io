
// module aliases
var Engine = Matter.Engine,
    // Render = Matter.Render,
    World = Matter.World,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Vertices = Matter.Vertices;

var ball;
var peg;
var walls = [];
var target = {x: 120, y: 240};
var actions = ['none', 'up', 'down', 'left', 'right'];

var gameCount = 0;
var gameFrame = 0;
var gameStates = [[]];
var gameActions = [[]];
var randFactor = 100;

var currentAction;

var startingQValues = [];

const model = tf.sequential();
const learningRate = 0.01;
const optimizer = tf.train.adam(learningRate);


function setup() {
  createCanvas(400, 400);

  // model input (15-dim):
  // position of the ball (x, y)
  // velocity of the ball (x, y)
  // position of the peg (x, y)
  // velocity of the peg (x, y)
  // target (x, y)
  // chosen action (none, up, down, left, right)

  // model output (1-dim):
  // q value
  model.add(
    tf.layers.dense(
      {
        units: 1,
        inputShape: 15,
        kernelInitializer: 'randomNormal',
        biasInitializer: 'randomNormal'
      }
    )
  );

  // create an engine
  engine = Engine.create();
  world = engine.world;

  // turn off gravity
  engine.world.gravity.y = 0;

  // add ball
  ball = new Ball(150, 200, 5);

  // add peg
  peg = new Peg(160, 160, 5);

  // add walls
  walls = [
    new Boundary(100, 200, 5, 100), // left wall
    new Boundary(200, 200, 5, 100), // right wall
    new Boundary(150, 150, 100, 5), // top wall
    new Boundary(150, 250, 100, 5), // bottom wall
  ];

  // console.log(model.predict(tf.tensor([[1]])).print());
}

function keyPressed(){
  peg.keyboardUpdate(keyCode);
}

function checkAction(pos, action){
  if (actions[pos] == action){
    return 1;
  }
  else {
    return 0;
  }
}

function resetGame() {
  World.remove(world, ball.body);
  World.remove(world, peg.body);
  // add ball
  ball = new Ball(150, 200, 5);

  // add peg
  peg = new Peg(160, 160, 5);
}


function State() {
  this.ball_pos = {x: ball.body.position.x, y: ball.body.position.y};
  this.ball_vel = {x: ball.body.velocity.x, y: ball.body.velocity.y};
  this.peg_pos = {x: peg.body.position.x, y: peg.body.position.y};
  this.peg_vel = {x: peg.body.velocity.x, y: peg.body.velocity.y};
  this.target = target;

  this.getDist = function() {
      return round(
        dist(
          this.ball_pos.x,
          this.ball_pos.y,
          this.target.x,
          this.target.y));
  }

  this.getReward = function() {
    return max(0, 50 - this.getDist());
  }

  this.getMaxQValue = function() {
    var maxQValue = getQValue(this, actions[0]);
    for(var x = 1; x < actions.length; x++){
      var actionQValue = getQValue(this, actions[x]);
      if (actionQValue > maxQValue) {
        maxQValue = actionQValue;
      }
    }
    return maxQValue;
  }
}

function getInput(state, action){
  return [
    map(state.ball_pos.x, 100, 200, 0, 1),
    map(state.ball_pos.y, 150, 250, 0, 1),
    map(state.ball_vel.x, -10, 10, 0, 1),
    map(state.ball_vel.y, -10, 10, 0, 1),
    map(state.peg_pos.x, 100, 200, 0, 1),
    map(state.peg_pos.y, 150, 250, 0, 1),
    map(state.peg_vel.x, -10, 10, 0, 1),
    map(state.peg_vel.y, -10, 10, 0, 1),
    map(state.target.x, 100, 200, 0, 1),
    map(state.target.y, 150, 250, 0, 1),
    checkAction(0, action),
    checkAction(1, action),
    checkAction(2, action),
    checkAction(3, action),
    checkAction(4, action)
  ];
}

function getQValue(state, action) {
  return model.predict(tf.tensor([getInput(state, action)])).dataSync()[0];
}

function pickRandomAction() {
  return actions[int(random(0, actions.length))];
}

function pickAction() {

  if (100 * random() < randFactor) {
    return pickRandomAction();
  }
  else {
    var state = new State();
    var bestAction = actions[0];
    var maxQValue = getQValue(state, bestAction);
    for(var x = 1; x < actions.length; x++){
      var actionQValue = getQValue(state, actions[x]);
      if (actionQValue > maxQValue) {
        maxQValue = actionQValue;
        bestAction = actions[x];
      }
    }
      return bestAction;
  }
}


function movePeg(action){
  if (action == 'up') {
    peg.keyboardUpdate(UP_ARROW);
  }
  else if (action == 'down') {
    peg.keyboardUpdate(DOWN_ARROW);
  }
  else if (action == 'left') {
    peg.keyboardUpdate(LEFT_ARROW);
  }
  else if (action == 'right') {
    peg.keyboardUpdate(RIGHT_ARROW);
  }
}

function getLabel(nextState) {
 return nextState.getReward() + 0.5 * nextState.getMaxQValue();
}

function modelLoss(pred, label) {
  const error = pred.sub(label).square().mean();
  return error;
}

function trainModel() {
  var currGameStates = gameStates[gameCount];
  var currGameActions = gameActions[gameCount];
  var inputs = [];
  var labels = [];
  for (var i = 0; i < currGameStates.length - 1; i ++) {
    inputs.push(getInput(currGameStates[i], currGameActions[i]));
    labels.push(getLabel(currGameStates[i + 1]));
  }

  // for (var x = 0; x < 10; x ++) {
    optimizer.minimize(() => {
      const pred = model.predict(tf.tensor(inputs));
      return modelLoss(pred, tf.tensor(labels));
    });
  // }
}

function runGame() {
  if (gameFrame == 100) {
    trainModel();
    gameCount += 1;
    gameFrame = 0;
    gameStates.push([]);
    gameActions.push([]);
    if (randFactor > 0) {
      randFactor -= 1;
    }
    resetGame();
  }
  else {
    if (gameFrame == 0) {
      startingQValues = [];
      for (var i = 0; i < actions.length; i++) {
        startingQValues.push(getQValue(new State(), actions[i]));
      }
    }
    gameStates[gameCount].push(new State());
    gameActions[gameCount].push(currentAction);
    gameFrame += 1;
  }
}

function printInfo() {
  var state = new State();
  noFill();
  stroke(255);
  strokeWeight(1);
  text("game = " + gameCount, 20, 10);
  text("frame = " + gameFrame, 20, 20);
  text("rand = " + randFactor, 20, 30);
  text("dist = " + state.getDist(), 20, 40);
  for (var i = 0; i < actions.length; i ++) {
    text(actions[i] + " = " + startingQValues[i], 20, 50 + 10 * i);
  }
}


function draw() {
  background(51);
  printInfo();

  ball.show();
  peg.show();
  for (var x = 0; x < walls.length; x++) {
    walls[x].show();
  }
  noStroke();
  fill(217, 95, 2);
  ellipse(target.x, target.y, 5);

  Engine.update(engine);
  currentAction = pickAction();
  movePeg(currentAction);

  runGame();
}
