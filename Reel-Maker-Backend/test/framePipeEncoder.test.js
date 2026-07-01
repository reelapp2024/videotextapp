const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  FramePipeEncoder,
  FfmpegPipeFailure,
  validateRawvideoArgs,
} = require('../services/framePipeEncoder');
const { getVideoEncodeOptions, testPipeEncoderAtSize } = require('../services/encodeOptions');

describe('FramePipeEncoder diagnostics', () => {
  it('validateRawvideoArgs computes expected RGBA frame bytes', () => {
    const info = validateRawvideoArgs(400, 300, 30);
    assert.equal(info.expectedFrameBytes, 400 * 300 * 4);
    assert.equal(info.rawvideoInput.video_size, '400x300');
  });

  it('rejects missing audio input before spawn', () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reel-ffdiag-'));
    const outputPath = path.join(outDir, 'out.mp4');
    const encoder = new FramePipeEncoder({
      width: 64,
      height: 64,
      fps: 24,
      outputPath,
      videoEncodeOptions: ['-c:v', 'libx264', '-pix_fmt', 'yuv420p'],
      audioInputs: [{ path: path.join(outDir, 'missing-voice.mp3') }],
      audioFilter: { filter: '[1:a]volume=1[voa]', audioLabel: 'voa' },
      audioEncodeOptions: ['-c:a', 'aac'],
    });

    assert.throws(() => encoder.start(), (err) => {
      assert.equal(err.name, 'FfmpegPipeFailure');
      assert.match(err.message, /Audio input file does not exist/);
      return true;
    });

    fs.rmSync(outDir, { recursive: true, force: true });
  });

  it('reports full ffmpeg failure details when encoder init fails', async () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reel-ffdiag-'));
    const outputPath = path.join(outDir, 'out.mp4');
    const w = 64;
    const h = 64;
    const fps = 24;
    const frameBytes = w * h * 4;
    const buf = Buffer.alloc(frameBytes);

    const encoder = new FramePipeEncoder({
      width: w,
      height: h,
      fps,
      outputPath,
      videoEncodeOptions: [
        '-c:v', 'h264_nvenc',
        '-preset', '0',
        '-profile:v', 'baseline',
        '-pix_fmt', 'yuv420p',
      ],
    });

    encoder.start();
    await encoder.writeFrameSync(buf);

    await assert.rejects(
      () => encoder.finish(),
      (err) => {
        assert.equal(err.name, 'FfmpegPipeFailure');
        assert.ok(err.details?.ffmpegCommand);
        assert.ok(err.details?.stderr || err.message.includes('stderr'));
        return true;
      },
    );

    fs.rmSync(outDir, { recursive: true, force: true });
  });
});

describe('encodeOptions runtime pipe probe', () => {
  it('falls back to libx264 when hardware encoder fails at export size', () => {
    const config = {
      video: {
        aspectRatio: '2160x4096',
        fps: 30,
        format: 'mp4',
      },
    };
    const opts = getVideoEncodeOptions(config, { fast: false, width: 2160, height: 4096, fps: 30 });
    const codec = opts.includes('h264_nvenc')
      ? 'h264_nvenc'
      : opts.includes('h264_qsv')
        ? 'h264_qsv'
        : 'libx264';
    const nvencProbe = testPipeEncoderAtSize('h264_nvenc', 2160, 4096, 30, [
      '-preset', '0', '-profile:v', 'baseline', '-b:v', '8000k',
    ]);
    if (!nvencProbe.ok) {
      assert.ok(codec === 'libx264' || codec === 'h264_qsv');
    }
  });
});
