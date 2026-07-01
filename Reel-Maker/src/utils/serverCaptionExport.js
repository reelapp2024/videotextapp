import { getCaptionEntry } from './captionIntegration.js';
import { resolveTrackSegments } from './exportSegments.js';

/**
 * Build caption timing payload for server export (shared render-core).
 */
export function buildCaptionExportPayload(config, voiceFiles, voiceCaptionMap, excelData = []) {
  const list = voiceFiles?.length ? voiceFiles : [null];
  const tracks = list.map((f, i) => {
    const entry = getCaptionEntry(voiceCaptionMap, f, i);
    const fromIndex = voiceCaptionMap?.byIndex?.[i]?.segments;
    const rawSegments = entry?.segments?.length
      ? entry.segments
      : fromIndex?.length
        ? fromIndex
        : config?.captionSync?.segments || [];
    const segments = resolveTrackSegments({
      segments: rawSegments,
      excelRow: excelData[i] ?? excelData[0],
      config,
    });
    return {
      index: i,
      fileName: f?.name || `track_${i}`,
      segments,
      language: entry?.language || null,
    };
  }).filter((t) => t.segments?.length > 0);

  if (tracks.length === 0) {
    const fallback = resolveTrackSegments({
      segments: [],
      excelRow: excelData[0],
      config,
    });
    if (fallback.length) {
      tracks.push({
        index: 0,
        fileName: 'excel_0',
        segments: fallback,
        language: null,
      });
    }
  }

  return {
    tracks,
    captionSync: config?.captionSync || {},
    enabled: true,
  };
}
