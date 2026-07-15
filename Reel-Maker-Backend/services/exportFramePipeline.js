/**
 * Overlap render and FFmpeg stdin writes using triple RGBA buffers.
 * submitFrame only blocks when 2 writes are already in flight (keeps encoder fed).
 */
class ExportFramePipeline {
  /**
   * @param {import('./framePipeEncoder').FramePipeEncoder} encoder
   * @param {number} frameBytes
   */
  constructor(encoder, frameBytes) {
    this.encoder = encoder;
    this.buffers = [
      Buffer.allocUnsafe(frameBytes),
      Buffer.allocUnsafe(frameBytes),
      Buffer.allocUnsafe(frameBytes),
    ];
    this._idx = 0;
    this._gate = Promise.resolve();
    this._writesInFlight = 0;
  }

  nextRenderBuffer() {
    const buf = this.buffers[this._idx];
    this._idx = (this._idx + 1) % this.buffers.length;
    return buf;
  }

  /**
   * @param {Buffer} buffer
   * @param {import('./exportRenderProfiler').ExportRenderProfiler | null} [profiler]
   */
  async submitFrame(buffer, profiler = null) {
    // Block only when FFmpeg backlog would overwrite a buffer still being written.
    while (this._writesInFlight >= 2) {
      await this._gate;
    }
    const t0 = profiler?.mark();
    this._writesInFlight += 1;
    const done = this.encoder.writeFrameSync(buffer).then(() => {
      if (profiler && t0 != null) profiler.record('ffmpegWrite', t0);
    });
    this._gate = done
      .catch(() => {})
      .finally(() => {
        this._writesInFlight = Math.max(0, this._writesInFlight - 1);
      });
  }

  async flush() {
    while (this._writesInFlight > 0) {
      await this._gate;
    }
  }

  dispose() {
    this.buffers = [];
  }
}

module.exports = { ExportFramePipeline };
