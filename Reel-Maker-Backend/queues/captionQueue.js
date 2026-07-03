const Queue = require('bull');
const { getBullRedisConfig, getRedisPrefixKey } = require('./connection');
const { getCaptionQueueName } = require('../services/bullCaptionConfig');

/** @type {import('bull').Queue|null} */
let captionQueue = null;

/**
 * @returns {import('bull').Queue|null}
 */
function getCaptionQueue() {
  if (captionQueue) return captionQueue;

  const redis = getBullRedisConfig();
  const name = getCaptionQueueName();
  const prefix = getRedisPrefixKey();

  const opts = typeof redis === 'string'
    ? { prefix }
    : { redis, prefix };

  captionQueue = new Queue(name, opts);

  captionQueue.on('error', (err) => {
    console.error('[caption-queue] queue error:', err.message);
  });

  captionQueue.on('ready', () => {
    console.log('[caption-queue] connected (Bull queue ready)');
  });

  return captionQueue;
}

/**
 * Enqueue one caption track transcription job.
 * @param {object} data
 * @param {{ priority?: number }} [opts]
 * @returns {Promise<import('bull').Job|null>}
 */
async function addCaptionJob(data, opts = {}) {
  const queue = getCaptionQueue();
  if (!queue) {
    throw new Error('Caption queue unavailable: Redis connection failed');
  }

  await queue.isReady();

  const trackIndex = Number(data.trackIndex) || 0;
  const job = await queue.add(data, {
    jobId: `caption-${data.captionJobId}-${trackIndex}`,
    priority: opts.priority ?? (trackIndex === 0 ? 1 : 5),
    attempts: 2,
    backoff: { type: 'fixed', delay: 3000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  });

  console.log(`[caption-queue] enqueued track ${trackIndex} for job ${data.captionJobId} (bull id=${job.id})`);
  return job;
}

/**
 * @returns {Promise<boolean>}
 */
async function isCaptionQueueAvailable() {
  try {
    const queue = getCaptionQueue();
    if (!queue) return false;
    await queue.isReady();
    return true;
  } catch {
    return false;
  }
}

async function closeCaptionQueue() {
  if (captionQueue) {
    await captionQueue.close();
    captionQueue = null;
  }
}

module.exports = {
  getCaptionQueue,
  addCaptionJob,
  isCaptionQueueAvailable,
  closeCaptionQueue,
};
