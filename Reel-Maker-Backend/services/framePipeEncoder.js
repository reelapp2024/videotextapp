const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

const FFMPEG = ffmpegInstaller.path;

function clamp(n, min, max, fallback) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(min, Math.min(max, x));
}

class FfmpegPipeFailure extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'FfmpegPipeFailure';
    this.details = details;
  }
}

function formatFfmpegCommand(executable, args) {
  return [executable, ...args].map((part) => {
    const s = String(part);
    return /\s|["]/.test(s) ? `"${s.replace(/"/g, '\\"')}"` : s;
  }).join(' ');
}

function validateOutputPath(outputPath) {
  const dir = path.dirname(path.resolve(outputPath));
  if (!fs.existsSync(dir)) {
    throw new FfmpegPipeFailure(`Output directory does not exist: ${dir}`, {
      outputPath: path.resolve(outputPath),
      outputDir: dir,
    });
  }
  try {
    fs.accessSync(dir, fs.constants.W_OK);
  } catch (err) {
    throw new FfmpegPipeFailure(`Output directory is not writable: ${dir}`, {
      outputPath: path.resolve(outputPath),
      outputDir: dir,
      accessError: err.message,
    });
  }
}

function validateAudioInputs(audioInputs) {
  for (const audio of audioInputs) {
    const audioPath = audio?.path;
    if (!audioPath) {
      throw new FfmpegPipeFailure('Audio input entry is missing a path', { audio });
    }
    const resolved = path.resolve(audioPath);
    if (!fs.existsSync(resolved)) {
      throw new FfmpegPipeFailure(`Audio input file does not exist: ${resolved}`, {
        audioPath: resolved,
      });
    }
    try {
      fs.accessSync(resolved, fs.constants.R_OK);
    } catch (err) {
      throw new FfmpegPipeFailure(`Audio input file is not readable: ${resolved}`, {
        audioPath: resolved,
        accessError: err.message,
      });
    }
  }
}

function buildAtempoChain(speed) {
  const s = clamp(speed, 0.25, 4, 1);
  if (Math.abs(s - 1) < 0.001) return null;
  const parts = [];
  let cur = s;
  while (cur > 2 + 1e-6) {
    parts.push(2);
    cur /= 2;
  }
  while (cur < 0.5 - 1e-6) {
    parts.push(0.5);
    cur /= 0.5;
  }
  parts.push(cur);
  return parts.map((v) => `atempo=${v.toFixed(5)}`).join(',');
}

function buildDurationFitFilters(durationSec, sampleRate) {
  if (!durationSec || durationSec <= 0) {
    return 'apad';
  }
  const dur = Number(durationSec);
  const durStr = dur.toFixed(3);
  const rate = clamp(sampleRate, 8000, 192000, 48000);
  const wholeLen = Math.ceil(dur * rate);
  return `apad=whole_len=${wholeLen},atrim=0:${durStr}`;
}

function buildAudioFilterForPipe(
  hasVideoAudio,
  hasVoice,
  hasMusic,
  videoVol,
  voiceVol,
  musicVol,
  exportSpeed = 1,
  durationSec = null,
  audioSampleRate = 48000,
) {
  const parts = [];
  const inputs = [];
  let audioIdx = 1;
  const tempo = buildAtempoChain(exportSpeed);
  const tempoSuffix = tempo ? `,${tempo}` : '';
  const durationFit = buildDurationFitFilters(durationSec, audioSampleRate);

  if (hasVideoAudio && videoVol > 0) {
    inputs.push(`[${audioIdx}:a]volume=${videoVol}${tempoSuffix}[va]`);
    parts.push('[va]');
    audioIdx += 1;
  }
  if (hasVoice) {
    inputs.push(`[${audioIdx}:a]volume=${voiceVol}${tempoSuffix}[voa]`);
    parts.push('[voa]');
    audioIdx += 1;
  }
  if (hasMusic) {
    inputs.push(`[${audioIdx}:a]volume=${musicVol}${tempoSuffix}[ma]`);
    parts.push('[ma]');
    audioIdx += 1;
  }

  if (parts.length === 0) return null;

  if (parts.length === 1) {
    const base = inputs[0].replace(/\[[^\]]+\]$/, '');
    return {
      filter: `${base},${durationFit}[aout]`,
      audioLabel: 'aout',
    };
  }

  const mixFilter = `${parts.join('')}amix=inputs=${parts.length}:duration=longest:dropout_transition=2[mix]`;
  return {
    filter: `${inputs.join(';')};${mixFilter};[mix]${durationFit}[aout]`,
    audioLabel: 'aout',
  };
}

function validateRawvideoArgs(width, height, fps) {
  const w = Number(width);
  const h = Number(height);
  const f = Number(fps);
  if (!Number.isFinite(w) || w < 1) {
    throw new FfmpegPipeFailure(`Invalid rawvideo width: ${width}`, { width, height, fps });
  }
  if (!Number.isFinite(h) || h < 1) {
    throw new FfmpegPipeFailure(`Invalid rawvideo height: ${height}`, { width, height, fps });
  }
  if (!Number.isFinite(f) || f < 1) {
    throw new FfmpegPipeFailure(`Invalid rawvideo framerate: ${fps}`, { width, height, fps });
  }
  return {
    width: w,
    height: h,
    fps: f,
    expectedFrameBytes: w * h * 4,
    rawvideoInput: {
      format: 'rawvideo',
      pix_fmt: 'rgba',
      video_size: `${w}x${h}`,
      framerate: f,
      input: 'pipe:0',
    },
  };
}

function normalizeRgbaBuffer(rgba) {
  if (Buffer.isBuffer(rgba)) return rgba;
  if (rgba instanceof Uint8Array) {
    return Buffer.from(rgba.buffer, rgba.byteOffset, rgba.byteLength);
  }
  if (rgba && rgba.buffer) {
    return Buffer.from(rgba.buffer, rgba.byteOffset ?? 0, rgba.byteLength ?? rgba.length);
  }
  throw new FfmpegPipeFailure('Frame buffer is not a Buffer or Uint8Array', {
    type: rgba === null ? 'null' : typeof rgba,
  });
}

class FramePipeEncoder {
  constructor(options) {
    this.width = options.width;
    this.height = options.height;
    this.fps = options.fps;
    this.outputPath = options.outputPath;
    this.videoEncodeOptions = options.videoEncodeOptions || [];
    this.audioEncodeOptions = options.audioEncodeOptions || [];
    this.audioInputs = options.audioInputs || [];
    this.audioFilter = options.audioFilter || null;
    this.durationSec = options.durationSec || null;
    this.container = options.container || 'mp4';
    this._rawvideo = validateRawvideoArgs(this.width, this.height, this.fps);
    this._proc = null;
    this._stdin = null;
    this._stderr = '';
    this._stdout = '';
    this._ffmpegArgs = null;
    this._ffmpegCommand = null;
    this._spawnError = null;
    this._closeCode = null;
    this._closeSignal = null;
    this._processError = null;
    this._started = false;
    this._aborted = false;
    this._stderrHandler = null;
    this._stdoutHandler = null;
    this._errorHandler = null;
    this._closeHandler = null;
    this.framesWritten = 0;
    this.metrics = {
      encodeStartMs: 0,
      encodeEndMs: 0,
      framesWritten: 0,
    };
  }

  _buildFfmpegArgs() {
    const { width, height, fps } = this._rawvideo;
    const fpsStr = String(fps);
    const args = [
      '-hide_banner',
      '-loglevel', 'warning',
      '-f', 'rawvideo',
      '-pix_fmt', 'rgba',
      '-video_size', `${width}x${height}`,
      '-framerate', fpsStr,
      '-i', 'pipe:0',
    ];

    for (const audio of this.audioInputs) {
      if (audio?.path) args.push('-i', audio.path);
    }

    const isNVENC = this.videoEncodeOptions.includes('h264_nvenc') || this.videoEncodeOptions.includes('hevc_nvenc');
    const isQSV = this.videoEncodeOptions.includes('h264_qsv');
    const outputPixFmt = isQSV ? 'nv12' : 'yuv420p';

    if (this.audioFilter) {
      const vf = `[0:v]format=${outputPixFmt}[vout]`;
      args.push('-filter_complex', `${vf};${this.audioFilter.filter}`);
      args.push('-map', '[vout]', '-map', `[${this.audioFilter.audioLabel}]`);
      args.push(...this.videoEncodeOptions);
      args.push(...this.audioEncodeOptions);
    } else {
      args.push('-vf', `format=${outputPixFmt}`);
      args.push('-an');
      args.push(...this.videoEncodeOptions);
    }

    // FIXED: Enforce high-performance multithreading attributes for software fallbacks
    if (!isQSV && !isNVENC && this.videoEncodeOptions.includes('libx264')) {
      args.push('-threads', '0', '-preset', 'ultrafast', '-tune', 'animation', '-crf', '18');
    }

    if (this.container === 'webm') {
      args.push('-f', 'webm');
    } else if (this.container === 'matroska') {
      args.push('-f', 'matroska');
    }

    args.push('-y', this.outputPath);
    return args;
  }

  _collectFailureDetails(context) {
    return {
      context,
      ffmpegExecutable: FFMPEG,
      ffmpegCommand: this._ffmpegCommand,
      ffmpegArgs: this._ffmpegArgs,
      exitCode: this._proc?.exitCode ?? this._closeCode,
      closeCode: this._closeCode,
      signal: this._closeSignal,
      killed: this._proc?.killed ?? false,
      pid: this._proc?.pid ?? null,
      stdinWritable: this._stdin?.writable ?? false,
      stdinDestroyed: this._stdin?.destroyed ?? null,
      framesWritten: this.framesWritten,
      spawnError: this._spawnError ? String(this._spawnError.message || this._spawnError) : null,
      processError: this._processError ? String(this._processError.message || this._processError) : null,
      stderr: this._stderr,
      stdout: this._stdout,
      rawvideo: this._rawvideo.rawvideoInput,
      outputPath: path.resolve(this.outputPath),
      audioInputs: this.audioInputs.map((a) => path.resolve(a.path)),
      videoEncodeOptions: this.videoEncodeOptions,
      audioEncodeOptions: this.audioEncodeOptions,
    };
  }

  _formatFailureMessage(prefix, details) {
    const lines = [
      prefix,
      `ffmpeg command: ${details.ffmpegCommand || '(not started)'}`,
      `pid: ${details.pid}`,
      `exitCode: ${details.exitCode}`,
      `signal: ${details.signal}`,
      `killed: ${details.killed}`,
      `stdin.writable: ${details.stdinWritable}`,
      `spawnError: ${details.spawnError || '(none)'}`,
      `processError: ${details.processError || '(none)'}`,
      `stderr:\n${details.stderr || '(empty)'}`,
      `stdout:\n${details.stdout || '(empty)'}`,
    ];
    return lines.join('\n');
  }

  _throwFailure(prefix, context) {
    const details = this._collectFailureDetails(context);
    throw new FfmpegPipeFailure(this._formatFailureMessage(prefix, details), details);
  }

  _logFrameDiagnostics(frameIndex, buf) {
    const expected = this._rawvideo.expectedFrameBytes;
    const payload = {
      frameIndex,
      bufferSize: buf.length,
      expectedSize: expected,
      width: this._rawvideo.width,
      height: this._rawvideo.height,
      fps: this._rawvideo.fps,
      rgbaLength: buf.length,
      pid: this._proc?.pid ?? null,
      stdinWritable: this._stdin?.writable ?? false,
      exitCode: this._proc?.exitCode ?? this._closeCode,
      killed: this._proc?.killed ?? false,
    };
    console.log(`[FramePipeEncoder] Frame ${frameIndex} buffer diagnostics:`, payload);
    return payload;
  }

  _validateFrameBuffer(frameIndex, rgba) {
    const buf = normalizeRgbaBuffer(rgba);
    const expected = this._rawvideo.expectedFrameBytes;
    if (frameIndex === 0) {
      this._logFrameDiagnostics(frameIndex, buf);
    }
    if (buf.length !== expected) {
      this._throwFailure(
        `Frame ${frameIndex} RGBA buffer size mismatch: got ${buf.length} bytes, expected ${expected} (${this._rawvideo.width}x${this._rawvideo.height}x4)`,
        'buffer_size_mismatch',
      );
    }
    return buf;
  }

  _assertReadyForWrite(frameIndex) {
    if (!this._started || !this._proc) {
      this._throwFailure('FramePipeEncoder.start() was not called before writing frames', 'encoder_not_started');
    }
    if (this._aborted) {
      this._throwFailure('FramePipeEncoder was aborted', 'encoder_aborted');
    }
    if (this._spawnError) {
      this._throwFailure(
        `FFmpeg spawn error before frame ${frameIndex}: ${this._spawnError.message}`,
        'spawn_error',
      );
    }
    if (this._processError) {
      this._throwFailure(
        `FFmpeg process error before frame ${frameIndex}: ${this._processError.message}`,
        'process_error',
      );
    }
    const exited = this._proc.exitCode !== null || this._closeCode !== null;
    if (exited) {
      this._throwFailure(
        `FFmpeg already exited before frame ${frameIndex} (exitCode=${this._proc.exitCode ?? this._closeCode}, signal=${this._closeSignal})`,
        'process_exited_before_write',
      );
    }
    if (this._proc.killed) {
      this._throwFailure(
        `FFmpeg process was killed before frame ${frameIndex}`,
        'process_killed_before_write',
      );
    }
    if (!this._stdin || this._stdin.destroyed || !this._stdin.writable) {
      this._throwFailure(
        `FFmpeg stdin is not writable before frame ${frameIndex} — child likely exited during encoder init`,
        'stdin_not_writable',
      );
    }
  }

  start() {
    if (this._started) return;

    validateOutputPath(this.outputPath);
    if (this.audioInputs.length > 0) {
      validateAudioInputs(this.audioInputs);
    }

    this._ffmpegArgs = this._buildFfmpegArgs();
    this._ffmpegCommand = formatFfmpegCommand(FFMPEG, this._ffmpegArgs);
    const videoCodecIdx = this._ffmpegArgs.indexOf('-c:v');
    const videoCodec = videoCodecIdx >= 0 ? this._ffmpegArgs[videoCodecIdx + 1] : '(none)';
    const rIdx = this._ffmpegArgs.indexOf('-r');
    const pixFmtIdx = this._ffmpegArgs.lastIndexOf('-pix_fmt');
    const filterComplexIdx = this._ffmpegArgs.indexOf('-filter_complex');
    console.log('[FramePipeEncoder] starting FFmpeg');
    console.log(`[FramePipeEncoder] ffmpeg command: ${this._ffmpegCommand}`);
    console.log('[FramePipeEncoder] command audit:', {
      video_size: `${this._rawvideo.width}x${this._rawvideo.height}`,
      framerate: this._rawvideo.fps,
      output_r: rIdx >= 0 ? this._ffmpegArgs[rIdx + 1] : null,
      input_pix_fmt: 'rgba',
      output_pix_fmt: pixFmtIdx >= 0 ? this._ffmpegArgs[pixFmtIdx + 1] : null,
      video_codec: videoCodec,
      filter_complex: filterComplexIdx >= 0 ? this._ffmpegArgs[filterComplexIdx + 1] : null,
      audio_inputs: this.audioInputs.map((a) => a.path),
      output_path: path.resolve(this.outputPath),
    });
    console.log('[FramePipeEncoder] rawvideo input:', this._rawvideo.rawvideoInput);

    this.metrics.encodeStartMs = Date.now();
    this._proc = spawn(FFMPEG, this._ffmpegArgs, { stdio: ['pipe', 'pipe', 'pipe'] });
    this._stdin = this._proc.stdin;
    this._started = true;

    this._stdoutHandler = (d) => {
      const chunk = d.toString();
      this._stdout += chunk;
      process.stdout.write(d);
    };
    this._stderrHandler = (d) => {
      const chunk = d.toString();
      this._stderr += chunk;
      process.stderr.write(d);
    };
    this._errorHandler = (err) => {
      if (this._aborted) return;
      this._spawnError = err;
      console.error('[FramePipeEncoder] error event:', err);
    };
    this._closeHandler = (code, signal) => {
      this._closeCode = code;
      this._closeSignal = signal ?? null;
      if (this.framesWritten === 0 && !this._aborted) {
        console.error('[FramePipeEncoder] close event before first frame:', {
          code,
          signal,
          pid: this._proc?.pid,
          killed: this._proc?.killed,
          stderr: this._stderr,
        });
      }
    };

    this._proc.stdout.on('data', this._stdoutHandler);
    this._proc.stderr.on('data', this._stderrHandler);
    this._proc.on('error', this._errorHandler);
    this._proc.on('close', this._closeHandler);

    console.log('[FramePipeEncoder] spawned', {
      pid: this._proc.pid,
      stdinWritable: this._stdin?.writable ?? false,
      exitCode: this._proc.exitCode,
      killed: this._proc.killed,
    });
  }

  writeFrameSync(rgba) {
    const frameIndex = this.framesWritten;
    return new Promise((resolve, reject) => {
      try {
        const buf = this._validateFrameBuffer(frameIndex, rgba);
        this._assertReadyForWrite(frameIndex);

        const ok = this._stdin.write(buf, (err) => {
          if (err) {
            const details = this._collectFailureDetails('stdin_write_callback');
            reject(new FfmpegPipeFailure(
              this._formatFailureMessage(`FFmpeg stdin write failed on frame ${frameIndex}: ${err.message}`, details),
              details,
            ));
          }
        });

        this.framesWritten += 1;

        const afterWrite = () => {
          if (frameIndex === 0) {
            const alive = this._proc && this._proc.exitCode === null && !this._proc.killed;
            console.log('[FramePipeEncoder] frame 0 written', {
              pid: this._proc?.pid,
              processAlive: alive,
              stdinWritable: this._stdin?.writable ?? false,
              exitCode: this._proc?.exitCode ?? this._closeCode,
            });
            if (!alive) {
              const details = this._collectFailureDetails('after_frame_0_write');
              reject(new FfmpegPipeFailure(
                this._formatFailureMessage('FFmpeg exited immediately after frame 0 was written', details),
                details,
              ));
              return;
            }
          }
          resolve();
        };

        if (ok) afterWrite();
        else this._stdin.once('drain', afterWrite);
      } catch (err) {
        reject(err);
      }
    });
  }

  async finish() {
    if (this._stdin?.writable) {
      this._stdin.end();
    }
    return new Promise((resolve, reject) => {
      if (!this._proc) {
        this.metrics.encodeEndMs = Date.now();
        this.metrics.framesWritten = this.framesWritten;
        resolve(this.metrics);
        return;
      }
      this._proc.once('close', (code, signal) => {
        this._closeCode = code;
        this._closeSignal = signal ?? null;
        this.metrics.encodeEndMs = Date.now();
        this.metrics.framesWritten = this.framesWritten;
        if (code === 0) {
          resolve(this.metrics);
          return;
        }
        const details = this._collectFailureDetails('finish');
        reject(new FfmpegPipeFailure(
          this._formatFailureMessage(`FFmpeg encode failed (exitCode=${code}, signal=${signal})`, details),
          details,
        ));
      });
    });
  }

  abort() {
    this._aborted = true;
    if (this._stdin && !this._stdin.destroyed) {
      this._stdin.destroy();
    }
    if (this._proc) {
      if (this._stderrHandler) this._proc.stderr?.removeListener('data', this._stderrHandler);
      if (this._stdoutHandler) this._proc.stdout?.removeListener('data', this._stdoutHandler);
      if (this._errorHandler) this._proc.removeListener('error', this._errorHandler);
      if (this._closeHandler) this._proc.removeListener('close', this._closeHandler);
      if (!this._proc.killed) this._proc.kill('SIGKILL');
    }
    this._proc = null;
    this._stdin = null;
  }
}

module.exports = {
  FramePipeEncoder,
  FfmpegPipeFailure,
  buildAudioFilterForPipe,
  buildAtempoChain,
  buildDurationFitFilters,
  validateRawvideoArgs,
  validateOutputPath,
  validateAudioInputs,
};