let barStore = {};

function loadBarData() {
    return Promise.all([
      d3.csv("https://raw.githubusercontent.com/gautsi/gautsi.github.io/master/sketches/carto/nys_ag_dem_pri_votes_032619.csv")
    ]).then(datasets => {
        barStore.votes = datasets[0];
        return store;
    })
}

function getBarConfig() {
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
    let container = d3.select("#bar1")
    container
        .attr("width", width)
        .attr("height", height)

    return { width, height, margin, bodyHeight, bodyWidth, container }
}

function getBarScales(data) {

}



function drawBar(config, data, color = d3.schemeDark2[1], fill = "none") {
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

function showBarData(data) {
  let config = getBarConfig();
}

loadBarData().then(showBarData);
