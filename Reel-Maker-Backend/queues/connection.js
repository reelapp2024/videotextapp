const { getRedisPrefix } = require('../services/bullExportConfig');

/**
 * Build Redis URL for logging (host/port or REDIS_URL).
 * @returns {string}
 */
function getRedisUrl() {
  const url = process.env.REDIS_URL;
  if (url && String(url).trim()) return String(url).trim();

  const host = process.env.REDIS_HOST
    || process.env.redisHost
    || '127.0.0.1';
  const port = process.env.REDIS_PORT
    || process.env.redisPort
    || '6379';
  return `redis://${host}:${port}`;
}

/**
 * Bull queue Redis config — matches other projects using redisHost/redisPort.
 * @returns {string | { host: string, port: number }}
 */
function getBullRedisConfig() {
  const url = process.env.REDIS_URL;
  if (url && String(url).trim()) return String(url).trim();

  return {
    host: process.env.REDIS_HOST
      || process.env.redisHost
      || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || process.env.redisPort || '6379', 10),
  };
}

function getRedisPrefixKey() {
  return getRedisPrefix();
}

/**
 * @deprecated Bull manages its own connections; use isExportQueueAvailable().
 */
async function pingRedis() {
  const { isExportQueueAvailable } = require('./exportQueue');
  const ok = await isExportQueueAvailable();
  return { ok, error: ok ? null : 'Redis queue not reachable' };
}

function getLastRedisError() {
  return null;
}

async function closeRedisConnections() {
  const { closeExportQueue } = require('./exportQueue');
  const { closeCaptionQueue } = require('./captionQueue');
  const { stopWhisperServerPool } = require('../services/whisperServerPool');
  await closeExportQueue();
  await closeCaptionQueue();
  await stopWhisperServerPool();
}

module.exports = {
  getRedisUrl,
  getBullRedisConfig,
  getRedisPrefixKey,
  pingRedis,
  getLastRedisError,
  closeRedisConnections,
};
