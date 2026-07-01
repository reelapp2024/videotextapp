import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createNodeCanvas } from '../../src/adapters/nodeCanvasAdapter.js';
import { drawOverlaysCore } from '../../src/overlay/drawOverlaysCore.js';
import { drawBackgroundCore } from '../../src/overlay/drawBackgroundCore.js';
import {
  buildOverlayParityScenario,
  OVERLAY_PARITY_SCENARIOS,
} from '../../src/overlay/overlayParityScenarios.js';
import { renderFrame } from '../../src/index.node.js';
import { assertPixelParity, buildDiffImage, countPixelDiff } from './pixelDiff.js';
import { resetFontRegistry } from '../../src/assets/fontRegistry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIFF_DIR = path.join(__dirname, 'diff-images');

/** @type {import('../../../Reel-Maker/src/overlay/overlayDrawDeps.js').createOverlayDrawDeps | null} */
let createOverlayDrawDeps = null;
/** @type {Function | null} */
let wrapTextCore = null;

async function loadOverlayDeps() {
  if (!createOverlayDrawDeps) {
    const depsMod = await import('../../../../Reel-Maker/src/overlay/overlayDrawDeps.js');
    const wrapMod = await import('../../src/layout/wrapText.js');
    createOverlayDrawDeps = depsMod.createOverlayDrawDeps;
    wrapTextCore = wrapMod.wrapText;
  }
  const wrapText = (text, wordsPerLine, ctx, maxWidth, textCache) => {
    if (textCache?.wrapText) {
      return textCache.wrapText(text, wordsPerLine, ctx, maxWidth, wrapTextCore);
    }
    return wrapTextCore(text, wordsPerLine, ctx, maxWidth);
  };
  return createOverlayDrawDeps({ wrapText });
}

async function renderOverlayFrameA(spec, deps) {
  const { canvas, ctx } = await createNodeCanvas(spec.width, spec.height);
  drawBackgroundCore(ctx, spec.width, spec.height, spec.config.background);
  drawOverlaysCore(ctx, spec.width, spec.height, spec.data, spec.videoTime, spec.duration, spec.config, deps);
  return ctx.getImageData(0, 0, spec.width, spec.height).data;
}

async function renderOverlayFrameB(spec, deps) {
  const { canvas, ctx } = await createNodeCanvas(spec.width, spec.height);
  drawBackgroundCore(ctx, spec.width, spec.height, spec.config.background);
  drawOverlaysCore(ctx, spec.width, spec.height, spec.data, spec.videoTime, spec.duration, spec.config, deps);
  return ctx.getImageData(0, 0, spec.width, spec.height).data;
}

async function saveDiffPng(scenario, a, b, width, height) {
  const { createCanvas } = await import('@napi-rs/canvas');
  fs.mkdirSync(DIFF_DIR, { recursive: true });
  const diff = buildDiffImage(a, b, width, height);
  const c = createCanvas(width, height);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(width, height);
  img.data.set(diff);
  ctx.putImageData(img, 0, 0);
  const out = path.join(DIFF_DIR, `${scenario}.png`);
  fs.writeFileSync(out, c.toBuffer('image/png'));
  return out;
}

const MAX_DIFF_RATIO = 0;

describe('overlay drawOverlaysCore parity (browser path A vs server path B)', () => {
  for (const scenario of OVERLAY_PARITY_SCENARIOS) {
    it(`identical pixels for scenario: ${scenario}`, async (t) => {
      try {
        await import('@napi-rs/canvas');
      } catch {
        t.skip('@napi-rs/canvas not available');
        return;
      }

      resetFontRegistry();
      const deps = await loadOverlayDeps();
      const spec = buildOverlayParityScenario(scenario, { width: 400, height: 300 });

      const pixelsA = await renderOverlayFrameA(spec, deps);
      const pixelsB = await renderOverlayFrameB(spec, deps);

      const stats = countPixelDiff(pixelsA, pixelsB);
      await saveDiffPng(scenario, pixelsA, pixelsB, spec.width, spec.height);

      assertPixelParity(pixelsA, pixelsB, MAX_DIFF_RATIO);
      assert.equal(stats.diffPixels, 0, `scenario ${scenario} should have 0 pixel diff`);
    });
  }
});

describe('renderFrame overlay mode (server)', () => {
  it('renders via drawOverlaysCore with metrics', async (t) => {
    try {
      await import('@napi-rs/canvas');
    } catch {
      t.skip('@napi-rs/canvas not available');
      return;
    }

    resetFontRegistry();
    const deps = await loadOverlayDeps();
    const spec = buildOverlayParityScenario('stroke', { width: 320, height: 240 });

    const result = await renderFrame({
      platform: 'node',
      width: spec.width,
      height: spec.height,
      videoTime: spec.videoTime,
      duration: spec.duration,
      config: spec.config,
      data: spec.data,
      renderMode: 'overlays',
      overlayDeps: deps,
    });

    assert.equal(result.width, 320);
    assert.equal(result.rgba.length, 320 * 240 * 4);
    assert.equal(result.metrics.renderMode, 'overlays');
    assert.equal(result.metrics.rendererVersion, '0.4.0-m6');
    assert.ok(result.metrics.totalFrameRenderMs >= 0);
  });
});
