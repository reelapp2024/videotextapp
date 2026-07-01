const { RunningStats } = require('./exportRunningStats');

const STAGE_ORDER = [
  'videoRead',
  'background',
  'mainVideo',
  'bgVideo',
  'overlays',
  'decorative',
  'logo',
  'readback',
  'ffmpegWrite',
];

/**
 * Per-export render stage profiler (high-resolution timers).
 */
class ExportRenderProfiler {
  constructor() {
    /** @type {Record<string, RunningStats>} */
    this.stages = Object.fromEntries(
      [...STAGE_ORDER, 'composite'].map((k) => [k, new RunningStats()]),
    );
    this.frameCount = 0;
  }

  /** @returns {bigint} */
  mark() {
    return process.hrtime.bigint();
  }

  /**
   * @param {string} stage
   * @param {bigint} start
   */
  record(stage, start) {
    const stats = this.stages[stage];
    if (!stats || start == null) return;
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    stats.push(ms);
  }

  beginFrame() {
    this.frameCount += 1;
  }

  /**
   * @returns {object}
   */
  summary() {
    const totalMs = STAGE_ORDER.reduce((sum, key) => sum + this.stages[key].sum, 0);
    const stages = {};
    for (const key of STAGE_ORDER) {
      const s = this.stages[key];
      stages[key] = {
        ...s.toJSON(),
        pctOfRender: totalMs > 0 ? Math.round((s.sum / totalMs) * 1000) / 10 : 0,
      };
    }
    const ranked = STAGE_ORDER
      .map((key) => ({ stage: key, totalMs: this.stages[key].sum, avgMs: this.stages[key].avg }))
      .sort((a, b) => b.totalMs - a.totalMs);
    return {
      frameCount: this.frameCount,
      stages,
      totalStageMs: totalMs,
      bottlenecks: ranked.slice(0, 5),
    };
  }
}

module.exports = { ExportRenderProfiler, STAGE_ORDER };
