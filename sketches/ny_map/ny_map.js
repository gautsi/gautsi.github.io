function preload() {
  nyMapData = loadJSON("https://raw.githubusercontent.com/gautsi/gen-purpose-repo/master/maps/ny_map_data.jsonhttps://raw.githubusercontent.com/gautsi/gen-purpose-repo/master/maps/ny_map_data_res80.json");
}

function setup() {
  console.log("preload done");
  let myCanvas = createCanvas(400, 400);
  myCanvas.parent('ny_map_sketch');
}

function drawMap(mapData) {

  // get max and min lat and lng values
  let maxLat = mapData[0]["lat"];
  let minLat = mapData[0]["lat"];
  let maxLng = mapData[0]["lng"];
  let minLng = mapData[0]["lng"];

  for (let i = 0; i < Object.keys(mapData).length; i ++) {
    if (mapData[i]["lat"] > maxLat) {
      maxLat = mapData[i]["lat"];
    }
    if (mapData[i]["lat"] < minLat) {
      minLat = mapData[i]["lat"];
    }
    if (mapData[i]["lng"] > maxLng) {
      maxLng = mapData[i]["lng"];
    }
    if (mapData[i]["lng"] < minLng) {
      minLng = mapData[i]["lng"];
    }
  }

  console.log("minmax done");

  noStroke();

  for (let i = 0; i < Object.keys(mapData).length; i ++) {
    let y = map(mapData[i]["lat"], minLat, maxLat, width - 10, 10);
    let x = map(mapData[i]["lng"], minLng, maxLng, 10, height - 10);
    if (mapData[i]["state"] == "NY") {
      fill(myDarkColors[1]);
    }
    else {
      fill(myLightColors[0]);
    }
    rect(x, y, 4, 4);
  }
}

function draw() {
  background(myLightColors[0]);
  drawMap(nyMapData);
  noLoop();
}
