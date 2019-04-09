function countyUpdateConfig() {
  let config = {
    lightColor: "#cccccc",
    darkColor: d3.schemeDark2[1],
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
    button: d3.select("#button").append("button"),
    sizeSelect: d3.select("#squareSize").on("change", changeSquareSize),
    buttonStatus: "update",
    currSquareSize: 20,
    projection: d3.geoMercator(),
    countyPaths: [],
    countyCentroids: [],
    countySquares: [],
    transDuration: 1000
  };

  config.button.text(config.buttonStatus).on("click", showMapUpd);


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
  cuConfig.statusText.text("");
  drawCountyPathsUpd();
  makeCountySquares();
  drawCountySquaresUpd(cuConfig.countySquares);
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
  cuConfig.sq = cuConfig.container.selectAll("squares")
    .data(squares)
    .enter()
    .append("rect")
    .attr("x", d => d.pos[0])
    .attr("y", d => d.pos[1])
    .attr("width", d => d.size[0])
    .attr("height", d => d.size[1])
    .attr("fill", "none")
    .attr("stroke", cuConfig.darkColor)
    .attr("stroke-width", cuConfig.darkWidth);
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

function makeCountySquares() {
  cuConfig.countySquares = cuConfig.countyCentroids.map(d => {
    return {
      centroid: d.centroid,
      pos: eltAdd(d.centroid, scaMult([cuConfig.currSquareSize, cuConfig.currSquareSize], -0.5)),
      size: [cuConfig.currSquareSize, cuConfig.currSquareSize],
      v: [0, 0],
      center: d.centroid
    }
  });
}

function updateCountySquares() {
  cuConfig.countySquares.forEach(d => {
    d.pos = eltAdd(d.centroid, scaMult([cuConfig.currSquareSize, cuConfig.currSquareSize], -0.5));
    d.size = [cuConfig.currSquareSize, cuConfig.currSquareSize];
    d.v = [0, 0];
    d.center = d.centroid;
  });
}


function showMapUpd() {
  drawBackgroundUpd();
  drawCountyPathsUpd();
  let moveTimer = d3.timer(function(elapsed) {
    let currTtlVel = updateNodes(cuConfig.countySquares);
    let currAvgVel = currTtlVel / cuConfig.countySquares.length;

    drawBackgroundUpd();
    drawCountySquaresUpd(cuConfig.countySquares);

    if (elapsed > 100000 | currAvgVel < 0.05) {
      moveTimer.stop();
      drawCountyPathsUpd();
      drawCountySquaresUpd(cuConfig.countySquares);
    }
  });
}

function changeSquareSize() {
  drawBackgroundUpd();
  drawCountyPathsUpd();
  drawCountySquaresUpd(cuConfig.countySquares);

  let squareSizeSelect = document.getElementById("squareSize");
  cuConfig.currSquareSize = Number(squareSizeSelect.options[squareSizeSelect.selectedIndex].value);
  updateCountySquares();
  cuConfig.sq.transition().duration(cuConfig.transDuration)
    .attr("x", d => d.pos[0])
    .attr("y", d => d.pos[1])
    .attr("width", d => d.size[0])
    .attr("height", d => d.size[1]);
}
