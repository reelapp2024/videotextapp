import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createAnimationEngine } from '../src/animation/animationEngine.js';
import { computePresetEffect } from '../src/animation/effectRegistry.js';
import { DEF_STYLE } from '../src/animation/constants.js';

describe('animationEngine', () => {
  it('returns DEF_STYLE when animation preset is none', () => {
    const engine = createAnimationEngine({
      overlay: { animationPreset: 'none', kineticEffect: 'none' },
      baseOverlay: {},
      videoTime: 1,
      videoDuration: 10,
      captionWordsFlat: null,
      allWords: ['hello', 'world'],
      lines: ['hello world'],
      lineAnimEnabled: false,
      revealMode: 'wordByWord',
      contentLineAnimSpeed: 2,
      partStartTime: 0,
      animEffect: 'fadeIn',
    });
    const style = engine.getAnimationStyle(0, 0);
    assert.deepEqual(style, DEF_STYLE);
  });

  it('fadeIn at p=0.5 produces eased alpha', () => {
    const direct = computePresetEffect('fadeIn', 0.5);
    assert.ok(direct.alpha > 0.4 && direct.alpha < 1);
    assert.equal(direct.scale, 1);
  });

  it('getLineAnimStyleForWord returns hidden before reveal', () => {
    const engine = createAnimationEngine({
      overlay: {},
      baseOverlay: {},
      videoTime: 0,
      videoDuration: 10,
      captionWordsFlat: null,
      allWords: ['a', 'b'],
      lines: ['a b'],
      lineAnimEnabled: true,
      revealMode: 'wordByWord',
      contentLineAnimSpeed: 2,
      partStartTime: 0,
      animEffect: 'fadeIn',
    });
    const hidden = engine.getLineAnimStyleForWord(5, 3, 0, 0);
    assert.equal(hidden.alpha, 0);
  });
});
