let h = 400;
let w = 400;
let currTime = 0;
let currCars = [];
let zoom = 9;
let clon = -74.01215;
let clat = 40.68105;
let cx;
let cy;

function preload() {
  nyMap = loadImage(`https://api.mapbox.com/styles/v1/mapbox/dark-v9/static/-74.01215,40.68105,${zoom},0,0/400x400?access_token=pk.eyJ1IjoiZ2F1dGFzIiwiYSI6ImNqanhkNjA5cjEwcXkzcXJ6NjZ4YnZxczEifQ.rRu0vF_nhwx9XhWosCEFzw`);
  stopTimes = loadJSON("https://raw.githubusercontent.com/gautsi/gen-purpose-repo/master/mta/stop_times_sub_morn_ver2.json");
  for (let i = 0; i < Object.keys(stopTimes).length; i ++) {
    stopTimes[i]["active"] = 0;
  }
}

function setup() {
  console.log("preload done s");
  myCanvas = createCanvas(w, h);
  myCanvas.parent('mta_sketch');
  imageMode(CENTER);

  cx = mercX(clon);
  cy = mercY(clat);

  setTimeout(updateCars, 5);
}

function mercX(lon) {
  var a = (256/PI) * pow(2, zoom);
  var b = radians(lon) + PI;
  return a * b;
}

function mercY(lat) {
  var a = (256/PI) * pow(2, zoom);
  var b = tan(PI/4 + radians(lat)/2);
  var c = PI - log(b);
  return a * c;
}


function updateCars() {
  for (let i = 0; i < Object.keys(stopTimes).length; i ++) {
    stopTimes[i]["active"] = currTime >= Number(stopTimes[i]["min_arrive"]) & currTime <= Number(stopTimes[i]["max_depart"])
    if (stopTimes[i]["active"]) {
      if (Number(stopTimes[i]["min_arrive"]) == currTime) {
        stopTimes[i]["curr_stop_sequence"] = stopTimes[i]["min_stop_sequence"];
        currStop = stopTimes[i]["stops"][stopTimes[i]["curr_stop_sequence"]];
        stopTimes[i]["next_check"] = currStop["mod_depart"];
        stopTimes[i]["curr_lat"] = currStop["stop_lat"];
        stopTimes[i]["curr_lon"] = currStop["stop_lon"];
        if (stopTimes[i]["min_stop_sequence"] == stopTimes[i]["max_stop_sequence"]) {
          stopTimes[i]["curr_lat_vel"] = 0;
          stopTimes[i]["curr_lon_vel"] = 0;
        }
        else {
          if (currTime < currStop["mod_depart"]) {
              stopTimes[i]["curr_lat_vel"] = 0;
              stopTimes[i]["curr_lon_vel"] = 0;
          }
          else {
            stopTimes[i]["curr_lat_vel"] = (currStop["next_stop_lat"] - currStop["stop_lat"]) / (currStop["next_arrive"] - currStop["mod_depart"]);
            stopTimes[i]["curr_lon_vel"] = (currStop["next_stop_lon"] - currStop["stop_lon"]) / (currStop["next_arrive"] - currStop["mod_depart"]);
          }
        }
      }
      else {
        if (stopTimes[i]["next_check"] == currTime) {
          if (stopTimes[i]["next_check"] == stopTimes[i]["stops"][stopTimes[i]["curr_stop_sequence"]]["next_arrive"]) {
            stopTimes[i]["curr_stop_sequence"] = String(Number(stopTimes[i]["curr_stop_sequence"]) + 1);
            currStop = stopTimes[i]["stops"][stopTimes[i]["curr_stop_sequence"]];
            stopTimes[i]["next_check"] = currStop["mod_depart"];
          }
          else if (stopTimes[i]["next_check"] == stopTimes[i]["stops"][stopTimes[i]["curr_stop_sequence"]]["mod_depart"]) {
            currStop = stopTimes[i]["stops"][stopTimes[i]["curr_stop_sequence"]];
            stopTimes[i]["next_check"] = currStop["next_arrive"];
          }
          if (stopTimes[i]["curr_stop_sequence"] == stopTimes[i]["max_stop_sequence"]) {
            stopTimes[i]["curr_lat_vel"] = 0;
            stopTimes[i]["curr_lon_vel"] = 0;
          }
          else {
            if (currTime < currStop["mod_depart"]) {
                stopTimes[i]["curr_lat_vel"] = 0;
                stopTimes[i]["curr_lon_vel"] = 0;
            }
            else {
              stopTimes[i]["curr_lat_vel"] = (currStop["next_stop_lat"] - currStop["stop_lat"]) / (currStop["next_arrive"] - currStop["mod_depart"]);
              stopTimes[i]["curr_lon_vel"] = (currStop["next_stop_lon"] - currStop["stop_lon"]) / (currStop["next_arrive"] - currStop["mod_depart"]);
            }
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

function keyPressed() {
 console.log(keyCode);
 if (keyCode == 65) {
   zoom += 0.1;
   cx = mercX(clon);
   cy = mercY(clat);

 }
 else if (keyCode == 90) {
   zoom -= 0.1;
   cx = mercX(clon);
   cy = mercY(clat);
 }
 nyMap = loadImage(`https://api.mapbox.com/styles/v1/mapbox/dark-v9/static/-74.01215,40.68105,${zoom},0,0/400x400?access_token=pk.eyJ1IjoiZ2F1dGFzIiwiYSI6ImNqanhkNjA5cjEwcXkzcXJ6NjZ4YnZxczEifQ.rRu0vF_nhwx9XhWosCEFzw`);

}

function colorAlpha(aColor, alpha) {
  var c = color(aColor);
  return color('rgba(' +  [red(c), green(c), blue(c), alpha].join(',') + ')');
}


function draw() {
  // background(myLightColors[0]);
  translate(width / 2, height / 2);
  image(nyMap, 0, 0);
  let hour = Math.floor(currTime / 3600);
  let min = Math.floor((currTime - hour * 3600) / 60);
  let sec = currTime - hour * 3600 - min * 60;
  fill(myDarkColors[1]);
  text(String(hour).padStart(2, "0") + ":" + String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0"), 20 - width / 2, 20 - height / 2);

  noStroke();
  for (let i = 0; i < Object.keys(stopTimes).length; i ++) {

    if (stopTimes[i]["active"]) {
        fill(colorAlpha("#" + stopTimes[i]["route_color"], 1));

        // ellipse(map(stopTimes[i]["curr_lon"], -74.253, -73.754, 0 - zoom, width + zoom), map(stopTimes[i]["curr_lat"], 40.511, 40.905, height + zoom, 0 - zoom), 4, 4)
        ellipse(mercX(stopTimes[i]["curr_lon"]) - cx, mercY(stopTimes[i]["curr_lat"]) - cy, 4, 4);
        // console.log(mercX(stopTimes[i]["curr_lon"]) - cx, mercY(stopTimes[i]["curr_lat"]) - cy);
      }
    }
  //if (currTime == 20){noLoop();}
}
