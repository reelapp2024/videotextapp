/**
 * Bull caption transcription worker — one job per audio track.
 */
const { getCaptionQueue } = require('../queues/captionQueue');
const { getCaptionQueueName, getCaptionWorkerConcurrency } = require('./bullCaptionConfig');
const { transcribeOneTrack } = require('./captionProcessor');
const { startWhisperServerPool } = require('./whisperServerPool');
const CaptionJob = require('../models/CaptionJob');

/** @type {import('bull').Queue|null} */
let activeQueue = null;
let processorRegistered = false;
let shuttingDown = false;

async function processCaptionJob(job) {
  if (shuttingDown) throw new Error('Caption worker shutting down');

  const { captionJobId, trackId, model, language } = job.data;
  if (!captionJobId || !trackId) {
    throw new Error('Invalid caption job payload');
  }

  console.log(`[caption-worker] transcribing track ${job.data.trackIndex} for job ${captionJobId}`);
  await transcribeOneTrack(captionJobId, trackId, model, language);
  return { ok: true, trackId };
}

/**
 * @returns {Promise<import('bull').Queue|null>}
 */
async function startEmbeddedCaptionWorker() {
  if (activeQueue && processorRegistered) return activeQueue;

  const queue = getCaptionQueue();
  if (!queue) {
    console.warn('[caption-worker] Redis unavailable — caption jobs will fall back to in-process mode');
    return null;
  }

  const concurrency = getCaptionWorkerConcurrency();
  const queueName = getCaptionQueueName();

  try {
    await queue.isReady();
  } catch (err) {
    console.warn('[caption-worker] Redis unavailable:', err.message);
    return null;
  }

  await startWhisperServerPool().catch((err) => {
    console.warn('[caption-worker] whisper pool pre-load failed:', err.message);
  });

  if (!processorRegistered) {
    queue.process(concurrency, processCaptionJob);

    queue.on('completed', (job) => {
      console.log(`[caption-worker] done track ${job.data?.trackIndex} job ${job.data?.captionJobId}`);
    });

    queue.on('failed', async (job, err) => {
      const captionJobId = job?.data?.captionJobId;
      console.error(`[caption-worker] failed track ${job?.data?.trackIndex} job ${captionJobId}:`, err?.message);
      if (!captionJobId) return;
      const maxAttempts = job.opts?.attempts ?? 1;
      if (job.attemptsMade >= maxAttempts) {
        await CaptionJob.findOneAndUpdate(
          { jobId: captionJobId },
          { $set: { error: err?.message || 'Caption transcription failed' } },
        );
      }
    });

    queue.on('stalled', (job) => {
      console.warn('[caption-worker] stalled job', job?.id);
    });

    processorRegistered = true;
  }

  activeQueue = queue;
  console.log(`[caption-worker] ready (queue=${queueName}, concurrency=${concurrency})`);
  return queue;
}

async function stopEmbeddedCaptionWorker() {
  if (!activeQueue) return;
  shuttingDown = true;
  await activeQueue.close();
  activeQueue = null;
  processorRegistered = false;
  shuttingDown = false;
}

module.exports = {
  startEmbeddedCaptionWorker,
  stopEmbeddedCaptionWorker,
};
