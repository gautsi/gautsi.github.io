function Circle(x, y, r) {
  this.x = x;
  this.y = y;
  this.r = r;
  this.xv = 0;
  this.yv = 0;
  this.xa = 0;
  this.ya = 0;

  this.show = function() {
    stroke(makeColor(myDarkColors[1], 50));
    strokeWeight(2);
    noFill();
    ellipse(this.x, this.y, this.r, this.r);
  }

  this.updatePos = function() {
    this.xv += this.xa;
    this.yv += this.ya;
    this.x += this.xv;
    this.y += this.yv;
  }
}

function Circles(circleList) {
  this.circleList = circleList;

  this.show = function() {
    for (let i = 0; i < this.circleList.length; i ++) {
      this.circleList[i].show();
    }
    this.showLines();
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
        if (i != j) {
          let distance = dist(circleList[i].x, circleList[i].y, circleList[j].x, circleList[j].y);
          // distx = this.circleList[j].x - this.circleList[i].x;
          // dirx = Math.sign(distx);
          // xa += -dirx / 10 * exp(-1 * abs(distx));
          xa += 1/2000 * (circleList[i].x - circleList[j].x) / (0.01 + distance);

          // disty = this.circleList[j].y - this.circleList[i].y;
          // diry = Math.sign(disty);
          // ya += -diry / 10 * exp(-1 * abs(disty));
          ya += 1/2000 * (circleList[i].y - circleList[j].y) / (0.01 + distance);
        }
      }
      // walls
      xa += 1/2 * (1 / (1 + this.circleList[i].x) -  1 / (1 + width - this.circleList[i].x));
      ya += 1/2 * (1 / (1 + this.circleList[i].y) -  1 / (1 + height - this.circleList[i].y));
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
        stroke(makeColor(myDarkColors[2], map(distance, 0, 100, 255, 0)));
        line(this.circleList[i].x, this.circleList[i].y, this.circleList[j].x, this.circleList[j].y);
      }
    }
  }
}

let circles;

function setup() {
  let myCanvas = createCanvas(400, 400);
  myCanvas.parent('circ_repel_sketch');
  circles = makeCircles(4, 4, 100, 100, 60, 60, 70, 1);
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

function draw() {
  background(myLightColors[0]);
  circles.show();
  circles.calcAcc();
  circles.updatePos();
}
