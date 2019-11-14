function setUp() {
  let config = {
    width: 400,
    height: 400,
    margin: {
      top: 10,
      bottom: 10,
      left: 10,
      right: 10},
    numRows: 10,
    numCols: 10,
    container: d3.select("#grid"),
    grey: "#cccccc",
    lightGrey: "#dddddd",
    startingPositions: [
      { player : 1, positions: [[0, 4]] },
      { player : 2, positions: [[9, 4]] }],
  };
  config.bodyHeight = config.height - config.margin.top - config.margin.bottom;
  config.bodyWidth = config.width - config.margin.left - config.margin.right;

  config.xScale = d3.scaleBand()
    .domain(d3.range(config.numCols))
    .range([config.margin.left, config.margin.left + config.bodyWidth])
    .padding(0.2);

  config.yScale = d3.scaleBand()
    .domain(d3.range(config.numRows))
    .range([config.margin.top, config.margin.top + config.bodyHeight])
    .padding(0.2);

  config.colorScale = d3.scaleOrdinal()
    .domain(d3.range(3))
    .range([config.grey].concat(d3.schemeDark2));

  config.lightColorScale = d3.scaleOrdinal()
    .domain(d3.range(3))
    .range([config.lightGrey].concat(d3.schemeSet2));

  config.container
    .attr("width", config.width)
    .attr("height", config.height);

  config.board = [];
  d3.range(config.numRows).forEach(r => d3.range(config.numCols).forEach(c => {
    config.board.push({ "row": r, "col": c, "player": 0, "influence": [0, 0] });
  }));

  config.startingPositions.forEach(ps => ps.positions.forEach(p => {
    config.board[p[0] * config.numRows + p[1]].player = ps.player;
  }));

  config.board.forEach(d => {
    d.influence = [0, 0];
    d.influenceDiff = 0;
    d.influenceChoice = 0;
  });

  return config;
};


function drawBoard(config) {
  // draw influence
  config.infJoin = config.container
    .selectAll(".inf")
    .data(config.board)
    .enter()
    .append("rect")
    .attr("class", "inf")
    .attr("x", d => config.xScale(d.col))
    .attr("y", d => config.yScale(d.row))
    .attr("width", config.xScale.bandwidth() *1.2)
    .attr("height", config.yScale.bandwidth() * 1.2)
    .attr("stroke", "none")
    .attr("fill", d => config.lightColorScale(d.influenceChoice));

  // draw pieces
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

}

function getRowCol(config, i) {
  let row = Math.floor(i / config.numRows);
  let col = i % config.numCols;
  return [row, col];
}

function calcInfluence(config) {
  config.board.forEach(d => {
    d.influence = [0, 0];
    d.influenceDiff = 0;
    d.influenceChoice = 0;
  });

  config.board.forEach((d, i) => {
    config.board.forEach((e, j) => {
      if (e.player > 0) {
        let distance = dist(
          getRowCol(config, i),
          getRowCol(config, j));
        let upd = i == j?2:1/distance;
        d.influence[e.player - 1] += upd;
      }
    });
  });

  config.board.forEach(d => {
    d.influenceDiff = d.influence[1] - d.influence[0];
    d.influenceChoice = d.influenceDiff == 0?0:d.influenceDiff > 0?2:1;
  });
}

function move(config) {
  // each player picks a piece where they have influence
  // both players move
  [1, 2].forEach(player => {
    let possible = config.board.filter(d => d.influenceChoice == player & d.player != player);
    if (possible.length > 0) {
      let choiceInd = Math.floor(Math.random() * possible.length);
      possible[choiceInd].player = player;
    }
  });
}

function runGame(config) {
  let gameTimer = d3.interval(elapsed => {
    calcInfluence(config);
    move(config);
    config.boardJoin.transition().duration(500).attr("fill", d => config.colorScale(d.player));
    config.infJoin.transition().duration(500).attr("fill", d => config.lightColorScale(d.influenceChoice));
  }, 1000);
}

let config = setUp();
drawBoard(config);
runGame(config);
