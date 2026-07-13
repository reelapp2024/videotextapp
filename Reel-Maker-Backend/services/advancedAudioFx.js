/**
 * Advanced TTS studio FX — production-safe for Piper mono WAV (22.05 kHz).
 * Always forces mono channel layout so aresample never fails.
 */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { getFfmpegPath } = require('./encodeOptions');
const { ACCENT_FX_BIAS } = require('./advancedTtsMap');

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

/** FFmpeg atempo only accepts 0.5–2.0; chain segments if needed */
function atempoChain(rate) {
  let r = clamp(Number(rate) || 1, 0.25, 4);
  const parts = [];
  while (r > 2.0 + 1e-6) {
    parts.push('atempo=2.0');
    r /= 2;
  }
  while (r < 0.5 - 1e-6) {
    parts.push('atempo=0.5');
    r /= 0.5;
  }
  if (Math.abs(r - 1) > 0.008) parts.push(`atempo=${r.toFixed(4)}`);
  return parts;
}

function buildAdvancedAfFilter(opts = {}) {
  const emotion = opts.emotion || 'vocal_smile';
  const emotionAmt = clamp(Number(opts.emotionAmt) || 0.72, 0, 1);
  const precision = opts.precision || 'studio';
  const stability = clamp(Number(opts.stability) || 0.55, 0, 1);
  const temperature = clamp(Number(opts.temperature) || 0.85, 0.1, 1.5);
  const sampleRate = String(opts.sampleRate || '22050');
  const accent = opts.accent || 'American (Gen)';
  const bias = ACCENT_FX_BIAS[accent] || ACCENT_FX_BIAS['American (Gen)'];
  const paceId = opts.paceId || 'natural';
  const e = Math.max(0.4, emotionAmt);

  const parts = [];

  // Normalize Piper mono PCM → 44.1k mono (fixes channel-layout failures)
  parts.push('aformat=sample_fmts=fltp:channel_layouts=mono');
  parts.push('aresample=44100:ocl=mono');

  // Combined pitch (prosody) + accent formant in ONE asetrate
  const pitch = clamp(Number(opts.pitch) || 1, 0.55, 1.85);
  const formant = clamp(Number(bias.formant) || 1, 0.88, 1.14);
  const rateMul = pitch * formant;
  if (Math.abs(rateMul - 1) > 0.015) {
    parts.push(`asetrate=${Math.round(44100 * rateMul)}`);
    parts.push('aformat=channel_layouts=mono');
    parts.push('aresample=44100:ocl=mono');
  }

  // Accent EQ signature
  parts.push(`treble=g=${(bias.treble * (0.55 + 0.45 * e)).toFixed(2)}`);
  parts.push(`bass=g=${(bias.bass * (0.55 + 0.45 * e)).toFixed(2)}`);
  if (bias.air) {
    parts.push(`equalizer=f=5200:t=q:w=1.1:g=${(1.6 * bias.air * e).toFixed(2)}`);
    parts.push(`equalizer=f=2500:t=q:w=0.9:g=${(1.1 * bias.air * e).toFixed(2)}`);
  }

  let tempo = clamp(Number(bias.tempo) || 1, 0.7, 1.25);

  // Accent-specific character (keep light — neural dialect does the heavy lifting)
  if (accent === 'Indian English') {
    // SPICOR en_IN is female-trained; drop pitch for male / elder male slots
    const vt = opts.voiceType || 'female';
    if (vt === 'male' || vt === 'old') {
      parts.push('asetrate=' + Math.round(44100 * (vt === 'old' ? 0.82 : 0.88)));
      parts.push('aformat=channel_layouts=mono');
      parts.push('aresample=44100:ocl=mono');
      tempo *= vt === 'old' ? 0.94 : 0.97;
    } else if (vt === 'children') {
      parts.push('asetrate=' + Math.round(44100 * 1.12));
      parts.push('aformat=channel_layouts=mono');
      parts.push('aresample=44100:ocl=mono');
      tempo *= 1.04;
    }
    // Mild presence — do NOT vibrato/garble the neural Indian accent
    parts.push(`equalizer=f=2200:t=q:w=1.0:g=${(0.9 * e).toFixed(2)}`);
    parts.push(`equalizer=f=4500:t=q:w=1.1:g=${(0.7 * e).toFixed(2)}`);
    tempo *= 0.99;
  } else if (accent === 'British (RP)' || accent === 'British (Brixton)') {
    parts.push(`equalizer=f=1500:t=q:w=1.0:g=${(1.2 * e).toFixed(2)}`);
    parts.push('highpass=f=75');
  } else if (accent === 'American (South)') {
    parts.push(`aecho=0.4:0.3:${Math.round(35 + 15 * e)}:0.18`);
  } else if (accent === 'American (Valley)') {
    parts.push(`equalizer=f=4000:t=q:w=1.2:g=${(1.8 * e).toFixed(2)}`);
  } else if (accent === 'Australian') {
    parts.push(`equalizer=f=2800:t=q:w=1.0:g=${(1.3 * e).toFixed(2)}`);
  }

  // Delivery style
  switch (emotion) {
    case 'whisper':
      parts.push(`volume=${(0.5 + 0.15 * (1 - e)).toFixed(3)}`);
      parts.push(`lowpass=f=${Math.round(2600 - 800 * e)}`);
      parts.push(`highpass=f=${Math.round(160 + 80 * e)}`);
      break;
    case 'newscaster':
      parts.push(`volume=${(1.06 + 0.08 * e).toFixed(3)}`);
      parts.push('highpass=f=85');
      parts.push(`equalizer=f=1800:t=q:w=1.0:g=${(1.5 * e).toFixed(2)}`);
      parts.push(`equalizer=f=4000:t=q:w=1.0:g=${(1.1 * e).toFixed(2)}`);
      parts.push('acompressor=threshold=-17dB:ratio=3:attack=8:release=80');
      tempo *= 1.02 + 0.015 * e;
      break;
    case 'hype':
      parts.push(`volume=${(1.1 + 0.18 * e).toFixed(3)}`);
      parts.push(`treble=g=${(2.8 * e).toFixed(2)}`);
      parts.push(`equalizer=f=4500:t=q:w=1.1:g=${(2.0 * e).toFixed(2)}`);
      parts.push('acompressor=threshold=-16dB:ratio=3.2:attack=5:release=55');
      tempo *= 1 + 0.05 * e;
      break;
    case 'empathetic':
      parts.push(`bass=g=${(2.0 * e).toFixed(2)}`);
      parts.push(`aecho=0.5:0.35:${Math.round(45 + 30 * e)}:0.25`);
      tempo *= 1 - 0.08 * e;
      break;
    case 'deadpan':
      parts.push(`treble=g=${(-2.2 * e).toFixed(2)}`);
      parts.push('acompressor=threshold=-20dB:ratio=4.5:attack=20:release=120');
      tempo *= 0.97 - 0.03 * e;
      break;
    case 'character':
      parts.push(`vibrato=f=${(4.5 + 2.5 * e).toFixed(2)}:d=${(0.1 * e * (1.2 - stability)).toFixed(3)}`);
      parts.push(`tremolo=f=${(3 + e).toFixed(2)}:d=${(0.08 * e).toFixed(3)}`);
      break;
    case 'vocal_smile':
    default:
      parts.push(`treble=g=${(2.0 * e).toFixed(2)}`);
      parts.push(`equalizer=f=3000:t=q:w=1.0:g=${(1.7 * e).toFixed(2)}`);
      parts.push(`equalizer=f=5200:t=q:w=1.1:g=${(1.2 * e).toFixed(2)}`);
      tempo *= 1 + 0.025 * e;
      break;
  }

  // Pace — lighter here because Piper length_scale already got prosody.rate
  if (paceId === 'rapid_fire') {
    tempo *= 1.06;
    parts.push('acompressor=threshold=-15dB:ratio=3.5:attack=4:release=45');
  } else if (paceId === 'the_drift') {
    tempo *= 0.94;
    parts.push('aecho=0.45:0.35:70:0.2');
  } else if (paceId === 'staccato') {
    tempo *= 0.98;
    parts.push('acompressor=threshold=-14dB:ratio=4.5:attack=2:release=28');
    parts.push('treble=g=1.2');
  }

  parts.push(...atempoChain(tempo));

  if (temperature > 0.75) {
    parts.push(`equalizer=f=2700:t=q:w=0.9:g=${((temperature - 0.75) * 3.5).toFixed(2)}`);
  }

  // Precision / output
  // preview = full accent/style/pace character, skip loudnorm (2-pass = slow)
  if (precision === 'preview') {
    parts.push('highpass=f=70');
    parts.push('lowpass=f=14000');
    parts.push('acompressor=threshold=-18dB:ratio=2.0:attack=10:release=80');
    parts.push('volume=1.05');
  } else if (precision === 'studio') {
    parts.push('highpass=f=60');
    parts.push('lowpass=f=15000');
    parts.push('acompressor=threshold=-18dB:ratio=2.2:attack=12:release=90');
    parts.push('loudnorm=I=-14:TP=-1.0:LRA=9');
  } else if (precision === 'draft') {
    parts.push('volume=0.96');
  } else {
    // balanced — light loudnorm for final-ish quality without full studio cost
    parts.push('highpass=f=65');
    parts.push('acompressor=threshold=-18dB:ratio=2.0:attack=10:release=85');
    parts.push('volume=1.02');
  }

  const outSr = precision === 'draft' ? '16000' : sampleRate || '22050';
  parts.push('aformat=channel_layouts=mono');
  parts.push(`aresample=${outSr}:ocl=mono`);

  return parts.filter(Boolean).join(',');
}

/** Minimal safe FX if full chain fails */
function buildFallbackAfFilter(opts = {}) {
  const accent = opts.accent || 'American (Gen)';
  const bias = ACCENT_FX_BIAS[accent] || ACCENT_FX_BIAS['American (Gen)'];
  const paceId = opts.paceId || 'natural';
  const pitch = clamp(Number(opts.pitch) || 1, 0.7, 1.4);
  const parts = [
    'aformat=sample_fmts=fltp:channel_layouts=mono',
    'aresample=22050:ocl=mono',
    `treble=g=${(bias.treble * 0.7).toFixed(2)}`,
    `bass=g=${(bias.bass * 0.7).toFixed(2)}`,
  ];
  if (Math.abs(pitch - 1) > 0.03) {
    parts.push(`asetrate=${Math.round(22050 * pitch)}`);
    parts.push('aformat=channel_layouts=mono');
    parts.push('aresample=22050:ocl=mono');
  }
  let tempo = bias.tempo || 1;
  if (paceId === 'rapid_fire') tempo *= 1.15;
  if (paceId === 'the_drift') tempo *= 0.85;
  parts.push(...atempoChain(tempo));
  parts.push('aformat=channel_layouts=mono');
  return parts.join(',');
}

function runFfmpegAf(inputPath, filter, tmpPath) {
  const ffmpeg = getFfmpegPath();
  const ext = path.extname(inputPath) || '.wav';
  return new Promise((resolve, reject) => {
    const args = [
      '-hide_banner',
      '-y',
      '-i',
      inputPath,
      '-af',
      filter,
      '-c:a',
      ext.toLowerCase() === '.wav' ? 'pcm_s16le' : 'libmp3lame',
      '-ar',
      '22050',
      '-ac',
      '1',
      '-q:a',
      '2',
      tmpPath,
    ];
    const child = spawn(ffmpeg, args, { windowsHide: true });
    let err = '';
    child.stderr.on('data', (d) => {
      err += d.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0 && fs.existsSync(tmpPath) && fs.statSync(tmpPath).size > 80) resolve({ filter });
      else reject(new Error(`Advanced FX ffmpeg failed (${code}): ${err.slice(-600)}`));
    });
  });
}

async function applyAdvancedAudioFx(inputPath, opts = {}) {
  if (!inputPath || !fs.existsSync(inputPath)) {
    throw new Error('Advanced FX: input missing');
  }

  const ext = path.extname(inputPath) || '.wav';
  const tmp = inputPath.replace(new RegExp(`\\${ext}$`, 'i'), `.advfx${ext}`);

  let filter = buildAdvancedAfFilter(opts);
  let appliedFilter = filter;
  try {
    await runFfmpegAf(inputPath, filter, tmp);
  } catch (e1) {
    console.warn('[advanced-fx] full chain failed, trying fallback:', e1.message?.slice(0, 180));
    filter = buildFallbackAfFilter(opts);
    appliedFilter = filter;
    await runFfmpegAf(inputPath, filter, tmp);
  }

  try {
    fs.unlinkSync(inputPath);
  } catch (_) {}
  fs.renameSync(tmp, inputPath);
  return {
    outputPath: inputPath,
    filter: appliedFilter,
    applied: true,
    accent: opts.accent,
    emotion: opts.emotion,
    paceId: opts.paceId,
  };
}

module.exports = {
  buildAdvancedAfFilter,
  buildFallbackAfFilter,
  applyAdvancedAudioFx,
};
