import { createBrowserCanvasAdapter } from '../adapters/browserCanvasAdapter.js';
import { renderLogger } from '../logging/logger.js';
import { scheduleFrame } from '../schedule/frameScheduler.js';
import { createRenderContext, RENDERER_VERSION } from '../types/renderContext.js';
import { validateScene } from '../validation/sceneValidator.js';
import { buildRowBasedTextScene, buildStaticLineScene } from './TextRenderer.js';

function nowMs() {
  return typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
}

/**
 * Coordinates renderer modules. M4: validation + performance metrics.
 */
export class RenderOrchestrator {
  constructor() {
    /** @type {import('../adapters/browserCanvasAdapter.js').BrowserCanvasAdapter | null} */
    this._adapter = null;
    this._strictValidation = true;
  }

  /** @param {boolean} strict */
  setStrictValidation(strict) {
    this._strictValidation = strict;
  }

  /** @param {CanvasRenderingContext2D} ctx */
  bindCanvas(ctx) {
    this._adapter = createBrowserCanvasAdapter(ctx);
    return this._adapter;
  }

  /** @param {import('../adapters/RendererAdapter.js').RendererAdapter} adapter */
  bindAdapter(adapter) {
    this._adapter = adapter;
  }

  /**
   * @param {import('../types/renderContext.js').RenderContext} renderCtx
   * @param {import('../types/sceneGraph.js').SceneNode} scene
   * @param {{ sceneBuildMs?: number }} [buildMetrics]
   */
  drawScheduledScene(renderCtx, scene, buildMetrics = {}) {
    if (!this._adapter) {
      throw new Error('RenderOrchestrator: no adapter bound — call bindCanvas() first');
    }

    const frameT0 = nowMs();
    const validation = validateScene(scene, {
      width: renderCtx.width,
      height: renderCtx.height,
      checkFonts: true,
    });

    if (validation.warnings.length) {
      renderLogger.sceneValidationWarning({
        warnings: validation.warnings,
        frameIndex: renderCtx.frameIndex,
        rendererVersion: RENDERER_VERSION,
      });
    }

    if (!validation.valid) {
      const err = new Error(`Scene validation failed: ${validation.errors.join('; ')}`);
      renderLogger.rendererFailed({
        message: err.message,
        errors: validation.errors,
        frameIndex: renderCtx.frameIndex,
        rendererVersion: RENDERER_VERSION,
      });
      if (this._strictValidation) throw err;
    }

    const scheduled = scheduleFrame(scene);
    const drawT0 = nowMs();

    renderLogger.rendererStarted({
      width: renderCtx.width,
      height: renderCtx.height,
      frameIndex: renderCtx.frameIndex,
      rendererVersion: RENDERER_VERSION,
      sceneBuildMs: buildMetrics.sceneBuildMs,
    });

    try {
      this._adapter.drawScene(scheduled, {
        width: renderCtx.width,
        height: renderCtx.height,
      });
      const drawMs = nowMs() - drawT0;
      const totalFrameRenderMs = nowMs() - frameT0;
      renderLogger.rendererCompleted({
        sceneBuildMs: buildMetrics.sceneBuildMs ?? 0,
        drawMs,
        totalFrameRenderMs,
        frameIndex: renderCtx.frameIndex,
        rendererVersion: RENDERER_VERSION,
      });
    } catch (err) {
      renderLogger.rendererFailed({
        message: err instanceof Error ? err.message : String(err),
        frameIndex: renderCtx.frameIndex,
        rendererVersion: RENDERER_VERSION,
      });
      throw err;
    }
  }

  /** @param {CanvasRenderingContext2D} ctx @param {object} params */
  renderRowBasedText(ctx, params) {
    this.bindCanvas(ctx);
    const buildT0 = nowMs();
    const scene = buildRowBasedTextScene({
      ...params,
      measureCtx: ctx,
    });
    const sceneBuildMs = nowMs() - buildT0;
    const renderCtx = createRenderContext({
      width: params.width,
      height: params.height,
      videoTime: params.videoTime,
      frameIndex: params.frameIndex,
    });
    this.drawScheduledScene(renderCtx, scene, { sceneBuildMs });
  }

  /** @param {CanvasRenderingContext2D} ctx @param {object} params */
  renderStaticLine(ctx, params) {
    this.bindCanvas(ctx);
    const buildT0 = nowMs();
    const scene = buildStaticLineScene(params);
    const sceneBuildMs = nowMs() - buildT0;
    const renderCtx = createRenderContext({
      width: params.width,
      height: params.height,
      frameIndex: params.frameIndex,
    });
    this.drawScheduledScene(renderCtx, scene, { sceneBuildMs });
  }
}

let sharedOrchestrator = null;

export function getRenderOrchestrator() {
  if (!sharedOrchestrator) sharedOrchestrator = new RenderOrchestrator();
  return sharedOrchestrator;
}
