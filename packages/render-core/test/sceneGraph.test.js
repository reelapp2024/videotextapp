import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createSceneRoot,
  createText,
  createRect,
  mergeTransform,
} from '../src/types/sceneGraph.js';
import { buildRowBasedTextScene } from '../src/renderers/TextRenderer.js';
import { isRenderCoreTextEnabled } from '../src/config/featureFlags.js';
import { canUseRenderCoreStaticLine } from '../src/renderers/canUseRenderCoreText.js';
import { scheduleFrame } from '../src/schedule/frameScheduler.js';

describe('sceneGraph', () => {
  it('creates a scene root with children', () => {
    const root = createSceneRoot([
      createRect({ x: 0, y: 0, width: 10, height: 10, style: { fill: '#000' } }),
      createText({ text: 'Hi', x: 5, y: 5, style: { fill: '#fff' } }),
    ]);
    assert.equal(root.type, 'group');
    assert.equal(root.children.length, 2);
    assert.equal(root.children[1].text, 'Hi');
  });

  it('mergeTransform applies defaults', () => {
    const t = mergeTransform({ x: 10, opacity: 0.5 });
    assert.equal(t.x, 10);
    assert.equal(t.scaleX, 1);
    assert.equal(t.opacity, 0.5);
  });
});

describe('frameScheduler', () => {
  it('pass-through returns same root in M3', () => {
    const root = createSceneRoot([]);
    assert.equal(scheduleFrame(root), root);
  });
});

describe('TextRenderer', () => {
  it('buildRowBasedTextScene produces text nodes per line', () => {
    const measureCtx = {
      measureText(s) {
        return { width: s.length * 8 };
      },
    };
    const scene = buildRowBasedTextScene({
      overlay: {
        enabled: true,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fontSize: 5,
        color: '#fff',
        positionY: 50,
        positionX: 50,
        wordsPerLine: 4,
        textAlign: 'center',
      },
      rawText: 'Hello world',
      width: 1080,
      height: 1920,
      measureCtx,
    });
    const textNodes = scene.children.filter((c) => c.type === 'text');
    assert.ok(textNodes.length >= 1);
    assert.equal(textNodes[0].textDrawOrder, 'fillThenStroke');
  });
});

describe('canUseRenderCoreStaticLine', () => {
  it('rejects when captions active', () => {
    // Flag off in test env — still test eligibility logic via direct overlay checks
    const overlay = { animationLogic: 'default', colorLogic: 'none' };
    assert.equal(
      canUseRenderCoreStaticLine(overlay, { overlayCaptionActive: true }),
      false,
    );
  });
});

describe('feature flag', () => {
  it('is off by default in node test env', () => {
    assert.equal(isRenderCoreTextEnabled(), false);
  });
});
