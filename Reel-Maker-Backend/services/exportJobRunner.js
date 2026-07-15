const path = require('path');
const fs = require('fs');
const VideoJob = require('../models/VideoJob');
const { processVideoJob } = require('./videoProcessor');
const {
  buildExportJobContext,
  processSingleExportRow,
  scanValidOutputFiles,
} = require('./exportRowProcessor');
const {
  clearJobCancelled,
  isJobCancelled,
  isJobCancelledAsync,
  JobCancelledError,
} = require('./jobCancellation');
const { exportLog } = require('./exportLogger');
const { getExportMetricsStore } = require('./exportMetricsStore');
const { getWorkerId, MemoryPeakTracker } = require('./workerContext');
const {
  sanitizeExcelData,
  resolveExportJobCount,
} = require('../utils/exportJobPlanning');
const { resolveWorkerConcurrency } = require('./exportResourcePlanner');
const {
  updateRowExportProgress,
  clearRowProgressThrottle,
} = require('./exportProgress');
const { resolveSettingsBackgroundPaths } = require('./exportMediaResolver');
const { resolveExportVideoVolume } = require('./videoLayoutFilters');
const ffmpeg = require('fluent-ffmpeg');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
const { getFfmpegPath } = require('./encodeOptions');
const { buildOutputFilename } = require('./exportFormat');
const { promisify } = require('util');

ffmpeg.setFfmpegPath(getFfmpegPath());
ffmpeg.setFfprobePath(ffprobeInstaller.path);
const ffprobeAsync = promisify(ffmpeg.ffprobe);

/** Progress phase labels (M8) — stored on VideoJob.exportPhase (optional). */
const PHASE = {
  ASSET_LOADING: 'asset_loading',
  RENDERING: 'rendering',
  ENCODING: 'encoding',
  FINALIZING: 'finalizing',
  COMPLETED: 'completed',
};

function phaseFromProgress(progress) {
  const p = Number(progress) || 0;
  if (p >= 100) return PHASE.COMPLETED;
  if (p >= 90) return PHASE.FINALIZING;
  if (p >= 70) return PHASE.ENCODING;
  if (p >= 5) return PHASE.RENDERING;
  return PHASE.ASSET_LOADING;
}

async function isExportCancelled(jobId) {
  return isJobCancelledAsync(jobId);
}

async function updateVideoJobProgress(jobId, update) {
  const phase = update.exportPhase || phaseFromProgress(update.progress);
  await VideoJob.findOneAndUpdate({ jobId }, {
    progress: update.progress,
    exportPhase: phase,
    ...(update.total != null ? { totalVideos: update.total } : {}),
    ...(update.completed != null ? { completedVideos: update.completed } : {}),
    ...(update.outputFiles ? { outputFiles: update.outputFiles } : {}),
    ...(update.rowProgress != null ? { exportRowProgress: update.rowProgress } : {}),
    ...(update.parallelJobs != null ? { parallelJobs: update.parallelJobs } : {}),
  });
}

function parseFpsRate(rate) {
  if (!rate || typeof rate !== 'string') return null;
  const parts = rate.split('/');
  if (parts.length !== 2) return null;
  const num = Number(parts[0]);
  const den = Number(parts[1]);
  if (!Number.isFinite(num) || !Number.isFinite(den) || den <= 0) return null;
  return num / den;
}

async function probeVideoFps(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  try {
    const meta = await ffprobeAsync(filePath);
    const vs = (meta?.streams || []).find((s) => s.codec_type === 'video');
    if (!vs) return null;
    const fps = parseFpsRate(vs.avg_frame_rate) || parseFpsRate(vs.r_frame_rate);
    if (!fps || !Number.isFinite(fps) || fps <= 0) return null;
    return Math.round(fps * 100) / 100;
  } catch {
    return null;
  }
}

async function buildRowProcessorDeps(jobId, files, config, useCaptionExport) {
  const outDir = path.join(__dirname, '../uploads/processed', jobId);
  fs.mkdirSync(outDir, { recursive: true });
  const jobMediaDir = path.join(outDir, '_media');
  fs.mkdirSync(jobMediaDir, { recursive: true });

  return {
    ffprobeAsync,
    probeVideoFps,
    resolveSettingsBackgroundPaths,
    jobMediaDir,
    videoVol: resolveExportVideoVolume(config, useCaptionExport),
    voiceVol: config?.audio?.volumeEnabled !== false ? config?.audio?.volume ?? 0.5 : 0,
    musicVol: config?.audio?.volumeEnabled !== false ? config?.audio?.musicVolume ?? 0.3 : 0,
  };
}

/**
 * Process one output video for a flattened Bull row job.
 */
async function runSingleRowExportJob(params) {
  const {
    parentJobId,
    rowIndex,
    files,
    excelData,
    config,
    queueWaitMs = 0,
    retryCount = 0,
  } = params;

  const memoryTracker = new MemoryPeakTracker();
  const cleanExcel = sanitizeExcelData(excelData);
  const captionExport = config?.captionExport;
  const useCaptionExport = Boolean(captionExport?.tracks?.some((t) => t.segments?.length > 0));

  if (await isExportCancelled(parentJobId)) {
    throw new JobCancelledError();
  }

  await VideoJob.findOneAndUpdate(
    { jobId: parentJobId, exportStartedAt: null },
    { exportStartedAt: new Date(), status: 'processing', progress: 2 },
  );

  const deps = await buildRowProcessorDeps(parentJobId, files, config, useCaptionExport);
  const ctx = await buildExportJobContext(parentJobId, files, cleanExcel, config, deps);
  fs.mkdirSync(ctx.outDir, { recursive: true });

  await updateRowExportProgress(parentJobId, rowIndex, 3, { force: true });

  const onFrameProgress = async (p) => {
    await updateRowExportProgress(parentJobId, rowIndex, p.progress);
    memoryTracker.sample();
  };

  const rowMetrics = await processSingleExportRow(ctx, rowIndex, {
    excelData: cleanExcel,
    config,
    onFrameProgress,
    isCancelled: () => isExportCancelled(parentJobId),
    queueWaitMs,
    retryCount,
  });

  const outputPath = path.join(ctx.outDir, buildOutputFilename(rowIndex, ctx.exportFmt.ext));
  if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size < 1000) {
    throw new Error(`Export failed: row ${rowIndex + 1} produced no valid output (${outputPath})`);
  }

  clearRowProgressThrottle(parentJobId, rowIndex);

  const updated = await VideoJob.findOneAndUpdate(
    { jobId: parentJobId },
    {
      $inc: { completedVideos: 1 },
      $unset: { [`exportRowProgress.${String(rowIndex)}`]: '' },
    },
    { new: true },
  );

  const total = updated?.totalVideos || ctx.rows;
  const completed = updated?.completedVideos || 0;
  const { computeOverallProgress } = require('./exportProgress');
  const progress = completed >= total
    ? 100
    : computeOverallProgress(completed, total, updated?.exportRowProgress || {});

  if (completed >= total) {
    const outputFiles = scanValidOutputFiles(ctx.outDir, ctx.exportFmt);
    const totalMs = updated?.exportStartedAt
      ? Date.now() - new Date(updated.exportStartedAt).getTime()
      : null;

    await VideoJob.findOneAndUpdate(
      { jobId: parentJobId, status: { $ne: 'done' } },
      {
        status: 'done',
        progress: 100,
        exportPhase: PHASE.COMPLETED,
        completedVideos: total,
        outputFiles,
        resultUrl: outputFiles[0] || '',
        exportDurationMs: totalMs,
        exportRowProgress: {},
      },
    );

    exportLog('export.job.completed', {
      jobId: parentJobId,
      totalMs,
      completedVideos: total,
      queueWaitMs,
      retryCount,
    });

    return { resultUrl: outputFiles[0] || '', outputFiles, exportMetrics: rowMetrics };
  }

  await VideoJob.findOneAndUpdate({ jobId: parentJobId }, {
    progress,
    exportPhase: phaseFromProgress(progress),
    completedVideos: completed,
  });

  return { rowIndex, completed, total, exportMetrics: rowMetrics };
}

/**
 * Run full video export for a job (in-process fallback — parallel rows in one process).
 */
async function runVideoExportJob(params) {
  const { jobId, files, excelData, config, queueWaitMs = 0, retryCount = 0 } = params;
  const memoryTracker = new MemoryPeakTracker();
  const startedAt = Date.now();

  exportLog('export.job.started', {
    jobId,
    queueWaitMs,
    retryCount,
    workerId: getWorkerId(),
  });

  if (await isExportCancelled(jobId)) {
    throw new JobCancelledError();
  }

  const cleanExcel = sanitizeExcelData(excelData);
  const captionExport = config?.captionExport;
  const useCaptionExport = Boolean(
    captionExport?.tracks?.some((t) => t.segments?.length > 0),
  );
  const plannedVideos = resolveExportJobCount({
    excelData: cleanExcel,
    config,
    useCaptionExport,
    captionExport,
    voiceCount: (files?.voices || []).length,
    videoCount: (files?.videos || []).length,
    imageCount: (files?.images || []).length,
  });

  await VideoJob.findOneAndUpdate({ jobId }, {
    status: 'processing',
    progress: 0,
    exportPhase: PHASE.ASSET_LOADING,
    totalVideos: plannedVideos,
    completedVideos: 0,
    exportRowProgress: {},
    parallelJobs: resolveWorkerConcurrency(),
    exportStartedAt: new Date(),
    exportDurationMs: null,
  });

  exportLog('export.job.planned', { jobId, plannedVideos });

  try {
    const result = await processVideoJob(
      jobId,
      files,
      cleanExcel,
      config,
      async (update) => {
        if (await isExportCancelled(jobId)) throw new JobCancelledError();
        const progress = update.progress ?? 0;
        await updateVideoJobProgress(jobId, {
          ...update,
          exportPhase: phaseFromProgress(progress),
        });
        memoryTracker.sample();
      },
      { queueWaitMs, retryCount },
    );

    const totalMs = Date.now() - startedAt;
    const peakMemory = memoryTracker.summary();
    const jobMetrics = result.exportMetrics || null;
    if (jobMetrics) {
      getExportMetricsStore().recordJob({ ...jobMetrics, queueWaitMs, totalMs, peakMemory });
    }

    await VideoJob.findOneAndUpdate({ jobId }, {
      status: 'done',
      progress: 100,
      exportPhase: PHASE.COMPLETED,
      resultUrl: result.resultUrl,
      outputFiles: result.outputFiles,
      exportDurationMs: totalMs,
    });

    exportLog('export.job.completed', {
      jobId,
      totalMs,
      queueWaitMs,
      retryCount,
      peakHeapUsed: peakMemory.peakHeapUsed,
      peakRss: peakMemory.peakRss,
      renderFps: jobMetrics?.renderFps,
      encodeFps: jobMetrics?.encodeFps,
      cacheHitRatio: jobMetrics?.cacheHitRatio,
    });

    return result;
  } catch (error) {
    const peakMemory = memoryTracker.summary();
    exportLog('export.job.failed', {
      jobId,
      error: error?.message,
      queueWaitMs,
      retryCount,
      peakHeapUsed: peakMemory.peakHeapUsed,
      peakRss: peakMemory.peakRss,
    });
    throw error;
  }
}

async function handleExportJobFailure(jobId, error) {
  if (error instanceof JobCancelledError) {
    await VideoJob.findOneAndUpdate({ jobId }, {
      status: 'cancelled',
      error: error.message,
      exportPhase: null,
    });
  } else {
    await VideoJob.findOneAndUpdate({ jobId }, {
      status: 'error',
      error: error?.message || String(error),
      exportPhase: null,
    });
  }
}

module.exports = {
  PHASE,
  phaseFromProgress,
  isExportCancelled,
  updateVideoJobProgress,
  runVideoExportJob,
  runSingleRowExportJob,
  handleExportJobFailure,
};
