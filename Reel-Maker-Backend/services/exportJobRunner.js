const VideoJob = require('../models/VideoJob');
const { processVideoJob } = require('./videoProcessor');
const {
  clearJobCancelled,
  isJobCancelled,
  isJobCancelledAsync,
  JobCancelledError,
} = require('./jobCancellation');
const { exportLog } = require('./exportLogger');
const { getExportMetricsStore } = require('./exportMetricsStore');
const { getWorkerId, MemoryPeakTracker } = require('./workerContext');

/** Progress phase labels (M8) — stored on VideoJob.exportPhase (optional). */
const PHASE = {
  ASSET_LOADING: 'asset_loading',
  RENDERING: 'rendering',
  ENCODING: 'encoding',
  FINALIZING: 'finalizing',
  COMPLETED: 'completed',
};

/**
 * Map numeric progress to export phase.
 * @param {number} progress
 */
function phaseFromProgress(progress) {
  const p = Number(progress) || 0;
  if (p >= 100) return PHASE.COMPLETED;
  if (p >= 90) return PHASE.FINALIZING;
  if (p >= 70) return PHASE.ENCODING;
  if (p >= 5) return PHASE.RENDERING;
  return PHASE.ASSET_LOADING;
}

/**
 * Cancellation check — works across API and worker processes via MongoDB.
 * @param {string} jobId
 */
async function isExportCancelled(jobId) {
  return isJobCancelledAsync(jobId);
}

/**
 * @param {string} jobId
 * @param {object} update
 */
async function updateVideoJobProgress(jobId, update) {
  const phase = update.exportPhase || phaseFromProgress(update.progress);
  await VideoJob.findOneAndUpdate({ jobId }, {
    progress: update.progress,
    exportPhase: phase,
    ...(update.total != null ? { totalVideos: update.total } : {}),
    ...(update.completed != null ? { completedVideos: update.completed } : {}),
    ...(update.outputFiles ? { outputFiles: update.outputFiles } : {}),
  });
}

/**
 * Run full video export for a job (shared by in-process API and BullMQ worker).
 * @param {object} params
 * @param {string} params.jobId
 * @param {object} params.files — { videos, voices, music, images }
 * @param {unknown} params.excelData
 * @param {object} params.config
 * @param {number} [params.queueWaitMs]
 * @param {number} [params.retryCount]
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

  await VideoJob.findOneAndUpdate({ jobId }, {
    status: 'processing',
    progress: 0,
    exportPhase: PHASE.ASSET_LOADING,
  });

  try {
    const result = await processVideoJob(
      jobId,
      files,
      excelData,
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

    await VideoJob.findOneAndUpdate({ jobId }, {
      status: 'done',
      progress: 100,
      exportPhase: PHASE.COMPLETED,
      resultUrl: result.resultUrl,
      outputFiles: result.outputFiles,
    });

    const totalMs = Date.now() - startedAt;
    const peakMemory = memoryTracker.summary();
    const jobMetrics = result.exportMetrics || null;
    if (jobMetrics) {
      getExportMetricsStore().recordJob({ ...jobMetrics, queueWaitMs, totalMs, peakMemory });
    }

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

/**
 * Handle export failure / cancellation cleanup.
 * @param {string} jobId
 * @param {Error} error
 */
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
  handleExportJobFailure,
};
