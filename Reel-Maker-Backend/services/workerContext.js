const os = require('os');
const { randomUUID } = require('crypto');

const WORKER_ID = process.env.EXPORT_WORKER_ID || `worker-${os.hostname()}-${process.pid}-${randomUUID().slice(0, 8)}`;

function getWorkerId() {
  return WORKER_ID;
}

function getMemorySnapshot() {
  const m = process.memoryUsage();
  return {
    rss: m.rss,
    heapUsed: m.heapUsed,
    heapTotal: m.heapTotal,
    external: m.external,
    arrayBuffers: m.arrayBuffers,
  };
}

/** Track peak heap during a job. */
class MemoryPeakTracker {
  constructor() {
    this.peakHeapUsed = 0;
    this.peakRss = 0;
    this._start = getMemorySnapshot();
  }

  sample() {
    const m = getMemorySnapshot();
    if (m.heapUsed > this.peakHeapUsed) this.peakHeapUsed = m.heapUsed;
    if (m.rss > this.peakRss) this.peakRss = m.rss;
    return m;
  }

  summary() {
    const end = this.sample();
    return {
      start: this._start,
      end,
      peakHeapUsed: this.peakHeapUsed,
      peakRss: this.peakRss,
      heapDelta: end.heapUsed - this._start.heapUsed,
    };
  }
}

module.exports = {
  getWorkerId,
  getMemorySnapshot,
  MemoryPeakTracker,
  WORKER_ID,
};
