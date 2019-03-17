let store = {};

function loadData() {
    return Promise.all([
        d3.json(
          "https://raw.githubusercontent.com/gautsi/gen-purpose-repo/master/maps/nyc_pub_adv.json"),
        d3.json(
          "https://raw.githubusercontent.com/gautsi/gen-purpose-repo/master/maps/nys_assembly_districts_031719.json"),
    ]).then(datasets => {
        store.results = datasets[0];
        store.ad = datasets[1];
        return store;
    })
}

function getElectionChartConfig() {
    let width = 500;
    let height = 500;
    let margin = {
        top: 10,
        bottom: 50,
        left: 50,
        right: 10
    }
    let bodyHeight = height - margin.top - margin.bottom
    let bodyWidth = width - margin.left - margin.right
    let container = d3.select("#ElectionChart")
    container
        .attr("width", width)
        .attr("height", height)

    return { width, height, margin, bodyHeight, bodyWidth, container }
}

function getElectionScales(data) {
  // take first candidate to test
  let cand = data.results[0];
  let votes = Object.values(cand.votes).map(Number)
  let maxVotes = d3.max(votes);
  let scale = d3.scaleSequential(d3.interpolateBlues)
    .domain([0, maxVotes]);

    return { cand, scale }
}


function drawMap(config, scales, data) {
  let { container, margin, bodyHeight, bodyWidth } = config;
  let { cand, scale } = scales;

  let projection = d3.geoMercator()
    .fitExtent([[margin.top, margin.left], [bodyWidth, bodyHeight]], data.ad);


  let path = d3.geoPath()
    .projection(projection);

  container.selectAll("path")
    .data(data.ad.features)
    .enter()
    .append("path")
    .attr("d", d => path(d))
    .attr("fill", d => scale(Number(cand.votes[d.properties.AssemDist])))
    .attr("stroke", "#cccccc");
}

function showData(data) {
  let config = getElectionChartConfig();
  let scales = getElectionScales(data);
  drawMap(config, scales, data);
}

loadData().then(showData);
