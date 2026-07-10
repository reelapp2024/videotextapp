const path = require('path');
const fs = require('fs');
const ProcessingJob = require('../models/ProcessingJob');
const { batchGenerateTTS } = require('./ttsService');
const { zipDir } = require('./videoProcessor');

/**
 * In-process fallback when Redis/Bull is unavailable.
 */
async function runTtsBatchInProcess({
  jobId,
  texts,
  outDir,
  speaker,
  rate,
  pitch,
  volume,
  quality,
}) {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  await ProcessingJob.findOneAndUpdate({ jobId }, { status: 'processing', progress: 1 });

  const toPublicUrl = (fp) => `/uploads/processed/${jobId}/${path.basename(fp)}`;

  const outputs = await batchGenerateTTS(
    texts,
    outDir,
    speaker,
    rate,
    pitch,
    volume,
    quality,
    async (ev) => {
      const outputFiles = ev.outputPaths.map(toPublicUrl);
      await ProcessingJob.findOneAndUpdate(
        { jobId },
        {
          progress: ev.percent,
          completedItems: ev.completed,
          totalItems: texts.length,
          outputFiles,
        },
      );
    },
  );

  const outputFiles = outputs.map(toPublicUrl);
  await ProcessingJob.findOneAndUpdate({ jobId }, { progress: 92 });

  const zipPath = path.join(outDir, 'tts_audios.zip');
  await zipDir(outDir, zipPath);
  const resultUrl = `/uploads/processed/${jobId}/tts_audios.zip`;

  await ProcessingJob.findOneAndUpdate({ jobId }, {
    status: 'done',
    progress: 100,
    resultUrl,
    outputFiles,
    completedItems: outputs.length,
  });
}

module.exports = {
  runTtsBatchInProcess,
};
