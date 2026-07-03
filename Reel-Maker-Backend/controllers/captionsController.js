const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const CaptionJob = require('../models/CaptionJob');
const CaptionTrack = require('../models/CaptionTrack');
const CaptionStyleTemplate = require('../models/CaptionStyleTemplate');
const { DEFAULT_CAPTION_STYLE } = require('../constants/caption');
const { runTranscriptionPipeline, runRenderPipeline } = require('../services/captionProcessor');
const { tryEnqueueCaptionBatch } = require('../services/captionQueueService');
const { captionUpload, captionJobsDir } = require('../middleware/upload');

function trackDto(t) {
  return {
    id: String(t._id),
    trackIndex: t.trackIndex,
    label: t.label,
    status: t.status,
    error: t.error,
    language: t.language,
    duration: t.duration,
    segments: t.segments,
    outputVideoUrl: t.outputVideoUrl,
  };
}

function trackSummaryDto(t) {
  return {
    id: String(t._id),
    trackIndex: t.trackIndex,
    label: t.label,
    status: t.status,
    error: t.error,
    language: t.language,
    duration: t.duration,
    outputVideoUrl: t.outputVideoUrl,
  };
}

module.exports = {
  createBatch: (req, res) => {
    const captionJobId = uuidv4();
    req.captionJobId = captionJobId;

    captionUpload.fields([
      { name: 'audios', maxCount: 100 },
      { name: 'videos', maxCount: 100 },
    ])(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      try {
        const files = req.files;
        const audioFiles = files?.audios || [];
        if (!audioFiles.length) return res.status(400).json({ error: 'At least one audio required' });

        const videoFiles = files?.videos || [];
        const whisperModel = req.body?.whisperModel || process.env.WHISPER_MODEL || 'base';
        const language = req.body?.language || 'auto';
        const jobDir = path.join(captionJobsDir, captionJobId);

        await CaptionJob.create({
          jobId: captionJobId,
          userId: req.userId || null,
          totalTracks: audioFiles.length,
          whisperModel,
          language,
          styleSnapshot: { ...DEFAULT_CAPTION_STYLE },
        });

        const tracks = audioFiles.map((af, i) => ({
          captionJobId,
          trackIndex: i,
          label: af.originalname,
          audioPath: path.join(jobDir, af.filename),
          videoPath: videoFiles[i] ? path.join(jobDir, videoFiles[i].filename) : null,
        }));
        const insertedTracks = await CaptionTrack.insertMany(tracks);

        res.status(202).json({ jobId: captionJobId, totalTracks: insertedTracks.length });

        const startInProcess = () => {
          setImmediate(() => {
            runTranscriptionPipeline(captionJobId, whisperModel, language).catch(async (e) => {
              await CaptionJob.findOneAndUpdate(
                { jobId: captionJobId },
                { status: 'error', error: e.message },
              );
            });
          });
        };

        tryEnqueueCaptionBatch(captionJobId, insertedTracks, whisperModel, language)
          .then((enqueued) => {
            if (!enqueued) startInProcess();
          })
          .catch(() => startInProcess());
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
  },

  getJob: async (req, res) => {
    const jobId = String(req.params.jobId);
    const summary = req.query.summary === '1' || req.query.summary === 'true';
    const job = await CaptionJob.findOne({ jobId });
    if (!job) return res.status(404).json({ error: 'Not found' });

    const base = {
      jobId: job.jobId,
      status: job.status,
      error: job.error,
      totalTracks: job.totalTracks,
      transcribedCount: job.transcribedCount,
      renderedCount: job.renderedCount,
      editorReady: job.editorReady,
      styleSnapshot: job.styleSnapshot,
      resultZipUrl: job.resultZipUrl,
      whisperModel: job.whisperModel,
    };

    if (summary) {
      const tracks = await CaptionTrack.find({ captionJobId: jobId })
        .select('trackIndex label status error language duration outputVideoUrl')
        .sort({ trackIndex: 1 })
        .lean();
      return res.json({ ...base, tracks: tracks.map(trackSummaryDto) });
    }

    const tracks = await CaptionTrack.find({ captionJobId: jobId }).sort({ trackIndex: 1 });
    res.json({ ...base, tracks: tracks.map(trackDto) });
  },

  updateTrack: async (req, res) => {
    const segments = req.body?.segments;
    if (!segments?.length) return res.status(400).json({ error: 'segments required' });
    const track = await CaptionTrack.findByIdAndUpdate(
      req.params.trackId,
      { segments },
      { new: true },
    );
    if (!track) return res.status(404).json({ error: 'Not found' });
    res.json(trackDto(track));
  },

  setStyle: async (req, res) => {
    const jobId = String(req.params.jobId);
    const style = req.body?.style;
    if (!style) return res.status(400).json({ error: 'style required' });
    await CaptionJob.findOneAndUpdate({ jobId }, { styleSnapshot: style });
    if (req.body?.saveAsTemplate && req.body?.templateName) {
      await CaptionStyleTemplate.create({
        name: req.body.templateName,
        userId: req.userId,
        style,
      });
    }
    res.json({ ok: true, style });
  },

  render: async (req, res) => {
    const jobId = String(req.params.jobId);
    const style = req.body?.style;
    if (style) await CaptionJob.findOneAndUpdate({ jobId }, { styleSnapshot: style });
    res.status(202).json({ ok: true });
    setImmediate(() => {
      runRenderPipeline(jobId, style || DEFAULT_CAPTION_STYLE).catch(async (e) => {
        await CaptionJob.findOneAndUpdate({ jobId }, { status: 'error', error: e.message });
      });
    });
  },

  listTemplates: async (_req, res) => {
    const list = await CaptionStyleTemplate.find().sort({ updatedAt: -1 }).limit(50);
    res.json({ templates: list });
  },
};
