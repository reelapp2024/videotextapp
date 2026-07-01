/**
 * Overlap render and FFmpeg stdin writes using ping-pong RGBA buffers.
 */
class ExportFramePipeline {
  /**
   * @param {import('./framePipeEncoder').FramePipeEncoder} encoder
   * @param {number} frameBytes
   */
  constructor(encoder, frameBytes) {
    this.encoder = encoder;
    this.bufferA = Buffer.allocUnsafe(frameBytes);
    this.bufferB = Buffer.allocUnsafe(frameBytes);
    this._flip = false;
    this._pendingWrite = Promise.resolve();
  }

  nextRenderBuffer() {
    this._flip = !this._flip;
    return this._flip ? this.bufferA : this.bufferB;
  }

  /**
   * @param {Buffer} buffer
   * @param {import('./exportRenderProfiler').ExportRenderProfiler | null} [profiler]
   */
  async submitFrame(buffer, profiler = null) {
    await this._pendingWrite;
    const t0 = profiler?.mark();
    this._pendingWrite = this.encoder.writeFrameSync(buffer).then(() => {
      if (profiler && t0 != null) profiler.record('ffmpegWrite', t0);
    });
  }

  async flush() {
    await this._pendingWrite;
  }

  dispose() {
    this.bufferA = null;
    this.bufferB = null;
  }
}

module.exports = { ExportFramePipeline };
