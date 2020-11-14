function setup() {
    let myCanvas = createCanvas(400, 400);
    myCanvas.parent('tiling');
}

let sideLength = 20;

function draw() {
    angleMode(RADIANS);
    rectMode(CENTER);
    background(myLightColors[0]);
    translate(width / 2, height / 2);
    for (let i = 1; i <= 6; i++) {
        drawTriangle(0, 0);
        rotate(PI / 3);
    }
    for (let i = 1; i <= 6; i++) {
        drawSquare(0, sideLength * (sqrt(3) / 2 + 1 / 2));
        push();
        rotate(PI / 6);
        drawTriangle(0, sideLength);
        pop();
        rotate(PI / 3);
    }
    for (let i = 1; i <= 12; i++) {
        push();
        translate(0, sideLength * (2 * sqrt(3) / 2 + 1));
        rotate(PI);
        drawTriangle(0, 0);
        rotate(PI/6);
        drawSquare(-1*sideLength/2, sideLength/2);
        pop();
        rotate(PI / 6);
    }
}

function drawTriangle(x, y) {
    triangle(x, y, x + sideLength * 1 / 2, y + sideLength * sqrt(3) / 2, x + sideLength * -1 / 2, y + sideLength * sqrt(3) / 2);
}

function drawSquare(x, y) {
    square(x, y, sideLength);
}
