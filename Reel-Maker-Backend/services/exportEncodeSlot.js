/**
 * Serialize limited HW (QSV) encode pipes, overflow extras to software encode.
 * Bundled FFmpeg + Intel QSV deadlocks with multiple concurrent rawvideo pipes.
 */
const os = require('os');
const { HW_ENCODER } = require('./encodeOptions');
const { resolveGpuEncodeSlots, isTruthyEnv } = require('./exportResourcePlanner');

const CPU_CORES = os.cpus().length;

const state = {
  hwActive: 0,
  swActive: 0,
  waiters: [],
};

function maxSoftwareSlots() {
  const env = parseInt(process.env.EXPORT_SW_ENCODE_SLOTS || '', 10);
  if (Number.isFinite(env) && env >= 1) return Math.min(CPU_CORES, env);
  // Leave 1 core free for Node / Redis
  return Math.max(2, Math.min(CPU_CORES - 1, 6));
}

function notifyWaiters() {
  // wake one waiter at a time
  const next = state.waiters.shift();
  if (next) next();
}

function tryTake(kind) {
  if (kind === 'hw') {
    const max = Math.max(1, resolveGpuEncodeSlots());
    if (state.hwActive < max) {
      state.hwActive += 1;
      return true;
    }
    return false;
  }
  const max = maxSoftwareSlots();
  if (state.swActive < max) {
    state.swActive += 1;
    return true;
  }
  return false;
}

function release(kind) {
  if (kind === 'hw') state.hwActive = Math.max(0, state.hwActive - 1);
  else state.swActive = Math.max(0, state.swActive - 1);
  notifyWaiters();
}

function waitUntil(predicate, timeoutMs) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tryOnce = () => {
      if (predicate()) {
        resolve(true);
        return;
      }
      if (Date.now() - started > timeoutMs) {
        reject(new Error('Timed out waiting for export encode slot'));
        return;
      }
      state.waiters.push(tryOnce);
    };
    tryOnce();
  });
}

/**
 * Acquire an encode permit.
 * @param {object} [opts]
 * @param {boolean} [opts.preferSoftware] — force software lane (chunks / overflow)
 * @returns {Promise<{ lane: 'hw'|'sw', forceSoftware: boolean, release: () => void }>}
 */
async function acquireEncodeSlot(opts = {}) {
  const preferSoftware = !!opts.preferSoftware;
  const allowSw = isTruthyEnv('EXPORT_ALLOW_SW_PARALLEL', true);
  const hwIsQsvOrLimited = HW_ENCODER === 'qsv' || HW_ENCODER === 'libx264';

  // Prefer HW when available and not forced to software
  if (!preferSoftware && HW_ENCODER !== 'libx264') {
    if (tryTake('hw')) {
      return {
        lane: 'hw',
        forceSoftware: false,
        release: () => release('hw'),
      };
    }
    // QSV often limited to 1 — overflow to software for parallel batch throughput
    if (allowSw && hwIsQsvOrLimited) {
      await waitUntil(() => tryTake('sw'), 600000);
      return {
        lane: 'sw',
        forceSoftware: true,
        release: () => release('sw'),
      };
    }
    await waitUntil(() => tryTake('hw'), 600000);
    return {
      lane: 'hw',
      forceSoftware: false,
      release: () => release('hw'),
    };
  }

  await waitUntil(() => tryTake('sw'), 600000);
  return {
    lane: 'sw',
    forceSoftware: true,
    release: () => release('sw'),
  };
}

function getEncodeSlotStats() {
  return {
    hwActive: state.hwActive,
    swActive: state.swActive,
    hwMax: Math.max(1, resolveGpuEncodeSlots()),
    swMax: maxSoftwareSlots(),
    waiting: state.waiters.length,
    hwEncoder: HW_ENCODER,
  };
}

module.exports = {
  acquireEncodeSlot,
  getEncodeSlotStats,
  maxSoftwareSlots,
};
