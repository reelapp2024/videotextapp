/** @typedef {{ alpha: number, scale: number, x: number, y: number, rotate: number }} MotionStyle */

/** @type {MotionStyle} */
export const DEF_STYLE = { alpha: 1, scale: 1, x: 0, y: 0, rotate: 0 };

/** @type {MotionStyle} */
export const HIDDEN_STYLE = { alpha: 0, scale: 1, x: 0, y: 0, rotate: 0 };

/** @type {Set<string>} */
export const ENTRANCE_EFFECTS = new Set([
  'fadeIn', 'fadeOut', 'fadeUp', 'fadeDown', 'fadeSlide',
  'slideUp', 'slideDown', 'slideLeft', 'slideRight',
  'slideFromTop', 'slideFromBottom', 'slideFromLeft', 'slideFromRight',
  'zoomIn', 'zoomOut', 'scaleIn',
  'bounceIn', 'bounceUp',
  'rotateIn', 'flipX', 'flipY', 'flipInX', 'flipInY',
  'elastic', 'elasticIn', 'spring', 'drop', 'blurIn',
  'firstWordTop', 'firstTwoTop', 'firstWordBottom', 'firstTwoBottom',
  'sideEntryLeft', 'sideEntryRight',
  'wordByWord', 'lineByLine', 'charByChar', 'typewriter',
  'staggerUp', 'staggerDown', 'cascade',
  'lineReveal', 'maskReveal', 'splitReveal', 'curtain',
  'implode', 'assemble',
]);

/** @typedef {{ alpha: number, scale: number, offsetX: number, offsetY: number, visibleChars: number }} LineAnimStyle */

/** @type {LineAnimStyle} */
export const LINE_ANIM_FULL = { alpha: 1, scale: 1, offsetX: 0, offsetY: 0, visibleChars: -1 };
