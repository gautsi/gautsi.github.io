let height = 600;
let width = 600;
let currTime = 43200;
let currCars = [];

function preload() {
  stopTimes = loadJSON("https://raw.githubusercontent.com/gautsi/gen-purpose-repo/master/stop_times_weekday_sub.json");
}

function setup() {
  console.log("preload done s");
  let myCanvas = createCanvas(width, height);
  myCanvas.parent('mta_sketch');
}

function draw() {
  background(myLightColors[0]);
  fill(myDarkColors[1]);
  text(currTime, 20, 20);

  for (let i = 0; i < 10; i++) { // Object.keys(stopTimes).length; i ++) {
      ellipse(
        map(stopTimes[i]["stop_lon"], -74.252, -73.755, 0, width),
        map(stopTimes[i]["stop_lat"], 40.512, 40.904, 0, height),
        4,
        4)
  }
  currTime += 1;
  // noLoop();
}
