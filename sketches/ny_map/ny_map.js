function preload() {
  // nyMapData = loadJSON("https://raw.githubusercontent.com/gautsi/gen-purpose-repo/master/maps/ny_map_data_res80.json");
  nyUntangledMapData = loadJSON("https://raw.githubusercontent.com/gautsi/gen-purpose-repo/master/maps/untangled_norm_county_squares_ver2.json");
}

function setup() {
  console.log("preload done");
  let myCanvas = createCanvas(400, 400);
  myCanvas.parent('ny_map_sketch');
}

function drawMap(mapData) {
  noStroke();

  for (let i = 0; i < Object.keys(mapData).length; i ++) {
    let y = map(mapData[i]["norm_lat_rank"], 0, 1, width - 10, 10);
    let x = map(mapData[i]["norm_lng_rank"], 0, 1, 10, height - 10);

    fill(myLightColors[(mapData[i]["county_id"] % 6)]);
    rectMode(CENTER);
    // rect(x, y, 4, 4);

    let min_y = map(mapData[i]["norm_min_new_test_lat_rank"], 0, 1, width - 10, 10);
    let max_y = map(mapData[i]["norm_max_new_test_lat_rank"], 0, 1, width - 10, 10);
    let min_x = map(mapData[i]["norm_min_new_test_lng_rank"], 0, 1, 10, height - 10);
    let max_x = map(mapData[i]["norm_max_new_test_lng_rank"], 0, 1, 10, height - 10);

    fill(myDarkColors[(mapData[i]["county_id"] % 6)]);
    rectMode(CORNERS);
    rect(min_x, min_y, max_x, max_y);


  }
}

function draw() {
  background(myLightColors[0]);
  drawMap(nyUntangledMapData);
  // noLoop();
}
