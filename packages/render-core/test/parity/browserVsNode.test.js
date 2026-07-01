import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createNodeCanvas } from '../../src/adapters/nodeCanvasAdapter.js';
import { createBrowserCanvasAdapter } from '../../src/adapters/browserCanvasAdapter.js';
import { createNodeCanvasAdapter } from '../../src/adapters/nodeCanvasAdapter.js';
import { drawScene } from '../../src/adapters/canvasSceneDrawer.js';
import { buildFrameScene, buildParityScenario } from '../../src/renderers/frameBuilder.js';
import { renderFrame } from '../../src/index.node.js';
import { assertPixelParity } from './pixelDiff.js';
import { resetFontRegistry } from '../../src/assets/fontRegistry.js';

const SCENARIOS = ['default', 'stroke', 'shadow', 'gradient', 'box', 'animation', 'scale', 'opacity'];
const MAX_DIFF_RATIO = 0;

async function loadCanvas() {
  const { createCanvas } = await import('@napi-rs/canvas');
  return createCanvas;
}

describe('browser vs node adapter parity', () => {
  for (const scenario of SCENARIOS) {
    it(`adapters match for scenario: ${scenario}`, async (t) => {
      const createCanvas = await loadCanvas().catch(() => null);
      if (!createCanvas) {
        t.skip('@napi-rs/canvas not available');
        return;
      }

      resetFontRegistry();
      const spec = buildParityScenario(scenario, { width: 400, height: 300 });
      const { canvas, ctx } = await createNodeCanvas(spec.width, spec.height);

      const scene = buildFrameScene({
        config: spec.config,
        data: spec.data,
        width: spec.width,
        height: spec.height,
        videoTime: spec.videoTime,
        duration: spec.duration,
        measureCtx: ctx,
      });

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, spec.width, spec.height);

      const drawerCanvas = createCanvas(spec.width, spec.height);
      const drawerCtx = drawerCanvas.getContext('2d');
      drawerCtx.fillStyle = '#000';
      drawerCtx.fillRect(0, 0, spec.width, spec.height);
      drawScene(drawerCtx, scene, { width: spec.width, height: spec.height }, null);
      const drawerPixels = drawerCtx.getImageData(0, 0, spec.width, spec.height).data;

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, spec.width, spec.height);
      createBrowserCanvasAdapter(ctx).drawScene(scene, { width: spec.width, height: spec.height });
      const browserPixels = ctx.getImageData(0, 0, spec.width, spec.height).data;

      const nodeCanvas2 = createCanvas(spec.width, spec.height);
      const nodeCtx2 = nodeCanvas2.getContext('2d');
      nodeCtx2.fillStyle = '#000';
      nodeCtx2.fillRect(0, 0, spec.width, spec.height);
      createNodeCanvasAdapter(nodeCtx2).drawScene(scene, { width: spec.width, height: spec.height });
      const nodePixels = nodeCtx2.getImageData(0, 0, spec.width, spec.height).data;

      assertPixelParity(drawerPixels, browserPixels, MAX_DIFF_RATIO);
      assertPixelParity(drawerPixels, nodePixels, MAX_DIFF_RATIO);
    });
  }
});

describe('renderFrame node platform', () => {
  it('returns RGBA buffer with performance metrics', async (t) => {
    try {
      await import('@napi-rs/canvas');
    } catch {
      t.skip('@napi-rs/canvas not available');
      return;
    }

    resetFontRegistry();
    const spec = buildParityScenario('stroke', { width: 320, height: 240 });
    const result = await renderFrame({
      platform: 'node',
      width: spec.width,
      height: spec.height,
      videoTime: spec.videoTime,
      duration: spec.duration,
      config: spec.config,
      data: spec.data,
    });

    assert.equal(result.width, 320);
    assert.equal(result.height, 240);
    assert.equal(result.rgba.length, 320 * 240 * 4);
    assert.ok(result.metrics.sceneBuildMs >= 0);
    assert.ok(result.metrics.drawMs >= 0);
    assert.ok(result.metrics.totalFrameRenderMs >= 0);
    assert.equal(result.metrics.rendererVersion, '0.4.0-m6');
  });
});
