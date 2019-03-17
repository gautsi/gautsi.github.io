let store = {};

function loadData() {
    return Promise.all([
        d3.json(
          "https://raw.githubusercontent.com/gautsi/gen-purpose-repo/master/maps/nyc_pub_adv.json"),
    ]).then(datasets => {
        store.results = datasets[0];
        return store;
    })
}

function formatData(inOut) {
}

function getBabyChartConfig() {
}

function getBabyChartScales(inOut, config) {
}


function drawFeedings(inOut, scales, config) {
}

function drawChanges(inOut, scales, config) {
}

function drawAxesBabyChart(inOut, scales, config){
}


function showData() {
  console.log(store.results);
//  formatData(store.inOut);
//  store.config = getBabyChartConfig();
//  store.scales = getBabyChartScales(store.inOut, store.config);
//  store.feedings = drawFeedings(store.inOut, store.scales, store.config);
//  store.changes = drawChanges(store.inOut, store.scales, store.config);
//  store.axes = drawAxesBabyChart(store.inOut, store.scales, store.config);
}

loadData().then(showData);
