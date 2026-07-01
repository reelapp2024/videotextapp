/**
 * Draw video/image frame with contain fit (+ optional zoom). Used by preview helpers.
 */

export function getVideoSourceDimensions(source) {
  if (!source) return { vw: 0, vh: 0 };
  const vw =
    source.displayWidth ||
    source.videoWidth ||
    source.codedWidth ||
    source.naturalWidth ||
    source.width ||
    0;
  const vh =
    source.displayHeight ||
    source.videoHeight ||
    source.codedHeight ||
    source.naturalHeight ||
    source.height ||
    0;
  return { vw, vh };
}

/**
 * Integer-snapped cover rect (background video / image fill).
 */
export function computeCoverRect(width, height, vw, vh) {
  if (!vw || !vh) return { sx: 0, sy: 0, sw: width, sh: height };
  const scale = Math.max(width / vw, height / vh);
  const sw = Math.round(vw * scale);
  const sh = Math.round(vh * scale);
  const sx = Math.round((width - sw) / 2);
  const sy = Math.round((height - sh) / 2);
  return { sx, sy, sw, sh };
}

/**
 * Integer-snapped contain rect (main video + optional zoom).
 */
export function computeContainRect(width, height, vw, vh, zoomScale = 1) {
  if (!vw || !vh) return { sx: 0, sy: 0, sw: width, sh: height };
  const z = Math.max(0.5, Math.min(2, zoomScale));
  const scale = Math.min(width / vw, height / vh) * z;
  const sw = Math.round(vw * scale);
  const sh = Math.round(vh * scale);
  const sx = Math.round((width - sw) / 2);
  const sy = Math.round((height - sh) / 2);
  return { sx, sy, sw, sh };
}

export function drawVideoFrameContain(ctx, source, width, height, zoomScale = 1) {
  const { vw, vh } = getVideoSourceDimensions(source);
  if (!vw || !vh) return;
  const { sx, sy, sw, sh } = computeContainRect(width, height, vw, vh, zoomScale);
  ctx.drawImage(source, sx, sy, sw, sh);
}

/**
 * Draw a source that is already export-sized (FFmpeg pad output) without rescaling.
 */
export function drawVideoFrameFullBleed(ctx, source, width, height, opacity = 1) {
  ctx.save();
  ctx.globalAlpha = opacity ?? 1;
  ctx.drawImage(source, 0, 0, width, height);
  ctx.restore();
}
