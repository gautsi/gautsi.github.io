let height = 500;
let width = 500;
let currTime = 43200;
let currCars = [];

function preload() {
  stopTimes = loadJSON("https://raw.githubusercontent.com/gautsi/gen-purpose-repo/master/mta/stop_times_sub.json");
  for (let i = 0; i < Object.keys(stopTimes).length; i ++) {
    stopTimes[i]["active"] = 0;
  }
}

function setup() {
  console.log("preload done s");
  let myCanvas = createCanvas(height, width);
  myCanvas.parent('mta_sketch');
  setTimeout(updateCars, 5);
}

function updateCars() {
  for (let i = 0; i < Object.keys(stopTimes).length; i ++) {
    stopTimes[i]["active"] = currTime >= Number(stopTimes[i]["min_arrive"]) & currTime <= Number(stopTimes[i]["max_depart"])
    if (stopTimes[i]["active"]) {
      if (Number(stopTimes[i]["min_arrive"]) == currTime) {
        stopTimes[i]["curr_stop_sequence"] = stopTimes[i]["min_stop_sequence"];
        currStop = stopTimes[i]["stops"][stopTimes[i]["curr_stop_sequence"]];
        stopTimes[i]["next_arrive"] = currStop["next_arrive"];
        stopTimes[i]["curr_lat"] = currStop["stop_lat"];
        stopTimes[i]["curr_lon"] = currStop["stop_lon"];
        if (stopTimes[i]["min_stop_sequence"] == stopTimes[i]["max_stop_sequence"]) {
          stopTimes[i]["curr_lat_vel"] = 0;
          stopTimes[i]["curr_lon_vel"] = 0;
        }
        else {
          stopTimes[i]["curr_lat_vel"] = (currStop["next_stop_lat"] - currStop["stop_lat"]) / (currStop["next_arrive"] - currStop["arrive"]);
          stopTimes[i]["curr_lon_vel"] = (currStop["next_stop_lon"] - currStop["stop_lon"]) / (currStop["next_arrive"] - currStop["arrive"]);
        }
      }
      else {
        if (stopTimes[i]["next_arrive"] == currTime) {
          stopTimes[i]["curr_stop_sequence"] = String(Number(stopTimes[i]["curr_stop_sequence"]) + 1);
          currStop = stopTimes[i]["stops"][stopTimes[i]["curr_stop_sequence"]];
          stopTimes[i]["next_arrive"] = currStop["next_arrive"];
          // stopTimes[i]["curr_lat"] = currStop["stop_lat"];
          // stopTimes[i]["curr_lon"] = currStop["stop_lon"];
          if (stopTimes[i]["curr_stop_sequence"] == stopTimes[i]["max_stop_sequence"]) {
            stopTimes[i]["curr_lat_vel"] = 0;
            stopTimes[i]["curr_lon_vel"] = 0;
          }
          else {
            stopTimes[i]["curr_lat_vel"] = (currStop["next_stop_lat"] - currStop["stop_lat"]) / (currStop["next_arrive"] - currStop["arrive"]);
            stopTimes[i]["curr_lon_vel"] = (currStop["next_stop_lon"] - currStop["stop_lon"]) / (currStop["next_arrive"] - currStop["arrive"]);
          }
        }
        else {
          stopTimes[i]["curr_lat"] += stopTimes[i]["curr_lat_vel"];
          stopTimes[i]["curr_lon"] += stopTimes[i]["curr_lon_vel"];
        }
      }
    }
  }
  currTime += 1;
  // if (currTime < 43205) {
    setTimeout(updateCars, 5);
  // }
}


function draw() {
  background(myLightColors[0]);
  fill(myDarkColors[1]);
  let hour = Math.floor(currTime / 3600);
  let min = Math.floor((currTime - hour * 3600) / 60);
  let sec = currTime - hour * 3600 - min * 60;
  text(String(hour).padStart(2, "0") + ":" + String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0"), 20, 20);

  noStroke();
  for (let i = 0; i < Object.keys(stopTimes).length; i ++) {

    if (stopTimes[i]["active"]) {
        fill("#" + stopTimes[i]["route_color"]);
        ellipse(
          map(stopTimes[i]["curr_lon"], -74.253, -73.754, 0, width),
          map(stopTimes[i]["curr_lat"], 40.511, 40.905, height, 0),
          4,
          4)
      }
    }
  // noLoop();
}
