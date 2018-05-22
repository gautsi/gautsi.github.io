// module aliases
var Engine = Matter.Engine,
    // Render = Matter.Render,
    World = Matter.World,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Vertices = Matter.Vertices;

var ground;
var balls = [];
var testBody;

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
  // testBody = Bodies.fromVertices(200, 200, test, {isStatic: true});
  // World.add(world, ground);
  World.add(world, leftGround);
  World.add(world, middleGround);
  World.add(world, rightGround);

  console.log(testBody);
}

function mousePressed() {
  balls.push(new Ball(mouseX, mouseY, random(10, 40)));
}


function draw() {
  background(51);

  Engine.update(engine);

  for(var x = 0; x < balls.length; x = x + 1){
    balls[x].show();
  }


  noStroke(255);
  fill(170);
  rectMode(CENTER);
  rect(leftGround.position.x, leftGround.position.y, 100, 100);
  rect(middleGround.position.x, middleGround.position.y, 50, 100);
  rect(rightGround.position.x, rightGround.position.y, 300, 100);
}
