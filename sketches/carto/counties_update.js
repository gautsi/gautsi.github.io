let nyCounties2;

let lightColor2 = "#cccccc";
let darkColor2 = d3.schemeDark2[1];

let lightWidth2 = 1;
let darkWidth2 = 2;


let width2 = 500;
let height2 = 500;
let margin2 = {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10};

let bodyHeight2 = height2 - margin2.top - margin2.bottom;
let bodyWidth2 = width2 - margin2.left - margin2.right;


let container2 = d3.select("#countiesUpdate").append("svg");

container2
  .attr("width", bodyWidth2)
  .attr("height", bodyHeight2);

let statusText2 = container2.append("text").attr("x", 5).attr("y", 15).text("preparing map...");

let currSquareSize2 = 30;

let projection2 = d3.geoMercator();
let countyPaths2 = [];
let countyCentroids2 = [];
let countySquares2 = [];

let transDuration2 = 1000;

d3.json("/assets/counties/us_counties.json").then(function (allCounties) {
  nyCounties2 = allCounties;
  nyCounties2.features = nyCounties2.features.filter(county => county.properties.STATEFP === "36");

  projection2.fitExtent([[margin2.top, margin2.left], [bodyWidth2, bodyHeight2]], nyCounties2);

  path2 = d3.geoPath().projection(projection2);

  countyPaths2 = nyCounties2.features.map(d => path2(d));
  countyCentroids2 = nyCounties2.features.map(d => {
    return { "centroid": path2.centroid(d), "name": d.properties.NAME };
  });

  countySquares2 = countyCentroids2.map(d => {
    return {
      "pos": eltAdd(d.centroid, scaMult([currSquareSize2, currSquareSize2], -0.5)),
      "size": [currSquareSize2, currSquareSize2],
      "v": [0, 0],
      "center": d.centroid
    }
  });

  statusText2.text("");
  showMap2();
});

function drawCountyPaths2() {
  container2.selectAll("paths")
    .data(countyPaths2)
    .enter()
    .append("path")
    .attr("d", d => d)
    .attr("fill", "none")
    .attr("stroke", lightColor2)
    .attr("stroke-width", lightWidth2);
}

function drawCountyCentroids2() {
  container2.selectAll("labels")
    .data(countyCentroids2)
    .enter()
    .append("text")
    .text(d => d.name)
    .attr("x", d => d.centroid[0] - currSquareSize2 / 2 + 2)
    .attr("y", d => d.centroid[1])
    .attr("font-size", 8);
}

function drawCountySquares2(squares) {
  let sq = container2.selectAll("squares")
    .data(squares);

  sq.enter()
    .append("rect")
    .attr("x", d => d.pos[0])
    .attr("y", d => d.pos[1])
    .attr("width", d => d.size[0])
    .attr("height", d => d.size[1])
    .attr("fill", "none")
    .attr("stroke", darkColor2)
    .attr("stroke-width", darkWidth2);

  sq.exit().remove();
}

function drawBackground() {
  container2
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "white");
}

function showMap2() {
  drawCountyPaths2();
  drawCountySquares2(countySquares2);
  // drawCountyCentroids2();

  let moveTimer = d3.timer(function(elapsed) {
    let currTtlVel = updateNodes(countySquares2);

    drawBackground();
    drawCountySquares2(countySquares2);


    if (elapsed > 100000 | currTtlVel < 0.5) {
      moveTimer.stop();
      drawCountyPaths2();
      drawCountySquares2(countySquares2);
    }
  }, 1000);
}
