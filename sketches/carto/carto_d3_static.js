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
  .on("click", start);


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

function deepCopyNodes(nodes) {
  return JSON.parse(JSON.stringify(nodes));
}

function start() {

  if (buttonStatus === "update") {
    let numIterations = 0;
    let moveTimer = d3.timer(function(elapsed) {
      numIterations += 1;
      let currTtlVel = updateNodes(nodes);
      let currAvgVel = currTtlVel / nodes.length;
      drawBackground();
      drawCarto(origNodes, color = d3.schemeSet2[0], fill = d3.schemeSet2[1]);
      drawCarto(nodes, color = d3.schemeDark2[1], fill = "none");

      if (elapsed > 100000 | currAvgVel < 0.05) {
        moveTimer.stop();
        buttonStatus = "reset";
        button.text("reset");
        container.append("text").attr("x", 5).attr("y", 15).attr("font-size", 12).text("done after " + numIterations + " iterations");
      } else {
        container.append("text").attr("x", 5).attr("y", 15).attr("font-size", 12).text("updating, iteration " + numIterations);
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
