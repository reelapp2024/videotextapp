const VideoJob = require('../models/VideoJob');

const throttleMs = Math.max(200, parseInt(process.env.EXPORT_PROGRESS_THROTTLE_MS || '400', 10) || 400);
const lastWriteByKey = new Map();

function phaseFromProgress(progress) {
  const p = Number(progress) || 0;
  if (p >= 100) return 'completed';
  if (p >= 90) return 'finalizing';
  if (p >= 70) return 'encoding';
  if (p >= 5) return 'rendering';
  return 'asset_loading';
}

/**
 * Overall % from completed rows (100 each) + in-flight row partial %.
 */
function computeOverallProgress(completed, total, rowProgress = {}) {
  const totalN = Math.max(1, Number(total) || 1);
  const done = Math.max(0, Number(completed) || 0);
  let sum = done * 100;
  for (const v of Object.values(rowProgress)) {
    if (typeof v === 'number' && Number.isFinite(v)) sum += Math.max(0, Math.min(99, v));
  }
  return Math.min(99, Math.round(sum / totalN));
}

/**
 * Atomically update one row's progress and recompute parent job progress.
 * @param {string} parentJobId
 * @param {number} rowIndex
 * @param {number} rowPct — 0–99 for in-flight row
 * @param {{ force?: boolean }} [opts]
 */
async function updateRowExportProgress(parentJobId, rowIndex, rowPct, opts = {}) {
  const key = `${parentJobId}:${rowIndex}`;
  const now = Date.now();
  const last = lastWriteByKey.get(key) || 0;
  const pct = Math.max(0, Math.min(99, Math.round(Number(rowPct) || 0)));

  if (!opts.force && pct < 99 && now - last < throttleMs) return null;
  lastWriteByKey.set(key, now);

  const rowKey = String(rowIndex);
  await VideoJob.findOneAndUpdate(
    { jobId: parentJobId },
    { $set: { [`exportRowProgress.${rowKey}`]: pct } },
  );

  const parent = await VideoJob.findOne({ jobId: parentJobId }).lean();
  if (!parent) return null;

  const total = parent.totalVideos || 1;
  const completed = parent.completedVideos || 0;
  const rowProgress = parent.exportRowProgress || {};
  const progress = computeOverallProgress(completed, total, rowProgress);

  await VideoJob.findOneAndUpdate({ jobId: parentJobId }, {
    progress,
    exportPhase: phaseFromProgress(progress),
    status: 'processing',
  });

  return { progress, rowProgress, completed, total };
}

function clearRowProgressThrottle(parentJobId, rowIndex) {
  lastWriteByKey.delete(`${parentJobId}:${rowIndex}`);
}

module.exports = {
  computeOverallProgress,
  updateRowExportProgress,
  clearRowProgressThrottle,
  phaseFromProgress,
};
