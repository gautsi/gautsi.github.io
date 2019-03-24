let store = {};

let numNodes = 10;

function makeNodes(num) {
  return [...Array(num).keys()].map(i => {
    let posRandFunc = d3.randomUniform(0, 300);
    let sizeRandFunc = d3.randomUniform(50, 100);
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


function drawCarto(config, data) {

  let { container, width, height } = config;

  // draw background
  container
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .attr("fill", d3.schemeSet2[0])


  let nodes = container
    .selectAll("nodes")
    .data(data.nodes)

  nodes.enter()
    .append('rect')
    .attr("x", d => d.pos[0])
    .attr("y", d => d.pos[1])
    .attr("width", d => d.size[0])
    .attr("height", d => d.size[1])
    .attr("stroke-width", 2)
    .attr("stroke", d3.schemeDark2[1])
    .attr("fill", "none")

  nodes.exit().remove();
}

function eltAdd(v1, v2) {
  return v1.map((p, i) => p + v2[i]);
}

function eltMult(v1, s) {
  return v1.map(p => p * s);
}


function updateNodes(data) {
  data.nodes.forEach(d => {
    data.nodes.forEach(d2 => {
      let overlap = [0, 1]
        .map(i => (d.pos[i] <= (d2.pos[i] + d2.size[i]) & (d.pos[i] + d.size[i]) >= d2.pos[i]))
        .reduce((a, b) => a & b);
      let vAdd = overlap ? eltAdd(d.pos, eltMult(d2.pos, -1)) : [0, 0];
      d.v = eltAdd(d.v, eltMult(vAdd, 0.001));
    });

    // friction
    d.v = eltAdd(d.v, eltMult(d.v, -0.2));

    d.pos = eltAdd(d.pos, d.v);
  });

}

function showData(data) {
  let config = getCartoConfig();
  drawCarto(config, data);

  d3.interval(function() {
    updateNodes(data);
    drawCarto(config, data);
  });
}

loadData().then(showData);
