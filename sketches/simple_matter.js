
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
const model = tf.sequential();

function setup() {
  createCanvas(400, 400);

  // model input (15-dim):
  // position of the ball (x, y)
  // velocity of the ball (x, y)
  // position of the peg (x, y)
  // velocity of the peg (x, y)
  // target (x, y)
  // chosen action (none, up, down, left, right)

  // model output (9-dim):
  // predicted next position of the ball (x, y)
  // predicted next velocity of the ball (x, y)
  // predicted next position of the peg (x, y)
  // predicted next velocity of the peg (x, y)
  // q value
  model.add(tf.layers.dense({units: 9, inputShape: 15}));

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

function getInput(action){
  return tf.tensor([[
    map(ball.body.position.x, 100, 200, 0, 1),
    map(ball.body.position.y, 150, 250, 0, 1),
    ball.body.velocity.x,
    ball.body.velocity.y,
    map(peg.body.position.x, 100, 200, 0, 1),
    map(peg.body.position.y, 150, 250, 0, 1),
    peg.body.velocity.x,
    peg.body.velocity.y,
    target.x,
    target.y,
    checkAction(0, action),
    checkAction(1, action),
    checkAction(2, action),
    checkAction(3, action),
    checkAction(4, action)
  ]]);
}

function movePeg(){
  var bestAction = actions[0];
  var maxQValue = -1000;
  for(var x = 0; x < actions.length; x++){
    actionQValue = model.predict(getInput(actions[x])).dataSync()[8];
    // console.log(actionQValue);
    if (actionQValue > maxQValue) {
      maxQValue = actionQValue;
      bestAction = actions[x];
    }
  }
  if (bestAction == 'up') {
    peg.keyboardUpdate(UP_ARROW);
  }
  else if (bestAction == 'down') {
    peg.keyboardUpdate(DOWN_ARROW);
  }
  else if (bestAction == 'left') {
    peg.keyboardUpdate(LEFT_ARROW);
  }
  else if (bestAction == 'right') {
    peg.keyboardUpdate(RIGHT_ARROW);
  }
}

function draw() {
  background(51);
  ball.show();
  peg.show();
  for (var x = 0; x < walls.length; x++) {
    walls[x].show();
  }
  noStroke();
  fill(217, 95, 2);
  ellipse(target.x, target.y, 5);

  Engine.update(engine);

  movePeg();
}
