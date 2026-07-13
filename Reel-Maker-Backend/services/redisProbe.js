/**
 * One-shot Redis reachability probe — avoids Bull reconnect spam when Redis is down.
 */
const net = require('net');
const { getBullRedisConfig } = require('../queues/connection');

let cached = null; // { ok: boolean, checkedAt: number, reason?: string }

function getRedisHostPort() {
  const cfg = getBullRedisConfig();
  if (typeof cfg === 'string') {
    try {
      const u = new URL(cfg);
      return { host: u.hostname || '127.0.0.1', port: parseInt(u.port || '6379', 10) };
    } catch {
      return { host: '127.0.0.1', port: 6379 };
    }
  }
  return { host: cfg.host || '127.0.0.1', port: cfg.port || 6379 };
}

/**
 * @param {{ force?: boolean, timeoutMs?: number }} [opts]
 * @returns {Promise<{ ok: boolean, host: string, port: number, reason?: string }>}
 */
function probeRedis(opts = {}) {
  const force = !!opts.force;
  const timeoutMs = opts.timeoutMs || 800;
  if (!force && cached && Date.now() - cached.checkedAt < 15000) {
    return Promise.resolve(cached);
  }

  const { host, port } = getRedisHostPort();

  return new Promise((resolve) => {
    const socket = net.connect({ host, port }, () => {
      socket.end();
      cached = { ok: true, host, port, checkedAt: Date.now() };
      resolve(cached);
    });
    socket.setTimeout(timeoutMs, () => {
      socket.destroy();
      cached = { ok: false, host, port, checkedAt: Date.now(), reason: 'timeout' };
      resolve(cached);
    });
    socket.on('error', (err) => {
      cached = {
        ok: false,
        host,
        port,
        checkedAt: Date.now(),
        reason: err.code || err.message || 'error',
      };
      resolve(cached);
    });
  });
}

/** Rate-limit identical queue error logs (ECONNREFUSED spam). */
const lastLogByKey = new Map();

function logQueueError(tag, err) {
  const msg = err?.message || String(err || '');
  const key = `${tag}|${msg}`;
  const now = Date.now();
  const prev = lastLogByKey.get(key) || 0;
  // Log once, then at most every 60s for the same error
  if (now - prev < 60000) return;
  lastLogByKey.set(key, now);
  const quiet = /ECONNREFUSED|ECONNRESET|ENOTFOUND|ETIMEDOUT/i.test(msg);
  if (quiet) {
    console.warn(
      `${tag} Redis unavailable (${msg}). Using in-process fallback. Start Redis or set USE_BULL_*=false. (silencing repeats for 60s)`
    );
  } else {
    console.error(`${tag} queue error:`, msg);
  }
}

module.exports = {
  probeRedis,
  getRedisHostPort,
  logQueueError,
};
