function eltAdd(v1, v2) {
  return v1.map((p, i) => p + v2[i]);
}

function eltMult(v1, s) {
  return v1.map(p => p * s);
}

function RectMark(x, y, w, h) {
  this.pos = [x, y];
  this.size = [w, h];

  this.v = [0, 0];

  this.show = function() {
    stroke(myDarkColors[1]);
    strokeWeight(2);
    noFill();
    rect(this.pos[0], this.pos[1], this.size[0], this.size[1]);
  }

  this.updatePos = function() {
    this.pos = eltAdd(this.pos, this.v);
  }

  this.updateVel = function(vAdd) {
    this.v = eltAdd(this.v, vAdd);
  }
}

function calcOverlap(rect1, rect2) {
  let overlap = [0, 1]
    .map(i => (rect1.pos[i] <= (rect2.pos[i] + rect2.size[i]) & (rect1.pos[i] + rect1.size[i]) >= rect2.pos[i]))
    .reduce((a, b) => a & b);
  let vAdd = overlap ? eltAdd(rect1.pos, eltMult(rect2.pos, -1)) : [0, 0];
  return vAdd;
}

function RectSet(rects) {
  this.rects = rects;

  this.show = function() {
    this.rects.forEach(rect => rect.show());
  }

  this.update = function() {
    this.rects.forEach(rect => {

      // overlap
      let vAdd = this.rects
        .map(rect2 => calcOverlap(rect, rect2))
        .reduce(eltAdd);

      rect.updateVel(eltMult(vAdd, 1.0 / 1000));

      // friction
      rect.updateVel(eltMult(rect.v, -1.0 / 5));

      rect.updatePos();
    });
  }
}

let testRects;
let numRects = 10;

function makeRectSet(num) {
  let rects = [];

  for (let i = 0; i < num; i ++) {
    rects.push(
      new RectMark(
        x = random(0, 300),
        y = random(0, 300),
        w = random(50, 100),
        h = random(50, 100)));
  }
  return new RectSet(rects);
}

function preload() {
  testRects = makeRectSet(numRects);
}

function setup() {
  let myCanvas = createCanvas(400, 400);
  myCanvas.parent('carto');
}

function draw() {
  background(myLightColors[0]);
  testRects.show();
  testRects.update();
}
