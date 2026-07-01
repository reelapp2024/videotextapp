/**
 * Shared Bull export worker — used by standalone worker and embedded API process.
 * Uses Bull (not BullMQ) for compatibility with Redis 3.x on Windows.
 */
const { getExportQueue } = require('../queues/exportQueue');
const { getExportQueueName, getWorkerConcurrency } = require('./bullExportConfig');
const {
  runVideoExportJob,
  handleExportJobFailure,
  PHASE,
} = require('./exportJobRunner');
const { clearJobCancelled, JobCancelledError } = require('./jobCancellation');
const { exportLog } = require('./exportLogger');
const { getWorkerId, getMemorySnapshot } = require('./workerContext');
const { getWorkerAssetCache } = require('./exportAssetCache');
const { getExportMetricsStore } = require('./exportMetricsStore');
const VideoJob = require('../models/VideoJob');

/** @type {import('bull').Queue|null} */
let activeQueue = null;
let processorRegistered = false;
let activeJobs = 0;
let shuttingDown = false;

function queueWaitMs(job) {
  const enqueued = job.timestamp || Date.now();
  const started = job.processedOn || Date.now();
  return Math.max(0, started - enqueued);
}

async function processExportJob(job) {
  if (shuttingDown) throw new Error('Worker shutting down');

  const { jobId, files, excelData, config } = job.data;
  const waitMs = queueWaitMs(job);
  const attempt = job.attemptsMade + 1;
  const maxAttempts = job.opts?.attempts ?? 1;
  const workerId = getWorkerId();

  activeJobs += 1;
  getExportMetricsStore().recordWorkerUtilization(workerId, activeJobs);

  exportLog('export.worker.job.pickup', {
    jobId,
    bullJobId: job.id,
    attempt,
    maxAttempts,
    queueWaitMs: waitMs,
    retryCount: job.attemptsMade,
  });

  await VideoJob.findOneAndUpdate({ jobId }, {
    exportPhase: PHASE.ASSET_LOADING,
    progress: 1,
  });

  try {
    const result = await runVideoExportJob({
      jobId,
      files,
      excelData,
      config,
      queueWaitMs: waitMs,
      retryCount: job.attemptsMade,
    });
    await job.progress(100);
    return {
      resultUrl: result.resultUrl,
      outputFiles: result.outputFiles,
    };
  } catch (err) {
    if (err instanceof JobCancelledError) {
      await handleExportJobFailure(jobId, err);
      return { cancelled: true };
    }
    exportLog('export.worker.job.error', {
      jobId,
      error: err.message,
      attempt,
      maxAttempts,
    });
    throw err;
  } finally {
    activeJobs = Math.max(0, activeJobs - 1);
    getExportMetricsStore().recordWorkerUtilization(workerId, activeJobs);
    getWorkerAssetCache().clearPerJob();
    clearJobCancelled(jobId);
  }
}

/**
 * Start export worker processor (idempotent).
 * @returns {Promise<import('bull').Queue|null>}
 */
async function startEmbeddedExportWorker() {
  if (activeQueue && processorRegistered) return activeQueue;

  const queue = getExportQueue();
  if (!queue) {
    console.warn('[export-worker] Redis unavailable — export jobs will fall back to in-process mode');
    return null;
  }

  const concurrency = getWorkerConcurrency();
  const queueName = getExportQueueName();
  const workerId = getWorkerId();

  try {
    await queue.isReady();
  } catch (err) {
    console.warn('[export-worker] Redis unavailable:', err.message);
    return null;
  }

  exportLog('export.worker.started', {
    workerId,
    queueName,
    concurrency,
    embedded: true,
    memory: getMemorySnapshot(),
  });

  if (!processorRegistered) {
    queue.process(concurrency, processExportJob);

    queue.on('completed', (job) => {
      exportLog('export.worker.job.completed', {
        jobId: job.data?.jobId,
        bullJobId: job.id,
        durationMs: job.finishedOn && job.processedOn ? job.finishedOn - job.processedOn : null,
      });
    });

    queue.on('failed', async (job, err) => {
      if (!job?.data?.jobId) return;
      const jobId = job.data.jobId;
      const maxAttempts = job.opts?.attempts ?? 1;
      if (job.attemptsMade < maxAttempts) {
        exportLog('export.worker.job.retry', {
          jobId,
          attempt: job.attemptsMade,
          maxAttempts,
          error: err?.message,
        });
        await VideoJob.findOneAndUpdate({ jobId }, {
          status: 'processing',
          exportPhase: PHASE.ASSET_LOADING,
        });
        return;
      }
      exportLog('export.worker.job.exhausted', {
        jobId,
        error: err?.message,
        attempts: job.attemptsMade,
      });
      await handleExportJobFailure(jobId, err);
      clearJobCancelled(jobId);
    });

    queue.on('stalled', (job) => {
      exportLog('export.worker.job.stalled', { bullJobId: job?.id });
    });

    processorRegistered = true;
  }

  activeQueue = queue;
  exportLog('export.worker.ready', { workerId, concurrency, embedded: true });
  return queue;
}

async function stopEmbeddedExportWorker() {
  if (!activeQueue) return;
  shuttingDown = true;
  await activeQueue.close();
  activeQueue = null;
  processorRegistered = false;
  shuttingDown = false;
}

module.exports = {
  startEmbeddedExportWorker,
  stopEmbeddedExportWorker,
};
