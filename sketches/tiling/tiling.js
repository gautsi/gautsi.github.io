let sideLength = 20;

function switchSide(sketch, shape, rot) {
    if (shape == 'square') {
        if (rot == 0) {
            sketch.rotate(sketch.PI / 2);
        }
        else {
            sketch.translate(0, -sideLength);
            sketch.rotate(-sketch.PI / 2);
        }
    }
    else if (shape == 'triangle') {
        if (rot == 0) {
            sketch.rotate(sketch.PI / 3);
        }
        else {
            sketch.translate(0, -sideLength);
            sketch.rotate(-2 * sketch.PI / 3);
        }
    }
}

function drawTriangle(sketch) {
    sketch.strokeWeight(1);
    sketch.stroke(myDarkColors[1]);
    sketch.fill(myDarkColors[0]);
    sketch.triangle(0, 0, 0, -sideLength, sideLength * sketch.sqrt(3) / 2, -sideLength * 1 / 2);
}

function drawSquare(sketch) {
    sketch.strokeWeight(1);
    sketch.stroke(myDarkColors[1]);
    sketch.fill(myDarkColors[0]);
    sketch.square(sideLength / 2, -sideLength / 2, sideLength);
}

function drawReference(sketch, c) {
    sketch.strokeWeight(3);
    sketch.stroke(c);
    sketch.line(0, 0, 0, -sideLength);
    sketch.strokeWeight(5);
    sketch.point(0, 0);
}


function create(sketch) {
    let shape;
    let rot = 0;
    let x = 0;
    let y = 0;
    let angle = 0;
    let actions = [];

    sketch.setup = () => {
        sketch.createCanvas(400, 400);
        sketch.angleMode(sketch.RADIANS);
        sketch.rectMode(sketch.CENTER);
    }
    sketch.draw = () => {
        sketch.background(myLightColors[0]);
        sketch.translate(sketch.width / 2, sketch.height / 2);
        for (let i = 0; i < actions.length; i++) {
            if (actions[i] == 'square') {
                drawSquare(sketch);
                shape = 'square';
                rot = 0;
            }
            else if (actions[i] == 'triangle') {
                drawTriangle(sketch);
                shape = 'triangle';
                rot = 0;
            }
            if (actions[i] == 'switch') {
                switchSide(sketch, shape, rot);
                rot += 1;
            }
        }
        drawReference(sketch, myDarkColors[2]);
    }

    sketch.keyPressed = () => {
        // s for "square"
        if (sketch.keyCode == 83) {
            actions.push('square');
        }

        // t for "triangle"
        if (sketch.keyCode == 84) {
            actions.push('triangle');
        }

        // r for "rotate" (switch side)
        if (sketch.keyCode == 82) {
            actions.push('switch');
        }

        // d for "delete"
        if (sketch.keyCode == 68) {
            actions.pop();
        }
    }
}

let createp5 = new p5(create, 'tiling');
