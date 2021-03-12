function setup(sketch, fr) {
    return () => {
        sketch.createCanvas(500, 500);
        sketch.angleMode(sketch.RADIANS);
        sketch.rectMode(sketch.CENTER);
        sketch.frameRate(fr);
    }
}

function goRotate(sketch, mult, i) {
    sketch.rotate(mult * getAngle(sketch, i));
}

function goLeft(sketch, i) {
    goRotate(sketch, -1, i);
    sketch.line(0, 0, 0, sketch.line_length);
    sketch.translate(0, sketch.line_length);
}

function goRight(sketch, i) {
    goRotate(sketch, 1, i);
    sketch.line(0, 0, 0, sketch.line_length);
    sketch.translate(0, sketch.line_length);
}

function getDir(num) {
    switch (num % 8) {
        case 0: return 1;
        case 1: return 1;
        case 2: return 0;
        case 4: return 1;
        case 5: return 0;
        case 6: return 0;
        default: return getDir((num + 1) / 4 - 1);
    }

}

function drawCurve(sketch) {
    sketch.strokeWeight(3);
    goLeft(sketch);
    for (let i = 0; i < sketch.num; i++) {
        sketch.stroke(myDarkColors[2]);
        if (getDir(i) == 0) {
            goLeft(sketch, i);
        }
        else if (getDir(i) == 1) {
            goRight(sketch, i);
        }
    }
}

function mult(sketch, i) {
    if (i % 2 == 0) {
        return 1;
    }
    else {
        return 1;
        // return 1 / (1 + 0.01 * sketch.time);
    }
}

function getAngle(sketch, i) {
    let angle = sketch.PI - sketch.PI / 2 * (1 / (1 + exp(-0.01 * sketch.time)));
    // let angle = sketch.PI / 2 * mult(sketch, i);
    return angle;
}

function create(sketch) {
    sketch.time = 1;
    sketch.num = 2 ** 12 - 1;
    sketch.line_length = 15;
    sketch.setup = setup(sketch, 60);
    sketch.draw = () => {
        sketch.background(myLightColors[0]);
        sketch.translate(sketch.width / 2, sketch.height / 2);
        drawCurve(sketch);
        sketch.time += 1;
    }
}

let dragon = new p5(create, 'dragon-unfold');