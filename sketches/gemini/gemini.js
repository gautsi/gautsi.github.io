let store = {}

function loadData() {
    return Promise.all([
      d3.json("https://raw.githubusercontent.com/gautsi/gen-purpose-repo/master/gemini/gemini_interest.json"),
      d3.json("https://raw.githubusercontent.com/gautsi/gen-purpose-repo/master/gemini/gemini_trades.json"),
      d3.json("https://raw.githubusercontent.com/gautsi/gen-purpose-repo/master/gemini/gemini_inside.json")
    ]).then(datasets => {
        store.interest = datasets[0];
        store.trades = datasets[1];
        store.inside = datasets[2];
        return store;
    })
}

function getInterestChartConfig() {
    let width = 800;
    let height = 400;
    let margin = {
        top: 10,
        bottom: 50,
        left: 50,
        right: 10
    }
    let bodyHeight = height - margin.top - margin.bottom
    let bodyWidth = width - margin.left - margin.right
    let container = d3.select("#InterestChart")
    container
        .attr("width", width)
        .attr("height", height)

    return { width, height, margin, bodyHeight, bodyWidth, container }
}

function getInterestChartScales(interest, config) {

    let { bodyWidth, bodyHeight } = config;
    let minTim = d3.min(interest.map(a => a.time))
    let maxTim = d3.max(interest.map(a => a.time))

    console.log(interest)
    console.log(minTim)
    console.log(maxTim)

    let xScale = d3.scaleTime()
        .range([0, bodyWidth])
        .domain([minTim, maxTim])

    let minPrice = d3.min(interest.map(a => +a.price_padded))
    let maxPrice = d3.max(interest.map(a => +a.price_padded))

    let allPrices = [...Array(100 * maxPrice - 100 * minPrice + 1).keys()].map((i) => {
      let pr = (100 * maxPrice - i) / 100;
      let prStr = pr.toString();
      let prStrPad = prStr;
      if (prStrPad.length == 7) {
        return prStrPad;
      } else {
        if (prStrPad.length == 6) {
          return prStrPad + "0";
        } else {
          if (prStrPad.length == 4) {
            return prStrPad + ".00";
          } else {
            return "Unknown price";
          }
        }
      }
    })

    let yScale = d3.scaleBand()
        .range([0, bodyHeight])
        .domain(allPrices)
        .padding(0)

    console.log("test")


  //  let yScale = d3.scaleLinear()
  //      .range([0, bodyHeight])
  //      .domain([maxPrice, minPrice])

    console.log("test2")

    let maxBidRem = d3.max(interest.filter(a => a.side === "bid").map(a => +a.remaining))
    let maxAskRem = d3.max(interest.filter(a => a.side === "ask").map(a => +a.remaining))


    let bidColorScale = d3.scaleSequential()
      .domain([0, maxBidRem])
      .interpolator(d3.interpolateBlues);

    let askColorScale = d3.scaleSequential()
      .domain([0, maxAskRem])
      .interpolator(d3.interpolateReds);

    return { xScale, yScale, bidColorScale, askColorScale, allPrices, minTim, maxTim }
}

function drawBarsInterestChart(interest, trades, inside, scales, config) {

  console.log("test3")


  let { margin, container, bodyHeight, bodyWidth } = config;

  console.log("test4")
  let {xScale, yScale, bidColorScale, askColorScale, allPrices } = scales

  console.log("test5")


  let body = container.append("g")
      .style("transform",
        `translate(${margin.left}px,${margin.top}px)`
      )

  console.log("test6")
  // draw background bars
  let backBars = body.selectAll(".bar").data(allPrices.map(d => {return {"price": d}}));
  console.log(allPrices.map(d => {return {"price": d}}).map(d => yScale(d.price)))

  let newBackBars = backBars
    .enter()
    .append("rect")
    .attr("height", yScale.bandwidth())
    .attr("y", d => yScale(d.price))
    .attr("x", 0)
    .attr("width", bodyWidth)
    .attr("fill", "#eeeeee");


  let bars = body.selectAll(".bar").data(interest.filter(d => +d.remaining > 0))

  console.log("test7")
  let newBars = bars.enter().append("rect")
      .attr("height", yScale.bandwidth())
      .attr("y", (d) => {
        let p = d.price_padded
        return yScale(p)})
      .attr("x", (d) => xScale(d.time))
      //.attr("width", 100)
      .attr("width", (d) => xScale(d.next_tim ? d.next_time : xScale.domain()[1]) - xScale(d.time))
      .attr("fill", (d) => +d.remaining > 0 ? (d.side === "bid" ? d3.schemeDark2[0] : d3.schemeDark2[1]) : "#eeeeee")
      // .attr("fill", (d) => +d.remaining > 0 ? d.side === "bid" ? bidColorScale(+d.remaining) : askColorScale(+d.remaining) : "#000000")
//      .on("mouseenter", function(d) { // <- this is the new code
//         drawRoutes(d.AirlineID)//TODO: call the drawRoutes function passing the AirlineID id 'd'
//         d3.select(this)
//           .attr("fill", "992a5b")//TODO: change the fill color of the bar to "#992a5b" as a way to highlight the bar. Hint: use d3.select(this)
//         })
//       .on("mouseleave", function(d) {
//         drawRoutes("0")
//         d3.select(this)
//           .attr("fill", "#2a5599")
//       })//TODO: Add another listener, this time for mouseleave
//   //TODO: In this listener, call drawRoutes(null), this will cause the function to remove all lines in the chart since there is no airline withe AirlineID == null.
//   //TODO: change the fill color of the bar back to "#2a5599"

  console.log("test8");

  let points = body.selectAll(".point").data(trades);

  let newPoints = points
    .enter()
    .append("circle")
    .attr("r", yScale.bandwidth())
    .attr("cy", d => yScale(d.price) + yScale.bandwidth() / 2)
    .attr("cx", d => xScale(d.time))
    .attr("stroke", d3.schemeDark2[2])
    .attr("fill", "none");

  // add inside lines
  let insideLine =  d3.line()
    .curve(d3.curveStepAfter)
    .x(d => xScale(d.time))
    .y(d => yScale(d.inside_padded) + yScale.bandwidth() / 2);

  let bestBidLineChart = body
   .append("path")
   .datum(inside.filter(d => d.side == "bid"))
   .attr("class", "line")
   .attr("fill", "none")
   .style("stroke", d3.schemeDark2[0]);

   bestBidLineChart.attr("d", insideLine);

   let bestAskLineChart = body
    .append("path")
    .datum(inside.filter(d => d.side == "ask"))
    .attr("class", "line")
    .attr("fill", "none")
    .style("stroke", d3.schemeDark2[1]);

  bestAskLineChart.attr("d", insideLine);

  // add last trade line
  let tradeLine = d3.line()
    .curve(d3.curveStepAfter)
    .x(d => xScale(d.time))
    .y(d => yScale(d.price));

  let lastTradeLineChart = body
   .append("path")
   .datum(trades)
   .attr("class", "line")
   .attr("fill", "none")
   .style("stroke", d3.schemeDark2[2]);

  lastTradeLineChart.attr("d", tradeLine);

  // add focus lines
  let xFocusLine = body
    .append("line")
    .attr("stroke", "#aaaaaa")
    .style("visibility", "hidden");

  let overlay = body
    .append("rect")
    .attr("width", bodyWidth)
    .attr("height", bodyHeight)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("mousemove", function () {
      xFocusLine
        .style("visibility", "visible")
        .attr("x1", d3.mouse(this)[0] - margin.left)
        .attr("y1", d3.mouse(this)[1] - margin.top)
        .attr("x2", d3.mouse(this)[0] - margin.left)
        .attr("y2", bodyWidth);
    });

  return { bars, newBars, points, newPoints, backBars, newBackBars, insideLine, bestBidLineChart, bestAskLineChart, tradeLine, lastTradeLineChart }
}

function drawAxesInterestChart(interest, scales, config){
  let {xScale, yScale} = scales
  let {container, margin, height} = config;
  let axisX = d3.axisBottom(xScale)

  let gX = container.append("g")
    .style("transform",
        `translate(${margin.left}px,${height - margin.bottom}px)`
    )

  gX.call(axisX)

  let axisY = d3.axisLeft(yScale)
    .tickValues(yScale.domain().filter((d, i) => !(i % Math.pow(2, 6))));

  let gY = container.append("g")
    .style("transform",
        `translate(${margin.left}px,${margin.top}px)`
    )

  gY.call(axisY)
//TODO: Append a g tag to the container, translate it based on the margins and call the axisY axis to draw the left axis.

  return { axisX, axisY, gX, gY };

}

function addZoom(config, scales, axes, join) {
  let { height, width, bodyHeight, bodyWidth, container } = config;
  let { xScale, yScale, minTim, maxTim } = scales;
  let { axisX, axisY, gX, gY } = axes;
  let { bars, newBars, points, newPoints, backBars, newBackBars, insideLine, bestBidLineChart, bestAskLineChart, tradeLine, lastTradeLineChart } = join;

  let zoom = d3.zoom()
    .scaleExtent([1, 40])
    .translateExtent([[0, 0], [width, height]]);

  zoom.on("zoom", function() {

    let newXScale = d3.event.transform.rescaleX(xScale);
    gX.call(axisX.scale(newXScale));

    yScale.range([0, bodyHeight].map((d) => d3.event.transform.applyY(d)));

    let newYDomain = yScale.domain().filter(d => yScale(d) > 0 && yScale(d) < bodyHeight);

    let newYTickValues = yScale.domain().filter((d, i) => !(i % Math.pow(2, Math.max(0, 7 - Math.floor(1.5 * Math.sqrt(d3.event.transform.k))))));

    gY.call(axisY.tickValues(newYTickValues));

    backBars.merge(newBackBars)
    .attr("height", yScale.bandwidth())
    .attr("y", d => yScale(d.price))
    .attr("x", newXScale(minTim))
    .attr("width", newXScale(maxTim) - newXScale(minTim))
    //.attr("fill", "#aaaaaa");

    bars.merge(newBars)
      .attr("height", yScale.bandwidth())
      .attr("y", (d) => {
        let p = d.price_padded
        return yScale(p)})
      .attr("x", (d) => newXScale(d.time))
      // .attr("width", 100)
      .attr("width", (d) => newXScale(d.next_tim ? d.next_time : newXScale.domain()[1]) - newXScale(d.time));

    points.merge(newPoints)
      .attr("r", yScale.bandwidth())
      .attr("cy", d => yScale(d.price) + yScale.bandwidth() / 2)
      .attr("cx", d => newXScale(d.time));

    let insideLine =  d3.line()
      .curve(d3.curveStepAfter)
      .x(d => newXScale(d.time))
      .y(d => yScale(d.inside_padded) + yScale.bandwidth() / 2);

    bestBidLineChart.attr("d", insideLine);

    bestAskLineChart.attr("d", insideLine);

    let tradeLine =  d3.line()
      .curve(d3.curveStepAfter)
      .x(d => newXScale(d.time))
      .y(d => yScale(d.price));

    lastTradeLineChart.attr("d", tradeLine);

  });

  container.call(zoom);
}


function drawInterestChart(interest, trades, inside) {
  console.log("a")
  let config = getInterestChartConfig();
  console.log("b")
  let scales = getInterestChartScales(interest, config);
  console.log("c")
  let join = drawBarsInterestChart(interest, trades, inside, scales, config);
  console.log("d")
  let axes = drawAxesInterestChart(interest, scales, config);
  console.log("e")
  addZoom(config, scales, axes, join);
  console.log("f")
}

function showData() {
  store.interest.forEach((d) => {
    d.time = new Date(d.fixed_timestampms);
    d.next_time = new Date(d.next_tim);
  });

  store.trades.forEach((d) => {
    d.time = new Date(d.timestampms);
  });

  store.inside.forEach(d => {
    d.time = new Date(d.ref_tim);
  });

  drawInterestChart(store.interest, store.trades, store.inside);
}

loadData().then(showData);
