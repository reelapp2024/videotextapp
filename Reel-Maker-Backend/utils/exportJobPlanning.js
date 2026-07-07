/**
 * Export job count + per-job Excel row data (mirrors frontend exportJobPlanning).
 */

function countNonemptyExcelRows(excelData) {
  if (!Array.isArray(excelData)) return 0;
  return excelData.filter(
    (row) =>
      Array.isArray(row) &&
      row.length > 0 &&
      row.some((cell) => cell != null && cell !== undefined && String(cell).trim() !== ''),
  ).length;
}

function sanitizeExcelData(excelData) {
  if (!Array.isArray(excelData)) return [];
  return excelData.filter(
    (row) =>
      Array.isArray(row) &&
      row.some((cell) => cell != null && cell !== undefined && String(cell).trim() !== ''),
  );
}

function resolveExportJobCount(opts) {
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

function buildExportRowData(excelData, jobIndex, config) {
  const overlayCount = config?.overlays?.length || 1;
  const excelFrameMode = config.excelFrameMode || 'colPerFrame';
  const contentMode = config.contentMode || 'multiColumn';
  const rowMerge = parseInt(config.excelRowsPerVideo, 10) || 0;

  if (!excelData?.length) {
    return Array.from({ length: overlayCount }, () => '');
  }

  if (contentMode === 'rowBased') {
    const i = jobIndex;
    if (rowMerge > 0) {
      const startRow = i * rowMerge;
      const endRow = Math.min(startRow + rowMerge, excelData.length);
      const mergedRows = excelData.slice(startRow, endRow);
      if (excelFrameMode === 'allInOneFrame') {
        return [
          mergedRows
            .map((r) => (Array.isArray(r) ? r.map((c) => String(c ?? '')).join(' ') : String(r ?? '')))
            .join('\n'),
        ];
      }
      const parts = [];
      for (const row of mergedRows) {
        if (!Array.isArray(row)) continue;
        for (let c = 0; c < row.length; c++) {
          if (row[c] != null && String(row[c]).trim()) parts.push(String(row[c]));
        }
      }
      return parts.length ? parts : [''];
    }
    const row = excelData[Math.min(i, excelData.length - 1)] || [];
    if (excelFrameMode === 'allInOneFrame') {
      return [Array.isArray(row) ? row.map((c) => String(c ?? '')).join('\n') : String(row ?? '')];
    }
    const parts = Array.isArray(row) ? row.map((c) => String(c ?? '')).filter((t) => t.trim()) : [String(row ?? '')];
    return parts.length ? parts : [''];
  }

  const row = excelData[jobIndex % excelData.length];
  return Array.isArray(row) ? row.map((c) => String(c ?? '')) : [String(row ?? '')];
}

function buildSegmentExcelRow(excelData, jobIndex, config) {
  const parts = buildExportRowData(excelData, jobIndex, config);
  const joined = parts.map((p) => String(p ?? '').trim()).filter(Boolean).join(' ');
  if (joined) return [joined];
  const excelLen = Array.isArray(excelData) ? excelData.length : 0;
  if (!excelLen) return [];
  const raw = excelData[jobIndex % excelLen];
  return Array.isArray(raw) ? raw : [String(raw ?? '')];
}

function resolveWhisperSegmentsForJob({ track }) {
  if (!track?.segments?.length) return null;
  return track.segments;
}

/**
 * Per-export-row config: correct voice captions + shared overlay/line styles from base config.
 */
function buildPerRowExportConfig(baseConfig, { jobIndex, voiceCount, captionExport, voiceIndex }) {
  if (!baseConfig || typeof baseConfig !== 'object') return baseConfig;
  const voiceTrackIdx =
    voiceIndex != null && Number.isFinite(voiceIndex)
      ? voiceIndex
      : voiceCount > 0
        ? jobIndex % voiceCount
        : 0;
  const track = captionExport?.tracks?.[voiceTrackIdx] || captionExport?.tracks?.[0];
  const segments = track?.segments;
  if (!segments?.length) return baseConfig;

  return {
    ...baseConfig,
    captionSync: {
      ...(baseConfig.captionSync || {}),
      enabled: true,
      segments,
      granularity: baseConfig.captionSync?.granularity || 'line',
      columnIndex: baseConfig.captionSync?.columnIndex ?? 0,
    },
  };
}

/** Row-level export parallelism — controlled by EXPORT_WORKER_CONCURRENCY (default 4). */
function resolveParallelJobs() {
  const n = parseInt(process.env.EXPORT_WORKER_CONCURRENCY || '4', 10);
  if (!Number.isFinite(n) || n < 1) return 4;
  return Math.min(16, n);
}

module.exports = {
  countNonemptyExcelRows,
  sanitizeExcelData,
  resolveExportJobCount,
  buildExportRowData,
  buildSegmentExcelRow,
  resolveWhisperSegmentsForJob,
  buildPerRowExportConfig,
  resolveParallelJobs,
};
