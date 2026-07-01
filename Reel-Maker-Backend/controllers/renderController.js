const { renderServerFrame, renderServerFramePng } = require('../services/serverRenderService');

/**
 * POST /api/render/frame
 * Body: { width, height, videoTime?, duration?, config, data?, assets?, format?: 'json'|'png' }
 *
 * NEW endpoint for M5 server renderer parity — does not modify export pipeline.
 */
async function renderFrame(req, res) {
  try {
    const {
      width = 1080,
      height = 1920,
      videoTime = 0,
      duration = 10,
      config = {},
      data,
      assets,
      format = 'json',
    } = req.body || {};

    const w = Math.min(4096, Math.max(64, Number(width) || 1080));
    const h = Math.min(4096, Math.max(64, Number(height) || 1920));

    if (format === 'png') {
      const { png, metrics } = await renderServerFramePng({
        width: w,
        height: h,
        videoTime,
        duration,
        config,
        data,
        assets,
      });
      res.set('Content-Type', 'image/png');
      res.set('X-Render-Version', metrics.rendererVersion || 'unknown');
      res.set('X-Render-Duration-Ms', String(metrics.totalFrameRenderMs ?? 0));
      return res.send(png);
    }

    const frame = await renderServerFrame({
      width: w,
      height: h,
      videoTime,
      duration,
      config,
      data,
      assets,
    });

    return res.json({
      width: frame.width,
      height: frame.height,
      metrics: frame.metrics,
      rgbaBase64: Buffer.from(frame.rgba).toString('base64'),
    });
  } catch (err) {
    const code = err?.code || 'RENDER_FAILED';
    const status = code === 'SCENE_VALIDATION_FAILED' ? 400 : 500;
    console.error('[render/frame]', code, err.message);
    return res.status(status).json({
      error: err.message,
      code,
      details: err.details || null,
    });
  }
}

/**
 * GET /api/render/parity/:scenario
 * Quick PNG preview for a built-in parity scenario.
 */
async function renderParityScenario(req, res) {
  try {
    const renderCore = await require('../services/serverRenderService').getRenderCore();
    const scenario = req.params.scenario || 'default';
    const buildScenario = renderCore.buildOverlayParityScenario || renderCore.buildParityScenario;
    const spec = buildScenario(scenario, {
      width: Number(req.query.width) || 540,
      height: Number(req.query.height) || 960,
      videoTime: Number(req.query.videoTime) || 0,
    });

    const { png, metrics } = await renderServerFramePng({
      ...spec,
      config: spec.config,
    });

    res.set('Content-Type', 'image/png');
    res.set('X-Parity-Scenario', scenario);
    res.set('X-Render-Duration-Ms', String(metrics.totalFrameRenderMs ?? 0));
    return res.send(png);
  } catch (err) {
    console.error('[render/parity]', err.message);
    return res.status(500).json({ error: err.message, code: err?.code || 'RENDER_FAILED' });
  }
}

module.exports = {
  renderFrame,
  renderParityScenario,
};
