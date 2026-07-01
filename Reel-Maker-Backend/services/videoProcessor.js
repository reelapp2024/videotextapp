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
var videoProcessor_exports = {};
__export(videoProcessor_exports, {
  extractAudioFromVideo: () => extractAudioFromVideo,
  extractThumbnail: () => extractThumbnail,
  mergeVideos: () => mergeVideos,
  processSlideshowJob: () => processSlideshowJob,
  processVideoJob: () => processVideoJob,
  zipDir: () => zipDir
});
module.exports = __toCommonJS(videoProcessor_exports);
var import_ffmpeg = __toESM(require("@ffmpeg-installer/ffmpeg"), 1);
var import_ffprobe = __toESM(require("@ffprobe-installer/ffprobe"), 1);
var import_fluent_ffmpeg = __toESM(require("fluent-ffmpeg"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_os = __toESM(require("os"), 1);
var import_url = require("url");
var import_archiver = __toESM(require("archiver"), 1);
var import_util = require("util");
var import_slideshowBaseVideo = require("./slideshowBaseVideo");
var import_exportMediaResolver = require("./exportMediaResolver");
var import_encodeOptions = require("./encodeOptions");
var import_videoLayoutFilters = require("./videoLayoutFilters");
var import_jobCancellation = require("./jobCancellation");
var import_exportSegments = require("../utils/exportSegments");
var import_exportRendererConfig = require("./exportRendererConfig");
var import_serverExportRow = require("./serverExportRow");
var import_exportFormat = require("./exportFormat");
import_fluent_ffmpeg.default.setFfmpegPath(import_ffmpeg.default.path);
import_fluent_ffmpeg.default.setFfprobePath(import_ffprobe.default.path);
const ffprobeAsync = (0, import_util.promisify)(import_fluent_ffmpeg.default.ffprobe);
const CPU_CORES = import_os.default.cpus().length;
const PARALLEL_JOBS = (() => {
  const env = process.env.VIDEO_PARALLEL_JOBS;
  if (env != null && env !== "") {
    const n = parseInt(env, 10);
    if (!isNaN(n) && n >= 1) return Math.min(16, n);
  }
  return Math.min(8, Math.max(2, Math.floor(CPU_CORES / 2)));
})();
const CAPTION_EXPORT_PARALLEL = (() => {
  const env = process.env.CAPTION_EXPORT_PARALLEL;
  if (env != null && env !== "") {
    const n = parseInt(env, 10);
    if (!isNaN(n) && n >= 1) return Math.min(8, n);
  }
  return 1;
})();
function getVideoEncodeOptions(config) {
  return (0, import_encodeOptions.getEncodeOptions)(config, { fast: false });
}
console.log(`FFmpeg: ${import_ffmpeg.default.path}`);
console.log(`CPU cores: ${CPU_CORES}, parallel jobs: ${PARALLEL_JOBS}, caption parallel: ${CAPTION_EXPORT_PARALLEL}`);
(0, import_encodeOptions.logEncodeCapabilities)();
async function probeHasAudio(filePath) {
  if (!filePath || !import_fs.default.existsSync(filePath)) return false;
  try {
    const meta = await ffprobeAsync(filePath);
    return (meta?.streams || []).some((s) => s.codec_type === "audio");
  } catch {
    return false;
  }
}
function parseFpsRate(rate) {
  if (!rate || typeof rate !== "string") return null;
  const parts = rate.split("/");
  if (parts.length !== 2) return null;
  const num = Number(parts[0]);
  const den = Number(parts[1]);
  if (!Number.isFinite(num) || !Number.isFinite(den) || den <= 0) return null;
  return num / den;
}
async function probeVideoFps(filePath) {
  if (!filePath || !import_fs.default.existsSync(filePath)) return null;
  try {
    const meta = await ffprobeAsync(filePath);
    const vs = (meta?.streams || []).find((s) => s.codec_type === "video");
    if (!vs) return null;
    const fps = parseFpsRate(vs.avg_frame_rate) || parseFpsRate(vs.r_frame_rate);
    if (!fps || !Number.isFinite(fps) || fps <= 0) return null;
    return Math.round(fps * 100) / 100;
  } catch {
    return null;
  }
}
function resolveServerExportFps(config, sourceFps) {
  const videoCfg = config?.video || {};
  const manual = clamp(Number(videoCfg.fps), 10, 60, 30);
  const useMatch = videoCfg.frameRateMode === "match" || (videoCfg.frameRateMode !== "manual" && videoCfg.useSourceFps !== false);
  if (!useMatch || sourceFps == null || !Number.isFinite(sourceFps) || sourceFps <= 0) {
    return manual;
  }
  const rounded = Math.round(sourceFps);
  if (rounded <= 26) return 24;
  if (rounded <= 45) return 30;
  if (rounded <= 75) return 60;
  return Math.min(60, Math.max(24, rounded));
}
function needsFpsConversion(sourceFps, targetFps) {
  if (sourceFps == null || !Number.isFinite(sourceFps)) return true;
  return Math.abs(sourceFps - targetFps) >= 0.5;
}
function buildFpsFilter(targetFps, sourceFps) {
  if (!needsFpsConversion(sourceFps, targetFps)) return "setpts=PTS-STARTPTS";
  return `fps=fps=${targetFps}:round=near`;
}
function joinVideoFilters(parts) {
  return parts.filter(Boolean).join(",");
}
async function runParallel(tasks, concurrency) {
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await tasks[i]();
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
function clamp(n, min, max, fallback) {
  const x = Number(n);
  if (!isFinite(x)) return fallback;
  return Math.max(min, Math.min(max, x));
}
function parseDimsFromConfig(config) {
  const ratio = String(config?.video?.aspectRatio || "").trim();
  const m = ratio.match(/^(\d{2,5})x(\d{2,5})$/i);
  if (m) {
    const w2 = clamp(parseInt(m[1], 10), 64, 4096, 1080);
    const h2 = clamp(parseInt(m[2], 10), 64, 4096, 1920);
    return { w: w2, h: h2 };
  }
  const w = clamp(config?.video?.width, 64, 4096, 1080);
  const h = clamp(config?.video?.height, 64, 4096, 1920);
  return { w, h };
}
async function writeConcatListForImages(imagePaths, secondsPerImage, listPath) {
  const dur = clamp(secondsPerImage, 0.1, 60, 2);
  const lines = [];
  for (const p of imagePaths) {
    const safe = p.replace(/\\/g, "/").replace(/'/g, "'\\''");
    lines.push(`file '${safe}'`);
    lines.push(`duration ${dur}`);
  }
  if (imagePaths.length > 0) {
    const last = imagePaths[imagePaths.length - 1].replace(/\\/g, "/").replace(/'/g, "'\\''");
    lines.push(`file '${last}'`);
  }
  import_fs.default.writeFileSync(listPath, lines.join("\n"));
}
async function processVideoJob(jobId, files, excelData, config, onProgress, jobMeta = {}) {
  const { queueWaitMs = 0, retryCount = 0 } = jobMeta || {};
  const outDir = import_path.default.join(__dirname, "../uploads/processed", jobId);
  import_fs.default.mkdirSync(outDir, { recursive: true });
  const jobMediaDir = import_path.default.join(outDir, "_media");
  import_fs.default.mkdirSync(jobMediaDir, { recursive: true });
  const captionExport = config?.captionExport;
  const useCaptionExport = Boolean(
    captionExport?.tracks?.some((t) => t.segments?.length > 0)
  );
  
  // === EXPORT PATH DEBUG ===
  console.log(`[export] ========== EXPORT JOB START ==========`);
  console.log(`[export] useCaptionExport: ${useCaptionExport}`);
  console.log(`[export] captionExport tracks: ${captionExport?.tracks?.length || 0}`);
  console.log(`[export] config.overlays count: ${config?.overlays?.length || 0}`);
  if (config?.overlays?.length > 0) {
    config.overlays.forEach((ov, i) => {
      console.log(`[export] overlay[${i}]: enabled=${ov.enabled}, fontFamily=${ov.fontFamily}, fontSize=${ov.fontSize}, color=${ov.color}, styleType=${ov.styleType}`);
    });
  }
  console.log(`[export] excelData rows: ${excelData?.length || 0}`);
  if (excelData?.length > 0) {
    console.log(`[export] first row sample: ${JSON.stringify(excelData[0])?.substring(0, 200)}`);
  }
  console.log(`[export] =====================================`);

  const useSharedRenderer = (0, import_exportRendererConfig.isServerSharedRenderer)();
  console.log(`[export] renderer: shared render-core (EXPORT_RENDERER=${(0, import_exportRendererConfig.resolveExportRenderer)()})`);
  
  const videoPaths = (files.videos || []).filter((p) => p && import_fs.default.existsSync(p));
  const voicePaths = (files.voices || []).filter((p) => p && import_fs.default.existsSync(p));
  const musicPaths = (files.music || []).filter((p) => p && import_fs.default.existsSync(p));
  const imagePaths = (files.images || []).filter((p) => p && import_fs.default.existsSync(p));
  const videoVol = (0, import_videoLayoutFilters.resolveExportVideoVolume)(config, useCaptionExport);
  const voiceVol = config?.audio?.volumeEnabled !== false ? config?.audio?.volume ?? 0.5 : 0;
  const musicVol = config?.audio?.volumeEnabled !== false ? config?.audio?.musicVolume ?? 0.3 : 0;
  const { w, h } = parseDimsFromConfig(config);
  const probedSourceFps = videoPaths[0] ? await probeVideoFps(videoPaths[0]) : null;
  const fps = resolveServerExportFps(config, probedSourceFps);
  if (probedSourceFps) {
    console.log(`[export] source fps=${probedSourceFps} → export fps=${fps}`);
  }
  const settingsBg = await (0, import_exportMediaResolver.resolveSettingsBackgroundPaths)(config, jobMediaDir);
  const settingsBgImage = settingsBg.imagePath;
  const settingsBgVideo = settingsBg.videoPath;
  if (videoPaths.length === 0 && voicePaths.length === 0 && imagePaths.length === 0 && !settingsBgImage && !settingsBgVideo) {
    throw new Error("No valid video, image, or voice files found");
  }
  const rows = useCaptionExport ? Math.max(captionExport.tracks?.length || 0, voicePaths.length, videoPaths.length > 1 ? videoPaths.length : 0, 1) : Math.max(excelData?.length || 1, 1);
  const exportFmt = (0, import_exportFormat.resolveExportFormat)(config);
  const outFileRe = (0, import_exportFormat.outputFilePattern)(exportFmt.ext);
  const syncOutputs = async (completed2, progress) => {
    const outNames2 = import_fs.default.readdirSync(outDir).filter((f) => outFileRe.test(f)).sort();
    const outputFiles2 = outNames2.map((f) => `/uploads/processed/${jobId}/${f}`);
    await onProgress({ progress, completed: completed2, total: rows, outputFiles: outputFiles2 });
  };
  await syncOutputs(0, 1);
  let completed = 0;
  let lastExportMetrics = null;
  const tasks = Array.from({ length: rows }, (_, i) => async () => {
    if (await (0, import_jobCancellation.isJobCancelledAsync)(jobId)) throw new import_jobCancellation.JobCancelledError();
    const uploadVideoPath = videoPaths.length > 0 ? videoPaths[i % videoPaths.length] : null;
    const uploadImagePath = imagePaths.length > 0 ? imagePaths[i % imagePaths.length] : null;
    const voicePath = voicePaths.length > 0 ? voicePaths[i % voicePaths.length] : null;
    const musicPath = musicPaths.length > 0 ? musicPaths[i % musicPaths.length] : null;
    const row = excelData[i] || [];
    const outputPath = import_path.default.join(outDir, (0, import_exportFormat.buildOutputFilename)(i, exportFmt.ext));
    const voiceTrackIdx = voicePaths.length > 0 ? i % voicePaths.length : 0;
    const track = useCaptionExport ? captionExport?.tracks?.[voiceTrackIdx] || captionExport?.tracks?.[0] : null;
    let segments = (0, import_exportSegments.resolveTrackSegments)({
      segments: track?.segments,
      excelRow: row,
      config,
      fallbackDuration: 60
    });
    if (!segments.length && config?.captionSync?.segments?.length) {
      segments = (0, import_exportSegments.resolveTrackSegments)({
        segments: config.captionSync.segments,
        excelRow: row,
        config,
        fallbackDuration: 60
      });
    }
    let imageBgPath = settingsBgImage || uploadImagePath;
    let videoPath = uploadVideoPath || settingsBgVideo;
    const videoHasAudio = videoPath ? await probeHasAudio(videoPath) : false;

    if (!useSharedRenderer) {
      throw new Error('Legacy FFmpeg drawtext/ASS export was removed in M10. Set EXPORT_RENDERER=server.');
    }

    console.log(`[export/server] row ${i + 1}: shared renderer → FFmpeg stdin`);
    return (0, import_serverExportRow.processOneRowWithSharedRenderer)({
      videoPath,
      imageBgPath,
      voicePath,
      musicPath,
      row,
      outputPath,
      videoVol,
      voiceVol,
      musicVol,
      w,
      h,
      fps,
      rowIndex: i,
      config,
      hasVideoAudio: videoHasAudio,
      segments,
      settingsBgVideo: settingsBgVideo,
      jobId,
      queueWaitMs,
      retryCount,
      isCancelled: () => (0, import_jobCancellation.isJobCancelledAsync)(jobId),
      onFrameProgress: async (p) => {
        await syncOutputs(completed, p.progress);
      },
    }).then(async (rowMetrics) => {
      lastExportMetrics = rowMetrics;
      completed++;
      await syncOutputs(completed, Math.round(completed / rows * 90));
    });
  });
  await runParallel(tasks, useCaptionExport ? CAPTION_EXPORT_PARALLEL : PARALLEL_JOBS);
  const outNames = import_fs.default.readdirSync(outDir).filter((f) => outFileRe.test(f)).sort();
  if (outNames.length === 0) {
    throw new Error("Export failed: FFmpeg produced no output files");
  }
  const outputFiles = outNames.map((f) => `/uploads/processed/${jobId}/${f}`);
  await onProgress({ progress: 100, completed: rows, total: rows, outputFiles });
  const resultUrl = outputFiles[0] || "";
  return { resultUrl, outputFiles, exportMetrics: lastExportMetrics };
}
async function processSlideshowJob(jobId, files, row, config, durationPerImageSec, onProgress) {
  if (await (0, import_jobCancellation.isJobCancelledAsync)(jobId)) throw new import_jobCancellation.JobCancelledError();
  const outDir = import_path.default.join(__dirname, "../uploads/processed", jobId);
  import_fs.default.mkdirSync(outDir, { recursive: true });
  const imagePaths = (files.images || []).filter((p) => p && import_fs.default.existsSync(p));
  const voicePaths = (files.voices || []).filter((p) => p && import_fs.default.existsSync(p));
  const musicPaths = (files.music || []).filter((p) => p && import_fs.default.existsSync(p));
  if (imagePaths.length === 0) throw new Error("No valid image files found");

  const fps = clamp(config?.video?.fps, 10, 60, 30);
  const { w, h } = parseDimsFromConfig(config);
  const exportSpeed = clamp(config?.video?.exportSpeed, 0.25, 4, 1);
  const videoVol = (0, import_videoLayoutFilters.resolveExportVideoVolume)(config, false);
  const voiceVol = config?.audio?.volumeEnabled !== false ? config?.audio?.volume ?? 0.5 : 0;
  const musicVol = config?.audio?.volumeEnabled !== false ? config?.audio?.musicVolume ?? 0.3 : 0;

  const listPath = import_path.default.join(outDir, "images.concat.txt");
  const basePath = import_path.default.join(outDir, "_slideshow_base.mp4");
  const outPath = import_path.default.join(outDir, "final.mp4");

  await writeConcatListForImages(imagePaths, durationPerImageSec, listPath);
  await onProgress(5);

  await (0, import_slideshowBaseVideo.buildSlideshowBaseVideo)({
    listPath,
    w,
    h,
    fps,
    exportSpeed,
    config,
    outputPath: basePath,
    onProgress: (pct) => onProgress(5 + Math.round(pct * 0.35)),
  });

  const voicePath = voicePaths[0] || null;
  const musicPath = musicPaths[0] || null;
  const rowData = Array.isArray(row) ? row : [];

  await (0, import_serverExportRow.processOneRowWithSharedRenderer)({
    videoPath: basePath,
    imageBgPath: null,
    voicePath,
    musicPath,
    row: rowData,
    outputPath: outPath,
    videoVol,
    voiceVol,
    musicVol,
    w,
    h,
    fps,
    rowIndex: 0,
    config,
    hasVideoAudio: false,
    segments: [],
    settingsBgVideo: null,
    jobId,
    isCancelled: () => (0, import_jobCancellation.isJobCancelledAsync)(jobId),
    onFrameProgress: async (p) => {
      await onProgress(40 + Math.round(p.progress * 0.55));
    },
  });

  try {
    import_fs.default.unlinkSync(basePath);
  } catch {
  }

  await onProgress(100);
  return {
    resultUrl: `/uploads/processed/${jobId}/final.mp4`,
    outputFiles: [`/uploads/processed/${jobId}/final.mp4`]
  };
}
async function extractAudioFromVideo(inputPath, outputPath, format = "wav") {
  return new Promise((resolve, reject) => {
    const cmd = (0, import_fluent_ffmpeg.default)(inputPath);
    if (format === "wav") {
      cmd.outputOptions(["-vn", "-acodec", "pcm_s16le", "-ar", "44100", "-ac", "2", "-threads", String(import_encodeOptions.THREADS_PER_JOB)]);
    } else {
      cmd.outputOptions(["-vn", "-acodec", "libmp3lame", "-ab", "192k", "-threads", String(import_encodeOptions.THREADS_PER_JOB)]);
    }
    cmd.output(outputPath).on("end", () => resolve()).on("error", reject).run();
  });
}
async function extractThumbnail(inputPath, outputPath, seekTime = 0.5) {
  return new Promise((resolve, reject) => {
    (0, import_fluent_ffmpeg.default)(inputPath).seekInput(seekTime).outputOptions(["-vframes", "1", "-q:v", "2"]).output(outputPath).on("end", () => resolve()).on("error", reject).run();
  });
}
async function mergeVideos(videoPaths, outputPath, transition = "fade", transitionDuration = 0.5) {
  if (videoPaths.length === 0) throw new Error("No videos to merge");
  if (videoPaths.length === 1) {
    import_fs.default.copyFileSync(videoPaths[0], outputPath);
    return;
  }
  const listFile = outputPath + ".list.txt";
  const content = videoPaths.map((p) => `file '${p.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`).join("\n");
  import_fs.default.writeFileSync(listFile, content);
  return new Promise((resolve, reject) => {
    (0, import_fluent_ffmpeg.default)().input(listFile).inputOptions(["-f", "concat", "-safe", "0"]).outputOptions([
      ...getVideoEncodeOptions(),
      "-c:a",
      "aac",
      "-b:a",
      "128k"
    ]).output(outputPath).on("end", () => {
      try {
        import_fs.default.unlinkSync(listFile);
      } catch (_) {
      }
      resolve();
    }).on("error", reject).run();
  });
}
function zipDir(srcDir, outPath) {
  return new Promise((resolve, reject) => {
    const output = import_fs.default.createWriteStream(outPath);
    const archive = (0, import_archiver.default)("zip", { zlib: { level: 1 } });
    output.on("close", () => resolve());
    archive.on("error", reject);
    archive.pipe(output);
    const names = import_fs.default.readdirSync(srcDir).filter((n) => !n.endsWith(".zip") && !n.endsWith(".list.txt"));
    for (const n of names) {
      const fp = import_path.default.join(srcDir, n);
      if (import_fs.default.statSync(fp).isFile()) archive.file(fp, { name: n });
    }
    archive.finalize();
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  extractAudioFromVideo,
  extractThumbnail,
  mergeVideos,
  processSlideshowJob,
  processVideoJob,
  zipDir
});
