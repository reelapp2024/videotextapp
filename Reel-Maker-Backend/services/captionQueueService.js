const { useBullCaptions } = require('./bullCaptionConfig');
const { addCaptionJob, isCaptionQueueAvailable } = require('../queues/captionQueue');
const CaptionJob = require('../models/CaptionJob');

/**
 * Enqueue all tracks for a caption batch. Returns true if queued via Bull.
 * @param {string} captionJobId
 * @param {Array<{ _id: unknown, trackIndex: number }>} tracks
 * @param {string} model
 * @param {string} language
 */
async function tryEnqueueCaptionBatch(captionJobId, tracks, model, language) {
  if (!useBullCaptions()) {
    return false;
  }

  try {
    const available = await isCaptionQueueAvailable();
    if (!available) {
      console.warn('[caption-queue] Redis unavailable — falling back to in-process transcription');
      return false;
    }

    await CaptionJob.findOneAndUpdate(
      { jobId: captionJobId },
      { status: 'transcribing', totalTracks: tracks.length },
    );

    for (const track of tracks) {
      await addCaptionJob({
        captionJobId,
        trackId: String(track._id),
        trackIndex: track.trackIndex,
        model,
        language,
      }, {
        priority: track.trackIndex === 0 ? 1 : 5,
      });
    }

    console.log(`[caption-queue] batch ${captionJobId}: ${tracks.length} track job(s) enqueued`);
    return true;
  } catch (err) {
    console.warn('[caption-queue] enqueue failed — falling back to in-process transcription:', err.message);
    return false;
  }
}

module.exports = {
  tryEnqueueCaptionBatch,
};
