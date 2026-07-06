/**
 * Export job count + per-job Excel row data (mirrors frontend buildPreviewRowData).
 */

function resolveExportJobCount(opts) {
  const {
    excelData,
    config = {},
    useCaptionExport = false,
    captionExport = null,
    voiceCount = 0,
    videoCount = 0,
  } = opts;

  const excelLen = Array.isArray(excelData) ? excelData.length : 0;
  const rowsPerVideo = parseInt(config.excelRowsPerVideo, 10) || 0;
  const contentMode = config.contentMode || 'multiColumn';

  let excelJobs = 0;
  if (excelLen > 0) {
    if (contentMode === 'rowBased' && rowsPerVideo > 0) {
      excelJobs = Math.ceil(excelLen / rowsPerVideo);
    } else {
      excelJobs = excelLen;
    }
  }

  const captionTracks = captionExport?.tracks?.length || 0;
  const multiVideoCount = videoCount > 1 ? videoCount : 0;

  if (excelJobs > 0) {
    return Math.max(excelJobs, multiVideoCount);
  }

  if (useCaptionExport) {
    return Math.max(captionTracks, voiceCount, multiVideoCount, 1);
  }

  return Math.max(excelLen, 1);
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

/** Row shape for resolveTrackSegments (caption column / timed text). */
function buildSegmentExcelRow(excelData, jobIndex, config) {
  const parts = buildExportRowData(excelData, jobIndex, config);
  const joined = parts.map((p) => String(p ?? '').trim()).filter(Boolean).join(' ');
  if (joined) return [joined];
  const excelLen = Array.isArray(excelData) ? excelData.length : 0;
  if (!excelLen) return [];
  const raw = excelData[jobIndex % excelLen];
  return Array.isArray(raw) ? raw : [String(raw ?? '')];
}

function resolveWhisperSegmentsForJob({ jobIndex, bulkExcel, voiceCount, track }) {
  if (!track?.segments?.length) return null;
  if (!bulkExcel) return track.segments;
  if (voiceCount > 1 && jobIndex < voiceCount) return track.segments;
  return null;
}

module.exports = {
  resolveExportJobCount,
  buildExportRowData,
  buildSegmentExcelRow,
  resolveWhisperSegmentsForJob,
};
