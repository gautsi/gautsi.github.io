function setup(sketch, fr) {
    return () => {
        sketch.createCanvas(500, 500);
        sketch.angleMode(sketch.RADIANS);
        sketch.rectMode(sketch.CENTER);
        sketch.frameRate(fr);
    }
}

function goLeft(sketch) {
    sketch.rotate(- sketch.PI / 2);
    sketch.line(0, 0, 0, sketch.line_length);
    sketch.translate(0, sketch.line_length);
}

function goRight(sketch) {
    sketch.rotate(sketch.PI / 2);
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
        default: return getDir((num + 1) / 4);
    }
    
}

function drawCurve(sketch) {
    sketch.strokeWeight(2);
    sketch.line(0, 0, 0, sketch.line_length);
    sketch.translate(0, sketch.line_length);
    for (let i = 0; i < sketch.num; i++) {
        if (getDir(i) == 0) {
            goLeft(sketch);
        }
        else if (getDir(i) == 1) {
            goRight(sketch);
        }
    }
}

function create(sketch) {
    sketch.num = 1;
    sketch.line_length = 10;
    sketch.setup = setup(sketch, 15);
    sketch.draw = () => {
        sketch.background(myLightColors[0]);
        sketch.translate(sketch.width / 2, sketch.height / 2);
        drawCurve(sketch);
        sketch.num += 1;
        if (sketch.num % 400 == 0) {
            sketch.line_length -= 1;
        }
    }
}

let dragon = new p5(create, 'dragon');