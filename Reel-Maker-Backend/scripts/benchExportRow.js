/* Benchmark one export row through the real pipeline. Usage: node scripts/benchExportRow.js [--sw] */
require('dotenv').config();
const path = require('path');

const forceSw = process.argv.includes('--sw');
if (forceSw) process.env.EXPORT_FORCE_SOFTWARE = 'true';

const { processOneRowWithSharedRenderer } = require('../services/serverExportRow');

const config = {
  video: {
    aspectRatio: '1080x1920',
    fps: 30,
    frameRateMode: 'manual',
    format: 'mp4',
    quality: 'high',
  },
  background: { type: 'solid', solidColor: '#101020' },
  overlays: [
    {
      enabled: true,
      text: 'This is a benchmark caption line',
      fontFamily: 'Arial',
      fontSize: 64,
      color: '#ffffff',
      positionY: 70,
      animation: 'fade',
    },
  ],
};

const inputFile = process.env.BENCH_INPUT || 'bench5s.mp4';

(async () => {
  const t0 = Date.now();
  const res = await processOneRowWithSharedRenderer({
    videoPath: path.resolve(__dirname, `../uploads/test-encode/${inputFile}`),
    imageBgPath: null,
    voicePath: null,
    musicPath: null,
    row: { text: 'This is a benchmark caption line' },
    outputPath: path.resolve(__dirname, `../uploads/test-encode/bench_out_${forceSw ? 'sw' : 'hw'}.mp4`),
    videoVol: 1,
    voiceVol: 1,
    musicVol: 1,
    w: 1080,
    h: 1920,
    fps: 30,
    rowIndex: 0,
    config,
    hasVideoAudio: true,
    segments: [],
    jobId: 'bench',
  });
  console.log('WALL_MS', Date.now() - t0);
  console.log('RESULT', JSON.stringify({
    totalFrames: res.totalFrames,
    avgFrameRenderMs: res.avgFrameRenderMs,
    renderFps: res.renderFps,
    encodeFps: res.encodeFps,
    durationSec: res.durationSec,
  }, null, 2));
  process.exit(0);
})().catch((e) => { console.error('BENCH FAILED:', e); process.exit(1); });
