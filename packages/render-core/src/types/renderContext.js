/**
 * Per-frame render context passed through the orchestrator.
 * @typedef {Object} RenderContext
 * @property {number} width
 * @property {number} height
 * @property {number} [videoTime]
 * @property {number} [frameIndex]
 * @property {string} [rendererVersion]
 */

export const RENDERER_VERSION = '0.4.0-m6';

/** @param {Partial<RenderContext>} ctx @returns {RenderContext} */
export function createRenderContext(ctx) {
  return {
    width: ctx.width ?? 1080,
    height: ctx.height ?? 1920,
    videoTime: ctx.videoTime,
    frameIndex: ctx.frameIndex,
    rendererVersion: RENDERER_VERSION,
  };
}
