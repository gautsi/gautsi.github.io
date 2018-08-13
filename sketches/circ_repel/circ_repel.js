function Circle(x, y, r) {
  this.x = x;
  this.y = y;
  this.r = r;
  this.xv = 0;
  this.yv = 0;
  this.xa = 0;
  this.ya = 0;
  this.posList = [];

  this.show = function() {
    stroke(makeColor(myDarkColors[1], 40));
    strokeWeight(2);
    noFill();
    ellipse(this.x, this.y, this.r, this.r);
    // this.showTrail();
  }

  this.showTrail = function() {
    fill(makeColor(myDarkColors[3], 255));
    noStroke();
    for (let i = 0; i < this.posList.length; i ++) {
      ellipse(this.posList[i][0], this.posList[i][1], 1);
    }
  }

  this.updatePos = function() {
    this.xv += this.xa;
    this.yv += this.ya;
    this.x += this.xv;
    this.y += this.yv;
    this.posList.push([this.x, this.y]);
    if (this.posList.length > 100) {
      this.posList = this.posList.slice(1);
    }

  }
}

function Circles(circleList) {
  this.circleList = circleList;

  this.show = function() {
    if (showCirc == 1) {
      this.showCircles();
    }
    if (showLin == 1) {
      this.showLines();
    }
  }

  this.showCircles = function() {
    for (let i = 0; i < this.circleList.length; i ++) {
      this.circleList[i].show();
    }
  }

  this.updatePos = function() {
    for (let i = 0; i < this.circleList.length; i ++) {
      this.circleList[i].updatePos();
    }
  }

  this.calcAcc = function() {
    for (let i = 0; i < this.circleList.length; i ++) {
      let xa = 0;
      let ya = 0;
      for (let j = 0; j < this.circleList.length; j ++) {
        let distance = dist(circleList[i].x, circleList[i].y, circleList[j].x, circleList[j].y);
        if (distance > 0) {
          let distFactor = 1 / 2 * exp(-1 / 15 * distance);
          xa += distFactor * (circleList[i].x - circleList[j].x) / (distance);
          ya += distFactor * (circleList[i].y - circleList[j].y) / (distance);
        }
      }
      // walls
      xa += 1/2 * (2 / (50 + this.circleList[i].x) -  2 / (50 + width - this.circleList[i].x));
      ya += 1/2 * (2 / (50 + this.circleList[i].y) -  2 / (50 + height - this.circleList[i].y));
      this.circleList[i].xa = xa / 3;
      this.circleList[i].ya = ya / 3;
    }
  }

  this.showLines = function() {
    strokeWeight(2);
    noFill();
    for (let i = 0; i < this.circleList.length - 1; i ++) {
      for (let j = i + 1; j < this.circleList.length; j ++) {
        let distance = dist(circleList[i].x, circleList[i].y, circleList[j].x, circleList[j].y);
        stroke(makeColor(myDarkColors[2], map(distance, 0, 100, 800, 0)));
        line(this.circleList[i].x, this.circleList[i].y, this.circleList[j].x, this.circleList[j].y);
      }
    }
  }
}

let circles;
let showCirc = 1;
let showLin = 1;

function setup() {
  let myCanvas = createCanvas(400, 400);
  myCanvas.parent('circ_repel_sketch');
  circles = makeCircles(4, 4, 100, 100, 60, 60, 70, 0);
}

function makeCircles(nrow, ncol, firstx, firsty, incrx, incry, r, randFactor) {
  let circles = [];
  for (let x = firstx; x < firstx + nrow * incrx; x += incrx) {
    for (let y = firsty; y < firsty + ncol * incry; y += incry) {
      circles.push(new Circle(x + randFactor * random(), y + randFactor * random(), r));
    }
  }
  return new Circles(circles);
}

function keyPressed() {
  // C for "cicle"
  if (keyCode == 67) {
    showCirc *= -1;
  }

  // L for "line"
  if (keyCode == 76) {
    showLin *= -1;
  }
}

function draw() {
  background(myLightColors[0]);
  circles.show();
  circles.calcAcc();
  circles.updatePos();
}
