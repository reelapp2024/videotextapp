const { useBullExport } = require('./bullExportConfig');
const { addExportJob, isExportQueueAvailable } = require('../queues/exportQueue');

/**
 * Try to enqueue export via Bull. Returns true if enqueued, false to use in-process fallback.
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

    await addExportJob(payload);
    return true;
  } catch (err) {
    console.warn('[export-queue] enqueue failed — falling back to in-process export:', err.message);
    return false;
  }
}

module.exports = {
  tryEnqueueExportJob,
};
