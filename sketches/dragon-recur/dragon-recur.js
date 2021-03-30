function setup(sketch, fr) {
    return () => {
        sketch.createCanvas(500, 500);
        sketch.angleMode(sketch.RADIANS);
        sketch.frameRate(fr);
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
        drawSeq(sketch, seq);
    }
}

function create(sketch) {
    sketch.time = 0;
    sketch.num = 2 ** 10 - 1;
    sketch.line_length = 5;
    sketch.setup = setup(sketch, 60);
    sketch.draw = () => {
        sketch.strokeWeight(3);
        sketch.stroke(myDarkColors[2]);
        sketch.background(myLightColors[0]);
        sketch.translate(sketch.width / 2, sketch.height / 2);
        start_seq = logistic(sketch.time, 0, 1, 0.02, 200);
        drawCurve(sketch, [start_seq]);
        sketch.time += 1;
    }
}

let dragon = new p5(create, 'dragon-recur');