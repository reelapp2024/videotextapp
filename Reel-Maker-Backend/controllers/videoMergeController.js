const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { mergeVideos, zipDir } = require('../services/videoProcessor');
const ProcessingJob = require('../models/ProcessingJob');
const { createJobUpload } = require('../middleware/upload');

const jobUpload = createJobUpload('v');

module.exports = {
  merge: async (req, res) => {
    const jobId = uuidv4();
    req.jobId = jobId;

    jobUpload.array('videos', 50)(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      try {
        const files = req.files;
        if (!files || files.length < 2) return res.status(400).json({ error: 'At least 2 videos needed for merge' });

        const transition = req.body?.transition || 'fade';
        const batchSize = Math.max(2, parseInt(req.body?.batchSize || '5', 10));
        const transitionDuration = parseFloat(req.body?.transitionDuration || '0.5');

        await ProcessingJob.create({ jobId, type: 'merge', status: 'queued', progress: 0, totalItems: files.length });
        res.status(202).json({ jobId });

        setImmediate(async () => {
          try {
            await ProcessingJob.findOneAndUpdate({ jobId }, { status: 'processing' });
            const outDir = path.join(__dirname, '../uploads/processed', jobId);
            fs.mkdirSync(outDir, { recursive: true });

            const allPaths = files.map((f) => f.path);
            const batches = [];
            for (let i = 0; i < allPaths.length; i += batchSize) {
              batches.push(allPaths.slice(i, i + batchSize));
            }

            for (let b = 0; b < batches.length; b++) {
              await ProcessingJob.findOneAndUpdate({ jobId }, { progress: Math.round((b / batches.length) * 90) });
              const outPath = path.join(outDir, `merged_${b + 1}.mp4`);
              try {
                await mergeVideos(batches[b], outPath, transition, transitionDuration);
              } catch (e) {
                console.error(`Merge batch ${b + 1} error:`, e.message);
              }
            }

            const zipPath = path.join(outDir, 'merged.zip');
            await zipDir(outDir, zipPath);
            const resultUrl = `/uploads/processed/${jobId}/merged.zip`;
            await ProcessingJob.findOneAndUpdate({ jobId }, { status: 'done', progress: 100, resultUrl });
          } catch (e) {
            await ProcessingJob.findOneAndUpdate({ jobId }, { status: 'error', error: e.message });
          }
        });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
  },
};
