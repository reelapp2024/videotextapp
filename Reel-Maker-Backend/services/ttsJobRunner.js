const path = require('path');
const fs = require('fs');
const ProcessingJob = require('../models/ProcessingJob');
const { batchGenerateTTS } = require('./ttsService');
const { zipDir } = require('./videoProcessor');
const { synthesizeAdvanced } = require('./advancedTtsService');
const { getTtsWorkerConcurrency } = require('./bullTtsConfig');

/**
 * Run async work over items with a concurrency pool.
 */
async function mapPool(items, concurrency, fn) {
  const limit = Math.max(1, Math.min(concurrency || 1, items.length || 1));
  const results = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (true) {
      const i = cursor;
      cursor += 1;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  }

  await Promise.all(Array.from({ length: limit }, () => worker()));
  return results;
}

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

/**
 * Advanced batch — parallel Piper + studio FX (in-process fallback when Redis down).
 */
async function runAdvancedTtsBatchInProcess({ jobId, texts, outDir, advancedOpts = {} }) {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  await ProcessingJob.findOneAndUpdate({ jobId }, { status: 'processing', progress: 1 });

  const toPublicUrl = (fp) => `/uploads/processed/${jobId}/${path.basename(fp)}`;
  const jobs = texts
    .map((t, i) => ({ text: String(t ?? '').trim(), index: i }))
    .filter((j) => j.text.length > 0);

  const slots = new Array(texts.length).fill(null);
  let engineUsed = 'piper-local';
  const concurrency = Math.min(
    getTtsWorkerConcurrency(),
    Math.max(1, parseInt(process.env.ADVANCED_TTS_PARALLEL || '4', 10) || 4),
  );
  let doneCount = 0;

  await mapPool(jobs, concurrency, async (job) => {
    const fileName = `tts_${job.index + 1}.wav`;
    const result = await synthesizeAdvanced({
      ...advancedOpts,
      text: job.text,
      outDir,
      fileName,
    });
    slots[job.index] = result.outputPath;
    if (result.engine) engineUsed = result.engine;
    doneCount += 1;
    const percent = Math.round((doneCount / jobs.length) * 90);
    await ProcessingJob.findOneAndUpdate(
      { jobId },
      {
        progress: percent,
        completedItems: doneCount,
        totalItems: texts.length,
        outputFiles: slots.filter(Boolean).map(toPublicUrl),
        'config.engine': engineUsed,
        'config.parallelJobs': concurrency,
      },
    );
    return result.outputPath;
  });

  const outputs = slots.filter(Boolean);
  await ProcessingJob.findOneAndUpdate({ jobId }, { progress: 92 });
  const zipPath = path.join(outDir, 'tts_audios.zip');
  await zipDir(outDir, zipPath);

  await ProcessingJob.findOneAndUpdate({ jobId }, {
    status: 'done',
    progress: 100,
    resultUrl: `/uploads/processed/${jobId}/tts_audios.zip`,
    outputFiles: outputs.map(toPublicUrl),
    completedItems: outputs.length,
  });
}

module.exports = {
  runTtsBatchInProcess,
  runAdvancedTtsBatchInProcess,
  mapPool,
};
