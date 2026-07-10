const fs = require('fs');
const { useBullTts } = require('./bullTtsConfig');
const { addBulkTtsJobs, isTtsQueueAvailable } = require('../queues/ttsQueue');
const ProcessingJob = require('../models/ProcessingJob');
const { getTtsWorkerConcurrency } = require('./bullTtsConfig');

/**
 * Enqueue flattened TTS jobs via Bull (one job per text row).
 * @param {object} payload
 * @returns {Promise<boolean>}
 */
async function tryEnqueueTtsBatch(payload) {
  if (!useBullTts()) {
    return false;
  }

  try {
    const available = await isTtsQueueAvailable();
    if (!available) {
      console.warn('[tts-queue] Redis unavailable — falling back to in-process TTS');
      return false;
    }

    const { jobId, texts, outDir } = payload;
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const items = texts
      .map((text, itemIndex) => ({ itemIndex, text: String(text ?? '').trim() }))
      .filter((it) => it.text.length > 0);

    await ProcessingJob.findOneAndUpdate({ jobId }, {
      status: 'processing',
      progress: 1,
      totalItems: items.length,
      'config.parallelJobs': getTtsWorkerConcurrency(),
    });

    await addBulkTtsJobs(payload, items);
    console.log(`[tts-queue] batch ${jobId}: ${items.length} item job(s) enqueued`);
    return true;
  } catch (err) {
    console.warn('[tts-queue] enqueue failed — falling back to in-process TTS:', err.message);
    return false;
  }
}

module.exports = {
  tryEnqueueTtsBatch,
};
