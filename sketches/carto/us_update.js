function usUpdateConfig() {
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
    container: d3.select("#usUpdate").append("svg"),
    button: d3.select("#button").append("button"),
    sizeSelect: d3.select("#squareSize").on("change", changeSquareSize),
    buttonStatus: "update",
    currSquareSize: 20,
    projection: d3.geoAlbers(),
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

let usConfig = usUpdateConfig();

d3.json(
  // "/assets/states/gz_2010_us_040_00_500k.json"
  "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json").then(function (allStates) {

  usConfig.allStates = allStates;

  usConfig.projection
    .fitExtent(
      [
        [usConfig.margin.top, usConfig.margin.left],
        [usConfig.bodyWidth, usConfig.bodyHeight]],
      allStates);

  usConfig.path = d3.geoPath().projection(usConfig.projection);

  usConfig.statePaths = allStates.features.map(d => usConfig.path(d));
  usConfig.stateCentroids = allStates.features.map(d => {
    return { "centroid": usConfig.path.centroid(d), "name": d.properties.name };
  });
  usConfig.statusText.text("");
  drawStatePathsUpd();
  makeStateSquares();
  drawStateSquaresUpd(usConfig.stateSquares);
});

function drawStatePathsUpd() {
  usConfig.container.selectAll("paths")
    .data(usConfig.statePaths)
    .enter()
    .append("path")
    .attr("d", d => d)
    .attr("fill", "none")
    .attr("stroke", usConfig.lightColor)
    .attr("stroke-width", usConfig.lightWidth);
}

function drawStateSquaresUpd(squares) {
  usConfig.sq = usConfig.container.selectAll("squares")
    .data(squares)
    .enter()
    .append("rect")
    .attr("x", d => d.pos[0])
    .attr("y", d => d.pos[1])
    .attr("width", d => d.size[0])
    .attr("height", d => d.size[1])
    .attr("fill", "none")
    .attr("stroke", usConfig.darkColor)
    .attr("stroke-width", usConfig.darkWidth);
}

function drawBackgroundUpd() {
  usConfig.container
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", usConfig.width)
    .attr("height", usConfig.height)
    .attr("fill", "white");
}

function makeStateSquares() {
  usConfig.stateSquares = usConfig.stateCentroids.map(d => {
    return {
      centroid: d.centroid,
      pos: eltAdd(d.centroid, scaMult([usConfig.currSquareSize, usConfig.currSquareSize], -0.5)),
      size: [usConfig.currSquareSize, usConfig.currSquareSize],
      v: [0, 0],
      center: d.centroid
    }
  });
}

function updateStateSquares() {
  usConfig.stateSquares.forEach(d => {
    d.pos = eltAdd(d.centroid, scaMult([usConfig.currSquareSize, usConfig.currSquareSize], -0.5));
    d.size = [usConfig.currSquareSize, usConfig.currSquareSize];
    d.v = [0, 0];
    d.center = d.centroid;
  });
}


function showMapUpd() {
  drawBackgroundUpd();
  drawStatePathsUpd();
  let moveTimer = d3.timer(function(elapsed) {
    let currTtlVel = updateNodes(usConfig.stateSquares);
    let currAvgVel = currTtlVel / usConfig.stateSquares.length;

    drawBackgroundUpd();
    drawStateSquaresUpd(usConfig.stateSquares);

    if (elapsed > 100000 | currAvgVel < 0.05) {
      moveTimer.stop();
      drawStatePathsUpd();
      drawStateSquaresUpd(usConfig.stateSquares);
    }
  });
}

function changeSquareSize() {
  drawBackgroundUpd();
  drawStatePathsUpd();
  drawStateSquaresUpd(usConfig.stateSquares);

  let squareSizeSelect = document.getElementById("squareSize");
  usConfig.currSquareSize = Number(squareSizeSelect.options[squareSizeSelect.selectedIndex].value);
  updateStateSquares();
  usConfig.sq.transition().duration(usConfig.transDuration)
    .attr("x", d => d.pos[0])
    .attr("y", d => d.pos[1])
    .attr("width", d => d.size[0])
    .attr("height", d => d.size[1]);
}
