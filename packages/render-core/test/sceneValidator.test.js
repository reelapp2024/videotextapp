import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createSceneRoot, createText, createRect } from '../src/types/sceneGraph.js';
import { validateScene } from '../src/validation/sceneValidator.js';

describe('sceneValidator', () => {
  it('rejects NaN coordinates', () => {
    const scene = createSceneRoot([
      createText({ text: 'Hi', x: NaN, y: 10, style: { font: 'bold 12px Arial', fill: '#fff' } }),
    ]);
    const result = validateScene(scene, { width: 100, height: 100 });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('NaN')));
  });

  it('warns on empty text', () => {
    const scene = createSceneRoot([
      createText({ text: '', x: 0, y: 0, style: { font: 'bold 12px Arial', fill: '#fff' } }),
    ]);
    const result = validateScene(scene, { width: 100, height: 100 });
    assert.equal(result.valid, true);
    assert.ok(result.warnings.length > 0);
  });

  it('rejects negative rect dimensions', () => {
    const scene = createSceneRoot([
      createRect({ x: 0, y: 0, width: -5, height: 10, style: { fill: '#000' } }),
    ]);
    const result = validateScene(scene, { width: 100, height: 100 });
    assert.equal(result.valid, false);
  });
});
