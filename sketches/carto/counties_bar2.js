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
    data["candidates"].forEach(c => {i[c.split(" (DEM)")[0]] = Number(i[c].replace(",", ""))});
    i["totalVotes"] = d3.sum(data["candidates"].map(c => i[c.split(" (DEM)")[0]]));
  });

  data["candidatesFixed"] = [1, 3, 0, 2].map(i => data["candidates"].map(c => c.split(" (DEM)")[0])[i]);

  data["votesStacked"] = d3.stack().keys(data["candidatesFixed"])(data.votes);
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
    let container = d3.select("#bar2").attr("align","center").append("svg")

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
      .padding(0.2);

  let colorScale = d3.scaleOrdinal()
    .domain(data.votesStacked.map(d => d.key))
    .range([2, 3, 1, 0].map(i => d3.schemeSet1[i]))
    .unknown(grey2);

  let legendScale = d3.scaleBand()
      .range([4 * bodyHeight / 9, 5 * bodyHeight / 9])
      .domain(data.votesStacked.map(d => d.key))
      .padding(0.1);

  return { xScale, yScale, colorScale, legendScale }

}



function drawBar2(config, scales, data, color = d3.schemeDark2[1], fill = "none") {
  let { width, height, margin, bodyHeight, bodyWidth, container } = config;
  let { xScale, yScale, colorScale } = scales;

  let barBody = container.append("g")
      .style("transform",
        `translate(${margin.left}px,${margin.top}px)`
      )

  let nodes = barBody
    .selectAll("counties")
    .data(data.votesStacked)
    .join("g")
    .attr("fill", d => colorScale(d.key))
    .selectAll("rect")
    .data(d => d)
    .join("rect")
    .attr("x", d => xScale(d[0]))
    .attr("y", d => yScale(d.data.countyFixed))
    .attr("width", d => xScale(d[1]) - xScale(d[0]))
    .attr("height", d => yScale.bandwidth())
    // .attr("stroke-width", 2)
    // .attr("stroke", "none")
    // .attr("fill", grey2);
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

function drawLegendBarChart(config, scales, data) {
  let { width, height, margin, bodyHeight, bodyWidth, container } = config;
  let { xScale, yScale, colorScale, legendScale } = scales;

  let legendBody = container.append("g")
    .style("transform",
      `translate(${margin.left}px,${margin.top}px)`
    )

  let legendMarks = legendBody
    .selectAll("candidates")
    .data(data.votesStacked)
    .join("rect")
    .attr("fill", d => colorScale(d.key))
    .attr("x", d => xScale(150000))
    .attr("y", d => legendScale(d.key))
    .attr("width", 10)
    .attr("height", 10);

  let legendLabels = legendBody
    .selectAll("candidates")
    .data(data.votesStacked)
    .join("text")
    .text(d => d.key)
    .attr("x", d => xScale(150000) + 15)
    .attr("y", d => legendScale(d.key) + legendScale.bandwidth() / 2)
    .attr("font-size", 12);
}

function showBarData2(data) {
  prepData2(data);
  console.log(data);
  let config = getBarConfig2();
  let scales = getBarScales2(config, data);
  drawBar2(config, scales, data);
  drawAxesBarChart2(config, scales, data);
  drawLegendBarChart(config, scales, data);
}

loadBar2Data().then(showBarData2);
