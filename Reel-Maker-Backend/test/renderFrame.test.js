const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { renderServerFrame, getRenderCore } = require('../services/serverRenderService');

describe('server render service', () => {
  it('renders a parity stroke frame on node', async (t) => {
    try {
      await import('@napi-rs/canvas');
    } catch {
      t.skip('@napi-rs/canvas not installed');
      return;
    }

    const renderCore = await getRenderCore();
    const spec = renderCore.buildParityScenario('stroke', { width: 400, height: 300 });

    const frame = await renderServerFrame({
      width: spec.width,
      height: spec.height,
      videoTime: spec.videoTime,
      duration: spec.duration,
      config: spec.config,
      data: spec.data,
    });

    assert.equal(frame.width, 400);
    assert.equal(frame.rgba.length, 400 * 300 * 4);
    assert.ok(frame.metrics.totalFrameRenderMs >= 0);
    assert.equal(frame.metrics.platform, 'node');
    assert.equal(frame.metrics.renderMode, 'overlays');
    assert.equal(frame.metrics.rendererVersion, '0.4.0-m6');
  });
});
