/**
 * Bull caption transcription queue feature flags.
 */

function isTruthy(val) {
  if (val == null || val === '') return false;
  const s = String(val).trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'yes' || s === 'on';
}

function useBullCaptions() {
  const raw = process.env.USE_BULL_CAPTIONS;
  if (raw == null || String(raw).trim() === '') return true;
  const s = String(raw).trim().toLowerCase();
  if (s === '0' || s === 'false' || s === 'no' || s === 'off') return false;
  return isTruthy(raw);
}

function getCaptionQueueName() {
  return process.env.CAPTION_QUEUE_NAME || 'caption-transcribe';
}

function getCaptionWorkerConcurrency() {
  const env = process.env.CAPTION_WORKER_CONCURRENCY || process.env.CAPTION_CPU_PARALLEL || '2';
  const n = parseInt(env, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(8, n);
}

module.exports = {
  useBullCaptions,
  getCaptionQueueName,
  getCaptionWorkerConcurrency,
};
