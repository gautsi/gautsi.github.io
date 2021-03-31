function logistic(x, min, max, rate, shift) {
    return min + (max - min) / (1 + exp(-1 * rate * (x - shift)))
}


function drawSeq(sketch, seq) {
    if (seq.length > 0) {
        sketch.line(0, 0, 0, sketch.line_length);
        sketch.translate(0, sketch.line_length);  
        sketch.rotate(seq[0] * sketch.PI / 2);
        drawSeq(sketch, seq.slice(1));  
    }
}
