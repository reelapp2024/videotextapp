const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { RunningStats } = require('../services/exportRunningStats');
const { ExportTextLayoutCache } = require('../services/exportTextLayoutCache');
const { ExportAssetCache } = require('../services/exportAssetCache');
const { analyzeDirtyLayers } = require('../services/exportDirtyLayers');
const { ExportJobMetrics } = require('../services/exportMetrics');
const { ExportMetricsStore } = require('../services/exportMetricsStore');
const { MemoryPeakTracker } = require('../services/workerContext');
const { ServerStaticLayerCache } = require('../services/exportStaticLayers');

describe('export production modules (M9)', () => {
  it('RunningStats tracks avg without unbounded arrays', () => {
    const stats = new RunningStats();
    for (let i = 1; i <= 1000; i += 1) stats.push(i);
    assert.equal(stats.count, 1000);
    assert.equal(stats.avg, 500.5);
    assert.equal(stats.min, 1);
    assert.equal(stats.max, 1000);
  });

  it('ExportTextLayoutCache caches measureText', () => {
    const cache = new ExportTextLayoutCache();
    const ctx = {
      font: '16px Arial',
      measureText(text) {
        return { width: text.length * 10, actualBoundingBoxAscent: 0, actualBoundingBoxDescent: 0 };
      },
    };
    const restore = cache.installOnContext(ctx);
    const a = ctx.measureText('hello');
    const b = ctx.measureText('hello');
    restore();
    assert.equal(a.width, 50);
    assert.equal(b.width, 50);
    assert.ok(cache.hits >= 1);
    assert.ok(cache.hitRatio > 0);
  });

  it('ExportAssetCache hits on repeated gradient key', () => {
    const cache = new ExportAssetCache();
    let builds = 0;
    const factory = () => {
      builds += 1;
      return { kind: 'gradient' };
    };
    cache.getGradient('grad-a', factory);
    cache.getGradient('grad-a', factory);
    assert.equal(builds, 1);
    assert.equal(cache.stats.gradientHits, 1);
    cache.clearAll();
  });

  it('analyzeDirtyLayers bakes static bg when safe', () => {
    const dirty = analyzeDirtyLayers({
      config: {
        background: { type: 'solid', solidColor: '#000' },
        overlays: [{ enabled: true, fontFamily: 'Arial' }],
      },
      hasBgVideo: false,
      hasMainVideo: false,
      bgEffectsActive: false,
    });
    assert.equal(dirty.canBakeStaticBackground, true);
    assert.equal(dirty.overlaysDirtyEveryFrame, true);
  });

  it('ExportJobMetrics computes render/encode fps', () => {
    const m = new ExportJobMetrics();
    m.setJobMeta({ jobId: 'j1', rendererVersion: '0.4.0-m6', fps: 30 });
    for (let i = 0; i < 30; i += 1) m.recordFrameRender(10);
    const json = m.finalize({ encodeMs: 1000, totalMs: 1500, cacheHitRatio: 0.5, peakMemory: null });
    assert.equal(json.totalFrames, 30);
    assert.ok(json.renderFps > 90);
    assert.ok(json.encodeFps > 20);
  });

  it('ExportMetricsStore aggregates completed jobs', () => {
    const store = new ExportMetricsStore();
    store.recordJob({
      render: { avg: 12 },
      encodeMs: 400,
      queueWaitMs: 50,
      totalMs: 500,
      cacheHitRatio: 0.8,
      peakMemory: { peakHeapUsed: 1e8, peakRss: 2e8 },
    });
    const snap = store.snapshot();
    assert.equal(snap.completedJobs, 1);
    assert.equal(snap.avgRenderMs, 12);
    assert.equal(snap.peakHeapUsed, 1e8);
  });

  it('MemoryPeakTracker records peak heap', () => {
    const tracker = new MemoryPeakTracker();
    tracker.sample();
    const summary = tracker.summary();
    assert.ok(summary.peakHeapUsed > 0);
    assert.ok(summary.peakRss > 0);
  });

  it('ServerStaticLayerCache composites baked layers', () => {
    const cache = new ServerStaticLayerCache();
    assert.equal(cache.compositeBase({ drawImage() {} }, 100, 100), false);
    cache.setBackground({ drawImage() {} });
    assert.equal(cache.compositeBase({ drawImage() {} }, 100, 100), true);
    cache.dispose();
    assert.equal(cache.background, null);
  });
});
