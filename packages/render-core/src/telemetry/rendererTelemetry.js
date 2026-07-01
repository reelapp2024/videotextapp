import { isRenderCoreActive, isRenderCoreAnimationEnabled, isRenderCoreTextEnabled } from '../config/featureFlags.js';
import { logRenderEvent } from '../logging/logger.js';
import { RENDERER_VERSION } from '../types/renderContext.js';

/** @type {Map<string, number>} */
const lastFallbackAt = new Map();
const DEDUPE_MS = 2000;

function shouldEmitFallback(key) {
  const now = Date.now();
  const prev = lastFallbackAt.get(key) ?? 0;
  if (now - prev < DEDUPE_MS) return false;
  lastFallbackAt.set(key, now);
  return true;
}

/**
 * Log when render-core is enabled but legacy draw path is used.
 * @param {string} path
 * @param {string} reason
 * @param {Record<string, unknown>} [details]
 */
export function reportRendererFallback(path, reason, details = {}) {
  if (!isRenderCoreActive()) return;
  const key = `${path}:${reason}`;
  if (!shouldEmitFallback(key)) return;
  logRenderEvent('info', 'RendererFallback', {
    path,
    reason,
    rendererVersion: RENDERER_VERSION,
    renderCoreText: isRenderCoreTextEnabled(),
    renderCoreAnimation: isRenderCoreAnimationEnabled(),
    ...details,
  });
}

export function resetRendererFallbackTelemetry() {
  lastFallbackAt.clear();
}
