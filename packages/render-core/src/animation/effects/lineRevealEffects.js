import { LINE_ANIM_FULL } from '../constants.js';

/**
 * Content-line reveal animations (extracted from App.jsx getLineAnimStyleForWord).
 * @param {object} params
 * @param {string} params.animEffect
 * @param {string} params.revealMode
 * @param {number} params.p
 * @param {number} params.unitIdx
 * @param {number} params.wordLen
 * @param {number} params.charStart
 * @param {number} params.totalCharsRevealed
 */
export function computeLineRevealStyle(params) {
  const { animEffect, p, unitIdx, wordLen, charStart, totalCharsRevealed, revealMode } = params;
  const easeOut = 1 - Math.pow(1 - p, 2);
  const easeIn = p * p;
  const easeInOut = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  const popOvershoot = p < 0.8 ? (p / 0.8) * 1.15 : 0.85 + 0.15 * ((p - 0.8) / 0.2);
  const elastic = p === 0 ? 0 : p === 1 ? 1 : Math.pow(2, -8 * p) * Math.sin((p * 6 - 0.5) * Math.PI) + 1;
  const swing = 0.5 - Math.cos(p * Math.PI) / 2;

  if (revealMode === 'characterByChar') {
    const vc = Math.min(wordLen, Math.max(0, totalCharsRevealed - charStart));
    if (vc >= wordLen) return LINE_ANIM_FULL;
    if (vc <= 0) return { alpha: 0, scale: 1, offsetX: 0, offsetY: 0, visibleChars: 0 };
    return { alpha: 1, scale: 1, offsetX: 0, offsetY: 0, visibleChars: vc };
  }

  switch (animEffect) {
    case 'scaleUp':
      return { alpha: p, scale: 0.3 + 0.7 * p, offsetX: 0, offsetY: 0, visibleChars: -1 };
    case 'slideUp':
      return { alpha: p, scale: 1, offsetX: 0, offsetY: (1 - p) * 20, visibleChars: -1 };
    case 'slideDown':
      return { alpha: p, scale: 1, offsetX: 0, offsetY: -(1 - p) * 20, visibleChars: -1 };
    case 'slideLeft':
      return { alpha: p, scale: 1, offsetX: (1 - p) * 30, offsetY: 0, visibleChars: -1 };
    case 'slideRight':
      return { alpha: p, scale: 1, offsetX: -(1 - p) * 30, offsetY: 0, visibleChars: -1 };
    case 'zoomIn':
      return { alpha: p, scale: p, offsetX: 0, offsetY: 0, visibleChars: -1 };
    case 'zoomOut':
      return { alpha: p, scale: 1.5 - 0.5 * p, offsetX: 0, offsetY: 0, visibleChars: -1 };
    case 'bounceIn':
      return { alpha: Math.min(1, p * 1.2), scale: p < 0.6 ? 0.5 + p * 1.2 : Math.min(1.15, 0.86 + (p - 0.6) * 0.6), offsetX: 0, offsetY: 0, visibleChars: -1 };
    case 'pop':
      return { alpha: p, scale: popOvershoot, offsetX: 0, offsetY: 0, visibleChars: -1 };
    case 'elasticIn':
      return { alpha: p, scale: Math.max(0, Math.min(1.5, elastic)), offsetX: 0, offsetY: 0, visibleChars: -1 };
    case 'swingIn':
      return { alpha: p, scale: swing, offsetX: 0, offsetY: (1 - swing) * 15, visibleChars: -1 };
    case 'dropIn':
      return { alpha: p, scale: 1, offsetX: 0, offsetY: (1 - p) * 40, visibleChars: -1 };
    case 'flyIn':
      return { alpha: p, scale: 0.8 + 0.2 * p, offsetX: (1 - p) * 60, offsetY: 0, visibleChars: -1 };
    case 'floatUp':
      return { alpha: p, scale: 1, offsetX: 0, offsetY: (1 - p) * 25, visibleChars: -1 };
    case 'pulseIn':
      return { alpha: p, scale: 0.7 + 0.3 * (0.5 + 0.5 * Math.sin(p * Math.PI)), offsetX: 0, offsetY: 0, visibleChars: -1 };
    case 'blurIn':
      return { alpha: easeIn, scale: 1, offsetX: 0, offsetY: 0, visibleChars: -1 };
    case 'flipIn':
      return { alpha: p, scale: 0.2 + 0.8 * Math.sin(p * Math.PI / 2), offsetX: 0, offsetY: 0, visibleChars: -1 };
    case 'rotateIn':
      return { alpha: p, scale: easeOut, offsetX: 0, offsetY: 0, visibleChars: -1 };
    case 'fadeScale':
      return { alpha: p, scale: 0.5 + 0.5 * p, offsetX: 0, offsetY: 0, visibleChars: -1 };
    case 'slideZoom':
      return { alpha: p, scale: 0.6 + 0.4 * p, offsetX: (1 - p) * 25, offsetY: (1 - p) * 10, visibleChars: -1 };
    case 'stagger': {
      const staggerP = Math.max(0, (p - unitIdx * 0.05) / 0.7);
      return { alpha: staggerP, scale: 0.8 + 0.2 * staggerP, offsetX: 0, offsetY: 0, visibleChars: -1 };
    }
    case 'wave': {
      const waveOff = Math.sin(unitIdx * 0.5) * (1 - p) * 15;
      return { alpha: p, scale: 1, offsetX: 0, offsetY: waveOff, visibleChars: -1 };
    }
    case 'cascade':
      return { alpha: p, scale: 1, offsetX: (1 - p) * (unitIdx % 2 === 0 ? 20 : -20), offsetY: (1 - p) * 10, visibleChars: -1 };
    case 'splitReveal':
      return { alpha: p, scale: 1, offsetX: (1 - p) * (unitIdx % 2 === 0 ? 40 : -40), offsetY: 0, visibleChars: -1 };
    case 'curtain':
      return { alpha: p, scale: 1, offsetY: (1 - p) * 30, offsetX: 0, visibleChars: -1 };
    case 'glowIn':
      return { alpha: easeInOut, scale: 0.9 + 0.1 * p, offsetX: 0, offsetY: 0, visibleChars: -1 };
    case 'typewriter':
    case 'reveal':
      return { alpha: easeIn, scale: 1, offsetX: 0, offsetY: 0, visibleChars: -1 };
    case 'zoomSlide':
      return { alpha: p, scale: 0.5 + 0.5 * p, offsetX: (1 - p) * 20, offsetY: (1 - p) * 15, visibleChars: -1 };
    case 'bounceUp':
      return { alpha: p, scale: 1, offsetX: 0, offsetY: (1 - p) * 35, visibleChars: -1 };
    case 'fadeDown':
      return { alpha: p, scale: 1, offsetX: 0, offsetY: -(1 - p) * 15, visibleChars: -1 };
    case 'spinIn':
      return { alpha: p, scale: easeOut, offsetX: 0, offsetY: 0, visibleChars: -1 };
    case 'blurFade':
      return { alpha: easeInOut, scale: 1, offsetX: 0, offsetY: 0, visibleChars: -1 };
    case 'expand':
      return { alpha: p, scale: 0.2 + 0.8 * p, offsetX: 0, offsetY: 0, visibleChars: -1 };
    case 'rise':
      return { alpha: p, scale: 1, offsetX: 0, offsetY: (1 - p) * 30, visibleChars: -1 };
    case 'slideFade':
      return { alpha: p, scale: 1, offsetX: (1 - p) * 25, offsetY: (1 - p) * 10, visibleChars: -1 };
    case 'scalePop':
      return { alpha: p, scale: popOvershoot, offsetX: 0, offsetY: 0, visibleChars: -1 };
    case 'fadeIn':
    default:
      return { alpha: p, scale: 1, offsetX: 0, offsetY: 0, visibleChars: -1 };
  }
}
