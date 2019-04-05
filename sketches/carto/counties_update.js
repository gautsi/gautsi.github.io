function countyUpdateConfig() {
  let config = {
    lightColor: "#cccccc",
    darkColor: d3.schemeDark2[1],
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

let cuConfig = countyUpdateConfig();

d3.json("/assets/counties/us_counties.json").then(function (allCounties) {
  let nyCounties = allCounties;
  nyCounties.features = nyCounties.features.filter(county => county.properties.STATEFP === "36");

  cuConfig.projection
    .fitExtent(
      [
        [cuConfig.margin.top, cuConfig.margin.left],
        [cuConfig.bodyWidth, cuConfig.bodyHeight]],
      nyCounties);

  cuConfig.path = d3.geoPath().projection(cuConfig.projection);

  cuConfig.countyPaths = nyCounties.features.map(d => cuConfig.path(d));
  cuConfig.countyCentroids = nyCounties.features.map(d => {
    return { "centroid": cuConfig.path.centroid(d), "name": d.properties.NAME };
  });

  cuConfig.countySquares = cuConfig.countyCentroids.map(d => {
    return {
      "pos": eltAdd(d.centroid, scaMult([cuConfig.currSquareSize, cuConfig.currSquareSize], -0.5)),
      "size": [cuConfig.currSquareSize, cuConfig.currSquareSize],
      "v": [0, 0],
      "center": d.centroid
    }
  });

  cuConfig.statusText.text("");
  showMapUpd();
});

function drawCountyPathsUpd() {
  cuConfig.container.selectAll("paths")
    .data(cuConfig.countyPaths)
    .enter()
    .append("path")
    .attr("d", d => d)
    .attr("fill", "none")
    .attr("stroke", cuConfig.lightColor)
    .attr("stroke-width", cuConfig.lightWidth);
}

function drawCountySquaresUpd(squares) {
  let sq = cuConfig.container.selectAll("squares")
    .data(squares);

  sq.enter()
    .append("rect")
    .attr("x", d => d.pos[0])
    .attr("y", d => d.pos[1])
    .attr("width", d => d.size[0])
    .attr("height", d => d.size[1])
    .attr("fill", "none")
    .attr("stroke", cuConfig.darkColor)
    .attr("stroke-width", cuConfig.darkWidth);

  sq.exit().remove();
}

function drawBackgroundUpd() {
  cuConfig.container
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", cuConfig.width)
    .attr("height", cuConfig.height)
    .attr("fill", "white");
}

function showMapUpd() {
  drawCountyPathsUpd();
  drawCountySquaresUpd(cuConfig.countySquares);

  let moveTimer = d3.timer(function(elapsed) {
    let currTtlVel = updateNodes(cuConfig.countySquares);

    drawBackgroundUpd();
    drawCountySquaresUpd(cuConfig.countySquares);


    if (elapsed > 100000 | currTtlVel < 0.5) {
      moveTimer.stop();
      drawCountyPathsUpd();
      drawCountySquaresUpd(cuConfig.countySquares);
    }
  }, 1000);
}
