const { useBullExport } = require('./bullExportConfig');
const {
  addBulkExportJobs,
  isExportQueueAvailable,
} = require('../queues/exportQueue');
const VideoJob = require('../models/VideoJob');
const {
  sanitizeExcelData,
  resolveExportJobCount,
} = require('../utils/exportJobPlanning');
const { resolveWorkerConcurrency } = require('./exportResourcePlanner');

/**
 * Try to enqueue export via Bull (one queue job per output video).
 * Returns true if enqueued, false to use in-process fallback.
 * @param {object} payload
 */
async function tryEnqueueExportJob(payload) {
  if (!useBullExport()) {
    return false;
  }

  try {
    const available = await isExportQueueAvailable();
    if (!available) {
      console.warn('[export-queue] Redis unavailable — falling back to in-process export');
      return false;
    }

    const { jobId, files, excelData, config } = payload;
    const cleanExcel = sanitizeExcelData(excelData);
    const captionExport = config?.captionExport;
    const useCaptionExport = Boolean(
      captionExport?.tracks?.some((t) => t.segments?.length > 0),
    );
    const rowCount = resolveExportJobCount({
      excelData: cleanExcel,
      config,
      useCaptionExport,
      captionExport,
      voiceCount: (files?.voices || []).length,
      videoCount: (files?.videos || []).length,
      imageCount: (files?.images || []).length,
    });

    await VideoJob.findOneAndUpdate({ jobId }, {
      totalVideos: rowCount,
      completedVideos: 0,
      parallelJobs: resolveWorkerConcurrency(),
      status: 'queued',
      progress: 1,
      exportRowProgress: {},
    });

    await addBulkExportJobs(
      { jobId, files, excelData: cleanExcel, config },
      rowCount,
    );
    return true;
  } catch (err) {
    console.warn('[export-queue] enqueue failed — falling back to in-process export:', err.message);
    return false;
  }
}

module.exports = {
  tryEnqueueExportJob,
};
