const os = require('os');
const { getExportQueue } = require('../queues/exportQueue');
const { getWorkerConcurrency } = require('./bullExportConfig');
const { HW_ENCODER } = require('./encodeOptions');

const CPU_CORES = os.cpus().length;

function isTruthyEnv(name, defaultValue = true) {
  const raw = process.env[name];
  if (raw == null || String(raw).trim() === '') return defaultValue;
  const s = String(raw).trim().toLowerCase();
  if (s === '0' || s === 'false' || s === 'no' || s === 'off') return false;
  return s === '1' || s === 'true' || s === 'yes' || s === 'on';
}

function resolveGpuEncodeSlots() {
  const env = parseInt(process.env.EXPORT_GPU_ENCODE_SLOTS || '', 10);
  if (Number.isFinite(env) && env >= 1) return Math.min(8, env);
  // Intel QSV: multiple concurrent rawvideo pipe encodes deadlock on bundled FFmpeg
  if (HW_ENCODER === 'qsv') return 1;
  return Math.min(3, Math.max(1, Math.floor(CPU_CORES / 4)));
}

/**
 * How many Bull workers should run concurrently.
 */
function resolveWorkerConcurrency() {
  return Math.min(getWorkerConcurrency(), CPU_CORES);
}

/**
 * Queue depth for dynamic resource allocation.
 * @returns {Promise<{ waiting: number, active: number, totalPending: number }>}
 */
async function getExportQueueDepth() {
  try {
    const queue = getExportQueue();
    if (!queue) return { waiting: 0, active: 0, totalPending: 0 };
    await queue.isReady();
    const [waiting, active] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
    ]);
    return {
      waiting: waiting || 0,
      active: active || 0,
      totalPending: (waiting || 0) + (active || 0),
    };
  } catch {
    return { waiting: 0, active: 0, totalPending: 0 };
  }
}

/**
 * Decide parallel chunk count for a single video export.
 * More chunks when queue is idle; fewer when many videos are exporting.
 * @param {object} [opts]
 * @param {number} [opts.totalFrames]
 * @param {boolean} [opts.allowChunks]
 */
async function resolveChunkCount(opts = {}) {
  const { totalFrames = 1, allowChunks = true } = opts;
  if (!allowChunks || !isTruthyEnv('EXPORT_CHUNK_PIPELINE', false)) return 1;
  if (totalFrames < 120) return 1;

  const depth = await getExportQueueDepth();
  const workerConcurrency = resolveWorkerConcurrency();
  const gpuSlots = resolveGpuEncodeSlots();
  const minFramesPerChunk = Math.max(30, parseInt(process.env.EXPORT_CHUNK_MIN_FRAMES || '90', 10) || 90);

  let maxChunks;
  if (depth.totalPending <= 1) {
    maxChunks = Math.min(
      Math.max(1, CPU_CORES - 2),
      gpuSlots,
      Math.floor(totalFrames / minFramesPerChunk),
    );
  } else if (depth.totalPending <= workerConcurrency) {
    maxChunks = Math.min(2, gpuSlots, Math.floor(totalFrames / minFramesPerChunk));
  } else {
    return 1;
  }

  return Math.max(1, Math.min(maxChunks, Math.floor(totalFrames / minFramesPerChunk)));
}

/**
 * Split [0, totalFrames) into aligned chunk ranges.
 * @param {number} totalFrames
 * @param {number} chunkCount
 * @returns {{ startFrame: number, endFrameExclusive: number }[]}
 */
function buildFrameChunks(totalFrames, chunkCount) {
  const n = Math.max(1, Math.min(chunkCount, totalFrames));
  const base = Math.floor(totalFrames / n);
  const remainder = totalFrames % n;
  const chunks = [];
  let cursor = 0;
  for (let c = 0; c < n; c++) {
    const size = base + (c < remainder ? 1 : 0);
    const start = cursor;
    const end = cursor + size;
    chunks.push({ startFrame: start, endFrameExclusive: end });
    cursor = end;
  }
  return chunks;
}

module.exports = {
  CPU_CORES,
  resolveWorkerConcurrency,
  resolveGpuEncodeSlots,
  getExportQueueDepth,
  resolveChunkCount,
  buildFrameChunks,
  isTruthyEnv,
};
