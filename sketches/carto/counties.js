let nyCounties = [];

d3.json("/assets/counties/us_counties.json").then(function (allCounties) {
  nyCounties = allCounties
  nyCounties.features = nyCounties.features.filter(county => county.properties.STATEFP === "36");
  showMap();
});


function showMap() {
  let width = 400;
  let height = 400;
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

  let projection = d3.geoMercator()
    .fitExtent([[margin.top, margin.left], [bodyWidth, bodyHeight]], nyCounties);

  let path = d3.geoPath()
    .projection(projection);

  container.selectAll("path")
    .data(nyCounties.features)
    .enter()
    .append("path")
    .attr("d", d => path(d))
    .attr("fill", "none")
    .attr("stroke", "#cccccc");

  let squareLength = 20;

  container.selectAll("squares")
    .data(nyCounties.features)
    .enter()
    .append("rect")
    .attr("x", d => path.centroid(d)[0] - squareLength / 2)
    .attr("y", d => path.centroid(d)[1] - squareLength / 2)
    .attr("width", squareLength)
    .attr("height", squareLength)
    .attr("fill", "none")
    .attr("stroke", d3.schemeDark2[1])
    .attr("stroke-width", 2);
}
