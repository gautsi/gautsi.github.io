function CountyCartoConfig() {
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
    container: d3.select("#countiesTtlVotes").append("svg"),
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

let ccConfig = CountyCartoConfig();

Promise.all([
  d3.csv("https://raw.githubusercontent.com/gautsi/gautsi.github.io/master/sketches/carto/nys_ag_dem_pri_votes_032619.csv"),
  d3.json("/assets/counties/us_counties.json")
]).then(function (data) {

  // prep carto
  let allCounties = data[1];
  let nyCounties = allCounties;
  nyCounties.features = nyCounties.features.filter(county => county.properties.STATEFP === "36");

  ccConfig.projection
    .fitExtent(
      [
        [ccConfig.margin.top, ccConfig.margin.left],
        [ccConfig.bodyWidth, ccConfig.bodyHeight]],
      nyCounties);

  ccConfig.path = d3.geoPath().projection(ccConfig.projection);

  ccConfig.countyPaths = nyCounties.features.map(d => ccConfig.path(d));

  ccConfig.countyCentroids = nyCounties.features.map(d => {
    return { "centroid": ccConfig.path.centroid(d), "name": d.properties.NAME };
  });

  ccConfig.countySquares = ccConfig.countyCentroids.map(d => {
    return {
      "pos": eltAdd(d.centroid, scaMult([ccConfig.currSquareSize, ccConfig.currSquareSize], -0.5)),
      "size": [ccConfig.currSquareSize, ccConfig.currSquareSize],
      "v": [0, 0],
      "center": d.centroid,
      "name": d.name
    }
  });

  ccConfig.statusText.text("adding votes...");


  ccConfig.votes = data[0];
  ccConfig.candidates = Object.keys(ccConfig.votes[0]).filter(i => i!= "County");
  ccConfig.candidatesFixed = [1, 3, 0, 2].map(i => ccConfig.candidates.map(c => c.split(" (DEM)")[0])[i]);
  ccConfig.votes.forEach(i => {
    i.countyFixed = i.County.split(" County")[0];
    ccConfig.candidates.forEach(c => {
      i[c.split(" (DEM)")[0]] = Number(i[c].replace(",", ""));
    });
  });

  ccConfig.countySquares.forEach(county => {
    let countyVotes = ccConfig.votes.filter(j => j.countyFixed === county.name)[0];
    ccConfig.candidatesFixed.forEach(c => {
      county[c] = countyVotes[c];
    });
    county.totalVotes = d3.sum(ccConfig.candidatesFixed.map(c => county[c]));
  });

  ccConfig.statusText.text("updating marks...");

  let moveTimer = d3.timer(function(elapsed) {
    let currTtlVel = updateNodes(ccConfig.countySquares);
    if (elapsed > 100000 | currTtlVel < 0.5) {
      moveTimer.stop();
      ccConfig.statusText.text("");
      showCountyCartoMap();
    }
  });
});

function showCountyCartoMap() {

  let totalVotesScale = d3.scaleLinear()
    .domain([0, d3.max(ccConfig.countySquares.map(c => c.totalVotes))])
    .range([0, ccConfig.currSquareSize]);

  // draw outer square
  ccConfig.container
    .selectAll("countyMarks")
    .data(ccConfig.countySquares)
    .enter()
    .append("rect")
    .attr("x", d => d.pos[0])
    .attr("y", d => d.pos[1])
    .attr("width", d => d.size[0])
    .attr("height", d => d.size[1])
    .attr("fill", ccConfig.lightGrey)
    .attr("stroke", "none");

    // draw votes rect
    ccConfig.container
      .selectAll("countyMarks")
      .data(ccConfig.countySquares)
      .enter()
      .append("rect")
      .attr("x", d => d.pos[0])
      .attr("y", d => (d.pos[1] + ccConfig.currSquareSize - totalVotesScale(d.totalVotes)))
      .attr("width", d => d.size[0])
      .attr("height", d => totalVotesScale(d.totalVotes))
      .attr("fill", ccConfig.darkGrey)
      .attr("stroke", "none");
}
