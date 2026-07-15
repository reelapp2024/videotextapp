const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');
const { resolvePythonCommand } = require('./fasterWhisperService');

const SCRIPT_PATH = path.join(__dirname, '../scripts/whisper_worker_server.py');
const LOG_PREFIX = '[whisper-pool]';

function usePersistentWhisper() {
  const raw = process.env.WHISPER_PERSISTENT;
  if (raw == null || String(raw).trim() === '') return true;
  const s = String(raw).trim().toLowerCase();
  if (s === '0' || s === 'false' || s === 'no' || s === 'off') return false;
  return true;
}

function getPoolSize() {
  const env = process.env.WHISPER_POOL_SIZE
    || process.env.CAPTION_WORKER_CONCURRENCY
    || process.env.CAPTION_CPU_PARALLEL
    || String(Math.min(4, os.cpus().length || 2));
  const n = parseInt(env, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(8, n);
}

function getModelLoadTimeoutMs() {
  // First boot may download Whisper weights; allow enough time, but prefer local cache.
  return Math.max(120000, parseInt(process.env.WHISPER_MODEL_LOAD_TIMEOUT_MS || '600000', 10) || 600000);
}

function getRequestTimeoutMs() {
  return Math.max(180000, parseInt(process.env.WHISPER_TIMEOUT_MS || '1200000', 10) || 1200000);
}

class WhisperWorker {
  constructor(index, python) {
    this.index = index;
    this.python = python;
    this.proc = null;
    this.rl = null;
    this.busy = false;
    this.ready = false;
    this.pending = null;
    this.queue = [];
    this.restarting = false;
  }

  log(label, detail) {
    if (detail !== undefined) {
      console.log(`${LOG_PREFIX} worker#${this.index} ${label}`, detail);
    } else {
      console.log(`${LOG_PREFIX} worker#${this.index} ${label}`);
    }
  }

  buildSpawnArgs() {
    const needsPyScriptFlag = this.python.executable === 'py';
    return needsPyScriptFlag ? ['-3', SCRIPT_PATH] : [SCRIPT_PATH];
  }

  start() {
    if (!fs.existsSync(SCRIPT_PATH)) {
      throw new Error('whisper_worker_server.py missing on server');
    }

    const spawnArgs = this.buildSpawnArgs();
    const command = [this.python.executable, ...spawnArgs].join(' ');
    this.log('starting', { command });

    this.proc = spawn(this.python.executable, spawnArgs, {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
      env: {
        ...process.env,
        WHISPER_DEVICE: process.env.WHISPER_DEVICE || 'cpu',
        WHISPER_COMPUTE: process.env.WHISPER_COMPUTE || 'int8',
        WHISPER_CPU_THREADS: process.env.WHISPER_CPU_THREADS || String(Math.min(4, os.cpus().length || 4)),
      },
    });

    this.ready = false;
    this.rl = readline.createInterface({ input: this.proc.stdout });

    this.proc.stderr.on('data', (d) => {
      const text = d.toString().trim();
      if (text) this.log('stderr', text);
    });

    this.proc.on('close', (code) => {
      this.log('exited', { code });
      this.ready = false;
      this.failPending(new Error(`Whisper worker exited (code ${code})`));
      if (!this.restarting) {
        this.restarting = true;
        setTimeout(() => {
          this.restarting = false;
          this.start().catch((err) => this.log('restart failed', err.message));
        }, 1500);
      }
    });

    this.proc.on('error', (err) => {
      this.failPending(new Error(`Whisper worker spawn error: ${err.message}`));
    });

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Whisper worker model load timed out (${command})`));
      }, getModelLoadTimeoutMs());

      const onLine = (line) => {
        try {
          const msg = JSON.parse(line);
          if (msg.ready) {
            clearTimeout(timer);
            this.ready = true;
            this.rl.off('line', onLine);
            this.rl.on('line', (responseLine) => this.onResponse(responseLine));
            this.log('ready');
            resolve();
          }
        } catch (_) {}
      };

      this.rl.on('line', onLine);
    });
  }

  failPending(err) {
    if (this.pending) {
      clearTimeout(this.pending.timer);
      this.pending.reject(err);
      this.pending = null;
    }
    this.busy = false;
    while (this.queue.length) {
      const next = this.queue.shift();
      next.reject(err);
    }
  }

  onResponse(line) {
    if (!this.pending) return;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch (e) {
      return;
    }
    if (msg.id !== this.pending.id) return;

    clearTimeout(this.pending.timer);
    const { resolve, reject } = this.pending;
    this.pending = null;
    this.busy = false;

    if (msg.ok) {
      resolve(msg);
    } else {
      reject(new Error(msg.error || 'Whisper worker failed'));
    }

    this.drainQueue();
  }

  drainQueue() {
    if (this.busy || !this.ready || this.queue.length === 0) return;
    const next = this.queue.shift();
    this.runRequest(next).catch((err) => next.reject(err));
  }

  runRequest(job) {
    return new Promise((resolve, reject) => {
      if (!this.ready || !this.proc?.stdin?.writable) {
        reject(new Error('Whisper worker not ready'));
        return;
      }

      this.busy = true;
      const id = uuidv4();
      const timer = setTimeout(() => {
        this.pending = null;
        this.busy = false;
        reject(new Error(`Voice-to-text timed out after ${Math.round(getRequestTimeoutMs() / 1000)}s`));
        try {
          this.proc.kill('SIGTERM');
        } catch (_) {}
      }, getRequestTimeoutMs());

      this.pending = { id, resolve, reject, timer };
      const payload = JSON.stringify({
        id,
        audio: job.audioPath,
        out: job.outJson,
        model: job.model,
        language: job.language,
      });
      this.proc.stdin.write(`${payload}\n`);
    });
  }

  transcribe(audioPath, options = {}) {
    const job = {
      audioPath,
      outJson: options.outJson,
      model: options.model || process.env.WHISPER_MODEL || 'base',
      language: options.language || process.env.WHISPER_LANGUAGE || 'auto',
    };

    return new Promise((resolve, reject) => {
      const wrapped = {
        ...job,
        resolve,
        reject,
      };

      if (this.busy) {
        this.queue.push(wrapped);
        return;
      }

      this.runRequest(wrapped).then(resolve).catch(reject);
    });
  }

  async stop() {
    this.restarting = true;
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
    if (this.proc) {
      try {
        this.proc.stdin.end();
      } catch (_) {}
      try {
        this.proc.kill('SIGTERM');
      } catch (_) {}
      this.proc = null;
    }
    this.ready = false;
    this.busy = false;
    this.failPending(new Error('Whisper pool shutting down'));
  }
}

class WhisperServerPool {
  constructor() {
    this.workers = [];
    this.started = false;
    this.startPromise = null;
    this.roundRobin = 0;
    this.maxSize = getPoolSize();
    this.python = null;
  }

  async ensureStarted() {
    if (this.started && this.workers.length > 0) return;
    if (this.startPromise) return this.startPromise;

    this.startPromise = (async () => {
      this.python = resolvePythonCommand();
      const initialSize = Math.min(1, this.maxSize);
      console.log(`${LOG_PREFIX} starting ${initialSize} worker(s) (max ${this.maxSize})`);

      this.workers = Array.from({ length: initialSize }, (_, i) => new WhisperWorker(i + 1, this.python));
      await Promise.all(this.workers.map((w) => w.start()));
      this.started = true;
      console.log(`${LOG_PREFIX} ready (${this.workers.length} worker(s))`);
    })();

    try {
      await this.startPromise;
    } catch (err) {
      this.startPromise = null;
      await this.stop();
      throw err;
    }
  }

  async ensureWorkerCapacity() {
    await this.ensureStarted();
    const idle = this.workers.find((w) => w.ready && !w.busy);
    if (idle || this.workers.length >= this.maxSize) return;
    const worker = new WhisperWorker(this.workers.length + 1, this.python);
    this.workers.push(worker);
    await worker.start();
    console.log(`${LOG_PREFIX} scaled up to ${this.workers.length} worker(s)`);
  }

  pickWorker() {
    if (this.workers.length === 1) return this.workers[0];
    const worker = this.workers[this.roundRobin % this.workers.length];
    this.roundRobin += 1;
    return worker;
  }

  async transcribe(audioPath, options = {}) {
    await this.ensureWorkerCapacity();
    const outJson = options.outJson || path.join(path.dirname(audioPath), `whisper-${uuidv4()}.json`);

    const idle = this.workers.find((w) => w.ready && !w.busy);
    const worker = idle || this.pickWorker();
    await worker.transcribe(audioPath, { ...options, outJson });
    return outJson;
  }

  async stop() {
    this.started = false;
    this.startPromise = null;
    await Promise.all(this.workers.map((w) => w.stop()));
    this.workers = [];
  }
}

let pool = null;

function getWhisperServerPool() {
  if (!pool) pool = new WhisperServerPool();
  return pool;
}

async function startWhisperServerPool() {
  if (!usePersistentWhisper()) {
    console.log(`${LOG_PREFIX} persistent workers disabled (WHISPER_PERSISTENT=false)`);
    return false;
  }
  try {
    await getWhisperServerPool().ensureStarted();
    return true;
  } catch (err) {
    console.warn(`${LOG_PREFIX} failed to start — will fall back to one-shot Python per request:`, err.message);
    return false;
  }
}

async function stopWhisperServerPool() {
  if (!pool) return;
  await pool.stop();
  pool = null;
}

module.exports = {
  usePersistentWhisper,
  getWhisperServerPool,
  startWhisperServerPool,
  stopWhisperServerPool,
};
