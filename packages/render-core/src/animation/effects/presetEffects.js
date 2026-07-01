import { DEF_STYLE } from '../constants.js';
import { bounceEase, easeOut, elasticEase, pseudoRand } from '../easing.js';

/**
 * Builtin overlay / kinetic preset motion (extracted from App.jsx computeEffectStyle).
 * @param {string} effect
 * @param {number} p progress 0..1
 * @param {number} pop popScale multiplier
 * @returns {import('../constants.js').MotionStyle}
 */
export function computeBuiltinPresetEffect(effect, p, pop = 1) {
  const eo = easeOut(p);
  switch (effect) {
    case 'fadeIn': return { alpha: eo, scale: 1, x: 0, y: 0, rotate: 0 };
    case 'fadeOut': return { alpha: 1 - eo, scale: 1, x: 0, y: 0, rotate: 0 };
    case 'fadeUp': case 'staggerUp': return { alpha: eo, scale: 1, x: 0, y: (1 - eo) * 40, rotate: 0 };
    case 'fadeDown': case 'staggerDown': return { alpha: eo, scale: 1, x: 0, y: -(1 - eo) * 40, rotate: 0 };
    case 'fadeSlide': return { alpha: eo, scale: 1, x: (1 - eo) * -50, y: 0, rotate: 0 };
    case 'slideUp': return { alpha: Math.min(1, p * 3), scale: 1, x: 0, y: (1 - eo) * 60, rotate: 0 };
    case 'slideDown': return { alpha: Math.min(1, p * 3), scale: 1, x: 0, y: -(1 - eo) * 60, rotate: 0 };
    case 'slideLeft': case 'sideEntryLeft': case 'slideFromLeft':
      return { alpha: Math.min(1, p * 3), scale: 1, x: (1 - eo) * -80, y: 0, rotate: 0 };
    case 'slideRight': case 'sideEntryRight': case 'slideFromRight':
      return { alpha: Math.min(1, p * 3), scale: 1, x: (1 - eo) * 80, y: 0, rotate: 0 };
    case 'slideFromTop': case 'firstWordTop': case 'firstTwoTop':
      return { alpha: Math.min(1, p * 3), scale: 1, x: 0, y: -(1 - eo) * 80, rotate: 0 };
    case 'slideFromBottom': case 'firstWordBottom': case 'firstTwoBottom':
      return { alpha: Math.min(1, p * 3), scale: 1, x: 0, y: (1 - eo) * 80, rotate: 0 };
    case 'zoomIn': case 'scaleIn':
      return { alpha: eo, scale: eo, x: 0, y: 0, rotate: 0 };
    case 'zoomOut':
      return { alpha: 1 - eo, scale: 1 + eo * 0.5, x: 0, y: 0, rotate: 0 };
    case 'bounceIn':
      return { alpha: Math.min(1, p * 2), scale: bounceEase(p), x: 0, y: 0, rotate: 0 };
    case 'bounceUp':
      return { alpha: Math.min(1, p * 2), scale: 1, x: 0, y: (1 - bounceEase(p)) * 50, rotate: 0 };
    case 'rotateIn':
      return { alpha: eo, scale: eo * 0.5 + 0.5, x: 0, y: 0, rotate: (1 - eo) * -Math.PI };
    case 'flipX': case 'flipInX':
      return { alpha: Math.min(1, p * 2), scale: Math.max(0.01, Math.abs(Math.cos((1 - eo) * Math.PI / 2))), x: 0, y: 0, rotate: 0 };
    case 'flipY': case 'flipInY': {
      const s = Math.max(0.01, Math.abs(Math.cos((1 - eo) * Math.PI / 2)));
      return { alpha: Math.min(1, p * 2), scale: s, x: 0, y: 0, rotate: 0 };
    }
    case 'elastic': case 'elasticIn':
      return { alpha: Math.min(1, p * 2), scale: elasticEase(p), x: 0, y: 0, rotate: 0 };
    case 'spring': {
      const sp = elasticEase(p);
      return { alpha: Math.min(1, p * 2), scale: sp, x: 0, y: (1 - sp) * 30, rotate: 0 };
    }
    case 'drop':
      return { alpha: Math.min(1, p * 2), scale: 1, x: 0, y: -(1 - bounceEase(p)) * 100, rotate: 0 };
    case 'blurIn':
      return { alpha: eo, scale: 1 + (1 - eo) * 0.2, x: 0, y: 0, rotate: 0 };
    case 'wordByWord': case 'lineByLine': case 'charByChar': case 'typewriter':
      return { alpha: p >= 0.01 ? 1 : 0, scale: 1, x: 0, y: 0, rotate: 0 };
    case 'cascade':
      return { alpha: eo, scale: eo * 0.5 + 0.5, x: 0, y: (1 - eo) * 20, rotate: 0 };
    case 'lineReveal': case 'maskReveal':
      return { alpha: p, scale: 1, x: 0, y: 0, rotate: 0 };
    case 'splitReveal': case 'curtain':
      return { alpha: eo, scale: 1, x: 0, y: (1 - eo) * 30, rotate: 0 };
    case 'scalePop':
      return { alpha: 1, scale: 1 + Math.sin(p * Math.PI) * 0.3 * pop, x: 0, y: 0, rotate: 0 };
    case 'scaleBounce':
      return { alpha: 1, scale: 1 + Math.abs(Math.sin(p * Math.PI * 2)) * 0.2 * pop, x: 0, y: 0, rotate: 0 };
    case 'shake':
      return { alpha: 1, scale: 1, x: Math.sin(p * Math.PI * 10) * 5, y: 0, rotate: 0 };
    case 'float':
      return { alpha: 1, scale: 1, x: 0, y: Math.sin(p * Math.PI * 2) * 10, rotate: 0 };
    case 'rotateBounce':
      return { alpha: 1, scale: 1, x: 0, y: 0, rotate: Math.sin(p * Math.PI * 2) * 0.1 };
    case 'pulse':
      return { alpha: 1, scale: 1 + Math.sin(p * Math.PI * 2) * 0.1, x: 0, y: 0, rotate: 0 };
    case 'swing':
      return { alpha: 1, scale: 1, x: 0, y: 0, rotate: Math.sin(p * Math.PI * 2) * 0.2 };
    case 'wobble':
      return { alpha: 1, scale: 1, x: Math.sin(p * Math.PI * 4) * 10, y: 0, rotate: Math.sin(p * Math.PI * 4) * 0.1 };
    case 'wave':
      return { alpha: 1, scale: 1, x: 0, y: Math.sin(p * Math.PI * 2) * 8, rotate: 0 };
    case 'heartbeat': {
      const hb = Math.sin(p * Math.PI * 2);
      return { alpha: 1, scale: 1 + (hb > 0 ? hb * 0.15 : hb * 0.05), x: 0, y: 0, rotate: 0 };
    }
    case 'flash':
      return { alpha: Math.abs(Math.sin(p * Math.PI * 3)), scale: 1, x: 0, y: 0, rotate: 0 };
    case 'rubberBand': {
      const rb = Math.sin(p * Math.PI * 3) * Math.exp(-p * 2);
      return { alpha: 1, scale: 1 + rb * 0.3, x: rb * 10, y: 0, rotate: 0 };
    }
    case 'jello': {
      const j = Math.sin(p * Math.PI * 4) * Math.exp(-p * 3);
      return { alpha: 1, scale: 1, x: j * 15, y: 0, rotate: j * 0.1 };
    }
    case 'tada': {
      const td = Math.sin(p * Math.PI * 6) * (1 - p);
      return { alpha: 1, scale: 1 + Math.abs(td) * 0.1, x: 0, y: 0, rotate: td * 0.05 };
    }
    case 'glowPulse': case 'glow': case 'neon':
      return { alpha: 0.7 + Math.sin(p * Math.PI * 2) * 0.3, scale: 1 + Math.sin(p * Math.PI * 2) * 0.02, x: 0, y: 0, rotate: 0 };
    case 'sparkle':
      return { alpha: 0.5 + pseudoRand(p * 10 | 0) * 0.5, scale: 0.95 + pseudoRand((p * 10 | 0) + 99) * 0.1, x: 0, y: 0, rotate: 0 };
    case 'glitch': {
      const gv = pseudoRand(p * 15 | 0);
      return { alpha: gv > 0.1 ? 1 : 0.5, scale: 1, x: gv > 0.8 ? (gv - 0.5) * 15 : 0, y: gv > 0.9 ? (gv - 0.5) * 8 : 0, rotate: 0 };
    }
    case 'explode': case 'scatter': {
      const ep = eo;
      return { alpha: 1 - ep, scale: 1 + ep * 2, x: pseudoRand(p + 1) * ep * 60 - 30, y: pseudoRand(p + 2) * ep * 60 - 30, rotate: ep * Math.PI };
    }
    case 'implode': case 'assemble': {
      const ip = eo;
      return { alpha: ip, scale: ip, x: (1 - ip) * pseudoRand(p + 1) * 60 - 30, y: (1 - ip) * pseudoRand(p + 2) * 60 - 30, rotate: (1 - ip) * Math.PI };
    }
    case 'random': {
      const rv = pseudoRand(p * 8 | 0);
      return { alpha: 0.6 + rv * 0.4, scale: 0.85 + rv * 0.3, x: (rv - 0.5) * 8, y: (pseudoRand(rv * 99) - 0.5) * 8, rotate: (rv - 0.5) * 0.15 };
    }
    case 'none':
      return { ...DEF_STYLE };
    default:
      return { ...DEF_STYLE };
  }
}
