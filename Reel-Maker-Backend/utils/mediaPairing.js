/**
 * Sequence / shuffle media pairing for bulk export rows.
 * Mirrors Reel-Maker/src/utils/mediaPairing.js
 */

function seededShuffle(array, seed) {
  const result = [...array];
  let s = Number(seed) || 1;
  const random = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildMediaIndexSeries(mode, mediaCount, outputRows, seed) {
  if (outputRows <= 0 || mediaCount <= 0) return [];
  if (mediaCount === 1) return Array.from({ length: outputRows }, () => 0);
  if (mode !== 'shuffle') {
    return Array.from({ length: outputRows }, (_, i) => i % mediaCount);
  }

  const indices = [];
  let perm = seededShuffle([...Array(mediaCount).keys()], seed);
  let ptr = 0;
  let round = 0;
  for (let r = 0; r < outputRows; r++) {
    if (ptr >= perm.length) {
      round += 1;
      perm = seededShuffle([...Array(mediaCount).keys()], seed + round * 997);
      ptr = 0;
    }
    indices.push(perm[ptr]);
    ptr += 1;
  }
  return indices;
}

/**
 * Precompute per-output-row media indices for parallel-safe server export.
 */
function buildExportMediaPairing({
  outputRows = 0,
  videoMode = 'sequence',
  audioMode = 'sequence',
  imageMode = 'sequence',
  videoCount = 0,
  voiceCount = 0,
  imageCount = 0,
  musicCount = 0,
  seed = Date.now(),
}) {
  const rows = Math.max(0, Number(outputRows) || 0);
  const baseSeed = Number(seed) || Date.now();
  return {
    seed: baseSeed,
    videoMode: videoMode === 'shuffle' ? 'shuffle' : 'sequence',
    audioMode: audioMode === 'shuffle' ? 'shuffle' : 'sequence',
    imageMode: imageMode === 'shuffle' ? 'shuffle' : 'sequence',
    voiceIndices: buildMediaIndexSeries(audioMode, voiceCount, rows, baseSeed + 1),
    videoIndices: buildMediaIndexSeries(videoMode, videoCount, rows, baseSeed),
    imageIndices: buildMediaIndexSeries(imageMode, imageCount, rows, baseSeed + 2),
    musicIndices: buildMediaIndexSeries('sequence', musicCount, rows, baseSeed + 3),
  };
}

function resolvePairedIndex(pairing, key, rowIndex, fallbackCount) {
  const list = pairing?.[key];
  if (Array.isArray(list) && list[rowIndex] != null) return list[rowIndex];
  if (fallbackCount > 0) return rowIndex % fallbackCount;
  return 0;
}

module.exports = {
  seededShuffle,
  buildMediaIndexSeries,
  buildExportMediaPairing,
  resolvePairedIndex,
};
