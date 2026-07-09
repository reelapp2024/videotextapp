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
 * Enqueue a video export job (legacy — single Bull job for entire bulk export).
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

function rowBullJobId(parentJobId, rowIndex) {
  return `${parentJobId}::row::${rowIndex}`;
}

/**
 * Enqueue one Bull job per output video (flattened queue).
 * @param {object} data — { jobId, files, excelData, config }
 * @param {number} rowCount
 */
async function addBulkExportJobs(data, rowCount) {
  const queue = getExportQueue();
  if (!queue) {
    throw new Error('Export queue unavailable: Redis connection failed');
  }

  await queue.isReady();

  const parentJobId = String(data.jobId);
  const jobs = Array.from({ length: rowCount }, (_, rowIndex) => ({
    data: {
      parentJobId,
      rowIndex,
      files: data.files,
      excelData: data.excelData,
      config: data.config,
    },
    opts: {
      jobId: rowBullJobId(parentJobId, rowIndex),
      ...DEFAULT_JOB_OPTIONS,
    },
  }));

  await queue.addBulk(jobs);
  console.log(`[export-queue] enqueued ${rowCount} row jobs for parent ${parentJobId}`);
}

/**
 * Remove queued export jobs for a parent bulk export (and legacy single job).
 * @param {string} jobId
 */
async function removeExportJobsForParent(jobId) {
  const queue = getExportQueue();
  if (!queue) return false;

  let removed = false;
  const legacy = await queue.getJob(String(jobId));
  if (legacy) {
    const state = await legacy.getState();
    if (state !== 'active') {
      await legacy.remove();
      removed = true;
    }
  }

  for (const state of ['waiting', 'delayed', 'paused']) {
    const jobs = await queue.getJobs([state], 0, 500);
    for (const job of jobs) {
      const d = job.data || {};
      if (d.parentJobId === jobId || d.jobId === jobId) {
        await job.remove();
        removed = true;
      }
    }
  }

  if (removed) console.log(`[export-queue] removed queued jobs for ${jobId}`);
  return removed;
}

/**
 * Remove a queued job (e.g. user cancellation before worker picks up).
 * @param {string} jobId
 */
async function removeExportJob(jobId) {
  return removeExportJobsForParent(jobId);
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
  addBulkExportJobs,
  removeExportJob,
  removeExportJobsForParent,
  rowBullJobId,
  isExportQueueAvailable,
  closeExportQueue,
  DEFAULT_JOB_OPTIONS,
};
