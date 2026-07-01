const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { resolveExportFormat } = require('../services/exportFormat');

function computeExportFrames(durationSec, fps, exportSpeed = 1) {
  const outputDuration = Math.max(durationSec / exportSpeed, 1 / fps);
  return Math.max(1, Math.ceil(outputDuration * fps));
}

describe('export FPS (production stabilization)', () => {
  it('defaults to mp4 container', () => {
    assert.equal(resolveExportFormat({}).ext, 'mp4');
    assert.equal(resolveExportFormat({ video: {} }).container, 'mp4');
  });

  it('respects explicit format from export settings', () => {
    assert.equal(resolveExportFormat({ video: { format: 'webm' } }).ext, 'webm');
    assert.equal(resolveExportFormat({ video: { format: 'mp4' } }).ext, 'mp4');
  });

  it('frame count = ceil(duration * fps) at speed 1', () => {
    assert.equal(computeExportFrames(10, 30, 1), 300);
    assert.equal(computeExportFrames(1, 24, 1), 24);
    assert.equal(computeExportFrames(10, 60, 1), 600);
  });

  it('frame count scales with export speed', () => {
    assert.equal(computeExportFrames(10, 30, 2), 150);
    assert.equal(computeExportFrames(10, 30, 0.5), 600);
  });

  it('frame timestamps are deterministic', () => {
    const fps = 30;
    const frames = computeExportFrames(2, fps, 1);
    const times = Array.from({ length: frames }, (_, i) => i / fps);
    assert.equal(times[0], 0);
    assert.equal(times[59], 59 / 30);
    assert.ok(Math.abs(times[times.length - 1] - (frames - 1) / fps) < 1e-9);
  });
});
