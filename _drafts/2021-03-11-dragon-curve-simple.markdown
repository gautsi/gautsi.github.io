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

I've been fascinated by the dragon curve[^wiki] for a long time. I have vague memories of coding the curve on a graphing calculator in high school. Part of my facination comes from the fact that although the curve is complicated, it has a very simple and physically real expression in terms of folding. If you fold a piece of paper onto itself a few times and then unfold it just to the point that each bend in 90 degrees, you have the start of the dragon curve! I've spent some time over the last few weeks challenging myself to code an animation of that folding/unfolding behavior. The above [p5js](https://p5js.org/) sketch is the result.

## The code

I tried to simplify the code as much as I could, glad to keep it under 50 lines (and no doubt could be simplified even more). I show the full code here but will talk about each part in turn below.

{% highlight javascript linenos %}
function setup() {
    let myCanvas = createCanvas(200, 300);
    myCanvas.parent('dragon_curve');
}

function step() {
    return millis() % 17000;
}

function logistic(shift = 0) {
    return 1 / (1 + exp(-1 * 0.01 * (step() - shift)));
}

function foldStep(level = 0) {
    return 2 - logistic(1000 * level + 1000) + logistic(-1000 * level + 17000);
}

function drawSeq(seq) {
    seq.map((i) => {
        line(0, 0, 0, 10);
        translate(0, 10);
        rotate(i * PI / 2);
    })
}

function makeAndDrawSeq(seq, level = 1) {
    if (seq.length < 2 ** 8) {
        let rev = seq.slice().reverse().map(i => -1 * i)
        makeAndDrawSeq(
          seq.concat(foldStep(level)).concat(rev), level + 1);
    } else {
        drawSeq(seq);
    }
}

function draw() {
    angleMode(RADIANS);
    strokeWeight(3);
    stroke(117, 112, 179);
    background(102, 194, 165);
    translate(width / 3, height / 3);
    makeAndDrawSeq([foldStep()]);
}
{% endhighlight %}

### Drawing the curve

There are at least a few different ways of encoding the dragon curve. The way I do it here is to think of walking along the curve so that it becomes a series of left and right turns (right = 1, left = -1). The function `drawSeq` draws a sequence of 1s and -1s as left and right turns along a walk:

```js
function drawSeq(seq) {
    seq.map((i) => {
        line(0, 0, 0, 10);
        translate(0, 10);
        rotate(i * PI / 2);
    })
}
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

The function `makeAndDrawSeq` implements this recursive process to build the sequence (and then draws it when long enough). Just assume `foldStep(level)` is 1 for now, will be discussed in the next section.

```js
function makeAndDrawSeq(seq, level = 1) {
    if (seq.length < 2 ** 8) {
        let rev = seq.slice().reverse().map(i => -1 * i)
        makeAndDrawSeq(
          seq.concat(foldStep(level)).concat(rev), level + 1);
    } else {
        drawSeq(seq);
    }
}
```

### Unfolding and refolding


## Sketch to gif

```js
saveCanvas('dragon_curve_frame', 'png');
```

```sh
ffmpeg -i dragon_curve_unfolding.mp4 -filter_complex "[0:v] fps=12,scale=480:-1,split [a][b];[a] palettegen [p];[b][p] paletteuse" dragon_curve_unfolding3.gif
```

[^wiki]: the dragon curve wikipedia [entry](https://en.wikipedia.org/wiki/Dragon_curve)