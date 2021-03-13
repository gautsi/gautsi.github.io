function setup(sketch, fr) {
    return () => {
        sketch.createCanvas(500, 500);
        sketch.angleMode(sketch.RADIANS);
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

function drawSeq(sketch, seq) {
    if (seq.length > 0) {
        sketch.rotate(seq[0] * sketch.PI / 2);
        sketch.line(0, 0, 0, sketch.line_length);
        sketch.translate(0, sketch.line_length);  
        drawSeq(sketch, seq.slice(1));  
    }
}

function drawCurve(sketch, seq) {
    if (seq.length < 600) {
        let rev = reverse(seq.slice(0, -1)).map(i => -1*i)
        drawCurve(sketch, seq.concat(rev).concat(1));
    } else { 
        console.log(seq);
        drawSeq(sketch, seq);
        sketch.noLoop();
    }
}

function create(sketch) {
    sketch.time = 1;
    sketch.num = 2 ** 10 - 1;
    sketch.line_length = 5;
    sketch.setup = setup(sketch, 60);
    sketch.draw = () => {
        sketch.strokeWeight(3);
        sketch.stroke(myDarkColors[2]);
        sketch.background(myLightColors[0]);
        sketch.translate(sketch.width / 2, sketch.height / 2);
        drawCurve(sketch, [1]);
        sketch.time += 1;
    }
}

let dragon = new p5(create, 'dragon-recur');