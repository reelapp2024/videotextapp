/**
 * O(1) running statistics — avoids per-frame arrays for long exports (M9).
 */
class RunningStats {
  constructor() {
    this.count = 0;
    this.sum = 0;
    this.min = Infinity;
    this.max = 0;
  }

  /** @param {number} value */
  push(value) {
    const v = Number(value) || 0;
    this.count += 1;
    this.sum += v;
    if (v < this.min) this.min = v;
    if (v > this.max) this.max = v;
  }

  get avg() {
    return this.count > 0 ? this.sum / this.count : 0;
  }

  toJSON() {
    return {
      count: this.count,
      sum: this.sum,
      avg: this.avg,
      min: this.min === Infinity ? 0 : this.min,
      max: this.max,
    };
  }
}

module.exports = { RunningStats };
