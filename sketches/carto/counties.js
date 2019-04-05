function countyConfig() {
  let config = {
    lightColor: "#cccccc",
    darkColor: d3.schemeDark2[1],
    lightGrey: "#eeeeee",
    darkGrey: "#bbbbbb",
    lightWidth: 1,
    darkWidth: 2,
    lightRad: 1,
    darkRad: 2,
    width: 500,
    height: 500,
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
    currSquareSize: 20,
    projection: d3.geoMercator(),
    countyPaths: [],
    countyCentroids: [],
    countySquares: [],
    transDuration: 1000,
    selectedCounty: "All counties"
  };

  config.bodyHeight = config.height - config.margin.top - config.margin.bottom;
  config.bodyWidth = config.width - config.margin.left - config.margin.right;


  config.container = d3.select("#counties").append("svg");

  config.container
    .attr("width", config.bodyWidth)
    .attr("height", config.bodyHeight);

  config.statusText = config.container.append("text").attr("x", 5).attr("y", 15).text("preparing map...");

  config.currMark = "counties";
  return config;
}


let cConfig = countyConfig();


d3.select("#mark").on("change", changeMark);
d3.select("#squareSize").on("change", changeSquareSize);

d3.json("/assets/counties/us_counties.json").then(function (allCounties) {
  let nyCounties = allCounties;
  nyCounties.features = nyCounties.features.filter(county => county.properties.STATEFP === "36");

  cConfig.projection.fitExtent([[cConfig.margin.top, cConfig.margin.left], [cConfig.bodyWidth, cConfig.bodyHeight]], nyCounties);

  cConfig.path = d3.geoPath().projection(cConfig.projection);

  cConfig.countyPaths = nyCounties.features.map(d => cConfig.path(d));
  cConfig.countyCentroids = nyCounties.features.map(d => cConfig.path.centroid(d));

  cConfig.statusText.text("");
  showMap();
});

function drawCountyPaths() {
  cConfig.container.selectAll("path")
    .data(cConfig.countyPaths)
    .enter()
    .append("path")
    .attr("d", d => d)
    .attr("fill", "none")
    .attr("stroke", cConfig.darkColor)
    .attr("stroke-width", cConfig.darkWidth);
}

function drawCountyCentroids() {
  cConfig.container.selectAll("circle")
    .data(cConfig.countyCentroids)
    .enter()
    .append("circle")
    .attr("cx", d => d[0])
    .attr("cy", d => d[1])
    .attr("r", cConfig.lightRad)
    .attr("fill", cConfig.lightColor)
    .attr("stroke", "none");
}

function drawCountySquares() {
  cConfig.squareJoin = cConfig.container.selectAll("rect")
    .data(cConfig.countyCentroids)
    .enter()
    .append("rect")
    .attr("x", d => d[0] - cConfig.currSquareSize / 2)
    .attr("y", d => d[1] - cConfig.currSquareSize / 2)
    .attr("width", cConfig.currSquareSize)
    .attr("height", cConfig.currSquareSize)
    .attr("fill", "none")
    .attr("stroke", cConfig.lightColor)
    .attr("stroke-width", cConfig.lightWidth);
}


function showMap() {

  drawCountyPaths();
  drawCountyCentroids();
  drawCountySquares();
  cConfig.container.selectAll("path").raise();
}

function changeMark() {
  let markSelect = document.getElementById("mark");
  let mark = markSelect.options[markSelect.selectedIndex].value;
  if (mark === "counties") {
    cConfig.container.selectAll("path").transition()
      .duration(cConfig.transDuration)
      .attr("stroke", cConfig.darkColor)
      .attr("stroke-width", cConfig.darkWidth)
      .on("end", function() {cConfig.container.selectAll("path").raise()});

    cConfig.container.selectAll("circle").transition()
      .duration(cConfig.transDuration)
      .attr("fill", cConfig.lightColor)
      .attr("r", cConfig.lightRad);

    cConfig.container.selectAll("rect").transition()
      .duration(cConfig.transDuration)
      .attr("stroke", cConfig.lightColor)
      .attr("stroke-width", cConfig.lightWidth);

  } else if (mark === "centroids") {
    cConfig.container.selectAll("path").transition()
      .duration(cConfig.transDuration)
      .attr("stroke", cConfig.lightColor)
      .attr("stroke-width", cConfig.lightWidth);

    cConfig.container.selectAll("circle").transition()
      .duration(cConfig.transDuration)
      .attr("fill", cConfig.darkColor)
      .attr("r", cConfig.darkRad)
      .on("end", function() {cConfig.container.selectAll("circle").raise()});

    cConfig.container.selectAll("rect").transition()
      .duration(cConfig.transDuration)
      .attr("stroke", cConfig.lightColor)
      .attr("stroke-width", cConfig.lightWidth);

  } else if (mark === "squares") {
    cConfig.container.selectAll("path").transition()
      .duration(cConfig.transDuration)
      .attr("stroke", cConfig.lightColor)
      .attr("stroke-width", cConfig.lightWidth);

    cConfig.container.selectAll("circle").transition()
      .duration(cConfig.transDuration)
      .attr("fill", cConfig.lightColor)
      .attr("r", cConfig.lightRad);

    cConfig.container.selectAll("rect").transition()
      .duration(cConfig.transDuration)
      .attr("stroke", cConfig.darkColor)
      .attr("stroke-width", cConfig.darkWidth)
      .on("end", function() {cConfig.container.selectAll("rect").raise()});
  }
}


function changeSquareSize() {
  let squareSizeSelect = document.getElementById("squareSize");
  let squareSize = Number(squareSizeSelect.options[squareSizeSelect.selectedIndex].value);

  cConfig.squareJoin.transition()
    .duration(cConfig.transDuration)
    .attr("x", d => d[0] - squareSize / 2)
    .attr("y", d =>d[1] - squareSize / 2)
    .attr("width", squareSize)
    .attr("height", squareSize);
}
