const path = require('path');
const ProcessingJob = require('../models/ProcessingJob');
const { zipDir } = require('./videoProcessor');

const throttleMs = Math.max(200, parseInt(process.env.TTS_PROGRESS_THROTTLE_MS || '350', 10) || 350);
const lastWriteByKey = new Map();

function computeTtsOverallProgress(completed, total, itemProgress = {}) {
  const totalN = Math.max(1, Number(total) || 1);
  const done = Math.max(0, Number(completed) || 0);
  let sum = done * 100;
  for (const v of Object.values(itemProgress)) {
    if (typeof v === 'number' && Number.isFinite(v)) {
      sum += Math.max(0, Math.min(99, v));
    }
  }
  return Math.min(99, Math.round(sum / totalN));
}

/**
 * @param {string} parentJobId
 * @param {number} itemIndex
 * @param {number} pct
 */
async function updateTtsItemProgress(parentJobId, itemIndex, pct) {
  const key = `${parentJobId}:${itemIndex}`;
  const now = Date.now();
  const last = lastWriteByKey.get(key) || 0;
  const p = Math.max(0, Math.min(99, Math.round(Number(pct) || 0)));
  if (p < 99 && now - last < throttleMs) return null;
  lastWriteByKey.set(key, now);

  const rowKey = String(itemIndex);
  await ProcessingJob.findOneAndUpdate(
    { jobId: parentJobId },
    { $set: { [`config.itemProgress.${rowKey}`]: p, status: 'processing' } },
  );

  const job = await ProcessingJob.findOne({ jobId: parentJobId }).lean();
  if (!job) return null;

  const completed = (job.config?.completedItemIndexes || []).length;
  const total = job.totalItems || 1;
  const progress = computeTtsOverallProgress(completed, total, job.config?.itemProgress || {});

  await ProcessingJob.findOneAndUpdate({ jobId: parentJobId }, {
    progress,
    completedItems: completed,
  });

  return { progress, completed, total };
}

/**
 * Mark one TTS item complete and finalize parent when all items are done.
 * @returns {Promise<object|null>}
 */
async function completeTtsItem(parentJobId, itemIndex, publicPath) {
  const rowKey = String(itemIndex);

  const job = await ProcessingJob.findOneAndUpdate(
    { jobId: parentJobId },
    {
      $addToSet: {
        outputFiles: publicPath,
        'config.completedItemIndexes': itemIndex,
      },
      $set: {
        status: 'processing',
        [`config.itemProgress.${rowKey}`]: 100,
      },
    },
    { new: true },
  );

  if (!job) return null;

  const completedIndexes = job.config?.completedItemIndexes || [];
  const failedIndexes = job.config?.failedItemIndexes || [];
  const completed = completedIndexes.length;
  const total = job.totalItems || 1;
  const progress = Math.min(99, Math.round((completed / total) * 90));

  await ProcessingJob.findOneAndUpdate({ jobId: parentJobId }, {
    completedItems: completed,
    progress,
  });

  lastWriteByKey.delete(`${parentJobId}:${itemIndex}`);

  if (completed + failedIndexes.length >= total) {
    if (failedIndexes.length > 0 && completed < total) {
      return failTtsJob(
        parentJobId,
        `TTS incomplete: ${failedIndexes.length}/${total} item(s) failed after retries`,
      );
    }
    return finalizeTtsJob(parentJobId);
  }

  return { progress, completed, total, done: false };
}

/**
 * @param {string} parentJobId
 * @param {number} itemIndex
 * @param {string} errorMessage
 */
async function recordTtsItemFailure(parentJobId, itemIndex, errorMessage) {
  const job = await ProcessingJob.findOneAndUpdate(
    { jobId: parentJobId },
    {
      $addToSet: { 'config.failedItemIndexes': itemIndex },
      $set: { [`config.itemErrors.${String(itemIndex)}`]: errorMessage },
    },
    { new: true },
  );
  if (!job) return null;

  const completed = (job.config?.completedItemIndexes || []).length;
  const failed = (job.config?.failedItemIndexes || []).length;
  const total = job.totalItems || 1;

  if (completed + failed >= total && completed < total) {
    return failTtsJob(
      parentJobId,
      `TTS incomplete: ${failed}/${total} item(s) failed (${errorMessage})`,
    );
  }
  return { completed, failed, total };
}

async function finalizeTtsJob(parentJobId) {
  const lock = await ProcessingJob.findOneAndUpdate(
    {
      jobId: parentJobId,
      status: { $nin: ['done', 'error'] },
      'config.finalizing': { $ne: true },
    },
    { $set: { 'config.finalizing': true, progress: 92 } },
    { new: true },
  );

  if (!lock) return null;

  try {
    const outDir = lock.config?.outDir;
    if (!outDir) throw new Error('TTS output directory missing on job');

    const zipPath = path.join(outDir, 'tts_audios.zip');
    await zipDir(outDir, zipPath);

    const resultUrl = `/uploads/processed/${parentJobId}/tts_audios.zip`;
    const outputFiles = [...(lock.outputFiles || [])].sort((a, b) => {
      const na = parseInt(String(a).match(/tts_(\d+)/i)?.[1] || '0', 10);
      const nb = parseInt(String(b).match(/tts_(\d+)/i)?.[1] || '0', 10);
      return na - nb;
    });

    await ProcessingJob.findOneAndUpdate({ jobId: parentJobId }, {
      status: 'done',
      progress: 100,
      resultUrl,
      outputFiles,
      completedItems: lock.totalItems || outputFiles.length,
    });

    console.log(`[tts-queue] parent job ${parentJobId} finalized (${outputFiles.length} file(s))`);
    return { done: true, resultUrl, outputFiles };
  } catch (err) {
    await failTtsJob(parentJobId, err.message);
    throw err;
  }
}

async function failTtsJob(parentJobId, message) {
  await ProcessingJob.findOneAndUpdate({ jobId: parentJobId }, {
    status: 'error',
    error: message,
  });
  return { done: true, error: message };
}

module.exports = {
  computeTtsOverallProgress,
  updateTtsItemProgress,
  completeTtsItem,
  recordTtsItemFailure,
  finalizeTtsJob,
  failTtsJob,
};
