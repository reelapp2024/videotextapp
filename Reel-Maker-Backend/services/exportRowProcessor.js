const path = require('path');
const fs = require('fs');
const { resolveExportDuration } = require('./mediaProbe');
const { resolveExportFormat, buildOutputFilename } = require('./exportFormat');
const { processRowWithChunkPipeline } = require('./exportChunkPipeline');
const { resolveExportJobCount, buildExportRowData, buildSegmentExcelRow, buildPerRowExportConfig } = require('../utils/exportJobPlanning');
const { resolvePairedIndex } = require('../utils/mediaPairing');
const { resolveTrackSegments } = require('../utils/exportSegments');
const { isJobCancelledAsync, JobCancelledError } = require('./jobCancellation');

async function probeHasAudio(ffprobeAsync, filePath) {
  if (!filePath || !fs.existsSync(filePath)) return false;
  try {
    const meta = await ffprobeAsync(filePath);
    return (meta?.streams || []).some((s) => s.codec_type === 'audio');
  } catch {
    return false;
  }
}

function parseDimsFromConfig(config) {
  const ratio = String(config?.video?.aspectRatio || '').trim();
  const m = ratio.match(/^(\d{2,5})x(\d{2,5})$/i);
  const clamp = (n, min, max, fallback) => {
    const x = Number(n);
    if (!Number.isFinite(x)) return fallback;
    return Math.max(min, Math.min(max, x));
  };
  if (m) {
    return {
      w: clamp(parseInt(m[1], 10), 64, 4096, 1080),
      h: clamp(parseInt(m[2], 10), 64, 4096, 1920),
    };
  }
  return {
    w: clamp(config?.video?.width, 64, 4096, 1080),
    h: clamp(config?.video?.height, 64, 4096, 1920),
  };
}

function clampFps(n, min, max, fallback) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(min, Math.min(max, x));
}

function resolveServerExportFps(config, sourceFps) {
  const videoCfg = config?.video || {};
  const manual = clampFps(videoCfg.fps, 10, 60, 30);
  const maxFps = clampFps(parseInt(process.env.EXPORT_MAX_FPS || '30', 10), 12, 60, 30);
  const useMatch = videoCfg.frameRateMode === 'match'
    || (videoCfg.frameRateMode !== 'manual' && videoCfg.useSourceFps !== false);
  if (!useMatch || sourceFps == null || !Number.isFinite(sourceFps) || sourceFps <= 0) {
    return Math.min(manual, maxFps);
  }
  const rounded = Math.round(sourceFps);
  let fps;
  if (rounded <= 26) fps = 24;
  else if (rounded <= 45) fps = 30;
  else fps = 30; // never auto-bump to 60 — doubles export time with no caption benefit
  return Math.min(fps, maxFps);
}

async function computeRowFrameCount(params) {
  const { videoPath, imageBgPath, voicePath, musicPath, segments, config, fps } = params;
  const duration = await resolveExportDuration({
    videoPath: videoPath || imageBgPath,
    voicePath,
    musicPath,
    segments,
    config,
  });
  const exportSpeed = Math.max(0.25, Math.min(4, Number(config?.video?.exportSpeed) || 1));
  const outputDuration = Math.max(duration / exportSpeed, 1 / fps);
  const totalFrames = Math.max(1, Math.ceil(outputDuration * fps));
  return { duration, outputDuration, totalFrames, exportSpeed };
}

/**
 * Build context shared across all rows in a bulk export job.
 */
async function buildExportJobContext(jobId, files, excelData, config, deps = {}) {
  const {
    ffprobeAsync,
    probeVideoFps,
    resolveSettingsBackgroundPaths,
    jobMediaDir,
  } = deps;

  const captionExport = config?.captionExport;
  const useCaptionExport = Boolean(captionExport?.tracks?.some((t) => t.segments?.length > 0));

  const videoPaths = (files.videos || []).filter((p) => p && fs.existsSync(p));
  const voicePaths = (files.voices || []).filter((p) => p && fs.existsSync(p));
  const musicPaths = (files.music || []).filter((p) => p && fs.existsSync(p));
  const imagePaths = (files.images || []).filter((p) => p && fs.existsSync(p));

  const { w, h } = parseDimsFromConfig(config);
  const probedSourceFps = videoPaths[0] ? await probeVideoFps(videoPaths[0]) : null;
  const fps = resolveServerExportFps(config, probedSourceFps);

  const settingsBg = await resolveSettingsBackgroundPaths(config, jobMediaDir);
  const rows = resolveExportJobCount({
    excelData,
    config,
    useCaptionExport,
    captionExport,
    voiceCount: voicePaths.length,
    videoCount: videoPaths.length,
    imageCount: imagePaths.length,
  });

  const exportFmt = resolveExportFormat(config);
  const pairing = config?.exportMediaPairing || null;

  return {
    jobId,
    outDir: path.join(__dirname, '../uploads/processed', jobId),
    useCaptionExport,
    captionExport,
    videoPaths,
    voicePaths,
    musicPaths,
    imagePaths,
    w,
    h,
    fps,
    probedSourceFps,
    settingsBgImage: settingsBg.imagePath,
    settingsBgVideo: settingsBg.videoPath,
    rows,
    exportFmt,
    pairing,
    videoVol: deps.videoVol,
    voiceVol: deps.voiceVol,
    musicVol: deps.musicVol,
    ffprobeAsync,
  };
}

/**
 * Process a single export row (one output video).
 */
async function processSingleExportRow(ctx, rowIndex, hooks = {}) {
  const {
    jobId,
    outDir,
    useCaptionExport,
    captionExport,
    videoPaths,
    voicePaths,
    musicPaths,
    imagePaths,
    w,
    h,
    fps,
    settingsBgImage,
    settingsBgVideo,
    exportFmt,
    pairing,
    videoVol,
    voiceVol,
    musicVol,
    ffprobeAsync,
  } = ctx;

  const { excelData, config, onFrameProgress, isCancelled, queueWaitMs = 0, retryCount = 0 } = hooks;

  const cancelCheck = isCancelled || (() => isJobCancelledAsync(jobId));
  if (await cancelCheck()) throw new JobCancelledError();

  const videoIdx = resolvePairedIndex(pairing, 'videoIndices', rowIndex, videoPaths.length);
  const imageIdx = resolvePairedIndex(pairing, 'imageIndices', rowIndex, imagePaths.length);
  const voiceIdx = resolvePairedIndex(pairing, 'voiceIndices', rowIndex, voicePaths.length);
  const musicIdx = resolvePairedIndex(pairing, 'musicIndices', rowIndex, musicPaths.length);

  const uploadVideoPath = videoPaths.length > 0 ? videoPaths[videoIdx] : null;
  const uploadImagePath = imagePaths.length > 0 ? imagePaths[imageIdx] : null;
  const voicePath = voicePaths.length > 0 ? voicePaths[voiceIdx] : null;
  const musicPath = musicPaths.length > 0 ? musicPaths[musicIdx] : null;

  const row = buildExportRowData(excelData, rowIndex, config);
  const segmentExcelRow = buildSegmentExcelRow(excelData, rowIndex, config);
  const outputPath = path.join(outDir, buildOutputFilename(rowIndex, exportFmt.ext));

  const voiceTrackIdx = voicePaths.length > 0 ? voiceIdx : 0;
  const track = useCaptionExport
    ? captionExport?.tracks?.[voiceTrackIdx] || captionExport?.tracks?.[0]
    : null;
  const whisperSegments = track?.segments?.length ? track.segments : null;

  const rowConfig = buildPerRowExportConfig(config, {
    jobIndex: rowIndex,
    voiceCount: voicePaths.length,
    captionExport,
    voiceIndex: voiceIdx,
  });

  let segments = resolveTrackSegments({
    segments: whisperSegments,
    excelRow: segmentExcelRow,
    config: rowConfig,
    fallbackDuration: 60,
  });
  if (!segments.length && rowConfig?.captionSync?.segments?.length) {
    segments = resolveTrackSegments({
      segments: rowConfig.captionSync.segments,
      excelRow: segmentExcelRow,
      config: rowConfig,
      fallbackDuration: 60,
    });
  }

  let imageBgPath = settingsBgImage || uploadImagePath;
  let videoPath = uploadVideoPath || settingsBgVideo;
  const videoHasAudio = videoPath ? await probeHasAudio(ffprobeAsync, videoPath) : false;

  console.log(`[export/server] row ${rowIndex + 1}: voice=${voiceIdx + 1} video=${videoPaths.length ? videoIdx + 1 : '-'} image=${imagePaths.length ? imageIdx + 1 : '-'}`);

  const frameMetrics = await computeRowFrameCount({
    videoPath,
    imageBgPath,
    voicePath,
    musicPath,
    segments,
    config: rowConfig,
    fps,
  });

  return processRowWithChunkPipeline({
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
    rowIndex,
    config: rowConfig,
    hasVideoAudio: videoHasAudio,
    segments,
    settingsBgVideo,
    jobId,
    queueWaitMs,
    retryCount,
    isCancelled: cancelCheck,
    onFrameProgress,
    totalFrames: frameMetrics.totalFrames,
    outputDuration: frameMetrics.outputDuration,
    exportSpeed: frameMetrics.exportSpeed,
  });
}

function scanValidOutputFiles(outDir, exportFmt) {
  const MIN_OUTPUT_BYTES = 1000;
  const outFileRe = new RegExp(`^out_\\d+\\.${exportFmt.ext.replace('.', '\\.')}$`);
  const outNames = fs.readdirSync(outDir).filter((f) => outFileRe.test(f)).sort();
  return outNames
    .filter((f) => {
      try {
        return fs.statSync(path.join(outDir, f)).size >= MIN_OUTPUT_BYTES;
      } catch {
        return false;
      }
    })
    .map((f) => `/uploads/processed/${path.basename(outDir)}/${f}`);
}

module.exports = {
  parseDimsFromConfig,
  resolveServerExportFps,
  buildExportJobContext,
  processSingleExportRow,
  scanValidOutputFiles,
  computeRowFrameCount,
};
