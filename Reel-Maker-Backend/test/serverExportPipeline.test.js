const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { processOneRowWithSharedRenderer } = require('../services/serverExportRow');
const { resolveExportRenderer } = require('../services/exportRendererConfig');

describe('server export pipeline (M7)', () => {
  it('resolveExportRenderer defaults to server (M10)', () => {
    const prev = process.env.EXPORT_RENDERER;
    delete process.env.EXPORT_RENDERER;
    assert.equal(resolveExportRenderer(), 'server');
    process.env.EXPORT_RENDERER = 'legacy';
    assert.equal(resolveExportRenderer(), 'server');
    process.env.EXPORT_RENDERER = 'server';
    assert.equal(resolveExportRenderer(), 'server');
    if (prev === undefined) delete process.env.EXPORT_RENDERER;
    else process.env.EXPORT_RENDERER = prev;
  });

  it('encodes a short overlay-only clip via stdin pipe', async (t) => {
    try {
      await import('@napi-rs/canvas');
    } catch {
      t.skip('@napi-rs/canvas not installed');
      return;
    }

    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reel-export-'));
    const outputPath = path.join(outDir, 'out_1.mp4');

    const config = {
      contentMode: 'rowBased',
      background: { type: 'solid', solidColor: '#1a1a2e' },
      video: { aspectRatio: '400x300', fps: 24 },
      overlays: [{
        enabled: true,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fontSize: 8,
        color: '#ffffff',
        positionY: 50,
        positionX: 50,
        wordsPerLine: 6,
        textAlign: 'center',
        styleType: 'stroke',
        strokeColor: '#ff3366',
      }],
    };

    const metrics = await processOneRowWithSharedRenderer({
      videoPath: null,
      imageBgPath: null,
      voicePath: null,
      musicPath: null,
      row: ['Server Export Test'],
      outputPath,
      videoVol: 0,
      voiceVol: 0.5,
      musicVol: 0.3,
      w: 400,
      h: 300,
      fps: 24,
      rowIndex: 0,
      config,
      hasVideoAudio: false,
      segments: [],
      isCancelled: () => false,
    });

    assert.ok(fs.existsSync(outputPath));
    assert.ok(fs.statSync(outputPath).size > 1000);
    assert.equal(metrics.exportPath, 'server');
    assert.equal(metrics.rendererVersion, '0.4.0-m6');
    assert.ok(metrics.totalFrames >= 24);
    assert.ok(metrics.avgFrameRenderMs >= 0);
    assert.ok(metrics.encodeMs >= 0);
    assert.ok(metrics.totalMs >= metrics.encodeMs);

    fs.rmSync(outDir, { recursive: true, force: true });
  });
});
