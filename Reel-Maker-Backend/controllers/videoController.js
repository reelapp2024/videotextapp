const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const VideoJob = require('../models/VideoJob');
const ProcessingJob = require('../models/ProcessingJob');
const { processSlideshowJob } = require('../services/videoProcessor');
const {
  markJobCancelled,
  clearJobCancelled,
  isJobCancelled,
  JobCancelledError,
} = require('../services/jobCancellation');
const { runVideoExportJob, handleExportJobFailure } = require('../services/exportJobRunner');
const { tryEnqueueExportJob } = require('../services/exportQueueService');
const { removeExportJob } = require('../queues/exportQueue');
const { createJobUpload, jobsDir } = require('../middleware/upload');

const jobUpload = createJobUpload('f');

module.exports = {
  process: async (req, res) => {
    const jobId = uuidv4();
    req.jobId = jobId;
    const fields = [
      { name: 'videos', maxCount: 20 },
      { name: 'voices', maxCount: 20 },
      { name: 'music', maxCount: 10 },
      { name: 'images', maxCount: 20 },
    ];
    const configField = { name: 'config', maxCount: 1 };
    const excelField = { name: 'excelData', maxCount: 1 };
    const mw = jobUpload.fields([...fields, configField, excelField]);

    mw(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      try {
        const files = req.files;
        let config = {};
        let excelData = [];
        const configFile = files?.config?.[0];
        const excelFile = files?.excelData?.[0];
        if (configFile?.path && fs.existsSync(configFile.path)) {
          try { config = JSON.parse(fs.readFileSync(configFile.path, 'utf-8')); } catch (_) {}
        }
        if (excelFile?.path && fs.existsSync(excelFile.path)) {
          try { excelData = JSON.parse(fs.readFileSync(excelFile.path, 'utf-8')); } catch (_) {}
        }

        const jobDir = path.join(jobsDir, jobId);
        const videoFiles = files?.videos || [];
        const voiceFiles = files?.voices || [];
        const musicFiles = files?.music || [];
        const imageFiles = files?.images || [];
        const videos = videoFiles.map((f) => path.join(jobDir, f.filename));
        const voices = voiceFiles.map((f) => path.join(jobDir, f.filename));
        const music = musicFiles.map((f) => path.join(jobDir, f.filename));
        const images = imageFiles.map((f) => path.join(jobDir, f.filename));

        if (videos.length === 0 && voices.length === 0 && images.length === 0) {
          return res.status(400).json({ error: 'At least one video, image, or voice file required' });
        }

        await VideoJob.create({
          jobId,
          status: 'queued',
          progress: 0,
          totalVideos: 0,
          completedVideos: 0,
          outputFiles: [],
        });
        res.status(202).json({ jobId, message: 'Processing started on server' });

        const exportPayload = {
          jobId,
          files: { videos, voices, music, images },
          excelData,
          config,
        };

        const enqueued = await tryEnqueueExportJob(exportPayload);

        if (enqueued) {
          console.log(`[export] job ${jobId} enqueued to Bull`);
          return;
        }

        setImmediate(async () => {
          try {
            await runVideoExportJob(exportPayload);
          } catch (e) {
            await handleExportJobFailure(jobId, e);
          } finally {
            clearJobCancelled(jobId);
          }
        });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
  },

  slideshow: async (req, res) => {
    const jobId = uuidv4();
    req.jobId = jobId;
    req.filePrefix = 'sl';

    const fields = [
      { name: 'images', maxCount: 200 },
      { name: 'voices', maxCount: 5 },
      { name: 'music', maxCount: 5 },
    ];
    const configField = { name: 'config', maxCount: 1 };
    const excelField = { name: 'excelData', maxCount: 1 };
    const slideField = { name: 'durationPerImageSec', maxCount: 1 };

    const mw = jobUpload.fields([...fields, configField, excelField, slideField]);
    mw(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      try {
        const files = req.files;
        let config = {};
        let excelData = [];
        let durationPerImageSec = 2;

        const configFile = files?.config?.[0];
        const excelFile = files?.excelData?.[0];
        const durFile = files?.durationPerImageSec?.[0];

        if (configFile?.path && fs.existsSync(configFile.path)) {
          try { config = JSON.parse(fs.readFileSync(configFile.path, 'utf-8')); } catch (_) {}
        }
        if (excelFile?.path && fs.existsSync(excelFile.path)) {
          try { excelData = JSON.parse(fs.readFileSync(excelFile.path, 'utf-8')); } catch (_) {}
        }
        if (durFile?.path && fs.existsSync(durFile.path)) {
          try { durationPerImageSec = Math.max(0.1, Math.min(60, Number(fs.readFileSync(durFile.path, 'utf-8')) || 2)); } catch (_) {}
        }

        const jobDir = path.join(jobsDir, jobId);
        const imageFiles = files?.images || [];
        const voiceFiles = files?.voices || [];
        const musicFiles = files?.music || [];

        const images = imageFiles.map((f) => path.join(jobDir, f.filename));
        const voices = voiceFiles.map((f) => path.join(jobDir, f.filename));
        const music = musicFiles.map((f) => path.join(jobDir, f.filename));

        if (images.length === 0) return res.status(400).json({ error: 'At least one image required' });

        await ProcessingJob.create({ jobId, type: 'video', status: 'queued', progress: 0, totalItems: 1, completedItems: 0 });
        res.status(202).json({ jobId, message: 'Slideshow processing started on server' });

        setImmediate(async () => {
          try {
            await ProcessingJob.findOneAndUpdate({ jobId }, { status: 'processing', progress: 1 });
            const row = (excelData && excelData.length > 0) ? (excelData[0] || []) : [];
            const out = await processSlideshowJob(
              jobId,
              { images, voices, music },
              row,
              config,
              durationPerImageSec,
              async (p) => {
                if (isJobCancelled(jobId)) throw new JobCancelledError();
                await ProcessingJob.findOneAndUpdate({ jobId }, { progress: p });
              },
            );
            await ProcessingJob.findOneAndUpdate({ jobId }, { status: 'done', progress: 100, resultUrl: out.resultUrl, outputFiles: out.outputFiles, completedItems: 1 });
          } catch (e) {
            if (e instanceof JobCancelledError) {
              await ProcessingJob.findOneAndUpdate({ jobId }, { status: 'cancelled', error: e.message });
            } else {
              await ProcessingJob.findOneAndUpdate({ jobId }, { status: 'error', error: e.message });
            }
          } finally {
            clearJobCancelled(jobId);
          }
        });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
  },

  cancelJob: async (req, res) => {
    try {
      const jobId = req.params.id;
      let job = await VideoJob.findOne({ jobId });
      if (!job) job = await ProcessingJob.findOne({ jobId });
      if (!job) return res.status(404).json({ error: 'Job not found' });
      if (job.status === 'done' || job.status === 'cancelled') {
        return res.json({ ok: true, status: job.status });
      }
      markJobCancelled(jobId);
      try {
        await removeExportJob(jobId);
      } catch (e) {
        console.warn('[export] queue remove failed:', e.message);
      }
      if (await VideoJob.findOne({ jobId })) {
        await VideoJob.findOneAndUpdate({ jobId }, { status: 'cancelled', error: 'Cancelled by user' });
      } else {
        await ProcessingJob.findOneAndUpdate({ jobId }, { status: 'cancelled', error: 'Cancelled by user' });
      }
      res.json({ ok: true, status: 'cancelled' });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  getJobStatus: async (req, res) => {
    try {
      let job = await VideoJob.findOne({ jobId: req.params.id });
      if (!job) job = await ProcessingJob.findOne({ jobId: req.params.id });
      if (!job) return res.status(404).json({ error: 'Job not found' });
      res.json({
        status: job.status,
        progress: job.progress,
        resultUrl: job.resultUrl,
        error: job.error,
        type: job.type || 'video',
        outputFiles: job.outputFiles || [],
        completedItems: job.completedVideos ?? job.completedItems ?? 0,
        totalItems: job.totalVideos ?? job.totalItems ?? 0,
        rowProgress: job.exportRowProgress || job.config?.itemProgress || {},
        parallelJobs: job.parallelJobs ?? job.config?.parallelJobs ?? 4,
        exportDurationMs: job.exportDurationMs ?? null,
        exportStartedAt: job.exportStartedAt ?? null,
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
};
