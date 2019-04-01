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
    container: d3.select("#countiesVotes").append("svg"),
    currSquareSize: 40,
    projection: d3.geoMercator(),
    countyPaths: [],
    countyCentroids: [],
    countySquares: [],
    transDuration: 1000
  };

  config.bodyHeight = config.height - config.margin.top - config.margin.bottom;
  config.bodyWidth = config.width - config.margin.left - config.margin.right;
  config.container
    .attr("width", config.bodyWidth)
    .attr("height", config.bodyHeight);

  config.statusText = config.container
    .append("text")
    .attr("x", 5)
    .attr("y", 15)
    .text("preparing map...");

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

  cvcConfig.statusText.text("updating marks...");

  let moveTimer = d3.timer(function(elapsed) {
    let currTtlVel = updateNodes(cvcConfig.countySquares);
    if (elapsed > 100000 | currTtlVel < 0.5) {
      moveTimer.stop();
      cvcConfig.statusText.text("");
      showCountyCartoMap();
    }
  });

  cvcConfig.countySquaresStacked = d3.stack().keys(cvcConfig.candidatesFixed)(cvcConfig.countySquares);
});

function showCountyCartoMap() {

  let totalVotesScale = d3.scaleLinear()
    .domain([0, d3.max(cvcConfig.countySquares.map(c => c.totalVotes))])
    .range([0, cvcConfig.currSquareSize]);

  let colorScale = d3.scaleOrdinal()
    .domain(cvcConfig.countySquaresStacked.map(d => d.key))
    .range([2, 3, 1, 0].map(i => d3.schemeSet1[i]))
    .unknown(cvcConfig.darkGrey);

  let legendScale = d3.scaleBand()
      .range([4 * cvcConfig.bodyHeight / 9, 5 * cvcConfig.bodyHeight / 9])
      .domain(cvcConfig.countySquaresStacked.map(d => d.key))
      .padding(0.1);


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
    .attr("stroke", "none");

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
      .attr("stroke", "none");
}
