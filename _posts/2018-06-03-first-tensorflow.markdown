---
layout: post
title:  "A Simple Tensorflow.js Sketch"
date:   2018-06-03
categories: draft
---

In this post I'm going to describe a sketch I'm working on to get familiar with tensorflow.js. In this sketch, a small two-layer feed forward neural network learns to fit a curve to a set of two-dimensional points. I generate these points as random deviations from a sin curve:

![Training Points]({{ "/assets/first_tf/training_points.jpg" | absolute_url }}){: height="50%" width="50%" .center-image}

Here is the code to make the training set:

```javascript
function makeTrainingPoints() {
  for (let i = 0; i < numTraining; i ++) {
    let x = random();
    let y = sin(TWO_PI * x) + 0.5 * random();
    trainingPoints.push([x, y]);
  }
}
```
