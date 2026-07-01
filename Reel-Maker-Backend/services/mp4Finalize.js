const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

/**
 * Add faststart moov atom for mobile playback (M7/M10).
 * @param {string} inputPath
 */
async function finalizeMp4ForMobile(inputPath) {
  if (!inputPath.endsWith('.mp4') || !fs.existsSync(inputPath)) return;
  const tmp = `${inputPath}.mobile.mp4`;
  await new Promise((resolve) => {
    ffmpeg(inputPath)
      .outputOptions(['-c', 'copy', '-movflags', '+faststart', '-f', 'mp4'])
      .output(tmp)
      .on('end', () => {
        try {
          fs.renameSync(tmp, inputPath);
        } catch {
          try { fs.unlinkSync(tmp); } catch { /* ignore */ }
        }
        resolve();
      })
      .on('error', () => {
        try { fs.unlinkSync(tmp); } catch { /* ignore */ }
        resolve();
      })
      .run();
  });
}

module.exports = { finalizeMp4ForMobile };
