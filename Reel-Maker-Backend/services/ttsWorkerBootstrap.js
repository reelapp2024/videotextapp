/**
 * Bull TTS worker — one job per text row (parallel Edge synthesis via Redis).
 */
const { getTtsQueue } = require('../queues/ttsQueue');
const { getTtsQueueName, getTtsWorkerConcurrency } = require('./bullTtsConfig');
const { runTtsItemJob } = require('./ttsItemProcessor');
const { recordTtsItemFailure } = require('./ttsProgress');

/** @type {import('bull').Queue|null} */
let activeQueue = null;
let processorRegistered = false;
let shuttingDown = false;

async function processTtsJob(job) {
  if (shuttingDown) throw new Error('TTS worker shutting down');

  const data = job.data || {};
  const { parentJobId, itemIndex } = data;
  if (!parentJobId || itemIndex == null) {
    throw new Error('Invalid TTS job payload');
  }

  console.log(`[tts-worker] item ${itemIndex + 1} for job ${parentJobId}`);
  return runTtsItemJob(data);
}

/**
 * @returns {Promise<import('bull').Queue|null>}
 */
async function startEmbeddedTtsWorker() {
  if (activeQueue && processorRegistered) return activeQueue;

  const queue = getTtsQueue();
  if (!queue) {
    console.warn('[tts-worker] Redis unavailable — TTS jobs will fall back to in-process mode');
    return null;
  }

  const concurrency = getTtsWorkerConcurrency();
  const queueName = getTtsQueueName();

  try {
    await queue.isReady();
  } catch (err) {
    console.warn('[tts-worker] Redis unavailable:', err.message);
    return null;
  }

  if (!processorRegistered) {
    queue.process(concurrency, processTtsJob);

    queue.on('completed', (job) => {
      console.log(`[tts-worker] done item ${job.data?.itemIndex} job ${job.data?.parentJobId}`);
    });

    queue.on('failed', async (job, err) => {
      const parentJobId = job?.data?.parentJobId;
      const itemIndex = job?.data?.itemIndex;
      const maxAttempts = job?.opts?.attempts ?? 1;
      console.error(
        `[tts-worker] failed item ${itemIndex} job ${parentJobId} (attempt ${job?.attemptsMade}/${maxAttempts}):`,
        err?.message,
      );
      if (!parentJobId || itemIndex == null) return;
      if (job.attemptsMade >= maxAttempts) {
        await recordTtsItemFailure(parentJobId, itemIndex, err?.message || 'TTS failed');
      }
    });

    queue.on('stalled', (job) => {
      console.warn('[tts-worker] stalled job', job?.id);
    });

    processorRegistered = true;
  }

  activeQueue = queue;
  console.log(`[tts-worker] ready (queue=${queueName}, concurrency=${concurrency})`);
  return queue;
}

async function stopEmbeddedTtsWorker() {
  if (!activeQueue) return;
  shuttingDown = true;
  await activeQueue.close();
  activeQueue = null;
  processorRegistered = false;
  shuttingDown = false;
}

module.exports = {
  startEmbeddedTtsWorker,
  stopEmbeddedTtsWorker,
};
