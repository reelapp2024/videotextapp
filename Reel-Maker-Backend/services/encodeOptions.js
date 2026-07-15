/**
 * Hardware Encoder Auto-Detection & Optimal Video Encoding Configuration
 * 
 * Supports:
 * - NVIDIA NVENC (Windows/Linux)
 * - Intel Quick Sync Video (Windows/Linux)
 * - AMD AMF/VCE (Windows)
 * - VAAPI (Linux - Intel/AMD)
 * - Software fallback (libx264)
 * 
 * Auto-detects best available encoder on startup.
 * Env variables are OPTIONAL overrides only.
 */

const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Try to use system FFmpeg first (better GPU support), fallback to bundled
let FFMPEG_PATH;
let FFMPEG_SOURCE = 'bundled';

function findSystemFfmpeg() {
  const isWindows = process.platform === 'win32';
  const possiblePaths = isWindows
    ? [
        'C:\\ffmpeg\\bin\\ffmpeg.exe',
        'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
        'C:\\Program Files (x86)\\ffmpeg\\bin\\ffmpeg.exe',
        path.join(process.env.LOCALAPPDATA || '', 'ffmpeg', 'bin', 'ffmpeg.exe'),
        path.join(process.env.PROGRAMFILES || '', 'ffmpeg', 'bin', 'ffmpeg.exe'),
      ]
    : [
        '/usr/bin/ffmpeg',
        '/usr/local/bin/ffmpeg',
        '/opt/homebrew/bin/ffmpeg',
        '/snap/bin/ffmpeg',
      ];

  // Check env override first
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return { path: process.env.FFMPEG_PATH, source: 'env' };
  }

  // Try to find system ffmpeg in PATH
  try {
    const cmd = isWindows ? 'where ffmpeg' : 'which ffmpeg';
    const result = execSync(cmd, { encoding: 'utf8', timeout: 5000, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    if (result && fs.existsSync(result.split('\n')[0])) {
      return { path: result.split('\n')[0], source: 'system-path' };
    }
  } catch {}

  // Try known locations
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return { path: p, source: 'system-known' };
    }
  }

  return null;
}

function initFfmpegPath() {
  const systemFfmpeg = findSystemFfmpeg();
  if (systemFfmpeg) {
    FFMPEG_PATH = systemFfmpeg.path;
    FFMPEG_SOURCE = systemFfmpeg.source;
    console.log(`[encode] Using ${FFMPEG_SOURCE} FFmpeg: ${FFMPEG_PATH}`);
  } else {
    try {
      const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
      FFMPEG_PATH = ffmpegInstaller.path;
      FFMPEG_SOURCE = 'bundled';
      console.log(`[encode] Using bundled FFmpeg: ${FFMPEG_PATH}`);
    } catch {
      FFMPEG_PATH = 'ffmpeg';
      FFMPEG_SOURCE = 'fallback';
      console.warn('[encode] No FFmpeg found, using PATH fallback');
    }
  }
}

initFfmpegPath();

// System info
const CPU_CORES = os.cpus().length;
const IS_WINDOWS = process.platform === 'win32';
const IS_LINUX = process.platform === 'linux';
const IS_MAC = process.platform === 'darwin';

// Thread config
const THREADS_PER_JOB = (() => {
  const env = process.env.VIDEO_THREADS_PER_JOB;
  if (env != null && env !== '') {
    const n = parseInt(env, 10);
    if (!isNaN(n) && n >= 1) return Math.min(16, n);
  }
  return Math.min(8, Math.max(4, CPU_CORES));
})();

// Encoder test cache
const ENCODER_TEST_CACHE = new Map();
const PIPE_ENCODER_TEST_CACHE = new Map();

/**
 * Test if a video encoder is available
 */
function testEncoder(codec, extraArgs = []) {
  const cacheKey = `${codec}|${extraArgs.join(' ')}`;
  if (ENCODER_TEST_CACHE.has(cacheKey)) {
    return ENCODER_TEST_CACHE.get(cacheKey);
  }

  try {
    execSync(
      `"${FFMPEG_PATH}" -hide_banner -loglevel error -f lavfi -i color=c=black:s=64x64:d=0.1 -c:v ${codec} ${extraArgs.join(' ')} -f null -`,
      { stdio: 'pipe', timeout: 15000 }
    );
    ENCODER_TEST_CACHE.set(cacheKey, true);
    return true;
  } catch {
    ENCODER_TEST_CACHE.set(cacheKey, false);
    return false;
  }
}

/**
 * Test encoder at specific resolution with rawvideo pipe
 */
function testPipeEncoderAtSize(codec, width, height, fps, extraArgs = []) {
  const w = clamp(Number(width), 64, 4096, 0);
  const h = clamp(Number(height), 64, 4096, 0);
  const f = clamp(Number(fps), 10, 60, 30);
  
  if (!w || !h) {
    return { ok: false, error: 'invalid dimensions' };
  }

  const key = `${codec}|${w}x${h}|${f}|${extraArgs.join(' ')}`;
  if (PIPE_ENCODER_TEST_CACHE.has(key)) {
    return PIPE_ENCODER_TEST_CACHE.get(key);
  }

  const frameBytes = w * h * 4;
  const buf = Buffer.alloc(frameBytes);
  const args = [
    '-hide_banner', '-loglevel', 'error',
    '-f', 'rawvideo', '-pix_fmt', 'rgba',
    '-video_size', `${w}x${h}`, '-framerate', String(f),
    '-i', 'pipe:0', '-vf', 'format=yuv420p', '-an',
    '-c:v', codec, ...extraArgs,
    '-frames:v', '1', '-f', 'null', '-'
  ];

  let result;
  try {
    const run = spawnSync(FFMPEG_PATH, args, {
      input: buf,
      timeout: 120000,
      maxBuffer: 16 * 1024 * 1024
    });
    result = {
      ok: run.status === 0,
      exitCode: run.status,
      stderr: run.stderr?.toString() || '',
      error: run.error?.message || null
    };
  } catch (err) {
    result = { ok: false, error: err.message };
  }

  PIPE_ENCODER_TEST_CACHE.set(key, result);
  return result;
}

/**
 * Encoder configurations for all supported hardware
 */
const ENCODER_CONFIGS = {
  // NVIDIA NVENC - fastest, best quality
  nvenc: {
    codec: 'h264_nvenc',
    testArgs: ['-preset', 'p1', '-profile:v', 'high'],
    legacyTestArgs: ['-preset', '0', '-profile:v', 'baseline'], // older drivers
    platforms: ['win32', 'linux'],
    priority: 1,
    buildOptions: (fast, rateOpts, fpsOpts, tail = []) => [
      '-c:v', 'h264_nvenc',
      '-preset', fast ? 'p1' : 'p4', // p1=fastest, p4=balanced quality
      '-tune', 'hq',
      '-profile:v', 'high',
      '-rc', 'vbr',
      '-rc-lookahead', fast ? '0' : '32',
      '-spatial-aq', '1',
      '-temporal-aq', '1',
      ...rateOpts,
      ...fpsOpts,
      ...tail,
    ],
    pixFmt: 'yuv420p'
  },

  // Intel Quick Sync Video
  qsv: {
    codec: 'h264_qsv',
    testArgs: ['-preset', 'veryfast', '-profile:v', 'high', '-look_ahead', '0'],
    platforms: ['win32', 'linux'],
    priority: 2,
    buildOptions: (fast, rateOpts, fpsOpts, tail = [], pipeMode = false) => [
      '-c:v', 'h264_qsv',
      '-preset', fast ? 'veryfast' : 'medium',
      '-profile:v', 'high',
      // look_ahead deadlocks rawvideo pipe on bundled FFmpeg — never use for pipe/chunk exports
      ...(pipeMode || fast
        ? ['-look_ahead', '0', '-async_depth', '1']
        : ['-look_ahead', '1', '-look_ahead_depth', '40']),
      ...rateOpts,
      ...fpsOpts,
      ...tail,
    ],
    pixFmt: 'nv12',
  },

  // AMD AMF/VCE (Windows only via DirectX)
  amf: {
    codec: 'h264_amf',
    testArgs: ['-quality', 'speed', '-profile:v', 'high'],
    platforms: ['win32'],
    priority: 3,
    buildOptions: (fast, rateOpts, fpsOpts, tail = []) => [
      '-c:v', 'h264_amf',
      '-quality', fast ? 'speed' : 'balanced',
      '-profile:v', 'high',
      '-rc', 'vbr_latency',
      ...rateOpts,
      ...fpsOpts,
      ...tail
    ],
    pixFmt: 'nv12'
  },

  // VAAPI (Linux - Intel/AMD)
  vaapi: {
    codec: 'h264_vaapi',
    testArgs: ['-profile:v', 'high'],
    platforms: ['linux'],
    priority: 4,
    requiresHwaccel: true,
    buildOptions: (fast, rateOpts, fpsOpts, tail = []) => [
      '-vaapi_device', '/dev/dri/renderD128',
      '-c:v', 'h264_vaapi',
      '-profile:v', 'high',
      '-compression_level', fast ? '0' : '4',
      ...rateOpts,
      ...fpsOpts,
      ...tail
    ],
    pixFmt: 'vaapi',
    vfPrefix: 'format=nv12,hwupload'
  },

  // Software fallback - optimized for speed
  libx264: {
    codec: 'libx264',
    testArgs: ['-preset', 'ultrafast'],
    platforms: ['win32', 'linux', 'darwin'],
    priority: 99,
    buildOptions: (fast, rateOpts, fpsOpts, tail = []) => [
      '-c:v', 'libx264',
      '-preset', fast ? 'ultrafast' : 'veryfast',
      '-tune', 'fastdecode',
      '-profile:v', 'high',
      '-level', '4.2',
      ...rateOpts,
      // Optimized x264 params for speed without sacrificing much quality
      '-x264-params', fast 
        ? 'ref=1:bframes=0:b-adapt=0:rc-lookahead=0:scenecut=0:weightp=0:aq-mode=0'
        : 'ref=2:bframes=1:b-adapt=1:rc-lookahead=20',
      '-threads', '0', // auto-detect optimal threads
      ...fpsOpts,
      ...tail
    ],
    pixFmt: 'yuv420p'
  }
};

/**
 * Detect all available hardware encoders
 */
function detectAllEncoders() {
  const available = [];
  const unavailable = [];

  console.log('[encode] Detecting available hardware encoders...');
  console.log(`[encode] Platform: ${process.platform}, CPU cores: ${CPU_CORES}`);
  console.log(`[encode] FFmpeg source: ${FFMPEG_SOURCE}`);

  for (const [name, config] of Object.entries(ENCODER_CONFIGS)) {
    // Skip if not supported on this platform
    if (!config.platforms.includes(process.platform)) {
      unavailable.push({ name, reason: 'platform not supported' });
      continue;
    }

    // Test the encoder
    let works = testEncoder(config.codec, config.testArgs);
    
    // Try legacy args for NVENC (older drivers)
    if (!works && name === 'nvenc' && config.legacyTestArgs) {
      works = testEncoder(config.codec, config.legacyTestArgs);
      if (works) {
        config._useLegacy = true;
      }
    }

    if (works) {
      available.push({ name, config, priority: config.priority });
      console.log(`[encode]   ✓ ${config.codec} available`);
    } else {
      unavailable.push({ name, reason: 'encoder test failed' });
      console.log(`[encode]   ✗ ${config.codec} not available`);
    }
  }

  // Sort by priority (lower = better)
  available.sort((a, b) => a.priority - b.priority);

  return { available, unavailable };
}

/**
 * Parse env variable overrides
 */
function getEnvOverrides() {
  const parse = (key) => {
    const val = process.env[key];
    if (val === '1' || val === 'true') return true;
    if (val === '0' || val === 'false') return false;
    return null;
  };

  return {
    forceNvenc: parse('USE_NVENC') === true,
    forceQsv: parse('USE_QSV') === true,
    forceAmf: parse('USE_AMF') === true,
    forceVaapi: parse('USE_VAAPI') === true,
    forceSoftware: parse('USE_SOFTWARE') === true,
    disableNvenc: parse('USE_NVENC') === false,
    disableQsv: parse('USE_QSV') === false,
    disableAmf: parse('USE_AMF') === false,
    disableVaapi: parse('USE_VAAPI') === false,
  };
}

/**
 * Select best encoder based on detection and env overrides
 */
function selectBestEncoder(detected, overrides) {
  const { available } = detected;
  
  // Handle force options
  if (overrides.forceSoftware) return 'libx264';
  if (overrides.forceNvenc && available.find(e => e.name === 'nvenc')) return 'nvenc';
  if (overrides.forceQsv && available.find(e => e.name === 'qsv')) return 'qsv';
  if (overrides.forceAmf && available.find(e => e.name === 'amf')) return 'amf';
  if (overrides.forceVaapi && available.find(e => e.name === 'vaapi')) return 'vaapi';

  // Filter by disable options
  const filtered = available.filter(e => {
    if (overrides.disableNvenc && e.name === 'nvenc') return false;
    if (overrides.disableQsv && e.name === 'qsv') return false;
    if (overrides.disableAmf && e.name === 'amf') return false;
    if (overrides.disableVaapi && e.name === 'vaapi') return false;
    return true;
  });

  // Return best available (already sorted by priority)
  return filtered.length > 0 ? filtered[0].name : 'libx264';
}

// Run detection at startup
const DETECTED_ENCODERS = detectAllEncoders();
const ENV_OVERRIDES = getEnvOverrides();
const HW_ENCODER = selectBestEncoder(DETECTED_ENCODERS, ENV_OVERRIDES);

console.log(`[encode] Selected encoder: ${ENCODER_CONFIGS[HW_ENCODER].codec}`);
if (HW_ENCODER === 'libx264') {
  console.log('[encode] ⚠ Using software encoding (slower). Install GPU drivers for faster exports.');
}

/**
 * Verify encoder works at specific resolution before export
 */
function resolveHardwareEncoderForExport(config, opts = {}) {
  const width = Number(opts.width);
  const height = Number(opts.height);
  const fps = clamp(Number(config?.video?.fps) || Number(opts.fps) || 30, 10, 60, 30);
  const fast = opts?.fast !== false;
  const pipeMode = opts?.pipe === true;
  const br = opts.br ?? resolveBitrateK(config);

  // Parallel overflow / chunk workers — avoid QSV multi-pipe deadlock
  if (opts.forceSoftware === true) {
    console.log('[encode] Using libx264 (software lane for parallel export)');
    return 'libx264';
  }
  
  const hasSize = Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0;
  
  // Get candidates in priority order
  const candidates = [];
  const overrides = getEnvOverrides();
  
  // Add selected encoder first
  if (HW_ENCODER !== 'libx264') {
    candidates.push(HW_ENCODER);
  }
  
  // Add other available encoders as fallbacks
  for (const { name } of DETECTED_ENCODERS.available) {
    if (!candidates.includes(name) && name !== 'libx264') {
      if (overrides.disableNvenc && name === 'nvenc') continue;
      if (overrides.disableQsv && name === 'qsv') continue;
      if (overrides.disableAmf && name === 'amf') continue;
      if (overrides.disableVaapi && name === 'vaapi') continue;
      candidates.push(name);
    }
  }

  // Test each candidate at target resolution
  for (const encoderName of candidates) {
    const config = ENCODER_CONFIGS[encoderName];
    if (!config) continue;

    if (!hasSize) {
      console.log(`[encode] Selected: ${config.codec} (no size verification)`);
      return encoderName;
    }

    const rateProbe = ['-b:v', `${br}k`, '-maxrate', `${Math.round(br * 1.25)}k`, '-bufsize', `${br * 2}k`];
    const testArgs = pipeMode && encoderName === 'qsv'
      ? ['-preset', 'veryfast', '-profile:v', 'high', '-look_ahead', '0', '-async_depth', '1', ...rateProbe]
      : [...(config.testArgs || []), ...rateProbe];
    
    const test = testPipeEncoderAtSize(config.codec, width, height, fps, testArgs);
    if (test.ok) {
      console.log(`[encode] Verified: ${config.codec} at ${width}x${height}@${fps}fps`);
      return encoderName;
    }

    const reason = (test.stderr || test.error || `exit ${test.exitCode}`).trim().split('\n')[0];
    console.warn(`[encode] ${config.codec} failed at ${width}x${height}@${fps}fps: ${reason}`);
  }

  console.log('[encode] Falling back to libx264 (software)');
  return 'libx264';
}

// Utility functions
function clamp(n, min, max, fallback) {
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function parsePixelCount(config) {
  const ratio = String(config?.video?.aspectRatio || '1080x1920');
  const m = ratio.match(/^(\d{2,5})x(\d{2,5})$/i);
  if (m) return parseInt(m[1], 10) * parseInt(m[2], 10);
  const w = clamp(Number(config?.video?.width), 64, 4096, 1080);
  const h = clamp(Number(config?.video?.height), 64, 4096, 1920);
  return w * h;
}

/**
 * Calculate optimal bitrate based on resolution and quality setting
 */
function resolveBitrateK(config) {
  const quality = config?.video?.exportQuality || 'standard';
  const qualityMult = quality === 'maximum' ? 1.55 : quality === 'high' ? 1.25 : quality === 'draft' ? 0.65 : 1;
  
  if (config?.video?.videoBitrateMode === 'custom') {
    const mbps = Number(config.video.videoBitrateCustom);
    if (isFinite(mbps) && mbps > 0) {
      const kbps = clamp(Math.round(mbps * 1000), 4000, 50000, 8000);
      console.log(`[encode] Custom bitrate: ${mbps} Mbps → ${kbps} kbps`);
      return kbps;
    }
  }

  const pixels = parsePixelCount(config);
  let baseMbps = 12;
  if (pixels >= 1920 * 1080) baseMbps = 12;
  else if (pixels >= 1280 * 720) baseMbps = 8;
  else baseMbps = 5;

  const preset = String(config?.video?.exportPreset || 'whatsapp');
  if (preset === 'whatsapp') baseMbps = Math.min(baseMbps, 8);
  
  const finalMbps = baseMbps * qualityMult;
  const kbps = clamp(Math.round(finalMbps * 1000), 4000, 50000, 8000);
  console.log(`[encode] Auto bitrate: ${pixels}px preset=${preset} quality=${quality} → ${kbps} kbps`);
  return kbps;
}

/**
 * Build audio encoding options
 */
function resolveAudioEncodeOptions(config) {
  const { resolveExportFormat } = require('./exportFormat');
  
  const audioK = clamp(
    config?.video?.audioBitrateMode === 'custom' ? Number(config?.video?.audioBitrateCustom) : 192,
    96, 320, 192
  );
  const audioChannels = config?.video?.audioChannels === 'custom'
    ? clamp(Number(config?.video?.audioChannelsCustom), 1, 2, 2)
    : 2;
  const pixels = parsePixelCount(config);
  const audioRate = config?.video?.audioSampleRateMode === 'custom'
    ? clamp(Number(config?.video?.audioSampleRateCustom), 22050, 48000, 44100)
    : pixels >= 1920 * 1080 ? 48000 : 44100;

  const { container } = resolveExportFormat(config);
  if (container === 'webm') {
    return {
      audioK, audioChannels, audioRate,
      options: ['-c:a', 'libopus', '-b:a', `${audioK}k`, '-ac', String(audioChannels), '-ar', String(audioRate)]
    };
  }
  return {
    audioK, audioChannels, audioRate,
    options: ['-c:a', 'aac', '-b:a', `${audioK}k`, '-ac', String(audioChannels), '-ar', String(audioRate)]
  };
}

/**
 * Build FPS and GOP options
 */
function buildFpsOpts(fps, gop, pixFmt = 'yuv420p') {
  return ['-r', String(fps), '-g', String(gop), '-keyint_min', String(fps), '-pix_fmt', pixFmt];
}

/**
 * Get video encoding options for the selected encoder
 */
function getVideoEncodeOptions(config, opts) {
  const { resolveExportFormat } = require('./exportFormat');
  
  const fast = opts?.fast !== false;
  const pipeMode = opts?.pipe === true;
  const br = resolveBitrateK(config);
  const fps = clamp(Number(config?.video?.fps) || Number(opts?.fps) || 30, 10, 60, 30);
  const gop = Math.max(fps, Math.round(fps * 2));
  const fmt = resolveExportFormat(config);

  // WebM uses VP8/VP9, not H.264
  if (fmt.container === 'webm') {
    const rateOpts = ['-b:v', `${br}k`, '-maxrate', `${Math.round(br * 1.25)}k`, '-bufsize', `${br * 2}k`];
    const fpsOpts = buildFpsOpts(fps, gop, 'yuv420p');
    if (fmt.videoCodec === 'vp9') {
      return ['-c:v', 'libvpx-vp9', ...rateOpts, '-row-mt', '1', '-cpu-used', fast ? '4' : '2', ...fpsOpts];
    }
    return ['-c:v', 'libvpx', ...rateOpts, '-cpu-used', fast ? '4' : '2', ...fpsOpts];
  }

  // Resolve best encoder for this export
  const encoderName = resolveHardwareEncoderForExport(config, { ...opts, fps, br });
  const encoderConfig = ENCODER_CONFIGS[encoderName];

  const rateOpts = ['-b:v', `${br}k`, '-maxrate', `${Math.round(br * 1.25)}k`, '-bufsize', `${br * 2}k`];
  const fpsOpts = buildFpsOpts(fps, gop, encoderConfig.pixFmt);
  const tail = fmt.container === 'mp4' ? ['-movflags', '+faststart'] : [];

  console.log(`[encode] Export: format=${fmt.ext} encoder=${encoderConfig.codec} fps=${fps} bitrate=${br}k fast=${fast} pipe=${pipeMode}`);

  return encoderConfig.buildOptions(fast, rateOpts, fpsOpts, tail, pipeMode);
}

/**
 * Get combined video + audio encoding options
 */
function getEncodeOptions(config, opts) {
  const audio = resolveAudioEncodeOptions(config);
  return [...getVideoEncodeOptions(config, opts), ...audio.options];
}

/**
 * Log encoding capabilities at startup
 */
function logEncodeCapabilities() {
  const encoderInfo = ENCODER_CONFIGS[HW_ENCODER];
  const hw = encoderInfo ? encoderInfo.codec : 'libx264 (software)';
  console.log(`[encode] ═══════════════════════════════════════════════════════`);
  console.log(`[encode] Video Encoder: ${hw}`);
  console.log(`[encode] FFmpeg: ${FFMPEG_SOURCE} (${FFMPEG_PATH})`);
  console.log(`[encode] CPU cores: ${CPU_CORES}, threads/job: ${THREADS_PER_JOB}`);
  console.log(`[encode] Platform: ${process.platform} ${os.release()}`);
  
  const available = DETECTED_ENCODERS.available.map(e => e.config.codec).join(', ') || 'none';
  console.log(`[encode] Available HW encoders: ${available}`);
  console.log(`[encode] ═══════════════════════════════════════════════════════`);
}

/**
 * Get FFmpeg executable path
 */
function getFfmpegPath() {
  return FFMPEG_PATH;
}

/**
 * Re-detect encoders (useful after driver updates)
 */
function refreshEncoderDetection() {
  ENCODER_TEST_CACHE.clear();
  PIPE_ENCODER_TEST_CACHE.clear();
  const detected = detectAllEncoders();
  const overrides = getEnvOverrides();
  const selected = selectBestEncoder(detected, overrides);
  console.log(`[encode] Refreshed encoder detection: ${ENCODER_CONFIGS[selected].codec}`);
  return selected;
}

module.exports = {
  HW_ENCODER,
  THREADS_PER_JOB,
  ENCODER_CONFIGS,
  DETECTED_ENCODERS,
  getEncodeOptions,
  getVideoEncodeOptions,
  resolveAudioEncodeOptions,
  resolveBitrateK,
  resolveHardwareEncoderForExport,
  testPipeEncoderAtSize,
  logEncodeCapabilities,
  getFfmpegPath,
  refreshEncoderDetection,
};
