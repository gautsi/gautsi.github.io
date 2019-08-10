store = {};

function loadData() {
  return Promise.all([
      d3.text("https://raw.githubusercontent.com/gautsi/gen-purpose-repo/master/baby_times/baby_times_080319.txt"),
  ]).then(datasets => {
      store.raw = datasets[0];
  })
}

function preProcess() {
  // turn raw string an array of objects
  store.times = store.raw.split("\n").map((x, i) => {return {raw: x, lineNum: i}});

  // find the dates and valid events
  store.dateRegex = /^[0-9]{6}\r$/;
  store.validEventRegex = /^(Feed|Sleep|Wake) [0-9]{1,2}:[0-9]{2}(A|P)\r{0,1}$/;
  store.times.forEach(x => {
    x.isDate = store.dateRegex.exec(x.raw)?true:false;
    x.isValidEvent = store.validEventRegex.exec(x.raw)?true:false;
  });

  // format dates, times and event types
  store.dates = store.times.filter(x => x.isDate);
  store.dates.forEach(d => {
    d.month = Number(d.raw.substring(0, 2)) - 1;
    d.day = Number(d.raw.substring(2, 4));
    d.year = 2000 + Number(d.raw.substring(4));
    d.date = new Date(d.year, d.month, d.day);
  });

  store.events = store.times.filter(x => x.isValidEvent);
  store.events.forEach(e => {
    e.eventType = e.raw.split(" ")[0];
    e.time = e.raw.split(" ")[1];
    e.hasWindowsEndlineChar = /\r$/.exec(e.raw)?true:false;
    e.timeSidePos = e.hasWindowsEndlineChar?2:1;
    e.timeSide = e.time.substring(e.time.length - e.timeSidePos, e.time.length - e.timeSidePos + 1);
    e.timeRawHour = Number(e.time.split(":")[0]);
    e.timeHour = (e.timeSide == "A"?0:12) + e.timeRawHour % 12;
    e.timeMinute = Number(e.time.split(":")[1].substring(0,2));
  });


  // get each event's start date
  store.events.forEach(e => {
    e.startDate = store.dates.filter(d => d.lineNum < e.lineNum).sort((a, b) => b.lineNum - a.lineNum)[0];
    e.startDateTime = new Date(
      e.startDate.year,
      e.startDate.month,
      e.startDate.day,
      e.timeHour,
      e.timeMinute
    );

    e.startTime = d3.timeParse("%H:%M:%S")(d3.timeFormat("%H:%M:%S")(e.startDateTime));
  });

  // restrict to the events after 7/27
  store.restEvents = store.events.filter(e => e.startDateTime > new Date(2019, 6, 28));

  // get each sleep event's end date/time
  // split sleep events that cross over to the next day
  let addSleepEvents = [];
  store.restEvents.filter(e => e.eventType == "Sleep").forEach(e => {
    e.nextEvent = e.lineNum < store.times.length - 1?
      store.restEvents.filter(e2 => e2.lineNum > e.lineNum).sort((a, b) => a.lineNum - b.lineNum)[0]:
      null;
    if (e.nextEvent){
      if (e.nextEvent.startDate.date - e.startDate.date != 0) {
        e.endDateTime = new Date(
          e.startDate.year,
          e.startDate.month,
          e.startDate.day,
          23,
          59,
          59
        );

        addSleepEvents.push({
          eventType: "Sleep",
          startDate: e.nextEvent.startDate,
          startDateTime: e.nextEvent.startDate.date,
          startTime: d3.timeParse("%H:%M:%S")("00:00:01"),
          endDateTime: e.nextEvent.startDateTime,
          nextEvent:e.nextEvent
        });
      } else {
        e.endDateTime = e.nextEvent.startDateTime
      }
    }

  });

  store.sleeps = store.restEvents.filter(e => e.eventType == "Sleep").concat(addSleepEvents);
  store.sleeps.forEach(e => {
    e.endTime = d3.timeParse("%H:%M:%S")(d3.timeFormat("%H:%M:%S")(e.endDateTime));
    e.durMin = e.nextEvent?(e.endDateTime - e.startDateTime) / 1000 / 60:null;
    e.validSleep = e.nextEvent?e.durMin < 8 * 60:false;
  });
  store.feeds = store.restEvents.filter(e => e.eventType == "Feed");

}

// get total sleep durations per day
function sleepDurs() {
    store.durs = d3.nest()
      .key(e => e.startDate.date)
      .rollup(v => d3.sum(v.map(s => s.validSleep?s.durMin:10).map(d => d / 60)))
      .entries(store.sleeps);
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
      .domain(store.restEvents.map(a => a.startDate.date))
      .padding(0.1);

  store.barScale = d3.scaleLinear()
    .range([0, store.barWidth])
    .domain(d3.extent(store.durs.map(a => a.value)));
}

function drawSleeps() {
  store.sleepBars = store.timesBody.selectAll(".sleep").data(store.sleeps);

  // draw grey background bar
  store.sleepBars
    .enter()
    .append("rect")
    .attr("height", store.yScale.bandwidth())
    .attr("y", e => store.yScale(e.startDate.date))
    .attr("x", 0)
    .attr("width", store.timesWidth)
    .attr("fill", "#eeeeee");


  store.sleepBars
    .enter()
    .append("rect")
    .attr("height", store.yScale.bandwidth())
    .attr("y", e => store.yScale(e.startDate.date))
    .attr("x", e => store.xScale(e.startTime))
    .attr("width", e => e.validSleep?store.xScale(e.endTime) - store.xScale(e.startTime):10)
    .attr("fill", e => e.validSleep?d3.schemeDark2[0]:d3.schemeDark2[2]);
}

function drawFeeds() {
  store.feedPoints = store.timesBody.selectAll(".feed").data(store.feeds);
  store.feedPoints
    .enter()
    .append("circle")
    .attr("r", store.yScale.bandwidth() / 5)
    .attr("cy", e => store.yScale(e.startDate.date) + store.yScale.bandwidth() / 2)
    .attr("cx", e => store.xScale(e.startTime))
    .attr("fill", d3.schemeDark2[1]);
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

  store.axisBar = d3.axisBottom(store.barScale);
  store.gBar = store.container.append("g")
    .style("transform",
        `translate(${store.margin.left + store.timesWidth + store.margin.mid}px,${store.height - store.margin.bottom}px)`
    );

  store.gBar.call(store.axisBar);
}


function drawViz() {
  preProcess();
  sleepDurs();
  config();
  scales();
  drawSleeps();
  drawFeeds();
  drawBars();
  axes();
}

loadData().then(drawViz);
