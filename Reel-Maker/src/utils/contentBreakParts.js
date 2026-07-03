/**
 * Whether punctuation or custom break rules are configured.
 * @param {object} overlay
 */
export function hasContentBreakRules(overlay) {
  const marks = overlay?.punctuationBreakMarks || [];
  const customBreak = String(overlay?.customBreakText || '').trim();
  return marks.length > 0 || customBreak.length > 0;
}

/**
 * Whisper segment texts as caption lines.
 * @param {Array<{ text?: string }>|null|undefined} segments
 * @returns {string[]}
 */
export function getCaptionSegmentLines(segments) {
  return (segments || []).map((s) => String(s.text ?? '').trim()).filter(Boolean);
}

/**
 * Sample text for Content Text & Auto-Break (Excel column or joined caption script).
 * @param {object} params
 */
export function getContentSampleText({
  excelData,
  overlay,
  captionSegments,
}) {
  const colIdx = overlay?.excelColumnIndex ?? overlay?.id ?? 0;
  if (excelData?.length > 0) {
    const fromExcel = String(excelData[0][colIdx] ?? '').trim();
    if (fromExcel) return fromExcel;
  }
  const segLines = getCaptionSegmentLines(captionSegments);
  if (segLines.length > 0) return segLines.join(' ');
  return '';
}

/**
 * Split sample text into lines using overlay punctuation + custom break marks.
 * When no break rules exist, caption segments become one line each.
 * @param {object} overlay
 * @param {string} sampleText
 * @param {{ captionSegments?: Array<{ text?: string }> }} [options]
 * @returns {string[]}
 */
export function computeContentBreakParts(overlay, sampleText, options = {}) {
  const text = String(sampleText || '').trim();
  const captionSegments = options.captionSegments;

  const marks = overlay?.punctuationBreakMarks || [];
  const customBreak = String(overlay?.customBreakText || '').trim();
  const allBreaks = [...marks];
  if (customBreak) {
    customBreak.split(/\s+/).forEach((b) => {
      if (b && !allBreaks.includes(b)) allBreaks.push(b);
    });
  }

  if (allBreaks.length === 0) {
    const segLines = getCaptionSegmentLines(captionSegments);
    if (segLines.length > 0) return segLines;
    return text ? [text] : [];
  }

  if (!text) return [];

  try {
    const pattern = allBreaks.map((m) => String(m).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${pattern})`, 'g');
    return text.replace(regex, '$1\n').split('\n').map((p) => p.trim()).filter(Boolean);
  } catch {
    return text ? [text] : [];
  }
}
