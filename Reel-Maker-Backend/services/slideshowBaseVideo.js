const ffmpeg = require('fluent-ffmpeg');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
const fs = require('fs');
const { getEncodeOptions, getFfmpegPath } = require('./encodeOptions');

ffmpeg.setFfmpegPath(getFfmpegPath());
ffmpeg.setFfprobePath(ffprobeInstaller.path);

function clamp(n, min, max, fallback) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(min, Math.min(max, x));
}

/**
 * Build a silent slideshow base video from an FFmpeg concat image list (M10).
 * Overlays are applied by the shared renderer in a second pass.
 */
async function buildSlideshowBaseVideo({
  listPath,
  w,
  h,
  fps,
  exportSpeed = 1,
  config,
  outputPath,
  onProgress,
}) {
  if (!listPath || !fs.existsSync(listPath)) {
    throw new Error('Slideshow concat list missing');
  }

  const speed = clamp(exportSpeed, 0.25, 4, 1);
  const baseVideoFilter = [
    `scale=${w}:${h}:force_original_aspect_ratio=decrease`,
    `pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:black`,
    `fps=${fps}`,
    ...(speed !== 1 ? [`setpts=PTS/${speed}`] : []),
  ].join(',');

  const encodeConfig = { ...config, video: { ...(config?.video || {}), fps } };
  const speedOpts = getEncodeOptions(encodeConfig, { fast: false });

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(listPath)
      .inputOptions(['-f', 'concat', '-safe', '0'])
      .outputOptions(['-vf', `${baseVideoFilter},format=yuv420p`, '-an', ...speedOpts])
      .output(outputPath)
      .on('progress', (p) => {
        if (onProgress && p?.percent != null) {
          Promise.resolve(onProgress(clamp(p.percent, 0, 100, 0))).catch(() => {});
        }
      })
      .on('end', () => {
        if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size < 1000) {
          reject(new Error('Slideshow base video missing or empty'));
          return;
        }
        resolve(outputPath);
      })
      .on('error', (err) => reject(err))
      .run();
  });
}

module.exports = { buildSlideshowBaseVideo };
