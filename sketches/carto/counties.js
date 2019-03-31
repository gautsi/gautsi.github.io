let nyCounties;

let lightColor = "#cccccc";
let darkColor = d3.schemeDark2[1];

let lightWidth = 1;
let darkWidth = 2;

let lightRad = 1;
let darkRad = 3;


let width = 500;
let height = 500;
let margin = {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10};

let bodyHeight = height - margin.top - margin.bottom;
let bodyWidth = width - margin.left - margin.right;


let container = d3.select("#counties").append("svg");

container
  .attr("width", bodyWidth)
  .attr("height", bodyHeight);

let statusText = container.append("text").attr("x", 5).attr("y", 15).text("preparing map...");

let currSquareSize = 20;
let currMark = "counties";

let projection = d3.geoMercator();
let countyPaths = [];
let countyCentroids = [];
let countySquares = [];

let transDuration = 1000;

d3.select("#mark").on("change", changeMark);
d3.select("#squareSize").on("change", changeSquareSize);

d3.json("/assets/counties/us_counties.json").then(function (allCounties) {
  nyCounties = allCounties;
  nyCounties.features = nyCounties.features.filter(county => county.properties.STATEFP === "36");

  projection.fitExtent([[margin.top, margin.left], [bodyWidth, bodyHeight]], nyCounties);

  path = d3.geoPath().projection(projection);

  countyPaths = nyCounties.features.map(d => path(d));
  countyCentroids = nyCounties.features.map(d => path.centroid(d));

  statusText.text("");
  showMap();
});

function drawCountyPaths() {
  container.selectAll("path")
    .data(countyPaths)
    .enter()
    .append("path")
    .attr("d", d => d)
    .attr("fill", "none")
    .attr("stroke", darkColor)
    .attr("stroke-width", darkWidth);
}

function drawCountyCentroids() {
  container.selectAll("circle")
    .data(countyCentroids)
    .enter()
    .append("circle")
    .attr("cx", d => d[0])
    .attr("cy", d => d[1])
    .attr("r", lightRad)
    .attr("fill", lightColor)
    .attr("stroke", "none");
}

function drawCountySquares() {
  squareJoin = container.selectAll("rect")
    .data(countyCentroids)
    .enter()
    .append("rect")
    .attr("x", d => d[0] - currSquareSize / 2)
    .attr("y", d => d[1] - currSquareSize / 2)
    .attr("width", currSquareSize)
    .attr("height", currSquareSize)
    .attr("fill", "none")
    .attr("stroke", lightColor)
    .attr("stroke-width", lightWidth);
}


function showMap() {

  drawCountyPaths();
  drawCountyCentroids();
  drawCountySquares();
  container.selectAll("path").raise();
}

function changeMark() {
  let markSelect = document.getElementById("mark");
  let mark = markSelect.options[markSelect.selectedIndex].value;
  if (mark === "counties") {
    container.selectAll("path").transition()
      .duration(transDuration)
      .attr("stroke", darkColor)
      .attr("stroke-width", darkWidth)
      .on("end", function() {container.selectAll("path").raise()});

    container.selectAll("circle").transition()
      .duration(transDuration)
      .attr("fill", lightColor)
      .attr("r", lightRad);

    container.selectAll("rect").transition()
      .duration(transDuration)
      .attr("stroke", lightColor)
      .attr("stroke-width", lightWidth);

  } else if (mark === "centroids") {
    container.selectAll("path").transition()
      .duration(transDuration)
      .attr("stroke", lightColor)
      .attr("stroke-width", lightWidth);

    container.selectAll("circle").transition()
      .duration(transDuration)
      .attr("fill", darkColor)
      .attr("r", darkRad)
      .on("end", function() {container.selectAll("circle").raise()});

    container.selectAll("rect").transition()
      .duration(transDuration)
      .attr("stroke", lightColor)
      .attr("stroke-width", lightWidth);

  } else if (mark === "squares") {
    container.selectAll("path").transition()
      .duration(transDuration)
      .attr("stroke", lightColor)
      .attr("stroke-width", lightWidth);

    container.selectAll("circle").transition()
      .duration(transDuration)
      .attr("fill", lightColor)
      .attr("r", lightRad);

    container.selectAll("rect").transition()
      .duration(transDuration)
      .attr("stroke", darkColor)
      .attr("stroke-width", darkWidth)
      .on("end", function() {container.selectAll("rect").raise()});
  }
}


function changeSquareSize() {
  let squareSizeSelect = document.getElementById("squareSize");
  let squareSize = Number(squareSizeSelect.options[squareSizeSelect.selectedIndex].value);

  squareJoin.transition()
    .duration(transDuration)
    .attr("x", d => d[0] - squareSize / 2)
    .attr("y", d =>d[1] - squareSize / 2)
    .attr("width", squareSize)
    .attr("height", squareSize);
}
