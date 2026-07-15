const { spawn } = require('child_process');
const fs = require('fs');
const { getFfmpegPath } = require('./encodeOptions');

const FFMPEG = getFfmpegPath();
const STDERR_MAX = 4096;

/**
 * Sequential RGBA frame reader via FFmpeg rawvideo pipe.
 * Prefetch-capable: kick next read while the previous frame is being rendered.
 */
class ServerVideoFrameSource {
  /**
   * @param {object} opts
   * @param {string} opts.filePath
   * @param {number} opts.width
   * @param {number} opts.height
   * @param {number} opts.fps
   * @param {boolean} [opts.loop]
   * @param {number} [opts.startFrame]
   */
  constructor(opts) {
    this.filePath = opts.filePath;
    this.width = opts.width;
    this.height = opts.height;
    this.fps = opts.fps;
    this.loop = opts.loop ?? false;
    this.startFrame = Math.max(0, Number(opts.startFrame) || 0);
    this._frameBytes = this.width * this.height * 4;
    this._bufferA = Buffer.allocUnsafe(this._frameBytes);
    this._bufferB = Buffer.allocUnsafe(this._frameBytes);
    this._writeBuffer = this._bufferA;
    this._proc = null;
    this._stdout = null;
    /** @type {Buffer[]} */
    this._chunks = [];
    this._pendingLen = 0;
    this._ended = false;
    this._lastFrame = null;
    this._stderr = '';
    this._stderrHandler = null;
    this._closeHandler = null;
    this.frameIndex = 0;
    this._duplicateFrameCount = 0;
    this._resolver = null;
    /** @type {Promise<Buffer|null>|null} */
    this._prefetch = null;
  }

  get frameBytes() {
    return this._frameBytes;
  }

  async start() {
    if (!this.filePath || !fs.existsSync(this.filePath)) {
      this._ended = true;
      return;
    }

    // One scale + even dims via trunc — same visual result as dual-scale, less filter work.
    const vf = [
      `fps=fps=${this.fps}:start_time=0:round=near`,
      `scale=${this.width}:${this.height}:force_original_aspect_ratio=decrease`,
      `scale='2*trunc(iw/2)':'2*trunc(ih/2)'`,
      `pad=${this.width}:${this.height}:(ow-iw)/2:(oh-ih)/2:black`,
    ].join(',');

    const decodeThreads = Math.max(1, parseInt(process.env.EXPORT_DECODE_THREADS || '4', 10) || 4);

    const args = [
      '-hide_banner',
      '-loglevel', 'error',
      '-threads', String(decodeThreads),
    ];
    if (this.loop) args.push('-stream_loop', '-1');
    args.push('-i', this.filePath);
    if (this.startFrame > 0) {
      const startSec = (this.startFrame / this.fps).toFixed(6);
      args.push('-ss', startSec);
    }
    args.push(
      '-an',
      '-vf', vf,
      '-vsync', 'cfr',
      '-f', 'rawvideo',
      '-pix_fmt', 'rgba',
      'pipe:1',
    );

    this._proc = spawn(FFMPEG, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    this._stdout = this._proc.stdout;

    this._stderrHandler = (d) => {
      const msg = d.toString();
      if (!msg.trim()) return;
      this._stderr = (this._stderr + msg).slice(-STDERR_MAX);
      console.warn('[serverVideoFrameSource]', msg.trim());
    };

    this._closeHandler = () => {
      this._ended = true;
      if (this._resolver) {
        const res = this._resolver;
        this._resolver = null;
        res();
      }
    };

    this._proc.stderr.on('data', this._stderrHandler);
    this._proc.on('close', this._closeHandler);

    this._stdout.on('data', (chunk) => {
      if (chunk && chunk.length > 0) {
        this._chunks.push(chunk);
        this._pendingLen += chunk.length;
        if (this._resolver && this._pendingLen >= this._frameBytes) {
          const res = this._resolver;
          this._resolver = null;
          res();
        }
      }
    });

    this._stdout.on('end', () => {
      this._ended = true;
      if (this._resolver) {
        const res = this._resolver;
        this._resolver = null;
        res();
      }
    });

    // Prime one frame so the first await is usually already ready.
    this.prefetch();
  }

  _consumeFrameBytes() {
    let written = 0;
    while (written < this._frameBytes && this._chunks.length > 0) {
      const head = this._chunks[0];
      const need = this._frameBytes - written;
      const take = Math.min(head.length, need);
      head.copy(this._writeBuffer, written, 0, take);
      written += take;
      this._pendingLen -= take;
      if (take === head.length) {
        this._chunks.shift();
      } else {
        this._chunks[0] = head.subarray(take);
      }
    }
    return written === this._frameBytes;
  }

  /**
   * @returns {Promise<Buffer|null>}
   */
  _readFrameInternal() {
    return new Promise((resolve) => {
      const checkAndProcess = () => {
        if (this._pendingLen >= this._frameBytes) {
          this._consumeFrameBytes();
          this.frameIndex += 1;
          this._lastFrame = this._writeBuffer;
          this._writeBuffer = this._writeBuffer === this._bufferA ? this._bufferB : this._bufferA;
          resolve(this._lastFrame);
          return true;
        }

        if (this._ended) {
          if (this._consumeFrameBytes()) {
            this.frameIndex += 1;
            this._lastFrame = this._writeBuffer;
            this._writeBuffer = this._writeBuffer === this._bufferA ? this._bufferB : this._bufferA;
            resolve(this._lastFrame);
          } else {
            if (this._lastFrame) this._duplicateFrameCount += 1;
            resolve(this._lastFrame);
          }
          return true;
        }
        return false;
      };

      if (checkAndProcess()) return;

      this._resolver = () => {
        checkAndProcess();
      };
    });
  }

  /**
   * Kick asynchronous decode of the next frame (overlaps with canvas render).
   */
  prefetch() {
    if (this._prefetch || this._ended) return;
    this._prefetch = this._readFrameInternal();
  }

  /**
   * @returns {Promise<Buffer|null>}
   */
  async readFrame() {
    let promise = this._prefetch;
    this._prefetch = null;
    if (!promise) promise = this._readFrameInternal();
    const frame = await promise;
    // Start filling the alternate buffer while caller renders this frame.
    this.prefetch();
    return frame;
  }

  getStats() {
    return {
      frameIndex: this.frameIndex,
      duplicateFrameCount: this._duplicateFrameCount,
      ended: this._ended,
    };
  }

  dispose() {
    this._prefetch = null;
    if (this._proc) {
      if (this._stderrHandler) this._proc.stderr?.removeListener('data', this._stderrHandler);
      if (this._closeHandler) this._proc.removeListener('close', this._closeHandler);
      if (this._stdout) {
        this._stdout.removeAllListeners('data');
        this._stdout.removeAllListeners('end');
      }
      if (!this._proc.killed) this._proc.kill('SIGKILL');
    }
    this._proc = null;
    this._stdout = null;
    this._chunks = [];
    this._pendingLen = 0;
    this._ended = true;
    this._lastFrame = null;
    this._bufferA = null;
    this._bufferB = null;
    this._writeBuffer = null;
    this._stderr = '';
    this._stderrHandler = null;
    this._closeHandler = null;
    this._resolver = null;
  }
}

module.exports = {
  ServerVideoFrameSource,
};
