import { getCaptionDurationSec } from './captionIntegration.js';
import { planVideoExportCount } from './exportJobPlanning.js';

/** Server render typically takes ~3× content duration (canvas + encode). */
const DEFAULT_PROCESSING_FACTOR = 3;

/**
 * Estimate total output duration and wall-clock processing time for bulk export.
 */
export function estimateBulkExportTiming({
  excelData,
  config,
  voiceFiles,
  voiceCaptionMap,
  videos,
  imageFiles,
  imageSlideDurationSec = 2,
  fallbackPerVideoSec = 15,
  singleVideoContentSec = null,
  parallelWorkers = 4,
  exportMediaPairing = null,
}) {
  const videoCount = planVideoExportCount({
    excelData,
    config,
    voiceFiles,
    voiceCaptionMap,
    videos,
    imageFiles,
  });
  if (videoCount === 0) return null;

  const speed = Math.max(0.25, Math.min(4, Number(config?.video?.exportSpeed) || 1));
  const parallel = Math.max(1, Number(parallelWorkers) || 4);
  const perVideoContentSec = [];

  for (let i = 0; i < videoCount; i++) {
    let contentSec = singleVideoContentSec;

    if (voiceFiles.length > 0) {
      const vi =
        exportMediaPairing?.voiceIndices?.[i] ??
        (i % voiceFiles.length);
      const voice = voiceFiles[vi];
      const captionDur = getCaptionDurationSec(voiceCaptionMap, voice, vi);
      const voiceDur = Number(voice?.durationSec ?? voice?.duration) || 0;
      contentSec = Math.max(captionDur, voiceDur, contentSec || 0);
    }

    if (imageFiles.length > 0 && videos.length === 0) {
      contentSec = imageSlideDurationSec;
    }

    perVideoContentSec.push(Math.max((contentSec || fallbackPerVideoSec) / speed, 1));
  }

  const totalContentSec = perVideoContentSec.reduce((sum, s) => sum + s, 0);
  const avgProcessingSec =
    (perVideoContentSec.reduce((sum, s) => sum + s * DEFAULT_PROCESSING_FACTOR, 0) / videoCount);
  const batches = Math.ceil(videoCount / parallel);
  const estimatedProcessingSec = Math.round(batches * avgProcessingSec);

  return {
    videoCount,
    totalContentSec: Math.round(totalContentSec),
    perVideoContentSec,
    estimatedProcessingSec,
    parallelWorkers: parallel,
    processingFactor: DEFAULT_PROCESSING_FACTOR,
  };
}
