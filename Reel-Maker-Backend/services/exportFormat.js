const path = require('path');

/**
 * Resolve container/codec from export config (and optional output path extension).
 * @param {object} config
 * @param {string} [outputPath]
 */
function resolveExportFormat(config, outputPath) {
  const raw = String(config?.video?.format || '').trim().toLowerCase();
  if (raw === 'webm-vp9' || raw === 'webm_vp9') {
    return { ext: 'webm', container: 'webm', videoCodec: 'vp9' };
  }
  if (raw === 'webm') {
    return { ext: 'webm', container: 'webm', videoCodec: 'vp8' };
  }
  if (raw === 'mkv') {
    return { ext: 'mkv', container: 'matroska', videoCodec: 'h264' };
  }
  if (raw === 'mp4') {
    return { ext: 'mp4', container: 'mp4', videoCodec: 'h264' };
  }

  if (outputPath) {
    const ext = path.extname(outputPath).toLowerCase().replace(/^\./, '');
    if (ext === 'webm') return { ext: 'webm', container: 'webm', videoCodec: 'vp9' };
    if (ext === 'mkv') return { ext: 'mkv', container: 'matroska', videoCodec: 'h264' };
    if (ext === 'mp4') return { ext: 'mp4', container: 'mp4', videoCodec: 'h264' };
  }

  return { ext: 'mp4', container: 'mp4', videoCodec: 'h264' };
}

function outputFilePattern(ext) {
  const safe = String(ext || 'webm').replace(/[^a-z0-9]/gi, '');
  return new RegExp(`^out_\\d+\\.${safe}$`, 'i');
}

function buildOutputFilename(index, ext) {
  return `out_${index + 1}.${ext || 'mp4'}`;
}

module.exports = {
  resolveExportFormat,
  outputFilePattern,
  buildOutputFilename,
};
