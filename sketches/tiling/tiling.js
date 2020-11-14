function setup() {
    let myCanvas = createCanvas(400, 400);
    myCanvas.parent('tiling');
    angleMode(RADIANS);
    rectMode(CENTER);
}

let sideLength = 20;
let shape;
let rot = 0;
let x = 0;
let y = 0;
let angle = 0;
let actions = [];

function switchSide() {
    if (shape == 'square') {
        if (rot == 0) {
            rotate(PI/2);
            // drawReference(myDarkColors[2]);
            // drawSquare();
        }
        else {
            translate(0, -sideLength);
            rotate(-PI/2);
            // drawReference(myDarkColors[2]);
            // drawSquare();
        }
    }
    else if (shape == 'triangle') {
        if (rot == 0) {
            rotate(PI/3);
            // drawReference(myDarkColors[2]);
            // drawTriangle();
        }
        else {
            translate(0, -sideLength);
            rotate(-2*PI/3);
            // drawReference(myDarkColors[2]);
            // drawTriangle();

        }
    }
}


function draw() {
    background(myLightColors[0]);
    translate(width / 2, height / 2);
    for (let i = 0; i < actions.length; i++){
        if (actions[i] == 'square') {
            drawSquare();
            shape = 'square';
            rot = 0;
        }
        else if (actions[i] == 'triangle') {
            drawTriangle();
            shape = 'triangle';
            rot = 0;
        }
        if (actions[i] == 'switch') {
            switchSide();
            rot += 1;
        }
    }
    drawReference(myDarkColors[2]);
}

function drawTriangle() {
    strokeWeight(1);
    stroke(myDarkColors[1]);
    fill(myDarkColors[0]);
    triangle(0, 0, 0, -sideLength, sideLength * sqrt(3) / 2, -sideLength * 1 / 2);
}

function drawSquare() {
    strokeWeight(1);
    stroke(myDarkColors[1]);
    fill(myDarkColors[0]);
    square(sideLength / 2, -sideLength / 2, sideLength);
}

function drawReference(c) {
    strokeWeight(3);
    stroke(c);
    line(0, 0, 0, -sideLength);
    strokeWeight(5);
    point(0, 0);
}

function keyPressed() {
    // s for "square"
    if (keyCode == 83) {
        actions.push('square');
    }
  
    // t for "triangle"
    if (keyCode == 84) {
        actions.push('triangle');
    }

    // r for "rotate" (switch side)
    if (keyCode == 82) {
        actions.push('switch');
    }
    
    // d for "delete"
    if (keyCode == 68) {
        actions.pop();
    }
  }