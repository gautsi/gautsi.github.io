let barStore2 = {};

let grey2 = "#dddddd";

function loadBar2Data() {
    return Promise.all([
      d3.csv("https://raw.githubusercontent.com/gautsi/gautsi.github.io/master/sketches/carto/nys_ag_dem_pri_votes_032619.csv")
    ]).then(datasets => {
        barStore2.votes = datasets[0];
        return barStore2;
    })
}

function prepData2(data) {
  data["candidates"] = Object.keys(data.votes[0]).filter(i => i != "County");
  data.votes.forEach(i => {
    i["countyFixed"] = i["County"].split(" County")[0];
    i["candidates"] = data["candidates"].map(j => {
      return {candidate: j.split(" (DEM)")[0], votes: Number(i[j].replace(",", ""))}});
    i["totalVotes"] = d3.sum(i.candidates.map(a => a.votes));
  });

  data.layers = d3.stack()(data.candidates.map(function(c) {
    return data.votes.map(function(d) {
      return {x: d.candidates.filter(i => i["candidate"] === c.split(" (DEM)")[0])[0].votes, y: d.countyFixed};
    });
  }));
}

function getBarConfig2() {
    let width = 400;
    let height = 600;
    let margin = {
        top: 10,
        bottom: 20,
        left: 60,
        right: 10
    }
    let bodyHeight = height - margin.top - margin.bottom
    let bodyWidth = width - margin.left - margin.right
    let container = d3.select("#bar2").append("svg")

    container
        .attr("width", width)
        .attr("height", height)

    return { width, height, margin, bodyHeight, bodyWidth, container }
}

function getBarScales2(config, data) {
  let { width, height, margin, bodyHeight, bodyWidth, container } = config;

  let maximumCount = d3.max(data.votes.map(a => a.totalVotes));
  console.log(maximumCount);

  let xScale = d3.scaleLinear()
      .range([0, bodyWidth])
      .domain([0, maximumCount]);

  let yScale = d3.scaleBand()
      .range([0, bodyHeight])
      .domain(data.votes.sort((a, b) => b.totalVotes - a.totalVotes).map(a => a.countyFixed))
      .padding(0.1);

  return { xScale, yScale }

}



function drawBar2(config, scales, data, color = d3.schemeDark2[1], fill = "none") {
  let { width, height, margin, bodyHeight, bodyWidth, container } = config;
  let { xScale, yScale } = scales;

  let barBody = container.append("g")
      .style("transform",
        `translate(${margin.left}px,${margin.top}px)`
      )

  let nodes = barBody
    .selectAll("counties")
    .data(data.votes);

  nodes.enter()
    .append('rect')
    .attr("x", 0)
    .attr("y", d => yScale(d.countyFixed))
    .attr("width", d => xScale(d.totalVotes))
    .attr("height", d => yScale.bandwidth())
    // .attr("stroke-width", 2)
    .attr("stroke", "none")
    .attr("fill", grey2);

  nodes.exit().remove();
}

function drawAxesBarChart2(config, scales, data){
  let {xScale, yScale} = scales
  let {container, margin, height} = config;
  let axisX = d3.axisBottom(xScale)
                .ticks(5)

  container.append("g")
    .style("transform",
        `translate(${margin.left}px,${height - margin.bottom}px)`
    )
    .call(axisX)

  let axisY = d3.axisLeft(yScale).tickSize(0);

  container.append("g")
    .style("transform",
        `translate(${margin.left}px,${margin.top}px)`
    )
    .call(axisY)
}


function showBarData2(data) {
  prepData2(data);
  console.log(data);
  let config = getBarConfig2();
  let scales = getBarScales2(config, data);
  drawBar2(config, scales, data);
  drawAxesBarChart2(config, scales, data);
}

loadBar2Data().then(showBarData2);