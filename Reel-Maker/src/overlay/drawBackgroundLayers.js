import { drawBackgroundPattern } from '../backgroundPresets.js';
import {
  shouldApplyBackgroundEffects,
  resolveBackgroundEffectDuration,
} from '../effects/backgroundEffectsCatalog.js';
import { renderBackgroundWithEffects } from '../effects/backgroundEffectsEngine.js';
import { computeCoverRect, getVideoSourceDimensions } from './videoFrameDraw.js';

function drawImageCover(ctx, source, width, height) {
  const { vw, vh } = getVideoSourceDimensions(source);
  if (!vw || !vh) {
    ctx.drawImage(source, 0, 0, width, height);
    return;
  }
  const { sx, sy, sw, sh } = computeCoverRect(width, height, vw, vh);
  ctx.drawImage(source, sx, sy, sw, sh);
}

/**
 * Base background draw (solid, gradient, pattern, image, video) — shared preview + server export.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width
 * @param {number} height
 * @param {object} bg
 * @param {object} [extras]
 */
export function drawBackgroundBase(ctx, width, height, bg, extras = {}) {
  if (!bg) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    return;
  }
  const type = bg.type || 'solid';
  if (type === 'solid') {
    ctx.fillStyle = bg.solidColor || '#000000';
    ctx.fillRect(0, 0, width, height);
  } else if (type === 'gradient') {
    const colors = bg.gradientColors || ['#1a1a2e', '#16213e'];
    const g = ctx.createLinearGradient(0, 0, width, height);
    colors.forEach((c, i) => g.addColorStop(i / Math.max(1, colors.length - 1), c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  } else if (type === 'pattern') {
    const patternId = bg.patternId || 'none';
    const fg = bg.patternColor || 'rgba(255,255,255,0.12)';
    const bgCol = bg.solidColor || '#0a0a0a';
    drawBackgroundPattern(ctx, width, height, patternId, fg, bgCol);
  } else if (type === 'image' && extras.image && extras.image.complete !== false) {
    drawImageCover(ctx, extras.image, width, height);
  } else if (type === 'video' && extras.videoFrame) {
    drawImageCover(ctx, extras.videoFrame, width, height);
  } else if (type === 'video' && extras.video && extras.video.readyState >= 2) {
    drawImageCover(ctx, extras.video, width, height);
  } else if (extras.videoFrame || extras.video) {
    drawImageCover(ctx, extras.videoFrame || extras.video, width, height);
  } else {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
  }
}

/**
 * Background with optional animated effects (matches preview drawBackground).
 */
export function drawBackgroundLayer(ctx, width, height, bg, extras, videoTime, videoDuration, fx, fxOpts) {
  const bgForDraw =
    fxOpts?.fallbackUploadImage && extras.image?.complete !== false
      ? { ...bg, type: 'image' }
      : bg;

  if (!shouldApplyBackgroundEffects(bg, fx, fxOpts)) {
    drawBackgroundBase(ctx, width, height, bgForDraw, extras);
    return;
  }

  const t = videoTime != null ? videoTime : 0;
  const dur = resolveBackgroundEffectDuration(videoDuration, fx);
  renderBackgroundWithEffects(
    ctx,
    width,
    height,
    (bctx, w, h) => drawBackgroundBase(bctx, w, h, bgForDraw, extras),
    t,
    dur,
    fx,
  );
}

/**
 * Draw RGBA raw buffer as full canvas frame (from FFmpeg decoder).
 * @param {CanvasRenderingContext2D} ctx
 * @param {Buffer|Uint8Array} rgba
 * @param {number} width
 * @param {number} height
 * @param {number} [opacity]
 */
export function drawRgbaBuffer(ctx, rgba, width, height, opacity = 1) {
  const imageData = ctx.createImageData(width, height);
  imageData.data.set(rgba);
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.putImageData(imageData, 0, 0);
  ctx.restore();
}
