const path = require('path');
const { generateTTS } = require('./ttsService');
const { completeTtsItem, updateTtsItemProgress } = require('./ttsProgress');

/**
 * Synthesize one TTS item (used by Bull worker and in-process fallback).
 * @param {object} params
 */
async function runTtsItemJob({
  parentJobId,
  itemIndex,
  text,
  speaker,
  rate,
  pitch,
  volume,
  quality,
  outDir,
}) {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) {
    throw new Error(`TTS item ${itemIndex + 1}: empty text`);
  }

  await updateTtsItemProgress(parentJobId, itemIndex, 10);

  const outPath = path.join(outDir, `tts_${itemIndex + 1}.mp3`);
  await generateTTS(trimmed, outPath, speaker, rate, pitch, volume, quality);

  await updateTtsItemProgress(parentJobId, itemIndex, 95);

  const publicPath = `/uploads/processed/${parentJobId}/${path.basename(outPath)}`;
  return completeTtsItem(parentJobId, itemIndex, publicPath);
}

module.exports = {
  runTtsItemJob,
};
