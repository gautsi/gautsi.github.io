function muellerConfig() {
  let config = {
    width: 800,
    height: 800,
    margin: {
      top: 10,
      bottom: 10,
      left: 10,
      right: 10
    },
    numRows: 10,
    numCols: 10,
    container: d3.select("#mueller").append("svg"),
    grey: "#cccccc"
  }

  config.bodyHeight = config.height - config.margin.top - config.margin.bottom;
  config.bodyWidth = config.width - config.margin.left - config.margin.right;

  config.container
    .attr("width", config.width)
    .attr("height", config.height);

  config.simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody().strength(-20))
    .force("center", d3.forceCenter(config.width / 2, config.height / 2));

  config.g = config.container.append("g");

  return config;
}


let mConfig = muellerConfig();

Promise.all([d3.json("/assets/mueller/common_words.json"), d3.json("/assets/mueller/common_pairs.json")]).then(function (data) {
  mConfig.words = data[0];
  mConfig.pairs = data[1];

  mConfig.words.forEach((d, i) => {d.id = i});
  mConfig.pairs.forEach((d, i) => {
    d.source = mConfig.words.filter(d2 => d2.word === d.word_x)[0].id;
    d.target = mConfig.words.filter(d2 => d2.word === d.word_y)[0].id;
  });

  let nodeElements = mConfig.g.append('g')
  .selectAll('circle')
  .data(mConfig.words)
  .enter().append('circle')
    .attr('r', 5)
    .attr('fill', mConfig.grey);

  let textElements = mConfig.g.append('g')
    .selectAll('text')
    .data(mConfig.words)
    .enter().append('text')
      .text(node => node.word)
      .attr('font-size', 6)
      .attr('dx', 2)
      .attr('dy', 2);

  let linkElements = mConfig.g.append('g')
    .selectAll('line');

  let linkElementsLines = linkElements.data(mConfig.pairs)
    .enter().append('line')
      .attr('stroke-width', 1)
      .attr('stroke', mConfig.grey);


  mConfig.simulation.nodes(mConfig.words).on("tick", () => {
    nodeElements
      .attr("cx", node => node.x)
      .attr("cy", node => node.y);

    textElements
      .attr("x", node => node.x)
      .attr("y", node => node.y);

    linkElementsLines
     .attr('x1', link => link.source.x)
     .attr('y1', link => link.source.y)
     .attr('x2', link => link.target.x)
     .attr('y2', link => link.target.y);

     linkElements.raise();
  });

  mConfig.simulation.force("link").links(mConfig.pairs);

  //add zoom capabilities
  let zoom_handler = d3.zoom()
      .on("zoom", zoom_actions);

  zoom_handler(mConfig.container);

  linkElements.raise();

});

function zoom_actions() {
  mConfig.g.attr("transform", d3.event.transform);
}
