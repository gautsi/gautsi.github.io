function logistic(x, min, max, rate, shift) {
    return min + max / (1 + exp(-1 * rate * (x - shift)))
}
