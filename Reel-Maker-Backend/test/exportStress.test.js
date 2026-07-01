const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { ServerExportSession } = require('../services/serverExportRow');
const { ServerVideoFrameSource } = require('../services/serverVideoFrameSource');
const { ExportTextLayoutCache } = require('../services/exportTextLayoutCache');
const { getWorkerAssetCache } = require('../services/exportAssetCache');

const BASE_CONFIG = {
  contentMode: 'rowBased',
  background: { type: 'solid', solidColor: '#0f0f23' },
  video: { aspectRatio: '320x240', fps: 24 },
  overlays: [{
    enabled: true,
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontSize: 7,
    color: '#ffffff',
    positionY: 50,
    positionX: 50,
    wordsPerLine: 5,
    textAlign: 'center',
    styleType: 'stroke',
    strokeColor: '#00ff88',
  }],
};

describe('export stress (M9)', () => {
  it('100-frame render loop maintains stable memory growth', async (t) => {
    try {
      await import('@napi-rs/canvas');
    } catch {
      t.skip('@napi-rs/canvas not installed');
      return;
    }

    const w = 320;
    const h = 240;
    const frames = 100;
    const session = new ServerExportSession(w, h);
    await session.init(BASE_CONFIG, { hasMainVideo: false, hasBgVideo: false, bgEffectsActive: false });
    await session.bakeStaticLayers({ config: BASE_CONFIG, bgImage: null, logoImage: null, logoState: null });

    const heapSamples = [];
    const row = ['Stress test caption with several words for layout cache'];

    for (let i = 0; i < frames; i += 1) {
      await session.drawExportFrame({
        rowData: row,
        videoTime: i / 24,
        duration: frames / 24,
        bgDrawExtras: {},
        mainVideoFrame: null,
        mainVideoOpacity: 1,
        bgVideoFrame: null,
        logoState: null,
      });
      if (i % 10 === 0) heapSamples.push(process.memoryUsage().heapUsed);
    }

    session.dispose();

    const first = heapSamples[0];
    const last = heapSamples[heapSamples.length - 1];
    const growthMb = (last - first) / (1024 * 1024);
    assert.ok(growthMb < 80, `heap grew ${growthMb.toFixed(1)}MB over ${frames} frames — possible leak`);
  });

  it('text layout cache improves hit ratio on repeated captions', async (t) => {
    try {
      await import('@napi-rs/canvas');
    } catch {
      t.skip('@napi-rs/canvas not installed');
      return;
    }

    const cache = new ExportTextLayoutCache();
    const { createCanvas } = await import('@napi-rs/canvas');
    const canvas = createCanvas(200, 100);
    const ctx = canvas.getContext('2d');
    ctx.font = '16px Arial';
    const restore = cache.installOnContext(ctx);

    const texts = ['Line one two three', 'Another caption here', 'Short'];
    for (let r = 0; r < 20; r += 1) {
      for (const text of texts) {
        ctx.measureText(text);
      }
    }
    restore();

    assert.ok(cache.hitRatio > 0.5, `expected cache hits, got ratio ${cache.hitRatio}`);
  });

  it('asset cache isolates per-job gradient clear', async () => {
    const cache = getWorkerAssetCache();
    const beforeHits = cache.stats.imageHits;
    cache.getGradient('test-key', () => ({ kind: 'gradient' }));
    cache.clearPerJob();
    assert.equal(cache._gradients.size, 0);
    cache.getGradient('test-key', () => ({ kind: 'gradient' }));
    assert.ok(cache.stats.gradientMisses >= 1);
    assert.ok(cache.stats.imageHits >= beforeHits);
  });

  it('ServerVideoFrameSource pending buffer avoids concat on small reads', async () => {
    const src = new ServerVideoFrameSource({
      filePath: '/nonexistent/video.mp4',
      width: 64,
      height: 64,
      fps: 24,
    });
    await src.start();
    src._appendChunk(Buffer.alloc(100));
    src._appendChunk(Buffer.alloc(200));
    assert.equal(src._pendingLen, 300);
    src.dispose();
    assert.equal(src._chunks.length, 0);
  });

  it('bulk session create/dispose x20 recovers cleanly', async (t) => {
    try {
      await import('@napi-rs/canvas');
    } catch {
      t.skip('@napi-rs/canvas not installed');
      return;
    }

    const startHeap = process.memoryUsage().heapUsed;
    for (let n = 0; n < 20; n += 1) {
      const session = new ServerExportSession(200, 150);
      await session.init(BASE_CONFIG, {});
      await session.drawExportFrame({
        rowData: [`Bulk ${n}`],
        videoTime: 0,
        duration: 1,
        bgDrawExtras: {},
        mainVideoFrame: null,
        mainVideoOpacity: 1,
        bgVideoFrame: null,
        logoState: null,
      });
      session.dispose();
    }
    if (global.gc) global.gc();
    const endHeap = process.memoryUsage().heapUsed;
    const deltaMb = (endHeap - startHeap) / (1024 * 1024);
    assert.ok(deltaMb < 60, `bulk dispose delta ${deltaMb.toFixed(1)}MB`);
  });
});
