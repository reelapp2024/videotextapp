import { computeContainRect } from '../overlay/videoFrameDraw.js';

/**
 * Position the native preview <video> to match canvas contain + zoom (hardware-decoded playback).
 */
export function applyPreviewVideoLayerStyle(videoEl, stageEl, zoomScale = 1, opacity = 1) {
  if (!videoEl || !stageEl) return;
  const stageW = stageEl.clientWidth;
  const stageH = stageEl.clientHeight;
  const vw = videoEl.videoWidth;
  const vh = videoEl.videoHeight;
  if (!stageW || !stageH || !vw || !vh) return;

  const { sx, sy, sw, sh } = computeContainRect(stageW, stageH, vw, vh, zoomScale);
  videoEl.style.left = `${sx}px`;
  videoEl.style.top = `${sy}px`;
  videoEl.style.width = `${sw}px`;
  videoEl.style.height = `${sh}px`;
  videoEl.style.opacity = String(opacity ?? 1);
}
