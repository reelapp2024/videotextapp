/**
 * Bull TTS queue feature flags.
 */

function isTruthy(val) {
  if (val == null || val === '') return false;
  const s = String(val).trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'yes' || s === 'on';
}

function useBullTts() {
  const raw = process.env.USE_BULL_TTS;
  if (raw == null || String(raw).trim() === '') return true;
  const s = String(raw).trim().toLowerCase();
  if (s === '0' || s === 'false' || s === 'no' || s === 'off') return false;
  return isTruthy(raw);
}

function getTtsQueueName() {
  return process.env.TTS_QUEUE_NAME || 'tts-synthesize';
}

function getTtsWorkerConcurrency() {
  const env = process.env.TTS_WORKER_CONCURRENCY || process.env.TTS_PARALLEL || '6';
  const n = parseInt(env, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(12, n);
}

module.exports = {
  useBullTts,
  getTtsQueueName,
  getTtsWorkerConcurrency,
};
