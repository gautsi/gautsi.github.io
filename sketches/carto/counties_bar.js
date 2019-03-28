let barStore = {};

function loadBarData() {
    return Promise.all([
      d3.csv("https://raw.githubusercontent.com/gautsi/gautsi.github.io/master/sketches/carto/nys_ag_dem_pri_votes_032619.csv")
    ]).then(datasets => {
        barStore.votes = datasets[0];
        return barStore;
    })
}

function prepData(data) {
  data["candidates"] = Object.keys(barStore.votes[0]).filter(i => i!= "County");
  data.votes.forEach(i => {
    i["countyFixed"] = i["County"].split(" County")[0];
    i["candidates"] = data["candidates"].map(j => {
      return {candidate: j.split(" (DEM)")[0], votes: Number(i[j].replace(",", ""))}});
  });
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
    let container = d3.select("#bar1").append("svg")

    container
        .attr("width", width)
        .attr("height", height)

    return { width, height, margin, bodyHeight, bodyWidth, container }
}

function getBarScales(config, data) {
  let { width, height, margin, bodyHeight, bodyWidth, container } = config;

  let maximumCount = d3.max(data.votes.map(a => d3.sum(a.candidates.map(b => b.votes))));
  console.log(maximumCount);

  let yScale = d3.scaleLinear()
      .range([0, bodyHeight])
      .domain([0, maximumCount]);

  let xScale = d3.scaleBand()
      .range([0, bodyWidth])
      .domain(data.votes.map(a => a.countyFixed))
      .padding(0.2);

  return { xScale, yScale }

}



function drawBar(config, scales, data, color = d3.schemeDark2[1], fill = "none") {
  let { container, width, height } = config;
  let { xScale, yScale } = scales;

  let nodes = container
    .selectAll("counties")
    .data(data.votes);

  nodes.enter()
    .append('rect')
    .attr("x", d => xScale(d.countyFixed))
    .attr("y", 0)
    .attr("width", d => xScale.bandwidth())
    .attr("height", d => yScale(d3.sum(d.candidates.map(a => a.votes))))
    .attr("stroke-width", 2)
    .attr("stroke", color)
    .attr("fill", fill);

  nodes.exit().remove();
}

function showBarData(data) {
  prepData(data);
  console.log(data);
  let config = getBarConfig();
  let scales = getBarScales(config, data);
  drawBar(config, scales, data);
}

loadBarData().then(showBarData);
