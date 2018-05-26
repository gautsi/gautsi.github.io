// module aliases
var Engine = Matter.Engine,
    // Render = Matter.Render,
    World = Matter.World,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Vertices = Matter.Vertices;

var ground;
var ball;
var testBody;
var peg;

function setup() {
  createCanvas(400, 400);

  // create an engine
  engine = Engine.create();
  world = engine.world;
  var options = {
    friction: 0,
    isStatic: true
  };
  leftGround = Bodies.rectangle(50, 400, 100, 100, options);
  middleGround = Bodies.rectangle(125, 425, 50, 100, options);
  rightGround = Bodies.rectangle(300, 400, 300, 100, options);
  peg = Bodies.circle(250, 100, 5, options);
  // testBody = Bodies.fromVertices(200, 200, test, {isStatic: true});
  // World.add(world, ground);
  World.add(world, leftGround);
  World.add(world, middleGround);
  World.add(world, rightGround);
  World.add(world, peg);

  ball = new Ball(200, 0, 10);

  console.log(testBody);
}

function newBall() {
  World.remove(world, ball.body);
  ball = new Ball(200, 0, 10);
}

function keyPressed(){
  console.log(peg.position.x);
  if (keyCode == RIGHT_ARROW) {
    Body.setPosition(peg, {x: peg.position.x + 1, y: peg.position.y});
    Body.setVelocity(peg, {x: 1, y: 0});
  }
  else if (keyCode == LEFT_ARROW) {
    Body.setPosition(peg, {x: peg.position.x - 1, y: peg.position.y});
    Body.setVelocity(peg, {x: -1, y: 0});
  }
}


function draw() {
  background(51);

  Engine.update(engine);

  ball.show();


  noStroke(255);
  fill(170);
  rectMode(CENTER);
  rect(leftGround.position.x, leftGround.position.y, 100, 100);
  rect(middleGround.position.x, middleGround.position.y, 50, 100);
  rect(rightGround.position.x, rightGround.position.y, 300, 100);

  ellipse(peg.position.x, peg.position.y, peg.circleRadius * 2);

  if (frameCount % 100 == 0) {
    newBall();
  }

}
