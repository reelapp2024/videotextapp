import {
  hasAnyCaptions,
  buildServerExportConfig,
  resolvePreviewVoiceFile,
} from '../utils/captionIntegration.js';
import { buildCaptionExportPayload } from '../utils/serverCaptionExport.js';
import { applyResolvedExportFps } from '../utils/exportSettings.js';
import {
  planVideoExportCount,
  resolvePreviewReferenceRowIndex,
} from '../utils/exportJobPlanning.js';
import { buildExportVideoSlots } from '../utils/exportVideoSlots.js';
import { buildExportMediaPairing } from '../utils/mediaPairing.js';

function withResolvedServerFps(baseConfig, detectedSourceFps) {
  return {
    ...baseConfig,
    video: applyResolvedExportFps(baseConfig.video || {}, detectedSourceFps ?? null),
  };
}

function withCaptionExportPayload(mergedConfig, voiceFiles, voiceCaptionMap, excelData) {
  const captionExport = buildCaptionExportPayload(
    mergedConfig,
    voiceFiles,
    voiceCaptionMap,
    excelData,
  );
  return captionExport.tracks?.length
    ? { ...mergedConfig, captionExport }
    : mergedConfig;
}

function buildVideoFormData(ctx) {
  const {
    videos,
    imageFiles,
    voiceFiles,
    musicFiles,
    config,
    voiceCaptionMap,
    excelData,
    detectedSourceFps,
    excelRowsPerVideo,
    excelFrameMode,
    previewRowIndex = 0,
    previewVoiceIndex = 0,
    videoMode = 'sequence',
    audioMode = 'sequence',
    imageMode = 'sequence',
  } = ctx;
  const fd = new FormData();
  (videos || []).forEach((v) => fd.append('videos', v instanceof File ? v : (v.file || v)));
  (imageFiles || []).forEach((f) => fd.append('images', f instanceof File ? f : (f.file || f)));
  (voiceFiles || []).forEach((v) => fd.append('voices', v instanceof File ? v : (v.file || v)));
  (musicFiles || []).forEach((m) => fd.append('music', m instanceof File ? m : (m.file || m)));
  const previewVoice = resolvePreviewVoiceFile(voiceFiles, previewVoiceIndex);
  const referenceRowIndex = excelData?.length
    ? (previewRowIndex ?? resolvePreviewReferenceRowIndex(excelData))
    : 0;
  const plannedVideos = planVideoExportCount({
    excelData,
    config,
    voiceFiles,
    voiceCaptionMap,
    videos,
    imageFiles,
  });
  const exportMediaPairing = buildExportMediaPairing({
    outputRows: plannedVideos,
    videoMode,
    audioMode,
    imageMode,
    videoCount: videos.length,
    voiceCount: voiceFiles.length,
    imageCount: imageFiles.length,
    musicCount: musicFiles.length,
  });
  const mergedConfig = withResolvedServerFps(
    {
      ...buildServerExportConfig(config, previewVoice, voiceCaptionMap, previewVoiceIndex),
      excelRowsPerVideo: excelRowsPerVideo ?? config.excelRowsPerVideo ?? '',
      excelFrameMode: excelFrameMode ?? config.excelFrameMode ?? 'colPerFrame',
      previewReferenceRowIndex: referenceRowIndex,
      videoMode,
      audioMode,
      imageMode,
      exportMediaPairing,
    },
    detectedSourceFps,
  );
  const exportConfig = withCaptionExportPayload(
    mergedConfig,
    voiceFiles,
    voiceCaptionMap,
    excelData,
  );
  fd.append('config', new Blob([JSON.stringify(exportConfig)], { type: 'application/json' }), 'config.json');
  fd.append('excelData', new Blob([JSON.stringify(excelData)], { type: 'application/json' }), 'data.json');
  return fd;
}

/**
 * Server-only export entry — uploads media + config to backend FFmpeg pipeline.
 */
export async function startProcessingImpl(ctx) {
  const {
    libsLoaded,
    excelData,
    videos,
    voiceFiles,
    musicFiles,
    imageFiles,
    config,
    voiceCaptionMap,
    imageCombineMode,
    imageSlideDurationSec,
    tryBackendProcessing,
    setLogs,
    setServerJobMeta,
    previewRowIndex,
    previewVoiceIndex,
    videoMode = 'sequence',
    audioMode = 'sequence',
    imageMode = 'sequence',
  } = ctx;

  const hasAudio = voiceFiles.length > 0 || musicFiles.length > 0;
  const hasVideos = videos.length > 0;
  const hasImages = imageFiles.length > 0;
  const hasCaptionContent = hasAnyCaptions(voiceCaptionMap) && voiceFiles.length > 0;
  const hasContent = excelData.length > 0 || hasImages || hasVideos || hasCaptionContent;
  const hasMedia = hasAudio || hasVideos || hasImages;

  if (!libsLoaded || !hasContent || !hasMedia) {
    alert('Upload at least a video, images, voice, or Excel/captions to proceed.');
    return;
  }

  const useCombineMode = imageCombineMode && imageFiles.length > 1;
  const imagesOnlyMedia = !voiceFiles.length && !musicFiles.length && !videos.length && imageFiles.length > 0;

  if (useCombineMode && imagesOnlyMedia) {
    const ok = await tryBackendProcessing('slideshow', () => {
      const fd = buildVideoFormData(ctx);
      fd.append('durationPerImageSec', new Blob([String(imageSlideDurationSec)], { type: 'text/plain' }), 'duration.txt');
      return fd;
    });
    if (ok) {
      setLogs(`Creating slideshow on server — ${imageFiles.length} images…`);
      return;
    }
    setLogs('Server slideshow export failed. Ensure backend is running and you are logged in.');
    return;
  }

  if (hasVideos || hasAudio || hasImages) {
    const plannedVideos = planVideoExportCount({
      excelData,
      config,
      voiceFiles,
      voiceCaptionMap,
      videos,
      imageFiles,
    });
    setServerJobMeta?.({
      total: plannedVideos,
      completed: 0,
      exportStartedAt: Date.now(),
      exportDurationMs: null,
      elapsedMs: 0,
      slots: buildExportVideoSlots({
        total: plannedVideos,
        completed: 0,
      }),
    });
    const ok = await tryBackendProcessing('video', () => buildVideoFormData(ctx), plannedVideos);
    if (ok) {
      setLogs(
        plannedVideos > 1
          ? `Bulk export started — ${plannedVideos} videos (styles from preview row apply to all).`
          : 'Export started — 1 video.',
      );
      return;
    }
    setLogs('Server export failed. Ensure backend is running (npm start) and you are logged in.');
  }
}
