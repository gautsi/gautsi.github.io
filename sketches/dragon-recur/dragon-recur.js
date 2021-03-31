function setup(sketch, fr) {
    return () => {
        sketch.createCanvas(500, 500);
        sketch.angleMode(sketch.RADIANS);
        sketch.frameRate(fr);
    }
}

function drawCurve(sketch, seq, add_func, level = 1) {
    if (seq.length < sketch.num) {
        let rev = reverse(seq.slice(0, -1)).map(i => -1 * i)
        drawCurve(sketch, seq.concat(rev).concat(add_func(level)), add_func, level + 1);
    } else {
        drawSeq(sketch, seq);
    }
}

function draw_bend(sketch) {
    start_seq = logistic(sketch.time, 0, 1, 0.02, 200);
    drawCurve(sketch, [start_seq], (level) => 1);
}

function draw_fold(sketch) {
    start_seq = logistic(sketch.time, 2, 1, 0.05, 0);
    drawCurve(sketch, [start_seq], (level) => logistic(sketch.time, 2, 1, 0.05, 90 * level));
}

function create(func) {
    return (sketch) => {
        sketch.time = 0;
        sketch.num = 2 ** 8;
        sketch.line_length = 10;
        sketch.setup = setup(sketch, 60);
        sketch.draw = () => {
            sketch.strokeWeight(3);
            sketch.stroke(myDarkColors[2]);
            sketch.background(myLightColors[0]);
            sketch.translate(sketch.width / 2, sketch.height / 2);
            func(sketch);
            sketch.time += 1;
        }
    }

}

let dragon_bend = new p5(create(draw_bend), 'dragon-bend');

let dragon_fold = new p5(create(draw_fold), 'dragon-fold');