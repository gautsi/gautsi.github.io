let store = {};

let numNodes = 10;

function makeNodes(num) {
  return [...Array(num).keys()].map(i => {
    let posRandFunc = d3.randomUniform(0, 300);
    let sizeRandFunc = d3.randomUniform(50, 100);
    return {
      "x": posRandFunc(),
      "y": posRandFunc(),
      "w": sizeRandFunc(),
      "h": sizeRandFunc()
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
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .attr("width", d => d.w)
    .attr("height", d => d.h)
    .attr("stroke-width", 2)
    .attr("stroke", d3.schemeDark2[1])
    .attr("fill", "none")

  nodes.exit().remove();

}

function showData(data) {
  let config = getCartoConfig();
  drawCarto(config, data);

  d3.interval(function() {
    data.nodes = data.nodes.map(d => {
      d.x += 1;
      return d;
    });
    drawCarto(config, data);
  });
}

loadData().then(showData);
