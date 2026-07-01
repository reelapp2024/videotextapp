const { RunningStats } = require('./exportRunningStats');

/**
 * Per-export internal metrics (M9) — not exposed via API.
 */
class ExportJobMetrics {
  constructor() {
    this.jobId = null;
    this.rendererVersion = null;
    this.queueWaitMs = 0;
    this.retryCount = 0;
    this.renderStats = new RunningStats();
    this.encodeMs = 0;
    this.totalMs = 0;
    this.totalFrames = 0;
    this.fps = 0;
    this.cacheHitRatio = 0;
    this.peakMemory = null;
    this.failureReason = null;
    this.startedAt = Date.now();
  }

  setJobMeta({ jobId, rendererVersion, queueWaitMs, retryCount, fps }) {
    this.jobId = jobId;
    this.rendererVersion = rendererVersion;
    this.queueWaitMs = queueWaitMs ?? 0;
    this.retryCount = retryCount ?? 0;
    this.fps = fps ?? 0;
  }

  recordFrameRender(ms) {
    this.renderStats.push(ms);
    this.totalFrames += 1;
  }

  finalize({ encodeMs, totalMs, cacheHitRatio, peakMemory }) {
    this.encodeMs = encodeMs ?? 0;
    this.totalMs = totalMs ?? Date.now() - this.startedAt;
    this.cacheHitRatio = cacheHitRatio ?? 0;
    this.peakMemory = peakMemory ?? null;
    return this.toJSON();
  }

  get renderFps() {
    const avgMs = this.renderStats.avg;
    return avgMs > 0 ? 1000 / avgMs : 0;
  }

  get encodeFps() {
    return this.encodeMs > 0 && this.totalFrames > 0
      ? (this.totalFrames / this.encodeMs) * 1000
      : 0;
  }

  toJSON() {
    return {
      jobId: this.jobId,
      rendererVersion: this.rendererVersion,
      queueWaitMs: this.queueWaitMs,
      retryCount: this.retryCount,
      totalFrames: this.totalFrames,
      fps: this.fps,
      render: this.renderStats.toJSON(),
      renderFps: this.renderFps,
      encodeMs: this.encodeMs,
      encodeFps: this.encodeFps,
      totalMs: this.totalMs,
      cacheHitRatio: this.cacheHitRatio,
      peakMemory: this.peakMemory,
      failureReason: this.failureReason,
    };
  }
}

module.exports = { ExportJobMetrics };
