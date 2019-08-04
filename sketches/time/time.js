let store = {};

function loadData() {
    return Promise.all([
        d3.csv("https://raw.githubusercontent.com/gautsi/gen-purpose-repo/master/baby_times/baby_times_prep_ver1_080419.csv"),
    ]).then(datasets => {
        store.times = datasets[0];
        return store;
    })
}

function formatData(times) {
  times.map(d => {
    d.date = new Date(
      year = d.dt.split(" ")[0].split("-")[0],
      month = Number(d.dt.split(" ")[0].split("-")[1]) - 1,
      day = d.dt.split(" ")[0].split("-")[2]);
    d.timeOfDay = d3.timeParse("%H:%M:%S")(d.dt.split(" ")[1]);
    d.endDate = new Date(
      year = d.next_dt.split(" ")[0].split("-")[0],
      month = Number(d.next_dt.split(" ")[0].split("-")[1]) - 1,
      day = d.next_dt.split(" ")[0].split("-")[2]);
    d.endTimeOfDay = d3.timeParse("%H:%M:%S")(d.next_dt.split(" ")[1]);
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
    let container = d3.select("#time")
    container
        .attr("width", width)
        .attr("height", height)

    return { width, height, margin, bodyHeight, bodyWidth, container }
}

function getBabyChartScales(times, config) {

    let { bodyWidth, bodyHeight } = config;
    let dateExtent = d3.extent(times.map(a => a.date))
    let timeOfDayExtent = d3.extent(times.map(a => a.timeOfDay).concat(times.map(a => a.endTimeOfDay)))

    let xScale = d3.scaleTime()
        .range([0, bodyWidth])
        .domain([d3.timeParse("%H:%M:%S")("00:00:01"), d3.timeParse("%H:%M:%S")("23:59:59")]);

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


function drawSleeps(times, scales, config) {

    let { margin, bodyWidth, container } = config;
    let { xScale, yScale } = scales

    let body = container.append("g")
        .style("transform",
          `translate(${margin.left}px,${margin.top}px)`
        );

    let bars = body.selectAll(".bar").data(
      times.filter(d => d.type == "sleep" & d.next_time_valid == "True"));

    let spillOverBars = body.selectAll(".bar").data(
      times.filter(d => d.type == "sleep" & d.next_time_valid == "True" & (d.endDate - d.date) != 0));

    let notValidBars = body.selectAll(".bar").data(
      times.filter(d => d.type == "sleep" & d.next_time_valid == "False"));

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
      .attr("width", d => (d.endDate - d.date) == 0?xScale(d.endTimeOfDay) - xScale(d.timeOfDay):bodyWidth - xScale(d.timeOfDay))
      .attr("fill", d => d3.schemeDark2[0]);

    let newSpillOverBars = spillOverBars
      .enter()
      .append("rect")
      .attr("height", yScale.bandwidth())
      .attr("y", d => yScale(d.endDate))
      .attr("x", d => 0)
      .attr("width", d => xScale(d.endTimeOfDay))
      .attr("fill", d => d3.schemeDark2[0]);

    let newNotValidBars = notValidBars
      .enter()
      .append("rect")
      .attr("height", yScale.bandwidth())
      .attr("y", d => yScale(d.date))
      .attr("x", d => xScale(d.timeOfDay))
      .attr("width", d => 10)
      .attr("fill", d => d3.schemeDark2[2]);


    return { bars, newBars }
}

function drawFeeds(times, scales, config) {

    let { margin, container } = config;
    let { xScale, yScale } = scales

    let body = container.append("g")
        .style("transform",
          `translate(${margin.left}px,${margin.top}px)`
        );

    let points = body.selectAll(".point").data(
      times.filter(d => d.type == "feed"));

    let newPoints = points
      .enter()
      .append("circle")
      .attr("r", yScale.bandwidth() / 5)
      .attr("cy", d => yScale(d.date) + yScale.bandwidth() / 2)
      .attr("cx", d => xScale(d.timeOfDay))
      .attr("fill", d3.schemeDark2[1]);

/**
    let labels = points
      .enter()
      .append("text")
      .text(d => d.line_num)
      .attr("y", d => yScale(d.date) + yScale.bandwidth() / 2)
      .attr("x", d => xScale(d.timeOfDay))
      .attr("fill", d3.schemeDark2[1]);
**/

    return { points, newPoints }
}

function drawAxesBabyChart(inOut, scales, config){
  let { xScale, yScale } = scales
  let { container, margin, height } = config;
  let axisX = d3.axisBottom(xScale).ticks(d3.timeHour.every(2));//.tickFormat(d3.timeFormat("%I %p"));

  let gX = container.append("g")
    .style("transform",
        `translate(${margin.left}px,${height - margin.bottom}px)`
    );

  gX.call(axisX);

  let axisY = d3.axisLeft(yScale)
    .tickFormat(d3.timeFormat("%m-%d"));

  let gY = container.append("g")
    .style("transform",
        `translate(${margin.left}px,${margin.top}px)`
    );

  gY.call(axisY);

  return { axisX, axisY, gX, gY };

}


function showData() {
  formatData(store.times);
  store.config = getBabyChartConfig();
  store.scales = getBabyChartScales(store.times, store.config);
  store.sleeps = drawSleeps(store.times, store.scales, store.config);
  store.feeds = drawFeeds(store.times, store.scales, store.config);
  store.axes = drawAxesBabyChart(store.times, store.scales, store.config);
}

loadData().then(showData);
