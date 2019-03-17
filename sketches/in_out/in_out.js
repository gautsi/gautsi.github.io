console.log("hello")

let store = {};

function loadData() {
    return Promise.all([
        d3.csv("https://raw.githubusercontent.com/gautsi/gen-purpose-repo/master/zetus.csv"),
    ]).then(datasets => {
        store.inOut = datasets[0];
        return store;
    })
}

function formatData(inOut) {
  inOut.map(d => {
    d.date = new Date(d.time.split(" ")[0]);
    d.timeOfDay = d3.timeParse("%H:%M")(d.time.split(" ")[1]);
    d.endTime = new Date(d.timeOfDay.getTime() + 1000 * 60 * +d.dur);
  });
}

function getBabyChartConfig() {
    let width = 800;
    let height = 500;
    let margin = {
        top: 10,
        bottom: 50,
        left: 50,
        right: 10
    }
    let bodyHeight = height - margin.top - margin.bottom
    let bodyWidth = width - margin.left - margin.right
    let container = d3.select("#BabyChart")
    container
        .attr("width", width)
        .attr("height", height)

    return { width, height, margin, bodyHeight, bodyWidth, container }
}

function getBabyChartScales(inOut, config) {

    let { bodyWidth, bodyHeight } = config;
    let dateExtent = d3.extent(inOut.map(a => a.date))
    let timeOfDayExtent = d3.extent(inOut.map(a => a.timeOfDay))

    let xScale = d3.scaleTime()
        .range([0, bodyWidth])
        .domain(timeOfDayExtent);

    let numDates = (dateExtent[1] - dateExtent[0]) / (1000 * 60 * 60 * 24);
    let dates = [...Array(numDates + 1).keys()].map(i => {
      let nextDate = new Date(dateExtent[0]);
      nextDate.setDate(dateExtent[0].getDate() + i);
      return nextDate;
    });

    let yScale = d3.scaleBand()
        .range([0, bodyHeight])
        .domain(dates)
        .padding(0.1);

    return { xScale, yScale };
}


function drawFeedings(inOut, scales, config) {

    let { margin, bodyWidth, container } = config;
    let { xScale, yScale } = scales

    let body = container.append("g")
        .style("transform",
          `translate(${margin.left}px,${margin.top}px)`
        );

    let bars = body.selectAll(".bar").data(
      //inOut);
      inOut.filter(d => ["L", "R", "B"].includes(d.type)));

    // draw grey background bar
    bars
      .enter()
      .append("rect")
      .attr("height", yScale.bandwidth())
      .attr("y", d => yScale(d.date))
      .attr("x", 0)
      .attr("width", bodyWidth)
      .attr("fill", "#eeeeee")

    let newBars = bars
      .enter()
      .append("rect")
      .attr("height", yScale.bandwidth())
      .attr("y", d => yScale(d.date))
      .attr("x", d => xScale(d.timeOfDay))
      .attr("width", d => xScale(d.endTime) - xScale(d.timeOfDay))
      .attr("fill", d3.schemeDark2[0]);

    return { bars, newBars }
}

function drawChanges(inOut, scales, config) {

    let { margin, container } = config;
    let { xScale, yScale } = scales

    let body = container.append("g")
        .style("transform",
          `translate(${margin.left}px,${margin.top}px)`
        );

    let points = body.selectAll(".point").data(
      //inOut);
      inOut.filter(d => ["S", "W"].includes(d.type)));

    let newPoints = points
      .enter()
      .append("circle")
      .attr("r", yScale.bandwidth() / 4)
      .attr("cy", d => yScale(d.date) + yScale.bandwidth() / 2)
      .attr("cx", d => xScale(d.timeOfDay))
      .attr("fill", d3.schemeDark2[1]);

    return { points, newPoints }
}

function drawAxesBabyChart(inOut, scales, config){
  let { xScale, yScale } = scales
  let { container, margin, height } = config;
  let axisX = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%I %p"));

  let gX = container.append("g")
    .style("transform",
        `translate(${margin.left}px,${height - margin.bottom}px)`
    );

  gX.call(axisX);

  let axisY = d3.axisLeft(yScale)
    .tickFormat(d3.timeFormat("%m-%d"));
  //   .tickValues(yScale.domain().filter((d, i) => !(i % Math.pow(2, 6))));

  let gY = container.append("g")
    .style("transform",
        `translate(${margin.left}px,${margin.top}px)`
    );

  gY.call(axisY);

  return { axisX, axisY, gX, gY };

}


function showData() {
  formatData(store.inOut);
  console.log(store.inOut);
  store.config = getBabyChartConfig();
  store.scales = getBabyChartScales(store.inOut, store.config);
  store.feedings = drawFeedings(store.inOut, store.scales, store.config);
  store.changes = drawChanges(store.inOut, store.scales, store.config);
  store.axes = drawAxesBabyChart(store.inOut, store.scales, store.config);
}

loadData().then(showData);
