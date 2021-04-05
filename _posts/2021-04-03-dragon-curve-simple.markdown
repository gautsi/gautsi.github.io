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

I've been fascinated by the dragon curve[^wiki] for a long time (I have vague memories of coding the curve on a graphing calculator in high school). Part of my fascination comes from the fact that although the curve is complicated, it has a very simple and physically real expression in terms of folding. If you fold a piece of paper onto itself a few times and then unfold it just to the point that each bend in 90 degrees, you have the start of the dragon curve! I've spent some time over the last few weeks challenging myself to code an animation of that folding/unfolding behavior. The above [p5js](https://p5js.org/) sketch is the result.

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

function makeAndDrawSeq(sketch, seq, level = 1) {
  if (seq.length < 2 ** 8) {
    let rev = seq
      .slice()
      .reverse()
      .map((i) => -1 * i);

    let newSeq = seq.concat(foldStep(sketch, step(sketch), level)).concat(rev);

    makeAndDrawSeq(sketch, newSeq, level + 1);
  } else {
    drawSeq(sketch, seq);
  }
}

function commonSetup(sketch, width, height) {
  sketch.createCanvas(width, height);
  sketch.angleMode(sketch.RADIANS);
  sketch.strokeWeight(3);
  sketch.stroke(117, 112, 179);
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

If we imagine we have unfolded the curve and are at the exact middle of the walk along the curve, the curve behind us and the curve ahead of us is the same, just rotated away from each other by 90 degrees (`PI / 2` radians). Walking along the curve from the middle to the end is like walking the curve from the middle to the start but in opposite, so a left turn becomes a right and vice versa. So to generate the next half of the dragon curve sequence, we append the reverse and opposite of the sequence to the end (joined together with a right turn (1) that indicates the 90 degree separation between the halves). Here are the first few generations starting from a single right turn:

```js
1
1 1 -1
1 1 -1 1 1 -1 -1 
1 1 -1 1 1 -1 -1 1 1 1 -1 -1 1 -1 -1
```

The function `makeAndDrawSeq` implements this recursive process to build the sequence (and then draws it when long enough). Just assume `foldStep` is 1 for now, will be discussed in the next section.

```js
function makeAndDrawSeq(sketch, seq, level = 1) {
  if (seq.length < 2 ** 8) {
    let rev = seq
      .slice()
      .reverse()
      .map((i) => -1 * i);

    let newSeq = seq.concat(foldStep(sketch, step(sketch), level)).concat(rev);

    makeAndDrawSeq(sketch, newSeq, level + 1);
  } else {
    drawSeq(sketch, seq);
  }
}
```

### Unfolding and refolding

Unfolding and refolding the curve was the trickiest part to figure out. My first realization was that, just like a folded up paper, I can always be drawing the full curve, just that sometimes some of the bends are closed i.e. a 180 degree (PI) turn rather than a 90 degree (PI/2). With the way the `drawSeq` function is step up, I can draw a closed bend by sending in a 2 or -2 for the sequence entry corresponding to that bend. Or a bend in between fully closed or opened by sending in a number in between 2 and 1, or in between -2 and -1.

For example, here is the drawing of the sequence `1.5, -1.5, 1.5, -1.5, 1.5, -1.5`:

<div id="intermediate_ex" style="height: 125px; width:100px; position:relative;" ></div>

#### How to smoothly vary a bend from closed to open and back?

To get the smooth opening and closing of bends, I vary the sequence entries smoothly between 2 and 1 or -2 and -1.

#### Which bends to close/open when?


## Sketch to gif

```js
saveCanvas('dragon_curve_frame', 'png');
```

```sh
ffmpeg -i dragon_curve_unfolding.mp4 -filter_complex "[0:v] fps=12,scale=480:-1,split [a][b];[a] palettegen [p];[b][p] paletteuse" dragon_curve_unfolding3.gif
```

[^wiki]: the dragon curve wikipedia [entry](https://en.wikipedia.org/wiki/Dragon_curve)