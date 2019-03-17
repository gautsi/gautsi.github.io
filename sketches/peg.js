function Peg(x, y, r){
  var options = {
    friction: 0,
    // frictionAir: 0,
    // frictionStatic: 0,
    restitution: 1
    // isStatic: true
  }
  this.body = Bodies.circle(x, y, r, options);
  this.r = r;
  World.add(world, this.body);

  this.show = function(){
    var pos = this.body.position;
    var angle = this.body.angle;
    push();
    translate(pos.x, pos.y);
    rotate(angle);
    // strokeWeight(1);
    // stroke(255);
    noStroke();
    fill(27, 158, 119);
    ellipse(0, 0, this.r * 2);
    pop();

  }

  this.keyboardUpdate = function(keyCode){
    var force = {x: 0, y: 0};
    var amnt = 0.0001;
    if (keyCode == RIGHT_ARROW) {
      force.x = amnt;
    }
    else if (keyCode == LEFT_ARROW) {
      force.x = -amnt;
    }
    else if (keyCode == DOWN_ARROW) {
      force.y = amnt;
    }
    else if (keyCode == UP_ARROW) {
      force.y = -amnt;
    }
    Body.applyForce(this.body, {x: this.body.position.x, y: this.body.position.y}, force);
  }

  this.mouseUpdate = function(){
    Body.setPosition(this.body, {x: mouseX, y: mouseY});
  }
}
