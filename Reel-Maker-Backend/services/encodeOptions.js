var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var encodeOptions_exports = {};
__export(encodeOptions_exports, {
  HW_ENCODER: () => HW_ENCODER,
  THREADS_PER_JOB: () => THREADS_PER_JOB,
  getEncodeOptions: () => getEncodeOptions,
  getVideoEncodeOptions: () => getVideoEncodeOptions,
  resolveAudioEncodeOptions: () => resolveAudioEncodeOptions,
  logEncodeCapabilities: () => logEncodeCapabilities,
  resolveBitrateK: () => resolveBitrateK,
  testPipeEncoderAtSize: () => testPipeEncoderAtSize,
  resolveHardwareEncoderForExport: () => resolveHardwareEncoderForExport
});
module.exports = __toCommonJS(encodeOptions_exports);
var import_child_process = require("child_process");
var import_ffmpeg = __toESM(require("@ffmpeg-installer/ffmpeg"), 1);
var import_os = __toESM(require("os"), 1);
var import_exportFormat = require("./exportFormat");
const CPU_CORES = import_os.default.cpus().length;
const THREADS_PER_JOB = (() => {
  const env = process.env.VIDEO_THREADS_PER_JOB;
  if (env != null && env !== "") {
    const n = parseInt(env, 10);
    if (!isNaN(n) && n >= 1) return Math.min(16, n);
  }
  return Math.min(8, Math.max(4, CPU_CORES));
})();
function testEncoder(codec, extraArgs) {
  try {
    (0, import_child_process.execSync)(
      `"${import_ffmpeg.default.path}" -hide_banner -loglevel error -f lavfi -i color=c=black:s=64x64:d=0.1 -c:v ${codec} ${extraArgs.join(" ")} -f null -`,
      { stdio: "pipe", timeout: 15e3 }
    );
    return true;
  } catch {
    return false;
  }
}
const PIPE_ENCODER_TEST_CACHE = /* @__PURE__ */ new Map();
function pipeTestCacheKey(codec, width, height, fps, extraArgs) {
  return `${codec}|${width}x${height}|${fps}|${extraArgs.join(" ")}`;
}
function testPipeEncoderAtSize(codec, width, height, fps, extraArgs = []) {
  const w = clamp(Number(width), 64, 4096, 0);
  const h = clamp(Number(height), 64, 4096, 0);
  const f = clamp(Number(fps), 10, 60, 30);
  if (!w || !h) {
    return { ok: false, exitCode: null, signal: null, stderr: "invalid dimensions", error: "invalid dimensions" };
  }
  const key = pipeTestCacheKey(codec, w, h, f, extraArgs);
  if (PIPE_ENCODER_TEST_CACHE.has(key)) {
    return PIPE_ENCODER_TEST_CACHE.get(key);
  }
  const frameBytes = w * h * 4;
  const buf = Buffer.alloc(frameBytes);
  const args = [
    "-hide_banner",
    "-loglevel",
    "error",
    "-f",
    "rawvideo",
    "-pix_fmt",
    "rgba",
    "-video_size",
    `${w}x${h}`,
    "-framerate",
    String(f),
    "-i",
    "pipe:0",
    "-vf",
    "format=yuv420p",
    "-an",
    "-c:v",
    codec,
    ...extraArgs,
    "-frames:v",
    "1",
    "-f",
    "null",
    "-"
  ];
  let result;
  try {
    const run = (0, import_child_process.spawnSync)(import_ffmpeg.default.path, args, {
      input: buf,
      timeout: 12e4,
      maxBuffer: 16 * 1024 * 1024
    });
    result = {
      ok: run.status === 0,
      exitCode: run.status,
      signal: run.signal,
      stderr: run.stderr ? run.stderr.toString() : "",
      stdout: run.stdout ? run.stdout.toString() : "",
      error: run.error ? String(run.error.message || run.error) : null
    };
  } catch (err) {
    result = {
      ok: false,
      exitCode: null,
      signal: null,
      stderr: "",
      stdout: "",
      error: err.message
    };
  }
  PIPE_ENCODER_TEST_CACHE.set(key, result);
  return result;
}
function videoCodecName(hw) {
  if (hw === "nvenc") return "h264_nvenc";
  if (hw === "qsv") return "h264_qsv";
  return "libx264";
}
function resolveHardwareEncoderForExport(config, opts = {}) {
  const width = Number(opts.width);
  const height = Number(opts.height);
  const fps = clamp(Number(config?.video?.fps) || Number(opts.fps) || 30, 10, 60, 30);
  const fast = opts?.fast !== false;
  const br = opts.br ?? resolveBitrateK(config);
  const rateProbe = ["-b:v", `${br}k`, "-maxrate", `${Math.round(br * 1.25)}k`, "-bufsize", `${br * 2}k`];
  const hasSize = Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0;
  const forceNvenc = process.env.USE_NVENC === "1" || process.env.USE_NVENC === "true";
  const forceQsv = process.env.USE_QSV === "1" || process.env.USE_QSV === "true";
  const disableNvenc = process.env.USE_NVENC === "0" || process.env.USE_NVENC === "false";
  const disableQsv = process.env.USE_QSV === "0" || process.env.USE_QSV === "false";
  const candidates = [];
  if (forceNvenc) candidates.push("nvenc");
  if (forceQsv) candidates.push("qsv");
  if (!forceNvenc && !forceQsv) {
    if (!disableNvenc && HW_ENCODER === "nvenc") candidates.push("nvenc");
    if (!disableQsv && HW_ENCODER === "qsv") candidates.push("qsv");
    if (!disableNvenc && !candidates.includes("nvenc") && testEncoder("h264_nvenc", ["-preset", "0", "-profile:v", "baseline"])) {
      candidates.push("nvenc");
    }
    if (!disableQsv && !candidates.includes("qsv") && testEncoder("h264_qsv", ["-preset", "veryfast", "-profile:v", "baseline"])) {
      candidates.push("qsv");
    }
  } else {
    if (forceNvenc && !disableQsv && !candidates.includes("qsv")) candidates.push("qsv");
    if (forceQsv && !disableNvenc && !candidates.includes("nvenc")) candidates.push("nvenc");
  }
  const unique = [...new Set(candidates)];
  for (const hw of unique) {
    const codec = videoCodecName(hw);
    if (!hasSize) {
      console.log(`[encode] selected video codec: ${codec} (startup probe only)`);
      return hw;
    }
    const preset = hw === "nvenc" ? ["-preset", "0", "-profile:v", "baseline"] : ["-preset", fast ? "veryfast" : "medium", "-profile:v", "baseline"];
    const test = testPipeEncoderAtSize(codec, width, height, fps, [...preset, ...rateProbe]);
    if (test.ok) {
      console.log(`[encode] selected video codec: ${codec} (verified ${width}x${height}@${fps}fps)`);
      return hw;
    }
    const reason = (test.stderr || test.error || `exit ${test.exitCode}`).trim().split("\n")[0];
    console.warn(`[encode] ${codec} probe failed at ${width}x${height}@${fps}fps — ${reason}`);
  }
  console.log("[encode] selected video codec: libx264 (software)");
  return null;
}
function detectHardwareEncoder() {
  const forceNvenc = process.env.USE_NVENC === "1" || process.env.USE_NVENC === "true";
  const forceQsv = process.env.USE_QSV === "1" || process.env.USE_QSV === "true";
  const disableNvenc = process.env.USE_NVENC === "0" || process.env.USE_NVENC === "false";
  const disableQsv = process.env.USE_QSV === "0" || process.env.USE_QSV === "false";
  if (forceNvenc && testEncoder("h264_nvenc", ["-preset", "0", "-profile:v", "baseline"])) return "nvenc";
  if (forceQsv && testEncoder("h264_qsv", ["-preset", "veryfast", "-profile:v", "baseline"])) return "qsv";
  if (!disableNvenc && testEncoder("h264_nvenc", ["-preset", "0", "-profile:v", "baseline"])) return "nvenc";
  if (!disableQsv && testEncoder("h264_qsv", ["-preset", "veryfast", "-profile:v", "baseline"])) return "qsv";
  return null;
}
const HW_ENCODER = detectHardwareEncoder();
function clamp(n, min, max, fallback) {
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
function parsePixelCount(config) {
  const ratio = String(config?.video?.aspectRatio || "1080x1920");
  const m = ratio.match(/^(\d{2,5})x(\d{2,5})$/i);
  if (m) return parseInt(m[1], 10) * parseInt(m[2], 10);
  const w = clamp(Number(config?.video?.width), 64, 4096, 1080);
  const h = clamp(Number(config?.video?.height), 64, 4096, 1920);
  return w * h;
}
function resolveBitrateK(config) {
  const quality = config?.video?.exportQuality || "standard";
  const qualityMult = quality === "maximum" ? 1.55 : quality === "high" ? 1.25 : quality === "draft" ? 0.65 : 1;
  if (config?.video?.videoBitrateMode === "custom") {
    const mbps = Number(config.video.videoBitrateCustom);
    if (isFinite(mbps) && mbps > 0) {
      const kbps = clamp(Math.round(mbps * 1e3), 4e3, 5e4, 8e3);
      console.log(`[encode] custom bitrate: ${mbps} Mbps → ${kbps} kbps`);
      return kbps;
    }
  }
  const pixels = parsePixelCount(config);
  let baseMbps = 12;
  if (pixels >= 1920 * 1080) baseMbps = 12;
  else if (pixels >= 1280 * 720) baseMbps = 8;
  else baseMbps = 5;
  const preset = String(config?.video?.exportPreset || "whatsapp");
  if (preset === "whatsapp") baseMbps = Math.min(baseMbps, 8);
  const finalMbps = baseMbps * qualityMult;
  const kbps = clamp(Math.round(finalMbps * 1e3), 4e3, 5e4, 8e3);
  console.log(`[encode] auto bitrate: ${pixels}px preset=${preset} quality=${quality} → ${kbps} kbps`);
  return kbps;
}
function resolveAudioEncodeOptions(config) {
  const audioK = clamp(
    config?.video?.audioBitrateMode === "custom" ? Number(config?.video?.audioBitrateCustom) : 128,
    96,
    320,
    128
  );
  const audioChannels = config?.video?.audioChannels === "custom"
    ? clamp(Number(config?.video?.audioChannelsCustom), 1, 2, 2)
    : 2;
  const pixels = parsePixelCount(config);
  const audioRate = config?.video?.audioSampleRateMode === "custom"
    ? clamp(Number(config?.video?.audioSampleRateCustom), 22050, 48e3, 44100)
    : pixels >= 1920 * 1080 ? 48000 : 44100;
  const { container } = (0, import_exportFormat.resolveExportFormat)(config);
  if (container === "webm") {
    return {
      audioK,
      audioChannels,
      audioRate,
      options: [
        "-c:a", "libopus",
        "-b:a", `${audioK}k`,
        "-ac", String(audioChannels),
        "-ar", String(audioRate),
      ],
    };
  }
  return {
    audioK,
    audioChannels,
    audioRate,
    options: [
      "-c:a", "aac",
      "-b:a", `${audioK}k`,
      "-ac", String(audioChannels),
      "-ar", String(audioRate),
    ],
  };
}
function buildFpsOpts(fps, gop, pixFmt = "yuv420p") {
  return [
    "-r", String(fps),
    "-g", String(gop),
    "-keyint_min", String(fps),
    "-pix_fmt", pixFmt,
  ];
}
function buildLibx264Options(fast, rateOpts, fpsOpts, tail = []) {
  const x264Preset = fast ? "ultrafast" : "veryfast";
  return [
    "-threads", "0",
    "-c:v", "libx264",
    "-preset", x264Preset,
    "-tune", "fastdecode",
    "-profile:v", "baseline",
    "-level", "4.0",
    ...rateOpts,
    "-x264-params", "ref=1:bframes=0:rc-lookahead=0:threads=0",
    ...fpsOpts,
    ...tail
  ];
}
function buildNvencOptions(fast, rateOpts, fpsOpts, tail = []) {
  return [
    "-c:v", "h264_nvenc",
    "-preset", "0",
    "-profile:v", "baseline",
    ...rateOpts,
    ...fpsOpts,
    ...tail
  ];
}
function buildQsvOptions(fast, rateOpts, fpsOpts, tail = []) {
  return [
    "-c:v", "h264_qsv",
    "-preset", fast ? "veryfast" : "medium",
    "-profile:v", "baseline",
    ...rateOpts,
    ...fpsOpts,
    ...tail
  ];
}
function getVideoEncodeOptions(config, opts) {
  const fast = opts?.fast !== false;
  const br = resolveBitrateK(config);
  const fps = clamp(Number(config?.video?.fps) || Number(opts?.fps) || 30, 10, 60, 30);
  const gop = Math.max(fps, Math.round(fps * 2));
  const fmt = (0, import_exportFormat.resolveExportFormat)(config);
  const exportHw = fmt.container === "webm" ? null : resolveHardwareEncoderForExport(config, { ...opts, fps, br });
  const selectedCodec = fmt.container === "webm"
    ? (fmt.videoCodec === "vp9" ? "libvpx-vp9" : "libvpx")
    : videoCodecName(exportHw);
  console.log(`[encode] export settings: format=${fmt.ext} fps=${fps} bitrate=${br}k gop=${gop} fast=${fast}`);
  console.log(`[encode] ffmpeg -c:v ${selectedCodec}`);
  const rateOpts = ["-b:v", `${br}k`, "-maxrate", `${Math.round(br * 1.25)}k`, "-bufsize", `${br * 2}k`];
  const libx264FpsOpts = buildFpsOpts(fps, gop, "yuv420p");
  const qsvFpsOpts = buildFpsOpts(fps, gop, "nv12");
  const mp4Tail = ["-movflags", "+faststart"];

  if (fmt.container === "webm") {
    if (fmt.videoCodec === "vp9") {
      return [
        "-c:v", "libvpx-vp9",
        ...rateOpts,
        "-row-mt", "1",
        "-cpu-used", fast ? "4" : "2",
        ...libx264FpsOpts,
      ];
    }
    return [
      "-c:v", "libvpx",
      ...rateOpts,
      "-cpu-used", fast ? "4" : "2",
      ...libx264FpsOpts,
    ];
  }

  if (fmt.container === "matroska") {
    if (exportHw === "nvenc") return buildNvencOptions(fast, rateOpts, libx264FpsOpts);
    if (exportHw === "qsv") return buildQsvOptions(fast, rateOpts, qsvFpsOpts);
    return buildLibx264Options(fast, rateOpts, libx264FpsOpts);
  }

  if (exportHw === "nvenc") return buildNvencOptions(fast, rateOpts, libx264FpsOpts, mp4Tail);
  if (exportHw === "qsv") return buildQsvOptions(fast, rateOpts, qsvFpsOpts, mp4Tail);
  return buildLibx264Options(fast, rateOpts, libx264FpsOpts, mp4Tail);
}
function getEncodeOptions(config, opts) {
  const audio = resolveAudioEncodeOptions(config);
  return [...getVideoEncodeOptions(config, opts), ...audio.options];
}
function logEncodeCapabilities() {
  const hw = HW_ENCODER ? `h264_${HW_ENCODER}` : "libx264 (software)";
  console.log(`[encode] ${hw}, CPU cores: ${CPU_CORES}, threads/job: ${THREADS_PER_JOB}`);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HW_ENCODER,
  THREADS_PER_JOB,
  getEncodeOptions,
  getVideoEncodeOptions,
  resolveAudioEncodeOptions,
  logEncodeCapabilities,
  resolveBitrateK,
  testPipeEncoderAtSize,
  resolveHardwareEncoderForExport
});
