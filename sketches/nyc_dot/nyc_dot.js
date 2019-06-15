function NYCDOTConfig() {
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
    barMargin: {
        top: 440,
        bottom: 50,
        left: 5,
        right: 300},
    container: d3.select("#nycdot").append("svg"),
    currSquareSize: 40,
    projection: d3.geoMercator(),
    countyPaths: [],
    countyCentroids: [],
    countySquares: [],
    transDuration: 1000,
    selectedCounty: "All counties"
  };

  config.bodyHeight = config.height - config.margin.top - config.margin.bottom;
  config.bodyWidth = config.width - config.margin.left - config.margin.right;

  config.barBodyHeight = config.height - config.barMargin.top - config.barMargin.bottom;
  config.barBodyWidth = config.width - config.barMargin.left - config.barMargin.right;

  config.container
    .attr("width", config.bodyWidth)
    .attr("height", config.bodyHeight);


  return config;
}

let ndConfig = NYCDOTConfig();

let myimage = ndConfig.container.append('image')
    .attr('xlink:href', 'http://207.251.86.238/cctv1119.jpg')
    .attr('width', 200)
    .attr('height', 200)
