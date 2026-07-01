const Queue = require('bull');
const { getBullRedisConfig, getRedisPrefixKey } = require('./connection');
const { getExportQueueName } = require('../services/bullExportConfig');

/** @type {import('bull').Queue|null} */
let exportQueue = null;

const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000,
  },
  removeOnComplete: {
    age: 24 * 3600,
    count: 500,
  },
  removeOnFail: {
    age: 7 * 24 * 3600,
    count: 200,
  },
};

/**
 * @returns {import('bull').Queue|null}
 */
function getExportQueue() {
  if (exportQueue) return exportQueue;

  const redis = getBullRedisConfig();
  const name = getExportQueueName();
  const prefix = getRedisPrefixKey();

  const opts = typeof redis === 'string'
    ? { prefix }
    : { redis, prefix };

  exportQueue = new Queue(name, opts);

  exportQueue.on('error', (err) => {
    console.error('[redis] queue error:', err.message);
  });

  exportQueue.on('ready', () => {
    console.log('[redis] connected (Bull queue ready)');
  });

  return exportQueue;
}

/**
 * Enqueue a video export job.
 * @param {object} data — { jobId, files, excelData, config }
 * @returns {Promise<import('bull').Job|null>}
 */
async function addExportJob(data) {
  const queue = getExportQueue();
  if (!queue) {
    throw new Error('Export queue unavailable: Redis connection failed');
  }

  await queue.isReady();

  const job = await queue.add(data, {
    jobId: String(data.jobId),
    ...DEFAULT_JOB_OPTIONS,
  });

  console.log(`[export-queue] enqueued job ${data.jobId} (bull id=${job.id})`);
  return job;
}

/**
 * Remove a queued job (e.g. user cancellation before worker picks up).
 * @param {string} jobId
 */
async function removeExportJob(jobId) {
  const queue = getExportQueue();
  if (!queue) return false;

  const job = await queue.getJob(String(jobId));
  if (!job) return false;

  const state = await job.getState();
  if (state === 'active') {
    return false;
  }

  await job.remove();
  console.log(`[export-queue] removed queued job ${jobId}`);
  return true;
}

/**
 * Check if Redis queue is reachable.
 */
async function isExportQueueAvailable() {
  try {
    const queue = getExportQueue();
    if (!queue) return false;
    await queue.isReady();
    return true;
  } catch {
    return false;
  }
}

async function closeExportQueue() {
  if (exportQueue) {
    await exportQueue.close();
    exportQueue = null;
  }
}

module.exports = {
  getExportQueue,
  addExportJob,
  removeExportJob,
  isExportQueueAvailable,
  closeExportQueue,
  DEFAULT_JOB_OPTIONS,
};
