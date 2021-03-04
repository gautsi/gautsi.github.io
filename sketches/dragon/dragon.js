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
    sketch.line(0, 0, 0, 10);
    sketch.translate(0, 10);
}

function goRight(sketch) {
    sketch.rotate(sketch.PI / 2);
    sketch.line(0, 0, 0, 10);
    sketch.translate(0, 10);
}

function drawCurve(sketch) {
    sketch.strokeWeight(5);
    sketch.point(0, 0);
    sketch.strokeWeight(3);
    sketch.line(0, 0, 0, 10);
    sketch.translate(0, 10);
    goLeft(sketch);
    goLeft(sketch);
    goRight(sketch);
    goLeft(sketch);
    goLeft(sketch);
    goRight(sketch);
    goRight(sketch);

    goLeft(sketch);
    goLeft(sketch);
    goRight(sketch);
    goRight(sketch);
}

function create(sketch) {
    sketch.setup = setup(sketch, 60);
    sketch.draw = () => {
        sketch.background(myLightColors[0]);
        sketch.translate(sketch.width / 2, sketch.height / 2);
        drawCurve(sketch);
    }
}

let dragon = new p5(create, 'dragon');