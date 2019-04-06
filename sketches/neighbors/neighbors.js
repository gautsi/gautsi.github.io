function neighborsConfig() {
  let config = {
    "width": 400,
    "height": 400,
    "margin": {
      "top": 10,
      "bottom": 10,
      "left": 10,
      "right": 10
    },
    "numRows": 10,
    "numCols": 10,
    "container": d3.select("#neighbors").append("svg"),
    "grey": "#cccccc"
  }

  config.bodyHeight = config.height - config.margin.top - config.margin.bottom;
  config.bodyWidth = config.width - config.margin.left - config.margin.right;

  config.xScale = d3.scaleBand()
    .domain(d3.range(config.numCols))
    .range([config.margin.left, config.margin.left + config.bodyWidth])
    .padding(0.1);

  config.yScale = d3.scaleBand()
    .domain(d3.range(config.numRows))
    .range([config.margin.top, config.margin.top + config.bodyHeight])
    .padding(0.1);

  config.colorScale = d3.scaleOrdinal()
    .domain(d3.range(3))
    .range([config.grey].concat(d3.schemeDark2));

  config.container
    .attr("width", config.width)
    .attr("height", config.height);

  config.board = [];
  d3.range(config.numRows).forEach(r => d3.range(config.numCols).forEach(c => {
    config.board.push({ "row": r, "col": c, "player": 0 });
  }));

  return config;
}

function drawBoard(config) {
  config.boardJoin = config.container
    .selectAll("rect")
    .data(config.board)
    .enter()
    .append("rect")
    .attr("x", d => config.xScale(d.col))
    .attr("y", d => config.yScale(d.row))
    .attr("width", config.xScale.bandwidth())
    .attr("height", config.yScale.bandwidth())
    .attr("stroke", "none")
    .attr("fill", d => config.colorScale(d.player));
}

function randomizeBoard(board) {
  board.forEach(d => {
    d.player = Math.floor(Math.random() * 3);
  });
}

function runGame(config) {
  let gameTimer = d3.interval(elapsed => {
    randomizeBoard(config.board);
    config.boardJoin.transition().duration(1000).attr("fill", d => config.colorScale(d.player));
  }, 2000);
}

let nConfig = neighborsConfig();
drawBoard(nConfig);
runGame(nConfig);
