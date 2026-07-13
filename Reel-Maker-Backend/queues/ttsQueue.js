const Queue = require('bull');
const { getBullRedisConfig, getRedisPrefixKey } = require('./connection');
const { getTtsQueueName } = require('../services/bullTtsConfig');
const { logQueueError } = require('../services/redisProbe');

/** @type {import('bull').Queue|null} */
let ttsQueue = null;

const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'fixed', delay: 2000 },
  removeOnComplete: 100,
  removeOnFail: 50,
};

/**
 * @returns {import('bull').Queue|null}
 */
function getTtsQueue() {
  if (ttsQueue) return ttsQueue;

  const redis = getBullRedisConfig();
  const name = getTtsQueueName();
  const prefix = getRedisPrefixKey();

  const opts = typeof redis === 'string'
    ? { prefix }
    : { redis, prefix };

  ttsQueue = new Queue(name, opts);

  ttsQueue.on('error', (err) => {
    logQueueError('[tts-queue]', err);
  });

  ttsQueue.on('ready', () => {
    console.log('[tts-queue] connected (Bull queue ready)');
  });

  return ttsQueue;
}

function itemBullJobId(parentJobId, itemIndex) {
  return `${parentJobId}::tts::${itemIndex}`;
}

/**
 * Enqueue one Bull job per TTS text item (flattened queue).
 * Supports Basic (Edge) and Advanced (Piper + studio FX) via `mode`.
 * @param {object} parent
 * @param {Array<{ itemIndex: number, text: string }>} items
 */
async function addBulkTtsJobs(parent, items) {
  const queue = getTtsQueue();
  if (!queue) {
    throw new Error('TTS queue unavailable: Redis connection failed');
  }

  await queue.isReady();

  const parentJobId = String(parent.jobId);
  const mode = parent.mode === 'advanced' ? 'advanced' : 'basic';
  const jobs = items.map(({ itemIndex, text }) => ({
    data: {
      mode,
      parentJobId,
      itemIndex,
      text,
      speaker: parent.speaker,
      rate: parent.rate,
      pitch: parent.pitch,
      volume: parent.volume,
      quality: parent.quality,
      outDir: parent.outDir,
      advancedOpts: mode === 'advanced' ? parent.advancedOpts || {} : undefined,
    },
    opts: {
      jobId: itemBullJobId(parentJobId, itemIndex),
      priority: itemIndex === 0 ? 1 : 5,
      ...DEFAULT_JOB_OPTIONS,
    },
  }));

  await queue.addBulk(jobs);
  console.log(`[tts-queue] enqueued ${jobs.length} ${mode} item job(s) for parent ${parentJobId}`);
}

/**
 * @returns {Promise<boolean>}
 */
async function isTtsQueueAvailable() {
  try {
    const queue = getTtsQueue();
    if (!queue) return false;
    await queue.isReady();
    return true;
  } catch {
    return false;
  }
}

async function closeTtsQueue() {
  if (ttsQueue) {
    await ttsQueue.close();
    ttsQueue = null;
  }
}

module.exports = {
  getTtsQueue,
  addBulkTtsJobs,
  isTtsQueueAvailable,
  closeTtsQueue,
  itemBullJobId,
};
