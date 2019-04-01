function CountyCartoConfig() {
  let config = {
    lightColor: "#cccccc",
    darkColor: d3.schemeDark2[1],
    lightGrey: "#cccccc",
    darkGrey: "#bbbbbb",
    lightWidth: 1,
    darkWidth: 2,
    width: 500,
    height: 500,
    margin: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10},
    container: d3.select("#countiesTtlVotes").append("svg"),
    currSquareSize: 30,
    projection: d3.geoMercator(),
    countyPaths: [],
    countyCentroids: [],
    countySquares: [],
    transDuration: 1000
  };

  config.bodyHeight = height - margin.top - margin.bottom;
  config.bodyWidth = width - margin.left - margin.right;
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

d3.json("/assets/counties/us_counties.json").then(function (allCounties) {

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
  ccConfig.container
    .selectAll("countyMarks")
    .data(ccConfig.countySquares)
    .enter()
    .append("rect")
    .attr("x", d => d.pos[0])
    .attr("y", d => d.pos[1])
    .attr("width", d => d.size[0])
    .attr("height", d => d.size[1])
    .attr("fill", ccConfig.darkGrey)
    .attr("stroke", "none");
}
