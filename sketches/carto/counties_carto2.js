function CountyVotesCartoConfig() {
  let config = {
    lightColor: "#cccccc",
    darkColor: d3.schemeDark2[1],
    lightGrey: "#eeeeee",
    darkGrey: "#bbbbbb",
    lightWidth: 1,
    darkWidth: 2,
    width: 600,
    height: 600,
    margin: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10},
    barMargin: {
        top: 440,
        bottom: 50,
        left: 5,
        right: 300},
    container: d3.select("#countiesVotes").append("svg"),
    currSquareSize: 40,
    projection: d3.geoMercator(),
    countyPaths: [],
    countyCentroids: [],
    countySquares: [],
    transDuration: 1000,
    selectedCounty: "all"
  };

  config.bodyHeight = config.height - config.margin.top - config.margin.bottom;
  config.bodyWidth = config.width - config.margin.left - config.margin.right;

  config.barBodyHeight = config.height - config.barMargin.top - config.barMargin.bottom;
  config.barBodyWidth = config.width - config.barMargin.left - config.barMargin.right;

  config.container
    .attr("width", config.bodyWidth)
    .attr("height", config.bodyHeight);

  config.statusText = config.container
    .append("text")
    .attr("x", 5)
    .attr("y", 15)
    .text("preparing map...");

  config.barText = config.container
    .append("text")
    .attr("x", 5)
    .attr("y", 425)
    .text("");


  return config;
}

let cvcConfig = CountyVotesCartoConfig();

Promise.all([
  d3.csv("https://raw.githubusercontent.com/gautsi/gautsi.github.io/master/sketches/carto/nys_ag_dem_pri_votes_032619.csv"),
  d3.json("/assets/counties/us_counties.json")
]).then(function (data) {

  // prep carto
  let allCounties = data[1];
  let nyCounties = allCounties;
  nyCounties.features = nyCounties.features.filter(county => county.properties.STATEFP === "36");

  cvcConfig.projection
    .fitExtent(
      [
        [cvcConfig.margin.top, cvcConfig.margin.left],
        [cvcConfig.bodyWidth, cvcConfig.bodyHeight]],
      nyCounties);

  cvcConfig.path = d3.geoPath().projection(cvcConfig.projection);

  cvcConfig.countyPaths = nyCounties.features.map(d => cvcConfig.path(d));

  cvcConfig.countyCentroids = nyCounties.features.map(d => {
    return { "centroid": cvcConfig.path.centroid(d), "name": d.properties.NAME };
  });

  cvcConfig.countySquares = cvcConfig.countyCentroids.map(d => {
    return {
      "pos": eltAdd(d.centroid, scaMult([cvcConfig.currSquareSize, cvcConfig.currSquareSize], -0.5)),
      "size": [cvcConfig.currSquareSize, cvcConfig.currSquareSize],
      "v": [0, 0],
      "center": d.centroid,
      "name": d.name
    }
  });

  cvcConfig.statusText.text("adding votes...");


  cvcConfig.votes = data[0];
  cvcConfig.candidates = Object.keys(cvcConfig.votes[0]).filter(i => i!= "County");
  cvcConfig.candidatesFixed = [1, 3, 0, 2].map(i => cvcConfig.candidates.map(c => c.split(" (DEM)")[0])[i]);
  cvcConfig.votes.forEach(i => {
    i.countyFixed = i.County.split(" County")[0];
    cvcConfig.candidates.forEach(c => {
      i[c.split(" (DEM)")[0]] = Number(i[c].replace(",", ""));
    });
  });

  cvcConfig.countySquares.forEach(county => {
    let countyVotes = cvcConfig.votes.filter(j => j.countyFixed === county.name)[0];
    cvcConfig.candidatesFixed.forEach(c => {
      county[c] = countyVotes[c];
    });
    county.totalVotes = d3.sum(cvcConfig.candidatesFixed.map(c => county[c]));
  });

  cvcConfig.totalVotes = cvcConfig.candidatesFixed.map(c => {
    return { "candidate": c, "votes": d3.sum(cvcConfig.countySquares.map(s => s[c])) };
  });

  cvcConfig.statusText.text("updating marks...");

  let moveTimer = d3.timer(function(elapsed) {
    let currTtlVel = updateNodes(cvcConfig.countySquares);
    if (elapsed > 100000 | currTtlVel < 0.5) {
      moveTimer.stop();
      cvcConfig.statusText.text("");
      showCountyCartoVotesMap();
      showCountyBarVotesMap(cvcConfig.selectedCounty);
    }
  });

  cvcConfig.countySquaresStacked = d3.stack().keys(cvcConfig.candidatesFixed)(cvcConfig.countySquares);
});

function showCountyBarVotesMap(county) {

  let colorScale = d3.scaleOrdinal()
    .domain(cvcConfig.countySquaresStacked.map(d => d.key))
    .range([2, 3, 1, 0].map(i => d3.schemeSet1[i]))
    .unknown(cvcConfig.darkGrey);

  let barYScale = d3.scaleBand()
      .range([0, cvcConfig.barBodyHeight])
      .domain(cvcConfig.countySquaresStacked.map(d => d.key))
      .padding(0.2);

  let barXScale = d3.scaleLinear()
      .range([0, cvcConfig.barBodyWidth]);

  let barBody = cvcConfig.container.append("g")
      .style("transform",
        `translate(${cvcConfig.barMargin.left}px,${cvcConfig.barMargin.top}px)`
      );

  // clear the bar area
  barBody
    .append("rect")
    .attr("x", -5)
    .attr("y", 0)
    .attr("width", cvcConfig.barBodyWidth + 20)
    .attr("height", cvcConfig.barBodyHeight + 20)
    .attr("fill", "white")
    .attr("stroke", "none");

  let barData = [];

  if (county == "all") {
    cvcConfig.barText.text("All votes");
    barData = cvcConfig.totalVotes;
  } else {
    cvcConfig.barText.text(county);
    barData = cvcConfig.candidatesFixed.map(c => {
      let candidateVotes = cvcConfig.countySquares
        .filter(s => s.name === county)[0][c];
      return { "candidate": c, "votes": candidateVotes };
    });
  }

  barXScale.domain([0, d3.max(barData.map(c => c.votes))]);

  barBody.selectAll("bar")
    .data(barData)
    .enter()
    .append("rect")
    .attr("x", barXScale(0))
    .attr("y", d => barYScale(d.candidate))
    .attr("width", d => barXScale(d.votes))
    .attr("height", barYScale.bandwidth())
    .attr("fill", d => colorScale(d.candidate))
    .attr("stroke", "none");


  let axisX = d3.axisBottom(barXScale)
                .ticks(5)

  cvcConfig.container.append("g")
    .style("transform",
        `translate(${cvcConfig.barMargin.left}px,${cvcConfig.height - cvcConfig.barMargin.bottom}px)`
    )
    .call(axisX)


  let axisY = d3.axisRight(barYScale).tickSize(0);

  cvcConfig.container.append("g")
    .style("transform",
        `translate(${cvcConfig.barMargin.left}px,${cvcConfig.barMargin.top}px)`
    )
    .call(axisY);
}

function showCountyCartoVotesMap() {

  let totalVotesScale = d3.scaleLinear()
    .domain([0, d3.max(cvcConfig.countySquares.map(c => c.totalVotes))])
    .range([0, cvcConfig.currSquareSize]);

  let colorScale = d3.scaleOrdinal()
    .domain(cvcConfig.countySquaresStacked.map(d => d.key))
    .range([2, 3, 1, 0].map(i => d3.schemeSet1[i]))
    .unknown(cvcConfig.darkGrey);


  // draw outer square
  cvcConfig.container
    .selectAll("countyMarks")
    .data(cvcConfig.countySquares)
    .enter()
    .append("rect")
    .attr("x", d => d.pos[0])
    .attr("y", d => d.pos[1])
    .attr("width", d => d.size[0])
    .attr("height", d => d.size[1])
    .attr("fill", cvcConfig.lightGrey)
    .attr("stroke", "none")
    .on("mouseover", function (d, i) {
      cvcConfig.selectedCounty = d.name;
      showCountyBarVotesMap(cvcConfig.selectedCounty);
    })
    .on("mouseout", function (d, i) {
      cvcConfig.selectedCounty = "all";
      showCountyBarVotesMap(cvcConfig.selectedCounty);
    });

    // draw votes rects
    cvcConfig.container
      .selectAll("countyVoteMarks")
      .data(cvcConfig.countySquaresStacked)
      .join("g")
      .attr("fill", d => colorScale(d.key))
      .selectAll("countyVoteCandidateMarks")
      .data(d => d)
      .join("rect")
      .attr("x", d => d.data.pos[0])
      .attr("y", d => (d.data.pos[1] + cvcConfig.currSquareSize - totalVotesScale(d[1])))
      .attr("width", d => d.data.size[0])
      .attr("height", d => totalVotesScale(d[1]) - totalVotesScale(d[0]))
      .attr("stroke", "none")
      .on("mouseover", function (d, i) {
        cvcConfig.selectedCounty = d.data.name;
        showCountyBarVotesMap(cvcConfig.selectedCounty);
      })
      .on("mouseout", function (d, i) {
        cvcConfig.selectedCounty = "all";
        showCountyBarVotesMap(cvcConfig.selectedCounty);
      });

}
