function eltAdd(v1, v2) {
  return v1.map((p, i) => p + v2[i]);
}

function eltApply(v1, v2, func) {
  return v1.map((p, i) => func(p, v2[i]));
}

function scaMult(v1, s) {
  return v1.map(p => p * s);
}

function eltSign(v, inv = false) {
  return [0, 1].map(i => v[i] >= 0 ? (inv ? -1 : 1) : (inv ? 1 : -1));
}

function dist(v1, v2) {
  return Math.sqrt([0, 1].map(i => Math.pow(v1[i] - v2[i], 2)).reduce((a, b) => a + b));
}


function updateNodes(ns) {

  let ttlVel = 0;

  ns.forEach(d => {
    // array to store distances to other marks
    // to be used to calculate attraction

    let distTo = [];
    ns.forEach(d2 => {
      // store distance from d2 to d elementwise:
      // first get difference in position


      let currDistTo = eltAdd(d2.center, scaMult(d.center, -1));

      // then account for width/height, reducing distance accordingly
      currDistTo = [0, 1].map(i => (currDistTo[i] >= 0 ? 1 : -1) * Math.max(Math.abs(currDistTo[i]) - 0.5 * (d.size[i] + d2.size[i]), 0));

      distTo.push({"dist_to": currDistTo});

      // check overlap
      let overlap = [0, 1]
        .map(i => (d.pos[i] <= (d2.pos[i] + d2.size[i]) & (d.pos[i] + d.size[i]) >= d2.pos[i]))
        .reduce((a, b) => a & b);

      let overlapUpd = eltAdd(d.center, scaMult(d2.center, -1));

      // scale overlap force by distance between centers: smaller distance = bigger force
      let overlapUpdScale = scaMult(overlapUpd, 20 / (0.1 + dist(d.center, d2.center)));

      let vAdd = overlap ? overlapUpdScale : [0, 0];

      d.v = eltAdd(d.v, scaMult(vAdd, 0.01));
    });

    // move closer to closest neighbors, if not already close
    let attractions = distTo.sort((a, b) => dist(a.dist_to, [0, 0]) - dist(b.dist_to, [0, 0])).slice(1, 4);

    // only move if not already very close in both dimensions
    let maxMinDist = attractions[0].dist_to.map(Math.abs).reduce((a, b) => Math.max(a, b));

    let attraction = maxMinDist > 2 ? attractions.map(i => i.dist_to).reduce((a, b) => scaMult(eltAdd(a, b), 0.01)) : [0, 0];

    d.v = eltAdd(d.v, attraction);

    // friction
    d.v = eltAdd(d.v, scaMult(d.v, -0.3));

    d.pos = eltAdd(d.pos, d.v);
    d.center = eltAdd(d.center, d.v);
    ttlVel += dist(d.v, [0, 0]);
  });
  return ttlVel;
}
