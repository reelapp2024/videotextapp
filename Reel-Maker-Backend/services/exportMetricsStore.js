const { RunningStats } = require('./exportRunningStats');

/**
 * Process-wide export metrics aggregator (M9) — internal monitoring only.
 */
class ExportMetricsStore {
  constructor() {
    this.completedJobs = 0;
    this.failedJobs = 0;
    this.renderMs = new RunningStats();
    this.encodeMs = new RunningStats();
    this.queueWaitMs = new RunningStats();
    this.totalMs = new RunningStats();
    this.cacheHitRatio = new RunningStats();
    this.peakHeapUsed = 0;
    this.peakRss = 0;
    this._workerJobs = new Map();
  }

  recordJob(metrics) {
    if (!metrics) return;
    if (metrics.failureReason) {
      this.failedJobs += 1;
      return;
    }
    this.completedJobs += 1;
    if (metrics.render?.avg != null) this.renderMs.push(metrics.render.avg);
    if (metrics.encodeMs != null) this.encodeMs.push(metrics.encodeMs);
    if (metrics.queueWaitMs != null) this.queueWaitMs.push(metrics.queueWaitMs);
    if (metrics.totalMs != null) this.totalMs.push(metrics.totalMs);
    if (metrics.cacheHitRatio != null) this.cacheHitRatio.push(metrics.cacheHitRatio);
    const peak = metrics.peakMemory;
    if (peak?.peakHeapUsed > this.peakHeapUsed) this.peakHeapUsed = peak.peakHeapUsed;
    if (peak?.peakRss > this.peakRss) this.peakRss = peak.peakRss;
  }

  recordWorkerUtilization(workerId, activeJobs) {
    this._workerJobs.set(workerId, { activeJobs, updatedAt: Date.now() });
  }

  get workerUtilization() {
    let active = 0;
    for (const v of this._workerJobs.values()) active += v.activeJobs || 0;
    return { activeJobs: active, workers: this._workerJobs.size };
  }

  snapshot() {
    return {
      completedJobs: this.completedJobs,
      failedJobs: this.failedJobs,
      avgRenderMs: this.renderMs.avg,
      avgEncodeMs: this.encodeMs.avg,
      avgQueueWaitMs: this.queueWaitMs.avg,
      avgTotalMs: this.totalMs.avg,
      avgCacheHitRatio: this.cacheHitRatio.avg,
      peakHeapUsed: this.peakHeapUsed,
      peakRss: this.peakRss,
      workerUtilization: this.workerUtilization,
    };
  }
}

const globalExportMetrics = new ExportMetricsStore();

module.exports = {
  ExportMetricsStore,
  getExportMetricsStore: () => globalExportMetrics,
};
