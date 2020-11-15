let sideLength = 20;
let shapeColors = [myLightColors[1], myLightColors[2]]
let edgeColor = 'black';
let scale = 0.75;

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

function drawShape(sketch, color, shapeFunc) {
    sketch.strokeWeight(2);
    sketch.stroke(edgeColor);
    sketch.fill(color);
    shapeFunc(sketch);
}

function drawTriangle(sketch) {
    sketch.triangle(0, 0, 0, -sideLength, sideLength * sketch.sqrt(3) / 2, -sideLength * 1 / 2);
}

function drawSquare(sketch) {
    sketch.square(sideLength / 2, -sideLength / 2, sideLength);
}

function drawReference(sketch, c) {
    sketch.strokeWeight(3);
    sketch.stroke(c);
    sketch.line(0, 0, 0, -sideLength);
    sketch.strokeWeight(5);
    sketch.point(0, 0);
}

function drawActions(sketch, actions, num_actions) {
    let shape;
    let rot = 0;
    let colorIndex = 0;
    sketch.scale(scale);
    for (let i = 0; i < min(num_actions, actions.length); i++) {
        if (actions[i] == 's') {
            drawShape(sketch, shapeColors[colorIndex], drawSquare);
            shape = 'square';
            rot = 0;
        }
        else if (actions[i] == 't') {
            drawShape(sketch, shapeColors[colorIndex], drawTriangle);
            shape = 'triangle';
            rot = 0;
        }
        if (actions[i] == 'r') {
            switchSide(sketch, shape, rot);
            rot += 1;
        }
        if (actions[i] == 'c') {
            colorIndex = 1 - colorIndex;
        }
    }
    drawReference(sketch, myLightColors[3]);
}

function readKey(sketch) {
    return () => {
        // s for "square"
        if (sketch.keyCode == 83) {
            sketch.actions += 's';
        }

        // t for "triangle"
        if (sketch.keyCode == 84) {
            sketch.actions += 't';
        }

        // r for "rotate" (switch side)
        if (sketch.keyCode == 82) {
            sketch.actions += 'r';
        }

        // d for "delete"
        if (sketch.keyCode == 68) {
            sketch.actions = sketch.actions.slice(0, -1);
        }
        
        // c to change "color"
        if (sketch.keyCode == 67) {
            sketch.actions += 'c';
        }
    }
}

function setup(sketch, fr) {
    return () => {
        sketch.createCanvas(500, 500);
        sketch.angleMode(sketch.RADIANS);
        sketch.rectMode(sketch.CENTER);
        sketch.frameRate(fr);
    }
}

function create(sketch) {
    sketch.actions = '';

    sketch.setup = setup(sketch, 60);
    sketch.draw = () => {
        sketch.background(myLightColors[0]);
        sketch.translate(sketch.width / 2, sketch.height / 2);
        drawActions(sketch, sketch.actions, sketch.actions.length);
    }

    sketch.keyPressed = readKey(sketch);
}

function auto(sketch) {
    sketch.actions = [
        Array(6).fill('tr'),
        ['crsrt'],
        Array(5).fill('rsrrt'),
        ['crrtrs'],
        Array(11).fill('rtrrs'),
        ['crrtrtrrtrs'],
        Array(11).fill('rtrrtrrtrs'),
        ['crrsrrtrtrrtrt'],
        Array(11).fill('rsrrrtrtrrtrt'),
        ['crrtrsrrsrrs'],
        Array(11).fill('rtrrsrrsrrs'),
        ['crrtrtrrtrtrrtrtrrsrt'],
        Array(11).fill('rtrrtrrtrtrrtrtrrsrt'),
        ['crrtrtrrtrtrrsrrtrtrtrrs'],
        Array(11).fill('rtrrtrrtrtrrsrrtrtrtrrs'),
        ['crrsrrtrrtrsrrtrsrrtrrtrt'],
        Array(11).fill('rsrrrtrrtrsrrtrsrrtrrtrt'),
        ['crrsrrtrtrrsrtrrsrtrrsrrt'],
        Array(11).fill('rsrrrtrtrrsrtrrsrtrrsrrt'),
        ['crrsrtrrsrrtrtrtrrtrrsrtrtrrtrrt'],
        Array(11).fill('rsrrtrrsrrtrtrtrrtrrsrtrtrrtrrt')].flat().join('');
    sketch.action_num = 0;

    sketch.setup = setup(sketch, 60);
    sketch.draw = () => {
        sketch.background(myLightColors[0]);
        sketch.translate(sketch.width / 2, sketch.height / 2);
        drawActions(sketch, sketch.actions, sketch.action_num);
        sketch.action_num += 100;
    }
}

let createp5 = new p5(create, 'tiling');

let autop5 = new p5(auto, 'autotiling');
