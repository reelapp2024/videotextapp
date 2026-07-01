const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { extractAudioFromVideo, zipDir } = require('../services/videoProcessor');
const ProcessingJob = require('../models/ProcessingJob');
const { createJobUpload } = require('../middleware/upload');

const jobUpload = createJobUpload('v');

module.exports = {
  extract: async (req, res) => {
    const jobId = uuidv4();
    req.jobId = jobId;

    jobUpload.array('videos', 50)(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      try {
        const files = req.files;
        if (!files || files.length === 0) return res.status(400).json({ error: 'No video files' });

        const format = req.body?.format || 'wav';
        await ProcessingJob.create({ jobId, type: 'audio_extract', status: 'queued', progress: 0, totalItems: files.length });
        res.status(202).json({ jobId });

        setImmediate(async () => {
          try {
            await ProcessingJob.findOneAndUpdate({ jobId }, { status: 'processing' });
            const outDir = path.join(__dirname, '../uploads/processed', jobId);
            fs.mkdirSync(outDir, { recursive: true });

            for (let i = 0; i < files.length; i++) {
              await ProcessingJob.findOneAndUpdate({ jobId }, { progress: Math.round((i / files.length) * 90) });
              const ext = format === 'mp3' ? 'mp3' : 'wav';
              const outPath = path.join(outDir, `audio_${i + 1}.${ext}`);
              try {
                await extractAudioFromVideo(files[i].path, outPath, format);
              } catch (e) {
                console.error(`Audio extract error ${i + 1}:`, e.message);
              }
            }

            const zipPath = path.join(outDir, 'audios.zip');
            await zipDir(outDir, zipPath);
            const resultUrl = `/uploads/processed/${jobId}/audios.zip`;
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
