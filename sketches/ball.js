function Ball(x, y, r){
  var options = {
    friction: 0,
    // frictionAir: 0,
    // frictionStatic: 0,
    restitution: 1
    // density: 0.0001
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
    fill(157);
    ellipse(0, 0, this.r * 2);
    pop();

  }
}
