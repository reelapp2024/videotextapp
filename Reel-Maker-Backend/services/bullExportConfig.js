/**
 * Bull export queue feature flags (M8).
 * Uses Bull (not BullMQ) for Redis 3.x on Windows.
 */

function isTruthy(val) {
  if (val == null || val === '') return false;
  const s = String(val).trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'yes' || s === 'on';
}

function useBullExport() {
  const raw = process.env.USE_BULL_EXPORT;
  if (raw == null || String(raw).trim() === '') return true;
  const s = String(raw).trim().toLowerCase();
  if (s === '0' || s === 'false' || s === 'no' || s === 'off') return false;
  return isTruthy(raw);
}

function getExportQueueName() {
  return process.env.EXPORT_QUEUE_NAME || 'video-export';
}

function getRedisPrefix() {
  return process.env.REDIS_PREFIX || 'reel-maker';
}

function getWorkerConcurrency() {
  const n = parseInt(process.env.EXPORT_WORKER_CONCURRENCY || '1', 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(16, n);
}

module.exports = {
  useBullExport,
  getExportQueueName,
  getRedisPrefix,
  getWorkerConcurrency,
  isTruthy,
};
