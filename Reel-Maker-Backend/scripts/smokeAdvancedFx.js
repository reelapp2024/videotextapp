/** Smoke-test Advanced FX on a Piper-like mono WAV */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { getFfmpegPath } = require('../services/encodeOptions');
const { applyAdvancedAudioFx, buildAdvancedAfFilter } = require('../services/advancedAudioFx');

async function makeTone(out) {
  const ffmpeg = getFfmpegPath();
  await new Promise((resolve, reject) => {
    const args = [
      '-y', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=1.2',
      '-ac', '1', '-ar', '22050', '-c:a', 'pcm_s16le', out,
    ];
    const c = spawn(ffmpeg, args, { windowsHide: true });
    let err = '';
    c.stderr.on('data', (d) => { err += d; });
    c.on('close', (code) => (code === 0 ? resolve() : reject(new Error(err.slice(-300)))));
  });
}

(async () => {
  const dir = path.join(__dirname, '../uploads/processed');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const wav = path.join(dir, '_fx_smoke.wav');
  await makeTone(wav);
  console.log('filter preview', buildAdvancedAfFilter({
    accent: 'Indian English', emotion: 'newscaster', paceId: 'rapid_fire', pitch: 1.1, emotionAmt: 0.85, precision: 'studio', sampleRate: '22050',
  }).slice(0, 120) + '...');
  const r = await applyAdvancedAudioFx(wav, {
    accent: 'Indian English',
    emotion: 'newscaster',
    paceId: 'the_drift',
    pitch: 1.12,
    emotionAmt: 0.85,
    precision: 'studio',
    sampleRate: '22050',
  });
  console.log('FX OK', r.applied, 'size', fs.statSync(wav).size);
})().catch((e) => {
  console.error('FX FAIL', e.message);
  process.exit(1);
});
