import {
  hasAnyCaptions,
  buildServerExportConfig,
} from '../utils/captionIntegration.js';
import { buildCaptionExportPayload } from '../utils/serverCaptionExport.js';
import { applyResolvedExportFps } from '../utils/exportSettings.js';

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
  } = ctx;
  const fd = new FormData();
  (videos || []).forEach((v) => fd.append('videos', v instanceof File ? v : (v.file || v)));
  (imageFiles || []).forEach((f) => fd.append('images', f instanceof File ? f : (f.file || f)));
  (voiceFiles || []).forEach((v) => fd.append('voices', v instanceof File ? v : (v.file || v)));
  (musicFiles || []).forEach((m) => fd.append('music', m instanceof File ? m : (m.file || m)));
  const capVoice = voiceFiles?.[0] || null;
  const mergedConfig = withResolvedServerFps(
    {
      ...buildServerExportConfig(config, capVoice, voiceCaptionMap, 0),
      excelRowsPerVideo: excelRowsPerVideo ?? config.excelRowsPerVideo ?? '',
      excelFrameMode: excelFrameMode ?? config.excelFrameMode ?? 'colPerFrame',
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
    const ok = await tryBackendProcessing('video', () => buildVideoFormData(ctx));
    if (ok) return;
    setLogs('Server export failed. Ensure backend is running (npm start) and you are logged in.');
  }
}
