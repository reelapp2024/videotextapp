import {
  pickEqualTimePartIndex,
  getActiveCaptionWordGlobalIndex,
  getCaptionLayoutText,
  buildFullCaptionScript,
  overlayUsesCaptions,
  flattenCaptionWords,
  getDisplayedWordGlobalIndex,
  resolveOverlayWithCaptionPreset,
  resolveConfigForCaptionPreset,
} from '../overlayRenderer.js';
import { getWordSizeScale, getWordLayoutOffset } from '../presets/captionPresetEngine.js';
import {
  TEXT_BG_PATTERNS,
  drawTextBgPattern,
  DOODLE_LIBRARY,
  drawDoodlesOnArea,
  getIntentFromText,
  getTextBgForIntent,
  getDoodleCategoryForIntent,
  getFontForIndex,
  getColorForIndex,
  getIconForIntent,
} from '../textStylePresets.js';
import { LINE_ANIM_EFFECTS } from '../constants.js';
import { resolveIcon } from './resolveIcon.js';

/**
 * Shared dependency bundle for drawOverlaysCore (browser preview + server renderer).
 * @param {{ wrapText: Function, resolveIcon?: Function }} [opts]
 */
export function createOverlayDrawDeps(opts = {}) {
  const wrapText = opts.wrapText;
  if (!wrapText) {
    throw new Error('createOverlayDrawDeps requires wrapText');
  }

  return {
    wrapText,
    overlayUsesCaptions,
    getCaptionLayoutText,
    pickEqualTimePartIndex,
    TEXT_BG_PATTERNS,
    drawTextBgPattern,
    DOODLE_LIBRARY,
    drawDoodlesOnArea,
    resolveOverlayWithCaptionPreset,
    resolveConfigForCaptionPreset,
    buildFullCaptionScript,
    flattenCaptionWords,
    getIntentFromText,
    getTextBgForIntent,
    getDoodleCategoryForIntent,
    getWordSizeScale,
    getWordLayoutOffset,
    getFontForIndex,
    getColorForIndex,
    getActiveCaptionWordGlobalIndex,
    getDisplayedWordGlobalIndex,
    getIconForIntent,
    LINE_ANIM_EFFECTS,
    resolveIcon: opts.resolveIcon || resolveIcon,
  };
}
