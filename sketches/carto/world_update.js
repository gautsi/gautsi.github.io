function worldUpdateConfig() {
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
    container: d3.select("#worldUpdate").append("svg"),
    button: d3.select("#worldButton").append("button"),
    sizeSelect: d3.select("#worldSquareSize").on("change", worldChangeSquareSize),
    buttonStatus: "update",
    currSquareSize: 20,
    projection: d3.geoEqualEarth(),
    statePaths: [],
    stateCentroids: [],
    stateSquares: [],
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

let worldConfig = worldUpdateConfig();

d3.json(
  // "/assets/states/gz_2010_us_040_00_500k.json"
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson").then(function (allCountries) {

  worldConfig.allCountries = allCountries;

  worldConfig.projection
    .fitExtent(
      [
        [worldConfig.margin.top, worldConfig.margin.left],
        [worldConfig.bodyWidth, worldConfig.bodyHeight]],
      allCountries);

  worldConfig.path = d3.geoPath().projection(worldConfig.projection);

  worldConfig.countryPaths = allCountries.features.map(d => worldConfig.path(d));
  worldConfig.countryCentroids = allCountries.features.map(d => {
    return { "centroid": worldConfig.path.centroid(d), "name": d.properties.name };
  });
  worldConfig.statusText.text("");
  drawCountryPathsUpd();
  makeCountrySquares();
  drawCountrySquaresUpd(worldConfig.countrySquares);
});

function drawCountryPathsUpd() {
  worldConfig.container.selectAll("paths")
    .data(worldConfig.countryPaths)
    .enter()
    .append("path")
    .attr("d", d => d)
    .attr("fill", "none")
    .attr("stroke", worldConfig.lightColor)
    .attr("stroke-width", worldConfig.lightWidth);
}

function drawCountrySquaresUpd(squares) {
  worldConfig.sq = worldConfig.container.selectAll("squares")
    .data(squares)
    .enter()
    .append("rect")
    .attr("x", d => d.pos[0])
    .attr("y", d => d.pos[1])
    .attr("width", d => d.size[0])
    .attr("height", d => d.size[1])
    .attr("fill", "none")
    .attr("stroke", worldConfig.darkColor)
    .attr("stroke-width", worldConfig.darkWidth);
}

function drawBackgroundUpd() {
  worldConfig.container
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", worldConfig.width)
    .attr("height", worldConfig.height)
    .attr("fill", "white");
}

function makeCountrySquares() {
  worldConfig.countrySquares = worldConfig.countryCentroids.map(d => {
    return {
      centroid: d.centroid,
      pos: eltAdd(d.centroid, scaMult([worldConfig.currSquareSize, worldConfig.currSquareSize], -0.5)),
      size: [worldConfig.currSquareSize, worldConfig.currSquareSize],
      v: [0, 0],
      center: d.centroid
    }
  });
}

function updateCountrySquares() {
  worldConfig.countrySquares.forEach(d => {
    d.pos = eltAdd(d.centroid, scaMult([worldConfig.currSquareSize, worldConfig.currSquareSize], -0.5));
    d.size = [worldConfig.currSquareSize, worldConfig.currSquareSize];
    d.v = [0, 0];
    d.center = d.centroid;
  });
}


function showMapUpd() {
  drawBackgroundUpd();
  drawCountryPathsUpd();
  let moveTimer = d3.timer(function(elapsed) {
    let currTtlVel = updateNodes(worldConfig.countrySquares);
    let currAvgVel = currTtlVel / worldConfig.countrySquares.length;

    drawBackgroundUpd();
    drawCountrySquaresUpd(worldConfig.countrySquares);

    if (elapsed > 100000 | currAvgVel < 0.05) {
      moveTimer.stop();
      drawCountryPathsUpd();
      drawCountrySquaresUpd(worldConfig.countrySquares);
    }
  });
}

function worldChangeSquareSize() {
  drawBackgroundUpd();
  drawCountryPathsUpd();
  drawCountrySquaresUpd(worldConfig.countrySquares);

  let squareSizeSelect = document.getElementById("worldSquareSize");
  worldConfig.currSquareSize = Number(squareSizeSelect.options[squareSizeSelect.selectedIndex].value);
  updateCountrySquares();
  worldConfig.sq.transition().duration(worldConfig.transDuration)
    .attr("x", d => d.pos[0])
    .attr("y", d => d.pos[1])
    .attr("width", d => d.size[0])
    .attr("height", d => d.size[1]);
}
