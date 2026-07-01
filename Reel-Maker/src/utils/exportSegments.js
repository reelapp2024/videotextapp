/** Build timed caption segments for server ASS export (Whisper, Excel, or edited text). */

export function buildSegmentsFromText(text, durationSec = 30) {
  const t = String(text ?? '').trim()
  if (!t) return []
  const dur = Math.max(1, Number(durationSec) || 30)
  const words = t.split(/\s+/).filter(Boolean)
  if (!words.length) {
    return [{ start: 0, end: dur, text: t, words: [] }]
  }
  const wDur = dur / words.length
  return [
    {
      start: 0,
      end: dur,
      text: t,
      words: words.map((word, i) => ({
        word,
        start: +(i * wDur).toFixed(3),
        end: +((i + 1) * wDur).toFixed(3),
      })),
    },
  ]
}

export function getCaptionColumnText(row, config) {
  if (row == null) return ''
  const col =
    config?.captionSync?.columnIndex != null ? Number(config.captionSync.columnIndex) || 0 : 0
  const arr = Array.isArray(row) ? row : [String(row ?? '')]
  return String(arr[col] ?? '').trim()
}

/**
 * Segments for one export row: Whisper/edited first, then Excel caption column, then captionSync fallback.
 */
export function resolveTrackSegments({ segments, excelRow, config, fallbackDuration = 60 }) {
  if (segments?.length) return segments
  const excelText = getCaptionColumnText(excelRow, config)
  if (excelText) return buildSegmentsFromText(excelText, fallbackDuration)
  const syncSegs = config?.captionSync?.segments
  if (syncSegs?.length) {
    const script = syncSegs
      .map((s) => String(s.text ?? '').trim())
      .filter(Boolean)
      .join(' ')
    if (script) return buildSegmentsFromText(script, fallbackDuration)
  }
  return []
}
