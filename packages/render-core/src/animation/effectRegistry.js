import { computeBuiltinPresetEffect } from './effects/presetEffects.js';
import { computeLineRevealStyle } from './effects/lineRevealEffects.js';

/** @typedef {(p: number, pop?: number) => import('./constants.js').MotionStyle} EffectHandler */

/** @type {Map<string, EffectHandler>} */
const presetHandlers = new Map();

/** @type {Map<string, (params: object) => import('./constants.js').LineAnimStyle>} */
const lineRevealHandlers = new Map();

/**
 * Register a custom preset effect (plugin extension point).
 * @param {string} id
 * @param {EffectHandler} handler
 */
export function registerPresetEffect(id, handler) {
  presetHandlers.set(id, handler);
}

/**
 * Register a custom line-reveal effect.
 * @param {string} id
 * @param {(params: object) => import('./constants.js').LineAnimStyle} handler
 */
export function registerLineRevealEffect(id, handler) {
  lineRevealHandlers.set(id, handler);
}

/**
 * @param {string} effectId
 * @param {number} p
 * @param {number} [pop]
 */
export function computePresetEffect(effectId, p, pop = 1) {
  const custom = presetHandlers.get(effectId);
  if (custom) return custom(p, pop);
  return computeBuiltinPresetEffect(effectId, p, pop);
}

/**
 * @param {string} effectId
 * @param {object} params
 */
export function computeLineRevealEffect(effectId, params) {
  const custom = lineRevealHandlers.get(effectId);
  if (custom) return custom(params);
  return computeLineRevealStyle({ ...params, animEffect: effectId });
}

export function listRegisteredPresetEffects() {
  return [...presetHandlers.keys()];
}

export function listRegisteredLineRevealEffects() {
  return [...lineRevealHandlers.keys()];
}
