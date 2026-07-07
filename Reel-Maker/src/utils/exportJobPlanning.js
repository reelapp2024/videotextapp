/**
 * Planned bulk export count (mirrors Reel-Maker-Backend/utils/exportJobPlanning.js).
 */
import { buildCaptionExportPayload } from './serverCaptionExport.js';
import { hasAnyCaptions } from './captionIntegration.js';

export function countNonemptyExcelRows(excelData) {
  if (!Array.isArray(excelData)) return 0;
  return excelData.filter(
    (row) =>
      Array.isArray(row) &&
      row.length > 0 &&
      row.some((cell) => cell != null && cell !== undefined && String(cell).trim() !== ''),
  ).length;
}

/** Same default as preview: row with the most non-empty text cells. */
export function resolvePreviewReferenceRowIndex(excelData) {
  if (!excelData?.length) return 0;
  const countCellsWithText = (row) =>
    (row || []).filter((c) => c != null && c !== undefined && String(c).trim() !== '').length;
  return excelData.reduce(
    (best, row, i) => (countCellsWithText(row) > countCellsWithText(excelData[best] || []) ? i : best),
    0,
  );
}

export function resolveExportJobCount(opts) {
  const {
    excelData,
    config = {},
    useCaptionExport = false,
    captionExport = null,
    voiceCount = 0,
    videoCount = 0,
    imageCount = 0,
  } = opts;

  const nonemptyExcel = countNonemptyExcelRows(excelData);
  const rowsPerVideo = parseInt(config.excelRowsPerVideo, 10) || 0;
  const contentMode = config.contentMode || 'multiColumn';

  let excelJobs = 0;
  if (nonemptyExcel > 0) {
    excelJobs =
      contentMode === 'rowBased' && rowsPerVideo > 0
        ? Math.ceil(nonemptyExcel / rowsPerVideo)
        : nonemptyExcel;
  }

  const captionTracks = captionExport?.tracks?.length || 0;
  const voiceJobs = voiceCount > 0 ? voiceCount : 0;
  const captionOnlyJobs =
    voiceJobs === 0 && useCaptionExport && captionTracks > 0 ? captionTracks : 0;

  // Output count is driven by Excel rows and audio/captions — NOT background video/image count.
  const primaryCount = Math.max(excelJobs, voiceJobs, captionOnlyJobs);
  if (primaryCount > 0) return primaryCount;

  // Visual-only fallback (no excel / no voice)
  if (imageCount > 0 && videoCount === 0) return 1;
  if (videoCount > 0) return 1;

  return 1;
}

export function planVideoExportCount({
  excelData,
  config,
  voiceFiles = [],
  voiceCaptionMap,
  videos = [],
  imageFiles = [],
}) {
  const captionExport = hasAnyCaptions(voiceCaptionMap)
    ? buildCaptionExportPayload(config, voiceFiles, voiceCaptionMap, excelData)
    : null;
  const useCaptionExport = Boolean(captionExport?.tracks?.some((t) => t.segments?.length > 0));

  return resolveExportJobCount({
    excelData,
    config,
    useCaptionExport,
    captionExport,
    voiceCount: voiceFiles.length,
    videoCount: videos.length,
    imageCount: imageFiles.length,
  });
}
