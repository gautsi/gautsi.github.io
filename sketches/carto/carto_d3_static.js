let nodes = [];
let origNodes = [];
let ttlVel = [];

let numNodes = 10;

let buttonStatus = "reset";

function makeNodes(num) {
  return [...Array(num).keys()].map(i => {
    let posRandFunc = d3.randomUniform(0, 300);
    let sizeRandFunc = d3.randomUniform(30, 100);
    let node = {
      "pos": [posRandFunc(), posRandFunc()],
      "size": [sizeRandFunc(), sizeRandFunc()],
      "v": [0, 0]
      }
    node["center"] = eltAdd(node["pos"], scaMult(node["size"], 0.5));
    return node;
  });
}

let button = d3
  .select("#button")
  .append("button");

button.text(buttonStatus)
  .on("click", function() {start()});


let width = 400;
let height = 400;
let margin = {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10};

let bodyHeight = height - margin.top - margin.bottom;
let bodyWidth = width - margin.left - margin.right;
let container = d3.select("#carto2").append("svg");

container
    .attr("width", width)
    .attr("height", height);

function drawBackground() {
  container
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .attr("fill", d3.schemeSet2[0]);
}


function drawCarto(drawNodes, color = d3.schemeDark2[1], fill = "none") {

  let ns = container
    .selectAll("nodes")
    .data(drawNodes);

  ns.enter()
    .append('rect')
    .attr("x", d => d.pos[0])
    .attr("y", d => d.pos[1])
    .attr("width", d => d.size[0])
    .attr("height", d => d.size[1])
    .attr("stroke-width", 2)
    .attr("stroke", color)
    .attr("fill", fill);

  ns.exit().remove();
}

function eltAdd(v1, v2) {
  return v1.map((p, i) => p + v2[i]);
}

function eltApply(v1, v2, func) {
  return v1.map((p, i) => func(p, v2[i]));
}

function scaMult(v1, s) {
  return v1.map(p => p * s);
}

function eltSign(v, inv = false) {
  return [0, 1].map(i => v[i] >= 0 ? (inv ? -1 : 1) : (inv ? 1 : -1));
}

function dist(v1, v2) {
  return Math.sqrt([0, 1].map(i => Math.pow(v1[i] - v2[i], 2)).reduce((a, b) => a + b));
}


function updateNodes() {

  let ttlVel = 0;

  nodes.forEach(d => {
    // array to store distances to other marks
    // to be used to calculate attraction

    let distTo = [];
    nodes.forEach(d2 => {
      // store distance from d2 to d elementwise:
      // first get difference in position


      let currDistTo = eltAdd(d2.center, scaMult(d.center, -1));

      // then account for width/height, reducing distance accordingly
      currDistTo = [0, 1].map(i => (currDistTo[i] >= 0 ? 1 : -1) * Math.max(Math.abs(currDistTo[i]) - 0.5 * (d.size[i] + d2.size[i]), 0));

      distTo.push({"dist_to": currDistTo});

      // check overlap
      let overlap = [0, 1]
        .map(i => (d.pos[i] <= (d2.pos[i] + d2.size[i]) & (d.pos[i] + d.size[i]) >= d2.pos[i]))
        .reduce((a, b) => a & b);

      let vAdd = overlap ? eltAdd(d.pos, scaMult(d2.pos, -1)) : [0, 0];

      d.v = eltAdd(d.v, scaMult(vAdd, 0.01));
    });

    // move closer to closest neighbors, if not already close
    let attractions = distTo.sort((a, b) => dist(a.dist_to, [0, 0]) - dist(b.dist_to, [0, 0])).slice(1, 4);

    // only move if not already very close in both dimensions
    let maxMinDist = attractions[0].dist_to.map(Math.abs).reduce((a, b) => Math.max(a, b));

    let attraction = maxMinDist > 2 ? attractions.map(i => i.dist_to).reduce((a, b) => scaMult(eltAdd(a, b), 0.01)) : [0, 0];

    d.v = eltAdd(d.v, attraction);

    // friction
    d.v = eltAdd(d.v, scaMult(d.v, -0.3));

    d.pos = eltAdd(d.pos, d.v);
    d.center = eltAdd(d.center, d.v);
    ttlVel += dist(d.v, [0, 0]);
  });
  return ttlVel;
}

function deepCopyNodes(nodes) {
  return JSON.parse(JSON.stringify(nodes));
}

function start() {

  if (buttonStatus === "update") {
    let moveTimer = d3.timer(function(elapsed) {
      let currTtlVel = updateNodes();
      drawBackground();
      drawCarto(origNodes, color = d3.schemeSet2[0], fill = d3.schemeSet2[1]);
      drawCarto(nodes, color = d3.schemeDark2[1], fill = "none");

      if (elapsed > 100000 | currTtlVel < 0.5) {
        moveTimer.stop();
        buttonStatus = "reset";
        button.text("reset");
        container.append("text").attr("x", 5).attr("y", 15).text("done.");
      } else {
        container.append("text").attr("x", 5).attr("y", 15).text("updating...");
      }
    });
  } else if (buttonStatus === "reset") {
    nodes = makeNodes(numNodes);
    origNodes = deepCopyNodes(nodes);

    drawBackground();
    drawCarto(origNodes, color = d3.schemeSet2[0], fill = d3.schemeSet2[1]);
    drawCarto(nodes, color = d3.schemeDark2[1], fill = "none");

    buttonStatus = "update";
    button.text("update");
  }
}

drawBackground();
