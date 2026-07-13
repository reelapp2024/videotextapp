/**
 * Redis + in-memory cache for TTS previews (Basic Edge + Advanced Piper).
 */
const crypto = require('crypto');
const { getBullRedisConfig, getRedisPrefixKey } = require('../queues/connection');

/** @type {import('ioredis').Redis | null} */
let client = null;
let clientFailedAt = 0;

const memCache = new Map();
const MEM_MAX = 80;

function getClient() {
  if (client) return client;
  if (Date.now() - clientFailedAt < 15000) return null;
  try {
    const Redis = require('ioredis');
    const cfg = getBullRedisConfig();
    client = typeof cfg === 'string'
      ? new Redis(cfg, { maxRetriesPerRequest: 1, enableReadyCheck: true, lazyConnect: true })
      : new Redis({
        ...cfg,
        maxRetriesPerRequest: 1,
        enableReadyCheck: true,
        lazyConnect: true,
        connectTimeout: 800,
      });
    client.on('error', () => {});
    return client;
  } catch (_) {
    clientFailedAt = Date.now();
    return null;
  }
}

function memGet(key) {
  const hit = memCache.get(key);
  if (!hit) return null;
  if (hit.exp && Date.now() > hit.exp) {
    memCache.delete(key);
    return null;
  }
  memCache.delete(key);
  memCache.set(key, hit);
  return hit.buf;
}

function memSet(key, buf, ttlSec) {
  if (memCache.size >= MEM_MAX) {
    const oldest = memCache.keys().next().value;
    memCache.delete(oldest);
  }
  memCache.set(key, { buf, exp: Date.now() + Math.max(60, ttlSec) * 1000 });
}

function previewCacheKey(payload) {
  const prefix = getRedisPrefixKey() || 'bull';
  const eng = payload.eng || (payload.speaker && !payload.voiceId ? 'basic-v1' : 'adv-v2');
  const hash = crypto
    .createHash('sha1')
    .update(
      JSON.stringify({
        t: payload.text,
        v: payload.voiceId || payload.speaker,
        vt: payload.voiceType,
        a: payload.accent,
        e: payload.emotion,
        ea: payload.emotionAmt,
        p: payload.paceId,
        s: payload.speed ?? payload.rate,
        pi: payload.pitch,
        vo: payload.volume,
        q: payload.quality,
        st: payload.stability,
        te: payload.temperature,
        pr: payload.precision,
        c: payload.cloneId || null,
        eng,
      }),
    )
    .digest('hex');
  return `${prefix}:tts:preview:${eng}:${hash}`;
}

async function ensureRedisReady(c) {
  if (!c) return false;
  if (c.status === 'ready') return true;
  await Promise.race([
    c.connect().catch(() => {}),
    new Promise((r) => setTimeout(r, 250)),
  ]);
  return c.status === 'ready';
}

async function getCachedPreview(payload) {
  const key = previewCacheKey(payload);
  const mem = memGet(key);
  if (mem && mem.length > 80) return { buffer: mem, key, hit: true, source: 'memory' };

  const c = getClient();
  if (!c) return null;
  try {
    if (!(await ensureRedisReady(c))) return null;
    const buf = await c.getBuffer(key);
    if (buf && buf.length > 80) {
      memSet(key, buf, 1800);
      return { buffer: buf, key, hit: true, source: 'redis' };
    }
    return null;
  } catch (_) {
    return null;
  }
}

async function setCachedPreview(payload, buffer, ttlSec = 3600) {
  if (!buffer || buffer.length < 80) return false;
  const key = previewCacheKey(payload);
  const ttl = Math.max(60, Number(ttlSec) || 3600);
  memSet(key, buffer, ttl);

  const c = getClient();
  if (!c) return true;
  try {
    if (!(await ensureRedisReady(c))) return true;
    await c.set(key, buffer, 'EX', ttl);
    return true;
  } catch (_) {
    return true;
  }
}

module.exports = {
  previewCacheKey,
  getCachedPreview,
  setCachedPreview,
};
