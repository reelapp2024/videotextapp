/** Caption sync + row timing helpers (main drawOverlays lives in App.jsx). */

import {
  mergeCaptionPresetWithOverlay,
  mergeCaptionSyncForPreset,
} from './presets/captionPresetMerge.js'

function findActiveSegment(segments, videoTime) {
  if (!segments?.length || videoTime == null) return null
  return (
    segments.find((s) => videoTime >= s.start && videoTime < s.end) ||
    segments[segments.length - 1]
  )
}

export function flattenCaptionWords(segments) {
  const out = []
  for (const seg of segments || []) {
    if (seg.words?.length) {
      for (const w of seg.words) {
        const word = String(w.word ?? '').trim()
        if (word) out.push({ word, start: w.start, end: w.end, seg })
      }
      continue
    }
    const parts = String(seg.text || '')
      .split(/\s+/)
      .filter(Boolean)
    const segDur = Math.max(0.01, (seg.end ?? 0) - (seg.start ?? 0))
    parts.forEach((word, i) => {
      const wDur = segDur / parts.length
      out.push({
        word,
        start: (seg.start ?? 0) + i * wDur,
        end: (seg.start ?? 0) + (i + 1) * wDur,
        seg,
      })
    })
  }
  return out
}

export function buildFullCaptionScript(segments) {
  return flattenCaptionWords(segments)
    .map((w) => w.word)
    .join(' ')
}

/** Last word index visible at videoTime (voice-synced). */
export function getLastVisibleCaptionWordIndex(words, videoTime) {
  if (!words?.length || videoTime == null) return -1
  const t = videoTime + 0.04
  let last = -1
  for (let i = 0; i < words.length; i++) {
    const start = words[i].start ?? 0
    const end = words[i].end ?? start
    if (t >= start) last = i
    if (t >= start && t < end) return i
  }
  return last
}

export function getCaptionColumnIndex(cfg) {
  if (cfg?.captionSync?.columnIndex != null) return Number(cfg.captionSync.columnIndex) || 0
  const primary = cfg?.overlays?.find((o) => o.enabled) || cfg?.overlays?.[0]
  return primary?.excelColumnIndex ?? primary?.id ?? 0
}

export function overlayUsesCaptions(overlay, cfg) {
  if (!cfg?.captionSync?.enabled || !cfg.captionSync?.segments?.length) return false
  const capCol = getCaptionColumnIndex(cfg)
  const overlayCol = overlay.excelColumnIndex ?? overlay.id
  if (overlayCol === capCol) return true
  if (overlay.captionTextPresetId && overlay.captionPresetsEnabled) return true
  return false
}

/** Map a word on the displayed caption line to its global index in whisper timing. */
export function getDisplayedWordGlobalIndex(
  segments,
  videoTime,
  lineIdx,
  wordIdxInLine,
  lines,
  wordsPerLine = 4,
  linesPerFrame = 0,
  granularity = 'line'
) {
  const flat = flattenCaptionWords(segments)
  if (!flat.length || videoTime == null) return wordIdxInLine
  const lastVisible = getLastVisibleCaptionWordIndex(flat, videoTime)
  if (lastVisible < 0) return 0
  if (granularity === 'word') return lastVisible
  if (granularity === 'karaoke') {
    let n = 0
    for (let L = 0; L < lineIdx; L++) {
      n += String(lines[L] || '').split(/\s+/).filter(Boolean).length
    }
    return Math.min(n + wordIdxInLine, lastVisible)
  }
  const wpl = Math.max(1, wordsPerLine)
  const capLineIdx = Math.floor(lastVisible / wpl)
  const numLines = linesPerFrame > 0 ? linesPerFrame : 1
  const startLine = Math.max(0, capLineIdx - numLines + 1)
  const baseGlobal = startLine * wpl
  let acc = 0
  for (let L = 0; L < lineIdx; L++) {
    acc += String(lines[L] || '').split(/\s+/).filter(Boolean).length
  }
  return Math.min(baseGlobal + acc + wordIdxInLine, lastVisible)
}

export function resolveOverlayWithCaptionPreset(overlay) {
  return mergeCaptionPresetWithOverlay(overlay)
}

export function resolveConfigForCaptionPreset(cfg, overlay) {
  return mergeCaptionSyncForPreset(cfg, overlay)
}

/**
 * Voice-synced caption text + layout (words/line, lines/frame).
 * Only words already started at videoTime are shown; layout groups those words.
 */
export function getCaptionLayoutText(segments, videoTime, opts = {}) {
  const { wordsPerLine = 4, linesPerFrame = 0, granularity = 'line' } = opts
  const words = flattenCaptionWords(segments)
  if (!words.length || videoTime == null) return ''

  const lastVisible = getLastVisibleCaptionWordIndex(words, videoTime)
  if (lastVisible < 0) return ''

  if (granularity === 'word') return words[lastVisible]?.word || ''

  if (granularity === 'segment') {
    const seg = findActiveSegment(segments, videoTime)
    if (!seg) return ''
    const segWords = words.filter((w) => w.seg === seg || w.start >= seg.start && w.end <= seg.end + 0.01)
    const vis = segWords.filter((_, i) => {
      const gi = words.indexOf(segWords[i])
      return gi <= lastVisible
    })
    return vis.map((w) => w.word).join(' ')
  }

  if (granularity === 'karaoke') {
    return words
      .slice(0, lastVisible + 1)
      .map((w) => w.word)
      .join(' ')
  }

  const wpl = Math.max(1, wordsPerLine)
  const lineIdx = Math.floor(lastVisible / wpl)
  const numLines = linesPerFrame > 0 ? linesPerFrame : 1
  const startLine = Math.max(0, lineIdx - numLines + 1)
  const textLines = []
  for (let L = startLine; L <= lineIdx; L++) {
    const ls = L * wpl
    const le = Math.min(words.length, ls + wpl)
    const spokenOnLine = words.slice(ls, Math.min(le, lastVisible + 1))
    if (spokenOnLine.length) {
      textLines.push(spokenOnLine.map((w) => w.word).join(' '))
    }
  }
  return textLines.join('\n')
}

export const getCaptionDisplayText = getCaptionLayoutText

export function getActiveCaptionWordGlobalIndex(segments, videoTime) {
  const words = flattenCaptionWords(segments)
  return getLastVisibleCaptionWordIndex(words, videoTime)
}

export const pickEqualTimePartIndex = (parts, videoTime, videoDuration, weighting = 'equal') => {
  if (!parts.length) return 0
  if (parts.length === 1) return 0
  if (videoTime == null || videoDuration == null || videoDuration <= 0) return 0
  const t = Math.max(0, Math.min(videoTime, videoDuration - 1e-9))
  if (weighting === 'chars') {
    const weights = parts.map((p) => Math.max(1, String(p).trim().length))
    const sum = weights.reduce((a, b) => a + b, 0)
    const target = (t / videoDuration) * sum
    let cumul = 0
    for (let i = 0; i < parts.length; i++) {
      cumul += weights[i]
      if (target < cumul) return i
    }
    return parts.length - 1
  }
  const idx = Math.floor((t / videoDuration) * parts.length)
  return Math.max(0, Math.min(idx, parts.length - 1))
}

/** @deprecated — prefer per-overlay resolution in drawOverlays */
export function applyCaptionSyncRowData(rowData, videoTime, videoDuration, config) {
  const cs = config.captionSync
  if (
    !cs?.enabled ||
    !cs.segments?.length ||
    !Array.isArray(rowData) ||
    rowData.length === 0 ||
    videoTime == null
  ) {
    return rowData
  }
  const col = getCaptionColumnIndex(config)
  const ov = config.overlays?.find((o) => (o.excelColumnIndex ?? o.id) === col) || config.overlays?.[0]
  const text = getCaptionLayoutText(cs.segments, videoTime, {
    wordsPerLine: ov?.wordsPerLine ?? 4,
    linesPerFrame: ov?.linesPerFrame ?? 0,
    granularity: cs.granularity || 'line',
  })
  const mode = config.contentMode || 'multiColumn'
  if (mode === 'rowBased') return text ? [text] : ['']
  return rowData.map((c, i) => (i === col ? text : String(c ?? '')))
}
