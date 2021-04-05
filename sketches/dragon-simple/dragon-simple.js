// self-contained unfolding dragon curve sketch

function step(sketch) {
  return sketch.millis() % 17500;
}

function logistic(sketch, x, shift = 0) {
  return 1 / (1 + sketch.exp(-1 * 0.01 * (x - shift)));
}

function foldStep(sketch, x, level = 0) {
  return (
    2 -
    logistic(sketch, x, 1000 * level + 1000) +
    logistic(sketch, x, -1000 * level + 17000)
  );
}

function drawSeq(sketch, seq) {
  seq.map((i) => {
    sketch.line(0, 0, 0, 10);
    sketch.translate(0, 10);
    sketch.rotate((i * sketch.PI) / 2);
  });
}

function makeAndDrawSeq(sketch, seq, foldStepFunc = foldStep, level = 1) {
  if (seq.length < 2 ** 7) {
    let rev = seq
      .slice()
      .reverse()
      .map((i) => -1 * i);

    let newSeq = seq
      .concat(foldStepFunc(sketch, step(sketch), level))
      .concat(rev);

    makeAndDrawSeq(sketch, newSeq, foldStepFunc, level + 1);
  } else {
    // console.log(seq);
    drawSeq(sketch, seq);
  }
}

function commonSetup(sketch, width, height) {
  sketch.createCanvas(width, height);
  sketch.angleMode(sketch.RADIANS);
  sketch.strokeWeight(3);
  sketch.stroke(117, 112, 179);
  sketch.fill(117, 112, 179);
}

function commonDraw(sketch) {
  sketch.background(102, 194, 165);
  sketch.translate(sketch.width / 3, sketch.height / 3);
}

let dragonCurve = new p5((sketch) => {
  sketch.setup = () => {
    commonSetup(sketch, 200, 300);
  };
  sketch.draw = () => {
    commonDraw(sketch);
    makeAndDrawSeq(sketch, [foldStep(sketch, step(sketch))]);
  };
}, "dragon_curve");

let drawSeqEx = new p5((sketch) => {
  sketch.setup = () => {
    commonSetup(sketch, 100, 100);
  };
  sketch.draw = () => {
    commonDraw(sketch);
    drawSeq(sketch, [1, -1, 1, -1, 1, -1]);
  };
}, "draw_seq_ex");

let intermediateEx = new p5((sketch) => {
  sketch.setup = () => {
    commonSetup(sketch, 100, 100);
  };
  sketch.draw = () => {
    commonDraw(sketch);
    drawSeq(sketch, [1.5, -1.5, 1.5, -1.5, 1.5, -1.5]);
  };
}, "intermediate_ex");

function yToChart(value) {
  return 125 - 50 * value;
}

function drawAxes(sketch) {
  sketch.background(102, 194, 165);
  sketch.line(25, 125, 25, 25);
  sketch.line(25, 125, 175, 125);
  sketch.strokeWeight(1);
  sketch.text("time", 165, 140);
  [0, 1, 2].map((i) => sketch.text(i, 15, yToChart(i)));
  sketch.strokeWeight(3);
}

let singleLogisticEx = new p5((sketch) => {
  sketch.setup = () => {
    commonSetup(sketch, 200, 150);
  };
  sketch.draw = () => {
    drawAxes(sketch);
    for (let i = 0; i < 150; i++) {
      let y = 2 - logistic(sketch, 20 * i, 1200);
      sketch.point(i + 25, yToChart(y));
    }
  };
}, "single_logistic");

let doubleLogisticEx = new p5((sketch) => {
  sketch.setup = () => {
    commonSetup(sketch, 200, 150);
  };
  sketch.draw = () => {
    drawAxes(sketch);
    for (let i = 0; i < 150; i++) {
      let y =
        2 - logistic(sketch, 20 * i, 600) + logistic(sketch, 20 * i, 2000);
      sketch.point(i + 25, yToChart(y));
    }
  };
}, "double_logistic");

let allBendsEx = new p5((sketch) => {
  sketch.setup = () => {
    commonSetup(sketch, 200, 300);
  };
  sketch.draw = () => {
    commonDraw(sketch);
    makeAndDrawSeq(sketch, [1], (sketch, x, level) => foldStep(sketch, x));
  };
}, "all_bends");
