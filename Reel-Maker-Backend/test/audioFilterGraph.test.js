const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const {
  buildAudioFilterForPipe,
  buildDurationFitFilters,
  FramePipeEncoder,
} = require('../services/framePipeEncoder');
const { getVideoEncodeOptions } = require('../services/encodeOptions');

const FFMPEG = ffmpegInstaller.path;
const FFPROBE = require('@ffprobe-installer/ffprobe').path;

function probeDuration(filePath) {
  const r = spawnSync(FFPROBE, [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    filePath,
  ], { encoding: 'utf8' });
  return parseFloat(r.stdout.trim());
}

function encodeWithAudioFilter({ audioPath, durationSec, fps = 24, frames = 48 }) {
  const w = 64;
  const h = 64;
  const bytes = w * h * 4;
  const buf = Buffer.alloc(bytes);
  const audioFilter = buildAudioFilterForPipe(false, true, false, 0, 0.5, 0, 1, durationSec, 48000);
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reel-audio-filter-'));
  const outputPath = path.join(outDir, 'out.mp4');

  const encoder = new FramePipeEncoder({
    width: w,
    height: h,
    fps,
    outputPath,
    videoEncodeOptions: ['-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-r', String(fps)],
    audioEncodeOptions: ['-c:a', 'aac', '-ar', '48000'],
    audioInputs: [{ path: audioPath }],
    audioFilter,
  });

  encoder.start();
  const writeAll = async () => {
    for (let i = 0; i < frames; i++) {
      await encoder.writeFrameSync(buf);
    }
    return encoder.finish();
  };

  return { outDir, outputPath, writeAll, audioFilter, expectedVideoDur: frames / fps };
}

describe('buildAudioFilterForPipe compatibility', () => {
  it('does not use apad=whole_dur (FFmpeg 5+ only)', () => {
    const result = buildAudioFilterForPipe(false, true, false, 0, 0.5, 0, 1, 26.044, 48000);
    assert.ok(result);
    assert.doesNotMatch(result.filter, /whole_dur/);
    assert.match(result.filter, /apad=whole_len=/);
    assert.match(result.filter, /atrim=0:26\.044/);
    assert.equal(result.audioLabel, 'aout');
  });

  it('buildDurationFitFilters uses whole_len samples', () => {
    const fit = buildDurationFitFilters(2, 48000);
    assert.equal(fit, 'apad=whole_len=96000,atrim=0:2.000');
  });

  it('codec selection log matches ffmpeg -c:v argument', () => {
    const config = { video: { aspectRatio: '400x300', fps: 24, format: 'mp4' } };
    const opts = getVideoEncodeOptions(config, { fast: false, width: 400, height: 300, fps: 24 });
    const idx = opts.indexOf('-c:v');
    const codec = opts[idx + 1];
    assert.ok(['h264_nvenc', 'h264_qsv', 'libx264'].includes(codec));
  });
});

describe('audio filter regression (bundled FFmpeg)', () => {
  const testDir = path.join(os.tmpdir(), 'reel-audio-regression');
  fs.mkdirSync(testDir, { recursive: true });

  function makeAudio(seconds, name) {
    const p = path.join(testDir, name);
    spawnSync(FFMPEG, [
      '-hide_banner', '-loglevel', 'error',
      '-f', 'lavfi', '-i', `sine=frequency=440:duration=${seconds}`,
      '-y', p,
    ]);
    return p;
  }

  it('Case 1: audio shorter than video — padded to video duration', async () => {
    const audio = makeAudio(2, 'short.mp3');
    const expectedDur = 2;
    const fps = 24;
    const frames = Math.ceil(expectedDur * fps);
    const { outputPath, writeAll, outDir } = encodeWithAudioFilter({
      audioPath: audio,
      durationSec: expectedDur,
      fps,
      frames,
    });
    await writeAll();
    assert.ok(fs.existsSync(outputPath));
    const dur = probeDuration(outputPath);
    assert.ok(Math.abs(dur - expectedDur) < 0.15, `expected ~${expectedDur}s got ${dur}s`);
    fs.rmSync(outDir, { recursive: true, force: true });
  });

  it('Case 2: audio longer than video — trimmed to video duration', async () => {
    const audio = makeAudio(10, 'long.mp3');
    const expectedDur = 2;
    const fps = 24;
    const frames = Math.ceil(expectedDur * fps);
    const { outputPath, writeAll, outDir } = encodeWithAudioFilter({
      audioPath: audio,
      durationSec: expectedDur,
      fps,
      frames,
    });
    await writeAll();
    const dur = probeDuration(outputPath);
    assert.ok(Math.abs(dur - expectedDur) < 0.15, `expected ~${expectedDur}s got ${dur}s`);
    fs.rmSync(outDir, { recursive: true, force: true });
  });

  it('Case 3: audio matches video duration', async () => {
    const expectedDur = 2;
    const audio = makeAudio(expectedDur, 'equal.mp3');
    const fps = 24;
    const frames = Math.ceil(expectedDur * fps);
    const { outputPath, writeAll, outDir } = encodeWithAudioFilter({
      audioPath: audio,
      durationSec: expectedDur,
      fps,
      frames,
    });
    await writeAll();
    const dur = probeDuration(outputPath);
    assert.ok(Math.abs(dur - expectedDur) < 0.15, `expected ~${expectedDur}s got ${dur}s`);
    fs.rmSync(outDir, { recursive: true, force: true });
  });

  it('Case 4: no audio — video only export', async () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reel-no-audio-'));
    const outputPath = path.join(outDir, 'out.mp4');
    const w = 64;
    const h = 64;
    const fps = 24;
    const frames = 24;
    const buf = Buffer.alloc(w * h * 4);
    const encoder = new FramePipeEncoder({
      width: w,
      height: h,
      fps,
      outputPath,
      videoEncodeOptions: ['-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-r', String(fps)],
    });
    encoder.start();
    for (let i = 0; i < frames; i++) {
      await encoder.writeFrameSync(buf);
    }
    await encoder.finish();
    assert.ok(fs.existsSync(outputPath));
    fs.rmSync(outDir, { recursive: true, force: true });
  });
});
