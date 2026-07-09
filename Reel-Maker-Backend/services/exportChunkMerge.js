const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { getFfmpegPath } = require('./encodeOptions');
const { buildAudioFilterForPipe } = require('./framePipeEncoder');
const { resolveAudioEncodeOptions } = require('./encodeOptions');
const { finalizeMp4ForMobile } = require('./mp4Finalize');

const FFMPEG = getFfmpegPath();

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(FFMPEG, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    proc.stderr.on('data', (d) => { stderr = (stderr + d.toString()).slice(-4096); });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited ${code}: ${stderr.trim()}`));
    });
  });
}

/**
 * Concat video-only chunk MP4s with stream copy, then mux full audio track.
 * @param {object} opts
 */
async function mergeChunkedExport(opts) {
  const {
    chunkPaths,
    outputPath,
    config,
    w,
    h,
    fps,
    outputDuration,
    exportSpeed = 1,
    videoPath,
    voicePath,
    musicPath,
    hasVideoAudio = false,
    videoVol = 0,
    voiceVol = 0,
    musicVol = 0,
  } = opts;

  if (!chunkPaths?.length) {
    throw new Error('mergeChunkedExport: no chunk paths');
  }

  const outDir = path.dirname(outputPath);
  const concatListPath = path.join(outDir, `_concat_${path.basename(outputPath)}.txt`);
  const videoOnlyPath = path.join(outDir, `_video_${path.basename(outputPath)}`);

  const lines = chunkPaths.map((p) => {
    const safe = p.replace(/\\/g, '/').replace(/'/g, "'\\''");
    return `file '${safe}'`;
  });
  fs.writeFileSync(concatListPath, lines.join('\n'));

  try {
    await runFfmpeg([
      '-hide_banner', '-loglevel', 'error',
      '-f', 'concat', '-safe', '0',
      '-i', concatListPath,
      '-c', 'copy',
      '-y', videoOnlyPath,
    ]);

    const encodeConfig = {
      ...config,
      video: { ...(config?.video || {}), fps, width: w, height: h },
    };
    const audioResolved = resolveAudioEncodeOptions(encodeConfig);
    const hasVoice = !!voicePath;
    const hasMusic = !!musicPath;
    const audioInputs = [];
    if (hasVideoAudio && videoPath) audioInputs.push({ path: videoPath });
    if (hasVoice) audioInputs.push({ path: voicePath });
    if (hasMusic) audioInputs.push({ path: musicPath });

    const audioFilter = buildAudioFilterForPipe(
      hasVideoAudio && videoPath,
      hasVoice,
      hasMusic,
      videoVol,
      voiceVol,
      musicVol,
      exportSpeed,
      outputDuration,
      audioResolved.audioRate,
    );

    const args = [
      '-hide_banner', '-loglevel', 'error',
      '-i', videoOnlyPath,
    ];
    for (const audio of audioInputs) {
      if (audio?.path) args.push('-i', audio.path);
    }

    if (audioFilter) {
      args.push('-filter_complex', audioFilter.filter);
      args.push('-map', '0:v:0', '-map', `[${audioFilter.audioLabel}]`);
      args.push(...audioResolved.options);
    } else {
      args.push('-map', '0:v:0', '-an');
    }

    args.push('-c:v', 'copy', '-y', outputPath);
    await runFfmpeg(args);

    if (outputPath.endsWith('.mp4')) {
      await finalizeMp4ForMobile(outputPath);
    }
  } finally {
    for (const p of [concatListPath, videoOnlyPath, ...chunkPaths]) {
      try { if (p && fs.existsSync(p)) fs.unlinkSync(p); } catch { /* ignore */ }
    }
  }
}

module.exports = {
  mergeChunkedExport,
};
