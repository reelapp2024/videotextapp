const ffmpeg = require('fluent-ffmpeg');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
const fs = require('fs');
const { promisify } = require('util');

ffmpeg.setFfprobePath(ffprobeInstaller.path);
const ffprobeAsync = promisify(ffmpeg.ffprobe);

async function probeDuration(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return 0;
  try {
    const meta = await ffprobeAsync(filePath);
    const d = meta?.format?.duration;
    return d && Number.isFinite(d) && d > 0 ? d : 0;
  } catch {
    return 0;
  }
}

function lastSegmentEnd(segments) {
  let max = 0;
  for (const seg of segments || []) {
    if ((seg.end ?? 0) > max) max = seg.end ?? 0;
    for (const w of seg.words || []) {
      if ((w.end ?? 0) > max) max = w.end ?? 0;
    }
  }
  return max;
}

/**
 * @param {object} params
 */
async function resolveExportDuration(params) {
  const {
    videoPath,
    voicePath,
    musicPath,
    segments = [],
    config = {},
  } = params;

  const [voiceDur, musicDur, videoDur] = await Promise.all([
    probeDuration(voicePath),
    probeDuration(musicPath),
    probeDuration(videoPath),
  ]);

  let segEnd = lastSegmentEnd(segments);
  if (!segEnd && config?.captionSync?.segments?.length) {
    segEnd = lastSegmentEnd(config.captionSync.segments);
  }

  return Math.max(voiceDur, musicDur, videoDur, segEnd, 1);
}

module.exports = {
  probeDuration,
  lastSegmentEnd,
  resolveExportDuration,
};
