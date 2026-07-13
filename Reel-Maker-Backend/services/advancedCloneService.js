/**
 * Custom voice reference — analyze + match FX (works without XTTS).
 * Full XTTS clone when FastAPI worker has model; otherwise timbre-match pipeline.
 */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const { getFfmpegPath } = require('./encodeOptions');

const CLONE_DIR = path.join(__dirname, '../uploads/clones');

function ensureCloneDir() {
  if (!fs.existsSync(CLONE_DIR)) fs.mkdirSync(CLONE_DIR, { recursive: true });
}

function runFfmpeg(args) {
  const ffmpeg = getFfmpegPath();
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpeg, args, { windowsHide: true });
    let err = '';
    child.stderr.on('data', (d) => {
      err += d.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve(err);
      else reject(new Error(`ffmpeg ${code}: ${err.slice(-400)}`));
    });
  });
}

/**
 * Normalize upload to wav + extract rough brightness/loudness profile from ffmpeg stats.
 */
async function saveAndAnalyzeClone(tempPath, originalName = 'ref.wav') {
  ensureCloneDir();
  const cloneId = uuidv4();
  const outWav = path.join(CLONE_DIR, `${cloneId}.wav`);
  const metaPath = path.join(CLONE_DIR, `${cloneId}.json`);

  await runFfmpeg([
    '-y',
    '-i', tempPath,
    '-ac', '1',
    '-ar', '24000',
    '-c:a', 'pcm_s16le',
    outWav,
  ]);

  // Probe volume / spectral feel via volumedetect + astats
  let log = '';
  try {
    log = await runFfmpeg([
      '-i', outWav,
      '-af', 'volumedetect,astats=metadata=1:reset=1',
      '-f', 'null',
      '-',
    ]);
  } catch (e) {
    log = e.message || '';
  }

  const meanMatch = log.match(/mean_volume:\s*([-\d.]+)/i);
  const maxMatch = log.match(/max_volume:\s*([-\d.]+)/i);
  const rmsMatch = log.match(/RMS level dB:\s*([-\d.]+)/i);
  const peakMatch = log.match(/Peak level dB:\s*([-\d.]+)/i);

  const meanDb = meanMatch ? parseFloat(meanMatch[1]) : -20;
  const maxDb = maxMatch ? parseFloat(maxMatch[1]) : -3;
  const rmsDb = rmsMatch ? parseFloat(rmsMatch[1]) : meanDb;

  // Heuristic: quieter refs → whisper-ish; brighter peak → more treble
  const brightness = Math.min(1, Math.max(0, (maxDb + 20) / 25));
  const warmth = Math.min(1, Math.max(0, (-rmsDb - 10) / 30));
  // Map loudness to pitch bias (deeper voices often lower energy in highs)
  const pitchBias = 0.85 + warmth * 0.25 - brightness * 0.12;

  const profile = {
    cloneId,
    fileName: originalName,
    wavPath: outWav,
    createdAt: new Date().toISOString(),
    meanDb,
    maxDb,
    rmsDb,
    brightness,
    warmth,
    pitchBias: Math.min(1.25, Math.max(0.75, pitchBias)),
    trebleGain: (brightness - 0.4) * 4,
    bassGain: (warmth - 0.3) * 3.5,
    volumeMul: meanDb < -28 ? 1.25 : meanDb > -12 ? 0.9 : 1.05,
  };

  fs.writeFileSync(metaPath, JSON.stringify(profile, null, 2));
  return profile;
}

function loadCloneProfile(cloneId) {
  if (!cloneId) return null;
  const metaPath = path.join(CLONE_DIR, `${cloneId}.json`);
  if (!fs.existsSync(metaPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  } catch (_) {
    return null;
  }
}

/**
 * Apply clone-match FX on top of Advanced TTS output.
 */
async function applyCloneMatchFx(inputPath, profile) {
  if (!profile || !inputPath || !fs.existsSync(inputPath)) {
    return { applied: false };
  }

  const ffmpeg = getFfmpegPath();
  const ext = path.extname(inputPath) || '.mp3';
  const tmp = inputPath.replace(new RegExp(`\\${ext}$`, 'i'), `.clone${ext}`);

  const pitch = profile.pitchBias || 1;
  const rate = Math.round(44100 * pitch);
  const treble = Number.isFinite(profile.trebleGain) ? profile.trebleGain : 0;
  const bass = Number.isFinite(profile.bassGain) ? profile.bassGain : 0;
  const vol = profile.volumeMul || 1;

  const filter = [
    'aresample=44100',
    `asetrate=${rate}`,
    'aresample=44100',
    `treble=g=${treble.toFixed(2)}`,
    `bass=g=${bass.toFixed(2)}`,
    `volume=${vol.toFixed(3)}`,
    'acompressor=threshold=-18dB:ratio=2.8:attack=8:release=90',
    'loudnorm=I=-15:TP=-1.2:LRA=10',
  ].join(',');

  await new Promise((resolve, reject) => {
    const child = spawn(
      ffmpeg,
      ['-y', '-i', inputPath, '-af', filter, '-c:a', ext === '.wav' ? 'pcm_s16le' : 'libmp3lame', '-q:a', '2', tmp],
      { windowsHide: true }
    );
    let err = '';
    child.stderr.on('data', (d) => {
      err += d.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0 && fs.existsSync(tmp) && fs.statSync(tmp).size > 80) resolve();
      else reject(new Error(`clone FX failed: ${err.slice(-300)}`));
    });
  });

  try {
    fs.unlinkSync(inputPath);
  } catch (_) {}
  fs.renameSync(tmp, inputPath);
  return { applied: true, cloneId: profile.cloneId };
}

module.exports = {
  CLONE_DIR,
  saveAndAnalyzeClone,
  loadCloneProfile,
  applyCloneMatchFx,
  ensureCloneDir,
};
