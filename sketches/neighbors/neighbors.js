function neighborsConfig() {
  let config = {
    width: 400,
    height: 400,
    margin: {
      top: 10,
      bottom: 10,
      left: 10,
      right: 10
    },
    numRows: 10,
    numCols: 10,
    container: d3.select("#neighbors").append("svg"),
    grey: "#cccccc",
    startingPositions: [
      { player : 1, positions: [[0, 4], [0, 5], [1, 4]] },
      { player : 2, positions: [[9, 4], [9, 5], [8, 5]] }],
    rules: [1, 1]
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
    config.board.push({ "row": r, "col": c, "player": 0, "neighbors": [0, 0] });
  }));

  config.startingPositions.forEach(ps => ps.positions.forEach(p => {
    config.board[p[0] * config.numRows + p[1]].player = ps.player;
  }));

  return config;
}

function drawBoard(config) {
  calcNeighbors(nConfig);

  config.boardJoin = config.container
    .selectAll(".piece")
    .data(config.board)
    .enter()
    .append("rect")
    .attr("class", "piece")
    .attr("x", d => config.xScale(d.col))
    .attr("y", d => config.yScale(d.row))
    .attr("width", config.xScale.bandwidth())
    .attr("height", config.yScale.bandwidth())
    .attr("stroke", "none")
    .attr("fill", d => config.colorScale(d.player));

    config.textJoin = config.container
      .selectAll("text")
      .data(config.board)
      .enter()
      .append("text")
      .text(d => d.neighbors.reduce((a, b) => a + ", " + b))
      .attr("x", d => config.xScale(d.col) + config.xScale.bandwidth() / 8)
      .attr("y", d => config.yScale(d.row) + config.yScale.bandwidth() / 2);

    config.textJoin.exit().remove();
}

function calcNeighbors(config) {
  config.board.forEach(d => {
    d.neighbors = [0, 0];
  });

  config.board.forEach((d, i) => {
    if (d.player > 0) {
      let row = Math.floor(i / config.numRows);
      let col = i % config.numCols;
      let neighborPos = [-1, 0, 1]
        .flatMap(j => [-1, 0, 1].map(
          k => [row + j, col + k]))
        .filter(l => l[0] >= 0 && l[0] < config.numRows && l[1] >= 0 && l[1] < config.numCols)
        .map(l => l[0] * config.numRows + l[1]);

      neighborPos.forEach(p => {config.board[p].neighbors[d.player - 1] += 1});
    }
  });
}

function randomizeRules(config) {
  config.rules = [0, 1].map(i => 1 + Math.floor(2 * Math.random()));
}

function randomizeBoard(board) {
  board.forEach(d => {
    d.player = Math.floor(Math.random() * 3);
  });
}

function drawBackground(config) {
  config.container
    .append("rect")
    .attr("class", "background")
    .attr("fill", "white")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", config.width)
    .attr("height", config.height)
    .attr("stroke", "black");
}

function updateBoard(config) {
  config.board.forEach(p => {
    if (p.neighbors[0] == config.rules[0] && p.neighbors[1] != config.rules[1]) {
        p.player = 1;
    } else if (p.neighbors[1] == config.rules[1] && p.neighbors[0] != config.rules[0]) {
      p.player = 2;
    } else {
      p.player = 0;
    }
  });
}

function runGame(config) {
  let gameTimer = d3.interval(elapsed => {
    randomizeRules(config);
    updateBoard(config);
    calcNeighbors(config);
    config.boardJoin.transition().duration(500).attr("fill", d => config.colorScale(d.player));
    config.textJoin.transition().duration(500).text(d => d.neighbors.reduce((a, b) => a + ", " + b));
  }, 1000);
}

let nConfig = neighborsConfig();
// drawBackground(nConfig);
drawBoard(nConfig);
runGame(nConfig);
