import { DEF_STYLE, ENTRANCE_EFFECTS, HIDDEN_STYLE, LINE_ANIM_FULL } from './constants.js';
import { computePresetEffect, computeLineRevealEffect } from './effectRegistry.js';
import { resolveEffectProgress } from './stagger.js';

export { isRenderCoreAnimationEnabled } from '../config/featureFlags.js';

/**
 * @typedef {object} AnimationEngineContext
 * @property {object} overlay
 * @property {object} baseOverlay
 * @property {number | null | undefined} videoTime
 * @property {number | null | undefined} videoDuration
 * @property {Array<{ start?: number, end?: number }> | undefined} captionWordsFlat
 * @property {string[]} allWords
 * @property {string[]} lines
 * @property {boolean} lineAnimEnabled
 * @property {string} revealMode
 * @property {number} contentLineAnimSpeed
 * @property {number} partStartTime
 * @property {string} animEffect
 */

/**
 * Creates per-overlay animation helpers (single source for preview + export).
 * @param {AnimationEngineContext} input
 */
export function createAnimationEngine(input) {
  const {
    overlay,
    baseOverlay,
    videoTime,
    videoDuration,
    captionWordsFlat,
    allWords,
    lines,
    lineAnimEnabled,
    revealMode,
    contentLineAnimSpeed,
    partStartTime,
    animEffect,
  } = input;

  const timingCtx = {
    baseOverlay,
    captionWordsFlat,
    videoTime,
    videoDuration,
    allWords,
    lines,
  };

  function resolveMotionProgress(logic, startTime, dur, shouldLoop, gIdx, lineIdx, captionGlobalIdx) {
    return resolveEffectProgress(
      timingCtx,
      logic,
      startTime,
      dur,
      shouldLoop,
      gIdx,
      lineIdx,
      captionGlobalIdx,
    );
  }

  function getPresetMotion(presetField, logicField, startField, durField, loopField, gIdx, lineIdx, captionGlobalIdx) {
    const effect = overlay[presetField] || 'none';
    if (effect === 'none') return DEF_STYLE;
    const { active, p } = resolveMotionProgress(
      overlay[logicField] || (presetField === 'animationPreset' ? 'default' : 'allAtOnce'),
      overlay[startField] ?? 0,
      overlay[durField] ?? 1.0,
      overlay[loopField] ?? false,
      gIdx,
      lineIdx,
      captionGlobalIdx,
    );
    if (!active) return ENTRANCE_EFFECTS.has(effect) ? HIDDEN_STYLE : DEF_STYLE;
    return computePresetEffect(effect, p, overlay.popScale ?? 1);
  }

  return {
    DEF_STYLE,
    HIDDEN_STYLE,
    ENTRANCE_EFFECTS,

    getAnimationStyle(gIdx, lineIdx, captionGlobalIdx = gIdx) {
      return getPresetMotion(
        'animationPreset',
        'animationLogic',
        'animationStartTime',
        'animationDuration',
        'animationLoop',
        gIdx,
        lineIdx,
        captionGlobalIdx,
      );
    },

    getKineticStyle(gIdx, lineIdx, captionGlobalIdx = gIdx) {
      return getPresetMotion(
        'kineticEffect',
        'kineticLogic',
        'kineticStartTime',
        'kineticDuration',
        'kineticLoop',
        gIdx,
        lineIdx,
        captionGlobalIdx,
      );
    },

    getLineAnimStyleForWord(gIdx, wordLen = 1, charStart = 0, lineIdx = 0) {
      if (!lineAnimEnabled || videoTime == null) return LINE_ANIM_FULL;
      const elapsed = Math.max(0, videoTime - partStartTime);
      const isCharAnim = revealMode === 'characterByChar';
      if (isCharAnim) {
        const totalCharsRevealed = Math.floor(elapsed * contentLineAnimSpeed);
        return computeLineRevealEffect(animEffect, {
          animEffect,
          revealMode,
          p: 0,
          unitIdx: gIdx,
          wordLen,
          charStart,
          totalCharsRevealed,
        });
      }
      const isFrameByFrame = revealMode === 'frameByFrame';
      const isLineByLine = revealMode === 'lineByLine';
      let p;
      if (isFrameByFrame) {
        p = Math.min(1, elapsed * contentLineAnimSpeed);
      } else {
        const visibleF = elapsed * contentLineAnimSpeed;
        const visibleCount = Math.floor(visibleF);
        const progress = Math.min(1, visibleF - visibleCount);
        const unitIdx = isLineByLine ? lineIdx : gIdx;
        if (unitIdx < visibleCount) return LINE_ANIM_FULL;
        if (unitIdx > visibleCount) return { alpha: 0, scale: 1, offsetX: 0, offsetY: 0, visibleChars: 0 };
        p = progress;
      }
      const unitIdx = isLineByLine ? lineIdx : gIdx;
      return computeLineRevealEffect(animEffect, {
        animEffect,
        revealMode,
        p,
        unitIdx,
        wordLen,
        charStart,
        totalCharsRevealed: 0,
      });
    },

    computePresetEffect,
    resolveEffectProgress: (logic, startTime, dur, shouldLoop, gIdx, lineIdx, captionGlobalIdx) =>
      resolveMotionProgress(logic, startTime, dur, shouldLoop, gIdx, lineIdx, captionGlobalIdx),
  };
}
