const { spawn } = require('child_process');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const fs = require('fs');

const FFMPEG = ffmpegInstaller.path;
const STDERR_MAX = 4096;

/**
 * Sequential RGBA frame reader via FFmpeg rawvideo pipe.
 * Frames are CFR at export FPS — round=near provides smooth frame alignment.
 */
class ServerVideoFrameSource {
  /**
   * @param {object} opts
   * @param {string} opts.filePath
   * @param {number} opts.width
   * @param {number} opts.height
   * @param {number} opts.fps
   * @param {boolean} [opts.loop]
   */
  constructor(opts) {
    this.filePath = opts.filePath;
    this.width = opts.width;
    this.height = opts.height;
    this.fps = opts.fps;
    this.loop = opts.loop ?? false;
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
  }

  get frameBytes() {
    return this._frameBytes;
  }

  async start() {
    if (!this.filePath || !fs.existsSync(this.filePath)) {
      this._ended = true;
      return;
    }

    const vf = [
      `fps=fps=${this.fps}:start_time=0:round=near`, // Maintained round=near to stop frame stuttering/shaking
      `scale=${this.width}:${this.height}:force_original_aspect_ratio=decrease`,
      `pad=${this.width}:${this.height}:(ow-iw)/2:(oh-ih)/2:black`,
    ].join(',');

    const args = [
      '-hide_banner',
      '-loglevel', 'error',
      '-threads', '4', 
    ];
    if (this.loop) args.push('-stream_loop', '-1');
    args.push(
      '-i', this.filePath,
      '-an',
      '-vf', vf,
      '-vsync', 'cfr', // FIXED: Swapped back to legacy flag to support bundled installer binaries safely
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
    };

    this._proc.stderr.on('data', this._stderrHandler);
    this._proc.on('close', this._closeHandler);
  }

  _appendChunk(chunk) {
    if (!chunk || chunk.length === 0) return;
    this._chunks.push(chunk);
    this._pendingLen += chunk.length;
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
  async readFrame() {
    if (this._ended && this._pendingLen < this._frameBytes) {
      if (this._lastFrame) {
        this._duplicateFrameCount += 1;
      }
      return this._lastFrame;
    }

    while (this._pendingLen < this._frameBytes && !this._ended) {
      const chunk = await this._readChunk();
      if (!chunk || chunk.length === 0) {
        this._ended = true;
        break;
      }
      this._appendChunk(chunk);
    }

    if (!this._consumeFrameBytes()) {
      if (this._lastFrame) this._duplicateFrameCount += 1;
      return this._lastFrame;
    }

    this.frameIndex += 1;
    this._lastFrame = this._writeBuffer;
    this._writeBuffer = this._writeBuffer === this._bufferA ? this._bufferB : this._bufferA;
    return this._lastFrame;
  }

  _readChunk() {
    return new Promise((resolve, reject) => {
      if (!this._stdout || this._ended) {
        resolve(null);
        return;
      }
      const onData = (buf) => {
        cleanup();
        resolve(buf);
      };
      const onEnd = () => {
        cleanup();
        resolve(null);
      };
      const onError = (err) => {
        cleanup();
        reject(err);
      };
      const cleanup = () => {
        this._stdout?.removeListener('data', onData);
        this._stdout?.removeListener('end', onEnd);
        this._stdout?.removeListener('error', onError);
      };
      this._stdout.once('data', onData);
      this._stdout.once('end', onEnd);
      this._stdout.once('error', onError);
    });
  }

  getStats() {
    return {
      frameIndex: this.frameIndex,
      duplicateFrameCount: this._duplicateFrameCount,
      ended: this._ended,
    };
  }

  dispose() {
    if (this._proc) {
      if (this._stderrHandler) this._proc.stderr?.removeListener('data', this._stderrHandler);
      if (this._closeHandler) this._proc.removeListener('close', this._closeHandler);
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
  }
}

module.exports = {
  ServerVideoFrameSource,
};