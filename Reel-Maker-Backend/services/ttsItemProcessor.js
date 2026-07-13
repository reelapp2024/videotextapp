const path = require('path');
const { generateTTS } = require('./ttsService');
const { synthesizeAdvanced } = require('./advancedTtsService');
const { completeTtsItem, updateTtsItemProgress } = require('./ttsProgress');

/**
 * Synthesize one TTS item (Bull worker — Basic Edge or Advanced Piper).
 * @param {object} params
 */
async function runTtsItemJob({
  mode,
  parentJobId,
  itemIndex,
  text,
  speaker,
  rate,
  pitch,
  volume,
  quality,
  outDir,
  advancedOpts,
}) {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) {
    throw new Error(`TTS item ${itemIndex + 1}: empty text`);
  }

  await updateTtsItemProgress(parentJobId, itemIndex, 10);

  if (mode === 'advanced') {
    const fileName = `tts_${itemIndex + 1}.wav`;
    const result = await synthesizeAdvanced({
      ...(advancedOpts || {}),
      text: trimmed,
      outDir,
      fileName,
      precision: advancedOpts?.precision || 'studio',
    });
    await updateTtsItemProgress(parentJobId, itemIndex, 95);
    const publicPath = `/uploads/processed/${parentJobId}/${path.basename(result.outputPath)}`;
    return completeTtsItem(parentJobId, itemIndex, publicPath);
  }

  const outPath = path.join(outDir, `tts_${itemIndex + 1}.mp3`);
  await generateTTS(trimmed, outPath, speaker, rate, pitch, volume, quality);

  await updateTtsItemProgress(parentJobId, itemIndex, 95);

  const publicPath = `/uploads/processed/${parentJobId}/${path.basename(outPath)}`;
  return completeTtsItem(parentJobId, itemIndex, publicPath);
}

module.exports = {
  runTtsItemJob,
};
