/** Max internal preview height — sharp when paused, lighter while playing. */
const MAX_PREVIEW_HEIGHT = 960;
const MAX_PLAYBACK_HEIGHT = 640;
const MIN_PREVIEW_HEIGHT = 320;
const MAX_DPR = 2;
const PLAYBACK_DPR = 1;

const makeEven = (n) => Math.max(2, Math.round(n / 2) * 2);

/**
 * Preview canvas size: matches visible panel × DPR (capped) so CSS does not upscale a tiny buffer.
 * @param {{ width: number, height: number }} exportDims
 * @param {HTMLElement | null | undefined} containerEl
 * @param {{ playing?: boolean }} [options]
 */
export function resolvePreviewCanvasSize(exportDims, containerEl, options = {}) {
  const playing = options.playing === true;
  const maxHeight = playing ? MAX_PLAYBACK_HEIGHT : MAX_PREVIEW_HEIGHT;
  const maxDpr = playing ? PLAYBACK_DPR : MAX_DPR;
  const aspect = exportDims.width / exportDims.height;
  const dpr = Math.min(
    typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    maxDpr,
  );

  let displayW = containerEl?.clientWidth ?? 0;
  let displayH = containerEl?.clientHeight ?? 0;

  if (displayW < 8 || displayH < 8) {
    displayH = playing ? 360 : 400;
    displayW = Math.round(displayH * aspect);
  }

  const containerAspect = displayW / displayH;
  let targetH;
  if (containerAspect > aspect) {
    targetH = displayH;
  } else {
    targetH = displayW / aspect;
  }

  targetH = Math.round(targetH * dpr);
  targetH = Math.min(Math.max(targetH, MIN_PREVIEW_HEIGHT), maxHeight);
  const targetW = Math.round(targetH * aspect);

  return {
    width: makeEven(targetW),
    height: makeEven(targetH),
  };
}
