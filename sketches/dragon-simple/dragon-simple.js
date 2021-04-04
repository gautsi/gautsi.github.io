// self-contained unfolding dragon curve sketch

function setup() {
    let myCanvas = createCanvas(200, 300);
    myCanvas.parent('dragon_curve');
}

function step() {
    return millis() % 17000;
}

function logistic(shift = 0) {
    return 1 / (1 + exp(-1 * 0.01 * (step() - shift)));
}

function foldStep(level = 0) {
    return 2 - logistic(1000 * level + 1000) + logistic(-1000 * level + 17000);
}

function drawSeq(seq) {
    seq.map((i) => {
        line(0, 0, 0, 10);
        translate(0, 10);
        rotate(i * PI / 2);
    })
}

function makeAndDrawSeq(seq, level = 1) {
    if (seq.length < 2 ** 8) {
        let rev = reverse(seq.slice(0, -1)).map(i => -1 * i)
        makeAndDrawSeq(seq.concat(rev).concat(foldStep(level)), level + 1);
    } else {
        drawSeq(seq);
    }
}

function draw() {
    console.log(millis());
    angleMode(RADIANS);
    strokeWeight(3);
    stroke(117, 112, 179);
    background(102, 194, 165);
    translate(width / 3, height / 3);
    makeAndDrawSeq([foldStep()]);
    // saveCanvas('dragon_curve_frame', 'png');
}