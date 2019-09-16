store = {};

function loadData() {
  return Promise.all([
      d3.csv("https://raw.githubusercontent.com/gautsi/gen-purpose-repo/master/baby_times/baby_times_schedule_090519.csv"),
  ]).then(datasets => {
      store.events = datasets[0];
  })
}

function preProcess() {
  // formatting
  store.events.forEach(e => {
    // get the start date and time and end time
    e.startDate = d3.timeParse("%m/%d/%y")(e.date);
    e.startTime = d3.timeParse("%H:%M %p")(e.start);
    e.endTime = d3.timeParse("%H:%M %p")(e.end);

    // add indicator for date switching over, if times switch from PM to AM
    e.crossDates = e.start.includes("PM") & e.end.includes("AM");

  });

  // split sleep events that cross over to the next day
  let addSleepEvents = [];
  store.events.filter(e => e.type == "sleep").forEach(e => {
    e.fixedEndTime = e.crossDates == 1?d3.timeParse("%H:%M:%S")("23:59:59"):e.endTime;
    if (e.crossDates == 1) {
      addSleepEvents.push({
        type: "sleep",
        startDate: d3.timeDay.offset(e.startDate, 1),
        startTime: d3.timeParse("%H:%M:%S")("00:00:01"),
        fixedEndTime: e.endTime
      });
    }
  });

  store.sleeps = store.events.filter(e => e.type == "sleep").concat(addSleepEvents);
  store.feeds = store.events.filter(e => e.type == "feed");

}

function config(){
  store.height = 500;
  store.timesWidth = 600;
  store.barWidth = 200;
  store.margin = {
      top: 10,
      bottom: 20,
      left: 40,
      right: 10,
      mid: 10
  };
  store.fullWidth = store.timesWidth + store.barWidth + store.margin.left + store.margin.right + store.margin.mid;
  store.bodyHeight = store.height - store.margin.top - store.margin.bottom;
  store.container = d3.select("#time");
  store.container
      .attr("width", store.fullWidth)
      .attr("height", store.height);

  store.timesBody = store.container.append("g")
      .style("transform",
        `translate(${store.margin.left}px,${store.margin.top}px)`
      );

  store.barBody = store.container.append("g")
      .style("transform",
        `translate(${store.margin.left + store.timesWidth + store.margin.mid}px,${store.margin.top}px)`
      );

}

function scales() {
  store.xScale = d3.scaleTime()
      .range([0, store.timesWidth])
      .domain([d3.timeParse("%H:%M:%S")("00:00:01"), d3.timeParse("%H:%M:%S")("23:59:59")]);

  store.yScale = d3.scaleBand()
      .range([0, store.bodyHeight])
      .domain(store.events.map(a => a.startDate))
      .padding(0.1);

  //store.barScale = d3.scaleLinear()
  //  .range([0, store.barWidth])
  //  .domain(d3.extent(store.durs.map(a => a.value)));
}

function drawSleeps() {
  store.sleepBars = store.timesBody.selectAll(".sleep").data(store.sleeps);

  // draw grey background bar
  store.sleepBars
    .enter()
    .append("rect")
    .attr("height", store.yScale.bandwidth())
    .attr("y", e => store.yScale(e.startDate))
    .attr("x", 0)
    .attr("width", store.timesWidth)
    .attr("fill", "#eeeeee");

  store.sleeps.forEach(e => {
    e.width = store.xScale(e.fixedEndTime) - store.xScale(e.startTime);
  });

  store.sleepBars
    .enter()
    .append("rect")
    .attr("height", store.yScale.bandwidth())
    .attr("y", e => store.yScale(e.startDate))
    .attr("x", e => store.xScale(e.startTime))
    .attr("width", e => store.xScale(e.fixedEndTime) - store.xScale(e.startTime))
    .attr("fill", e => d3.schemeDark2[0]);
}

function drawFeeds() {
  store.feedPoints = store.timesBody.selectAll(".feed").data(store.feeds);
  store.feedPoints
    .enter()
    .append("circle")
    .attr("r", store.yScale.bandwidth() / 5)
    .attr("cy", e => store.yScale(e.startDate) + store.yScale.bandwidth() / 2)
    .attr("cx", e => store.xScale(e.startTime))
    .attr("fill", e => e.subtype == "nursed"?d3.schemeDark2[1]:d3.schemeDark2[2]);
}

function drawBars() {
  store.durBars = store.barBody.selectAll(".dur").data(store.durs);

  store.durBars
    .enter()
    .append("rect")
    .attr("height", store.yScale.bandwidth())
    .attr("y", d => store.yScale(d.key))
    .attr("x", 0)
    .attr("width", d => store.barScale(d.value))
    .attr("fill", d3.schemeDark2[3]);
}

function axes() {
  store.axisX = d3.axisBottom(store.xScale).ticks(d3.timeHour.every(2));

  store.gX = store.container.append("g")
    .style("transform",
        `translate(${store.margin.left}px,${store.height - store.margin.bottom}px)`
    );

  store.gX.call(store.axisX);

  store.axisY = d3.axisLeft(store.yScale)
    .tickFormat(d3.timeFormat("%m-%d"));

  store.gY = store.container.append("g")
    .style("transform",
        `translate(${store.margin.left}px,${store.margin.top}px)`
    );

  store.gY.call(store.axisY);

  //store.axisBar = d3.axisBottom(store.barScale);
  //store.gBar = store.container.append("g")
  //  .style("transform",
  //      `translate(${store.margin.left + store.timesWidth + store.margin.mid}px,${store.height - store.margin.bottom}px)`
  //  );

  //store.gBar.call(store.axisBar);
}


function drawViz() {
  preProcess();
  // sleepDurs();
  config();
  scales();
  drawSleeps();
  drawFeeds();
  // drawBars();
  axes();
}

loadData().then(drawViz);
