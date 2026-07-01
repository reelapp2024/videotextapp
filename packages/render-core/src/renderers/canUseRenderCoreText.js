import { isRenderCoreTextEnabled } from '../config/featureFlags.js';
import { reportRendererFallback } from '../telemetry/rendererTelemetry.js';

/**
 * Row-based static text — decorative bg/doodles remain legacy in M3–M4.
 * @param {object} overlay
 */
export function canUseRenderCoreRowBased(overlay) {
  if (!isRenderCoreTextEnabled()) return false;
  if (!overlay) {
    reportRendererFallback('rowBased', 'missingOverlay');
    return false;
  }
  return true;
}

/**
 * Multi-column static line (else branch when !useWordByWord).
 * @param {object} overlay
 * @param {object} context
 */
export function canUseRenderCoreStaticLine(overlay, context = {}) {
  if (!isRenderCoreTextEnabled()) return false;
  if (!overlay) {
    reportRendererFallback('staticLine', 'missingOverlay');
    return false;
  }
  const gates = [
    ['overlayCaptionActive', context.overlayCaptionActive],
    ['hasContentText', context.hasContentText],
    ['lineAnimEnabled', context.lineAnimEnabled],
    ['kineticEffect', context.kineticEffect && context.kineticEffect !== 'none'],
    ['colorLogic', overlay.colorLogic && overlay.colorLogic !== 'none'],
    ['fontChangeLogic', overlay.fontChangeLogic && overlay.fontChangeLogic !== 'none'],
    ['iconLogic', overlay.iconSectionEnabled && overlay.iconLogic && overlay.iconLogic !== 'none'],
    ['wordSizeLogic', !!overlay.wordSizeLogic],
    ['wordLayoutLogic', !!overlay.wordLayoutLogic],
    ['wordDimInactive', !!overlay.wordDimInactive],
  ];
  for (const [reason, blocked] of gates) {
    if (blocked) {
      reportRendererFallback('staticLine', reason, {
        overlayId: overlay.id,
        animationPreset: overlay.animationPreset,
      });
      return false;
    }
  }
  return true;
}

export { isRenderCoreTextEnabled } from '../config/featureFlags.js';
