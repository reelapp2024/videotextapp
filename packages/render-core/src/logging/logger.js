/**
 * Structured logging for the render/export pipeline.
 * Avoids noisy console output — callers opt in via setLogSink.
 */

/** @typedef {'debug'|'info'|'warn'|'error'} LogLevel */

/** @type {((entry: object) => void) | null} */
let logSink = null;

/** @param {(entry: object) => void} sink */
export function setLogSink(sink) {
  logSink = sink;
}

/**
 * @param {LogLevel} level
 * @param {string} event
 * @param {Record<string, unknown>} [data]
 */
export function logRenderEvent(level, event, data = {}) {
  const entry = {
    ts: Date.now(),
    level,
    subsystem: 'render-core',
    event,
    ...data,
  };
  if (logSink) {
    logSink(entry);
    return;
  }
  if (import.meta.env?.DEV && level !== 'debug') {
    // eslint-disable-next-line no-console
    console[level === 'error' ? 'error' : 'info'](`[render-core] ${event}`, data);
  }
}

export const renderLogger = {
  rendererStarted: (data) => logRenderEvent('info', 'RendererStarted', data),
  frameProgress: (data) => logRenderEvent('debug', 'FrameProgress', data),
  rendererCompleted: (data) => logRenderEvent('info', 'RendererCompleted', data),
  rendererFailed: (data) => logRenderEvent('error', 'RendererFailed', data),
  sceneValidationWarning: (data) => logRenderEvent('warn', 'SceneValidationWarning', data),
  rendererFallback: (data) => logRenderEvent('info', 'RendererFallback', data),
};
