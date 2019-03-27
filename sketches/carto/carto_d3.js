let store = {};
let ttlVel = [];

let numNodes = 10;

function makeNodes(num) {
  return [...Array(num).keys()].map(i => {
    let posRandFunc = d3.randomUniform(0, 300);
    let sizeRandFunc = d3.randomUniform(50, 80);
    return {
      "pos": [posRandFunc(), posRandFunc()],
      "size": [sizeRandFunc(), sizeRandFunc()],
      "v": [0, 0]
      }
  });
}

function loadData() {
    return Promise.all([
      makeNodes(numNodes)
    ]).then(datasets => {
        store.nodes = datasets[0];
        return store;
    })
}

function getCartoConfig() {
    let width = 400;
    let height = 400;
    let margin = {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
    }
    let bodyHeight = height - margin.top - margin.bottom
    let bodyWidth = width - margin.left - margin.right
    let container = d3.select("#cartoD3")
    container
        .attr("width", width)
        .attr("height", height)

    return { width, height, margin, bodyHeight, bodyWidth, container }
}

function getCartoScales(data) {

}

function drawBackground(config) {
  let { container, width, height } = config;

  // draw background
  container
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .attr("fill", d3.schemeSet2[0]);
}


function drawCarto(config, data, color = d3.schemeDark2[1], fill = "none") {
  let { container, width, height } = config;

  let nodes = container
    .selectAll("nodes")
    .data(data.nodes);

  nodes.enter()
    .append('rect')
    .attr("x", d => d.pos[0])
    .attr("y", d => d.pos[1])
    .attr("width", d => d.size[0])
    .attr("height", d => d.size[1])
    .attr("stroke-width", 2)
    .attr("stroke", color)
    .attr("fill", fill);

  nodes.exit().remove();
}

function eltAdd(v1, v2) {
  return v1.map((p, i) => p + v2[i]);
}

function eltMult(v1, s) {
  return v1.map(p => p * s);
}

function dist(v1, v2) {
  return Math.sqrt([0, 1].map(i => Math.pow(v1[i] - v2[i], 2)).reduce((a, b) => a + b));
}


function updateNodes(data) {
  let ttlVel = 0;
  data.nodes.forEach(d => {
    let relPos = [];
    data.nodes.forEach(d2 => {
      // add relative position
      relPos.push({"rel_pos": eltAdd(d2.pos, eltMult(d.pos, -1))});

      // check overlap
      let overlap = [0, 1]
        .map(i => (d.pos[i] <= (d2.pos[i] + d2.size[i]) & (d.pos[i] + d.size[i]) >= d2.pos[i]))
        .reduce((a, b) => a & b);

      let vAdd = overlap ? eltAdd(d.pos, eltMult(d2.pos, -1)) : [0, 0];

      d.v = eltAdd(d.v, eltMult(vAdd, 0.01));
    });

    // move closer to closest neighbors
    let attractions = relPos
      .sort((a, b) => dist(a.rel_pos, [0, 0]) - dist(b.rel_pos, [0, 0]))
      .slice(0, 4);

    let attraction = dist(attractions[1].rel_pos, [0, 0]) > 80 ? attractions.map(i => eltMult(i.rel_pos, 0.001)).reduce(eltAdd) : [0, 0];

    d.v = eltAdd(d.v, attraction);

    // friction
    d.v = eltAdd(d.v, eltMult(d.v, -0.2));

    d.pos = eltAdd(d.pos, d.v);
    ttlVel += dist(d.v, [0, 0]);
  });
  return ttlVel;
}

function deepCopyData(data) {
  return {"nodes": JSON.parse(JSON.stringify(data.nodes))};
}

function showData(data) {
  let config = getCartoConfig();
  let origData = deepCopyData(data);

  let moveTimer = d3.timer(function(elapsed) {
    let currTtlVel = updateNodes(data);
    if (elapsed > 100000) {
      moveTimer.stop();
    } else if (currTtlVel < 0.5) {
      data.nodes = makeNodes(numNodes);
      origData = deepCopyData(data);
    } else {
      drawBackground(config);
      drawCarto(config, origData, color = d3.schemeSet2[0], fill = d3.schemeSet2[1]);
      drawCarto(config, data, color = d3.schemeDark2[1], fill = "none");
    }
  });
}

loadData().then(showData);
