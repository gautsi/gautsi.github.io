function usUpdateConfig() {
  let config = {
    lightColor: "#cccccc",
    darkColor: d3.schemeDark2[1],
    lightWidth: 1,
    darkWidth: 2,
    width: 700,
    height: 600,
    margin: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10},
    container: d3.select("#map"),
    currSquareSize: 50,
    projection: d3.geoAlbers(),
    statePaths: [],
    stateCentroids: [],
    stateSquares: [],
    transDuration: 1000,
    mapTrans: [-300, -300]
  };

  // config.button.text(config.buttonStatus).on("click", showMapUpd);
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
    .attr("stroke", d3.schemeDark2[1])
    .attr("stroke-width", 2);

}

function drawStateLabels(squares) {
  usConfig.abv = usConfig.container.selectAll("state_abv")
    .data(squares)
    .enter()
    .append("text")
    .attr("x", d => d.pos[0] + 10)
    .attr("y", d => d.pos[1] + 20)
    .attr("fill", d3.schemeDark2[1])
    .attr("stroke", "none")
    .text(d => d.abv);
}

function drawStatePops() {
  usConfig.pop = usConfig.container
    .selectAll("statePopMarks")
    .data(usConfig.statePops)
    .enter()
    .append("rect")
    .attr("x", d => d.pos[0] + usConfig.yearScale(d.year))
    .attr("y", d => d.pos[1] + usConfig.popScale(d.pop))
    .attr("width", d => usConfig.yearScale.bandwidth())
    .attr("height", d => usConfig.currSquareSize - usConfig.popScale(d.pop))
    .attr("stroke", "none")
    .attr("fill", d3.schemeDark2[0]);
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
      centroid: eltAdd(d.centroid, usConfig.mapTrans),
      pos: eltAdd(
        eltAdd(d.centroid, usConfig.mapTrans),
        scaMult([usConfig.currSquareSize, usConfig.currSquareSize], -0.5)),
      size: [usConfig.currSquareSize, usConfig.currSquareSize],
      v: [0, 0],
      center: eltAdd(d.centroid, usConfig.mapTrans),
      name: d.name
    }
  });
}

function addStateAbv() {
  usConfig.stateSquares.map(d => {
    d.abv = usConfig.stateCodes.filter(s => s.STATE_NAME == d.name)[0].STUSAB;
  });
}

function addStatePops() {
  usConfig.maxPop = 0;
  usConfig.years = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018];
  usConfig.stateSquares.map(d => {
    let pops = usConfig.statePops.filter(s => s.NAME == d.name)[0];
    usConfig.years.map(year => {
      let pop = parseInt(pops["POPESTIMATE" + year]);
      if (pop > usConfig.maxPop) {
        usConfig.maxPop = pop;
      }
      d[year] = pop;
    });
  });
}

function makeStatePops() {
  usConfig.statePops = usConfig.stateSquares.flatMap(d => usConfig.years.map(year =>{ return {'year': year, 'pos': d.pos, 'pop': d[year]};}))
}


function showMapUpd() {
  // drawBackgroundUpd();
  // drawStatePathsUpd();
  let moveTimer = d3.timer(function(elapsed) {
    let currTtlVel = updateNodes(usConfig.stateSquares);
    let currAvgVel = currTtlVel / usConfig.stateSquares.length;

    // drawBackgroundUpd();
    // drawStateSquaresUpd(usConfig.stateSquares);

    if (elapsed > 100000 | currAvgVel < 0.05) {
      moveTimer.stop();
      // drawStatePathsUpd();
      drawStateSquaresUpd(usConfig.stateSquares);
      makeStatePops();
      drawStatePops();
      drawStateLabels(usConfig.stateSquares);
      usConfig.statusText.text("");
    }
  });
}

let usConfig = usUpdateConfig();

Promise.all([
  d3.json(
    // "/assets/states/gz_2010_us_040_00_500k.json"
    "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json"),
  d3.dsv(
    "|",
    // from https://www2.census.gov/geo/docs/reference/state.txt
    "/assets/states/state_codes.txt"),
  d3.csv(
    //from https://www2.census.gov/programs-surveys/popest/datasets/2010-2018/national/totals/nst-est2018-alldata.csv
    "/assets/states/nst-est2018-alldata.csv")]).then(function (data) {

  usConfig.allStates = data[0];
  usConfig.stateCodes = data[1];
  usConfig.statePops = data[2];

  usConfig.projection
    .fitExtent(
      [
        [usConfig.margin.top, usConfig.margin.left],
        [usConfig.bodyWidth, usConfig.bodyHeight]],
      usConfig.allStates);

  usConfig.path = d3.geoPath().projection(usConfig.projection);

  // usConfig.statePaths = usConfig.allStates.features.map(d => usConfig.path(d));
  usConfig.stateCentroids = usConfig.allStates.features.map(d => {
    return { "centroid": scaMult(usConfig.path.centroid(d), 1.5), "name": d.properties.name };
  });
  makeStateSquares();
  addStateAbv();
  addStatePops();

  // make the pop bar scales
  usConfig.popScale = d3.scaleLinear()
      .domain([0, usConfig.maxPop])
      .range([usConfig.currSquareSize, 0]);

  usConfig.yearScale = d3.scaleBand()
      .domain(usConfig.years)
      .range([0, usConfig.currSquareSize])
      .padding(0.1);

  showMapUpd();
});
