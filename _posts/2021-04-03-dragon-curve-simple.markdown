---
layout: post
title:  "Dragon curve unfolding and refolding"
date:   2021-04-03
categories: post
p5:
  - p5
  - addons/p5.dom
sketches:
  - dragon-simple
---

<div id="dragon_curve" style="height: 325px; width:200px; position:relative;" ></div>

I've been fascinated by the dragon [curve](https://en.wikipedia.org/wiki/Dragon_curve) for a long time (I have vague memories of coding the curve on a graphing calculator in high school). Part of my fascination comes from the fact that although the curve is complicated, it has a very simple and physically real expression in terms of folding. If you fold a piece of paper onto itself a few times and then unfold it just to the point that each bend in 90 degrees, you have the start of the dragon curve! I've spent some time over the last few weeks challenging myself to code an animation of that folding/unfolding behavior. The above [p5js](https://p5js.org/) sketch is the result.

## The code

I tried to simplify the code as much as I could, glad to keep it around 60 lines (and no doubt could be cut down even more). I show the full code here but will talk about each part in turn below.

{% highlight javascript linenos %}
function step(sketch) {
  return sketch.millis() % 17500;
}

function logistic(sketch, x, shift = 0) {
  return 1 / (1 + sketch.exp(-1 * 0.01 * (x - shift)));
}

function foldStep(sketch, x, level = 0) {
  return (
    2 -
    logistic(sketch, x, 1000 * level + 1000) +
    logistic(sketch, x, -1000 * level + 17000)
  );
}

function drawSeq(sketch, seq) {
  seq.map((i) => {
    sketch.line(0, 0, 0, 10);
    sketch.translate(0, 10);
    sketch.rotate((i * sketch.PI) / 2);
  });
}

function makeAndDrawSeq(sketch, seq, foldStepFunc = foldStep, level = 1) {
  if (seq.length < 2 ** 7) {
    let rev = seq
      .slice()
      .reverse()
      .map((i) => -1 * i);

    let newSeq = seq
      .concat(foldStepFunc(sketch, step(sketch), level))
      .concat(rev);

    makeAndDrawSeq(sketch, newSeq, foldStepFunc, level + 1);
  } else {
    drawSeq(sketch, seq);
  }
}

function commonSetup(sketch, width, height) {
  sketch.createCanvas(width, height);
  sketch.angleMode(sketch.RADIANS);
  sketch.strokeWeight(3);
  sketch.stroke(117, 112, 179);
  sketch.fill(117, 112, 179);
}

function commonDraw(sketch) {
  sketch.background(102, 194, 165);
  sketch.translate(sketch.width / 3, sketch.height / 3);
}

let dragonCurve = new p5((sketch) => {
  sketch.setup = () => {
    commonSetup(sketch, 200, 300);
  };
  sketch.draw = () => {
    commonDraw(sketch);
    makeAndDrawSeq(sketch, [foldStep(sketch, step(sketch))]);
  };
}, "dragon_curve");
{% endhighlight %}

### Drawing the curve

There are at least a few different ways of encoding the dragon curve. The way I do it here is to think of walking along the curve so that it becomes a series of left and right turns (right = 1, left = -1). The function `drawSeq` draws a sequence of 1s and -1s as left and right turns along a walk:

```js
function drawSeq(sketch, seq) {
  seq.map((i) => {
    sketch.line(0, 0, 0, 10);
    sketch.translate(0, 10);
    sketch.rotate((i * sketch.PI) / 2);
  });
}
```

For example, here is the drawing of the sequence `1, -1, 1, -1, 1, -1`:

<div id="draw_seq_ex" style="height: 125px; width:100px; position:relative;" ></div>

The code to make the above sketch:

```js
let drawSeqEx = new p5((sketch) => {
  sketch.setup = () => {
    commonSetup(sketch, 100, 100);
  };
  sketch.draw = () => {
    commonDraw(sketch);
    drawSeq(sketch, [1, -1, 1, -1, 1, -1]);
  };
}, "draw_seq_ex");
```

### Building the curve

But how to build the particular sequence of 1s and -1s that is the dragon curve? Here is the start of it:
```js
1, 1, -1, 1, 1, -1, -1, ...
```

If we imagine we have unfolded the curve and are at the exact middle of the walk along the curve, the curve behind us is the same as the curve ahead of us, just rotated away by 90 degrees (`PI/2` radians). Walking along the curve from the middle to the end is like walking the curve from the middle to the start but in opposite, so a left turn becomes a right and vice versa. So to generate the next half of the dragon curve sequence, we append the reverse and opposite of the sequence to the end (joined together with a right turn (1) that indicates the 90 degree separation between the halves). Here are the first few generations starting from a single right turn:

```js
1
1 1 -1
1 1 -1 1 1 -1 -1 
1 1 -1 1 1 -1 -1 1 1 1 -1 -1 1 -1 -1
```

The function `makeAndDrawSeq` implements this recursive process to build the sequence (and then draws it when long enough). Assume for now that `foldStepFunc` always returns 1, will be discussed in the next section.

```js
function makeAndDrawSeq(sketch, seq, foldStepFunc = foldStep, level = 1) {
  if (seq.length < 2 ** 7) {
    let rev = seq
      .slice()
      .reverse()
      .map((i) => -1 * i);

    let newSeq = seq
      .concat(foldStepFunc(sketch, step(sketch), level))
      .concat(rev);

    makeAndDrawSeq(sketch, newSeq, foldStepFunc, level + 1);
  } else {
    drawSeq(sketch, seq);
  }
}
```

### Unfolding and refolding

Unfolding and refolding the curve was the trickiest part to figure out. My first realization was that, just like a folded up piece of paper, I can always be drawing the full curve, just that sometimes some of the bends are closed i.e. a 180 degree (`PI`) turn rather than a 90 degree (`PI/2`). With the way the `drawSeq` function is step up, I can draw a closed bend by sending in a 2 or -2 for the sequence entry corresponding to that bend. Or a bend in between fully closed or opened by sending in a number in between 2 and 1, or in between -2 and -1.

For example, here is the drawing of the sequence `1.5, -1.5, 1.5, -1.5, 1.5, -1.5`:

<div id="intermediate_ex" style="height: 125px; width:100px; position:relative;" ></div>

#### How to smoothly vary a bend from closed to open and back?

To get the smooth opening and closing of bends, I vary the sequence entries smoothly between 2 and 1 or -2 and -1. I use a logistic [function](https://en.wikipedia.org/wiki/Logistic_function) to get the smoothly varying value.

<div id="single_logistic" style="height: 175px; width:200px; position:relative;" ></div>

The code to make the above sketch:

```js

function logistic(sketch, x, shift = 0) {
  return 1 / (1 + sketch.exp(-1 * 0.01 * (x - shift)));
}

function yToChart(value, xaxis = 125) {
  return xaxis - 50 * value;
}

function drawAxes(sketch, xaxis = 125, width = 150, title = "") {
  sketch.line(25, xaxis, 25, xaxis - 100);
  sketch.line(25, xaxis, 25 + width, xaxis);
  sketch.strokeWeight(1);
  sketch.text("time", 15 + width, xaxis + 20);
  [0, 1, 2].map((i) => sketch.text(i, 15, yToChart(i, xaxis)));
  sketch.text(title, 15 + width / 2, xaxis - 90);
  sketch.strokeWeight(3);
}

let singleLogisticEx = new p5((sketch) => {
  sketch.setup = () => {
    commonSetup(sketch, 200, 150);
  };
  sketch.draw = () => {
    sketch.background(102, 194, 165);
    drawAxes(sketch);
    for (let i = 0; i < 150; i++) {
      let y = 2 - logistic(sketch, 20 * i, 1200);
      sketch.point(i + 25, yToChart(y));
    }
  };
}, "single_logistic");
```

The `shift` parameter controls when the varying between values actually happens: initially the logistic function is fairly constant on the original value, and later the function is fairly constant on the final value.

If unfolding is varying sequence entries smoothly from 2 to 1 or -2 to -1, then refolding is just varying the entries back. To get this effect I take the difference of two logistic functions with different shifts (so they change at different times):

<div id="double_logistic" style="height: 175px; width:200px; position:relative;" ></div>

The code to get the above sketch:
```js
let doubleLogisticEx = new p5((sketch) => {
  sketch.setup = () => {
    commonSetup(sketch, 200, 150);
  };
  sketch.draw = () => {
    sketch.background(102, 194, 165);
    drawAxes(sketch);
    for (let i = 0; i < 150; i++) {
      let y =
        2 - logistic(sketch, 20 * i, 600) + logistic(sketch, 20 * i, 2000);
      sketch.point(i + 25, yToChart(y));
    }
  };
}, "double_logistic");
```

#### Which bends to close/open when?

Unfolding/refolding all bends at the same time gives a nice effect but not the sequential effect I'm looking for:

<div id="all_bends" style="height: 325px; width:200px; position:relative;" ></div>

The code to get the above sketch:
```js
let allBendsEx = new p5((sketch) => {
  sketch.setup = () => {
    commonSetup(sketch, 200, 300);
  };
  sketch.draw = () => {
    commonDraw(sketch);
    makeAndDrawSeq(sketch, [1], (sketch, x, level) => foldStep(sketch, x));
  };
}, "all_bends");
```

The problem is to figure out when each bend should unfold. For each unfolding step, which bends actually unfold? Imagine in a simple case that a paper is folded twice, so that there are three folds. On the first unfolding, the first and last bends unfold, followed by the middle bend on the next folding. In general, the middle bend is unfolded last.

At each iteration of the recursive function to generate the sequence, a middle bend and the reverse of the current sequence is added to the sequence. I don't really understand why this works, but shifting the logistic functions for a bend depending on the recursive level that the bend was added to the sequence gives the unfolding and refolding effect I'm looking for. On the refolding, the order of levels reverses, so the last bends to unfold are the first to refold. The `foldStep` function gives the double logistic function for each level:

```js
function foldStep(sketch, x, level = 0) {
  return (
    2 -
    logistic(sketch, x, 1000 * level + 1000) +
    logistic(sketch, x, -1000 * level + 17000)
  );
}
```

<div id="logistic_level" style="height: 450px; width:200px; position:relative;" ></div>

The code to get the above sketch:

```js
let LogisticLevelEx = new p5((sketch) => {
  sketch.setup = () => {
    commonSetup(sketch, 400, 425);
  };
  sketch.draw = () => {
    sketch.background(102, 194, 165);
    for (let level = 0; level < 3; level++) {
      drawAxes(sketch, 125 * (level + 1), 350, (title = "level " + level));
      for (let i = 0; i < 400; i++) {
        let y = foldStep(sketch, 50 * i, level);
        sketch.point(i + 25, yToChart(y, 125 * (level + 1)));
      }
    }
  };
}, "logistic_level");
```

#### Looping

I use the p5js [`millis`](https://p5js.org/reference/#/p5/millis) function to keep track of the time and the current animation step (it gives the milliseconds since the sketch started). To get the sketch to loop continuously from unfolding to refolding to unfolding again and so on, I use the modulo operator on `milis`:

```js
function step(sketch) {
  return sketch.millis() % 17500;
}
```

So every 17,500 milliseconds (trial and error to figure out a good number here), the animation goes back to step 0.

## Sketch to gif

Here's the sketch as a gif:

<img src="/assets/dragon_curve/dragon_curve_unfolding.gif" height="30%" width="30%">{: .center-image }

I had to do a little searching around to figure out how to get a gif from a sketch. A bit of trial and error got me to this process:

### Get frames as images
I added this this line to the end of the sketch's `draw` function:
```js
sketch.saveCanvas('dragon_curve_frame', 'png');
```
That downloaded frames of the sketch as png images.

### Images to gif

I then followed this [guide](https://engineering.giphy.com/how-to-make-gifs-with-ffmpeg/) on giphy to use [ffmpeg](https://ffmpeg.org/) to make a gif from the images.

```sh
ffmpeg \
  -framerate 60 \
  -i 'gifs/dragon_curve/images/dragon_curve_frame(%d).png' \
  -filter_complex "[0:v] fps=12,scale=480:-1,split [a][b];[a] palettegen [p];[b][p] paletteuse" \
  gifs/dragon_curve/dragon_curve_unfolding.gif
```

## Future directions

Many of the places in this project that required trial and error to figure out make me wonder about variations of this sketch that could be interesting. What if I start with a different sequence? Or unfold/refold bends in a different order? Or vary lengths of lines in addition to bend angles? These all could lead to interesting sketches.  