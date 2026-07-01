import { getIconForWord, getIntentFromText, getIconForIntent, ICON_LIBRARY } from '../textStylePresets.js';

/**
 * Resolve per-word or corner icon character for an overlay.
 * @param {string} word
 * @param {object} overlay
 * @param {string} fullText
 */
export function resolveIcon(word, overlay, fullText) {
  try {
    const customChar = overlay.iconCustomChar;
    if (customChar && customChar.length <= 5) return customChar;
    if (customChar && customChar.length > 5) return customChar.slice(0, 3);
    const srcType = overlay.iconSourceType || 'icons';
    if (srcType === 'icons') {
      const intent = overlay.iconIntent || 'auto';
      if (intent === 'auto') {
        const detected = getIntentFromText(fullText || '');
        if (detected) {
          const intentIcon = getIconForIntent(detected, String(word).length);
          if (intentIcon) return intentIcon;
        }
      } else if (ICON_LIBRARY[intent] && ICON_LIBRARY[intent].length > 0) {
        const hash = String(word).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        return ICON_LIBRARY[intent][hash % ICON_LIBRARY[intent].length];
      }
      const meaningIcon = getIconForWord(word, 'icons');
      return meaningIcon || '✦';
    }
    const result = getIconForWord(word, srcType);
    return result || '✦';
  } catch {
    return '✦';
  }
}
