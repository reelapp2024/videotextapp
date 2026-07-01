import { buildConfigWithVoiceCaptions } from './captionExport.js'
import { flattenCaptionWords, getCaptionColumnIndex } from '../overlayRenderer.js'
import {
  mergeCaptionPresetWithOverlay,
  mergeCaptionSyncForPreset,
  getCaptionExportOverlay,
} from '../presets/captionPresetMerge.js'

export { getCaptionColumnIndex }

/** Merge API tracks with uploaded voice File order */
export function syncVoiceCaptionMap(voiceFiles, tracks) {
  const byName = {}
  const byIndex = {}
  ;(tracks || []).forEach((t) => {
    if (!t?.segments?.length) return
    const payload = { segments: t.segments, language: t.language }
    byIndex[t.trackIndex] = payload
    if (t.label) byName[t.label] = payload
  })
  ;(voiceFiles || []).forEach((f, i) => {
    const t = tracks?.[i]
    if (t?.segments?.length) {
      byName[f.name] = { segments: t.segments, language: t.language }
      byIndex[i] = { segments: t.segments, language: t.language }
    }
  })
  return { byName, byIndex }
}

export function getCaptionEntry(voiceCaptionMap, voiceFile, voiceIndex = 0) {
  if (!voiceCaptionMap) return null
  if (voiceFile?.name && voiceCaptionMap.byName?.[voiceFile.name]) {
    return voiceCaptionMap.byName[voiceFile.name]
  }
  return voiceCaptionMap.byIndex?.[voiceIndex] ?? null
}

export function captionsReadyForVoice(voiceCaptionMap, voiceFile, voiceIndex) {
  return Boolean(getCaptionEntry(voiceCaptionMap, voiceFile, voiceIndex)?.segments?.length)
}

export function hasAnyCaptions(voiceCaptionMap) {
  if (!voiceCaptionMap) return false
  const names = Object.keys(voiceCaptionMap.byName || {})
  const idxs = Object.keys(voiceCaptionMap.byIndex || {})
  return names.length > 0 || idxs.length > 0
}

/** Build excel-like row array from whisper segments (works with all content modes) */
export function buildRowDataFromCaptions(segments, cfg, overlayCount = 1) {
  if (!segments?.length) return null
  const mode = cfg?.contentMode || 'multiColumn'
  const n = Math.max(overlayCount, 1)

  if (mode === 'rowBased') {
    const parts = segments.map((s) => String(s.text ?? '').trim()).filter(Boolean)
    return parts.length ? parts : ['']
  }

  if (mode === 'singleColumn') {
    const col = Math.max(0, Number(cfg.singleColumnIndex) || 0)
    const script = segments
      .map((s) => String(s.text ?? '').trim())
      .filter(Boolean)
      .join(' ')
    const row = Array(Math.max(n, col + 1)).fill('')
    if (script) row[col] = script
    return row
  }

  const capCol = getCaptionColumnIndex(cfg)
  const script = segments
    .map((s) => String(s.text ?? '').trim())
    .filter(Boolean)
    .join(' ')
  const row = Array(n).fill('')
  if (script && capCol < row.length) row[capCol] = script
  return row
}

/** Whisper segment durations for content auto-break (caption column overlay only) */
export function applyCaptionTimingToConfig(cfg, segments) {
  if (!segments?.length || !cfg?.overlays?.length) return cfg
  const durations = segments.map((s) => Math.max(0.08, (s.end ?? 0) - (s.start ?? 0)))
  const capCol = getCaptionColumnIndex(cfg)
  return {
    ...cfg,
    overlays: cfg.overlays.map((ov) => {
      const overlayCol = ov.excelColumnIndex ?? ov.id
      if (overlayCol !== capCol) return ov
      if (ov.captionTextPresetId && ov.captionPresetsEnabled) return ov
      return {
        ...ov,
        contentTextSectionEnabled: true,
        contentPartDurations: durations,
        contentPartHoldAfter: durations.map(() => 0),
      }
    }),
  }
}

export function getCaptionPreviewWords(voiceCaptionMap, voiceFile, voiceIndex = 0) {
  const entry = getCaptionEntry(voiceCaptionMap, voiceFile, voiceIndex)
  if (!entry?.segments?.length) return []
  return flattenCaptionWords(entry.segments).map((w) => w.word)
}

/** Merge caption preset + Font/Layout/Style panel overrides before server export (matches preview). */
export function prepareConfigForServerExport(cfg) {
  const overlays = (cfg.overlays || []).map((ov) => mergeCaptionPresetWithOverlay(ov))
  let out = { ...cfg, overlays }
  const capOverlay = getCaptionExportOverlay(out)
  if (capOverlay) out = mergeCaptionSyncForPreset(out, capOverlay)
  return out
}

/** Full export config: merged Text-tab style + caption sync (matches preview). */
export function buildServerExportConfig(cfg, voiceFile, voiceCaptionMap, voiceIndex = 0) {
  console.log('[export-config] === BUILDING SERVER EXPORT CONFIG ===')
  console.log('[export-config] Input config overlays:', cfg?.overlays?.length || 0)
  
  let out = prepareConfigForServerExport(cfg)
  console.log('[export-config] After prepareConfigForServerExport overlays:', out?.overlays?.length || 0)
  
  if (hasAnyCaptions(voiceCaptionMap)) {
    console.log('[export-config] Has captions, enabling captionSync')
    out = {
      ...out,
      textSource: 'captions',
      captionSync: {
        ...(out.captionSync || {}),
        enabled: true,
        granularity: out.captionSync?.granularity || 'line',
      },
    }
  }
  
  const exportOverlay = getCaptionExportOverlay(out)
  console.log('[export-config] exportOverlay found:', !!exportOverlay)
  
  if (exportOverlay) {
    // Debug: Log ALL text styles being sent to server
    console.log('[export-config] === OVERLAY STYLES FOR EXPORT ===')
    console.log('[export-config] fontFamily:', exportOverlay.fontFamily)
    console.log('[export-config] fontSize:', exportOverlay.fontSize)
    console.log('[export-config] fontWeight:', exportOverlay.fontWeight)
    console.log('[export-config] color:', exportOverlay.color)
    console.log('[export-config] textAlign:', exportOverlay.textAlign)
    console.log('[export-config] positionX:', exportOverlay.positionX)
    console.log('[export-config] positionY:', exportOverlay.positionY)
    console.log('[export-config] styleType:', exportOverlay.styleType)
    console.log('[export-config] strokeColor:', exportOverlay.strokeColor)
    console.log('[export-config] bgColor:', exportOverlay.bgColor)
    console.log('[export-config] bgOpacity:', exportOverlay.bgOpacity)
    console.log('[export-config] shadowEnabled:', exportOverlay.shadowEnabled)
    console.log('[export-config] shadowColor:', exportOverlay.shadowColor)
    console.log('[export-config] enabled:', exportOverlay.enabled)
    console.log('[export-config] ================================')
    
    out = {
      ...out,
      exportCaptionOverlay: exportOverlay,
      overlays: out.overlays.map((ov) => {
        const col = ov.excelColumnIndex ?? ov.id
        const eCol = exportOverlay.excelColumnIndex ?? exportOverlay.id
        return col === eCol ? exportOverlay : ov
      }),
    }
    out = mergeCaptionSyncForPreset(out, exportOverlay)
  }
  
  console.log('[export-config] Final overlays count:', out?.overlays?.length || 0)
  if (out?.overlays?.[0]) {
    console.log('[export-config] First overlay sample:', JSON.stringify({
      fontFamily: out.overlays[0].fontFamily,
      fontSize: out.overlays[0].fontSize,
      color: out.overlays[0].color,
      enabled: out.overlays[0].enabled,
    }))
  }
  
  return buildDrawConfig(out, voiceFile, voiceCaptionMap, voiceIndex)
}

export function buildDrawConfig(cfg, voiceFile, voiceCaptionMap, voiceIndex = 0) {
  let out = cfg?.exportCaptionOverlay != null ? { ...cfg } : prepareConfigForServerExport(cfg)
  const entry = getCaptionEntry(voiceCaptionMap, voiceFile, voiceIndex)
  if (entry?.segments?.length) {
    out = applyCaptionTimingToConfig(out, entry.segments)
    out = buildConfigWithVoiceCaptions(out, voiceFile, voiceCaptionMap, voiceIndex)
    if (!out.captionSync?.enabled) {
      out = {
        ...out,
        captionSync: {
          ...(out.captionSync || {}),
          enabled: true,
          segments: entry.segments,
          granularity: out.captionSync?.granularity || 'line',
          columnIndex: out.captionSync?.columnIndex ?? 0,
        },
      }
    }
  }
  return out
}

export function resolvePreviewVoiceFile(voiceFiles, previewVoiceIndex) {
  if (!voiceFiles?.length) return null
  const i = Math.max(0, Math.min(previewVoiceIndex, voiceFiles.length - 1))
  return voiceFiles[i]
}

export function buildPreviewRowData({
  excelData,
  previewRowIndex,
  config,
  voiceFiles,
  voiceCaptionMap,
  previewVoiceIndex,
  excelFrameMode,
  excelRowsPerVideo,
}) {
  const voiceFile = resolvePreviewVoiceFile(voiceFiles, previewVoiceIndex)
  const capEntry = getCaptionEntry(voiceCaptionMap, voiceFile, previewVoiceIndex)
  const useCaptions =
    capEntry?.segments?.length &&
    (config.textSource === 'captions' || config.captionSync?.enabled)

  if (useCaptions) {
    const built = buildRowDataFromCaptions(
      capEntry.segments,
      config,
      config.overlays?.length || 1
    )
    if (built) return built
  }

  if (!excelData?.length) {
    return (config.overlays || []).map((o) => `Preview ${o.name}`)
  }

  const contentMode = config.contentMode || 'multiColumn'
  const rowMerge = parseInt(excelRowsPerVideo, 10) || 0
  const i = Math.min(previewRowIndex, excelData.length - 1)

  if (contentMode === 'rowBased') {
    if (rowMerge > 0) {
      const startRow = i * rowMerge
      const endRow = Math.min(startRow + rowMerge, excelData.length)
      const mergedRows = excelData.slice(startRow, endRow)
      if (excelFrameMode === 'allInOneFrame') {
        return [
          mergedRows
            .map((r) => (Array.isArray(r) ? r.map((c) => String(c ?? '')).join(' ') : String(r ?? '')))
            .join('\n'),
        ]
      }
      const parts = []
      for (const row of mergedRows) {
        if (!Array.isArray(row)) continue
        for (let c = 0; c < row.length; c++) {
          if (row[c] != null && String(row[c]).trim()) parts.push(String(row[c]))
        }
      }
      return parts.length ? parts : ['']
    }
    const row = excelData[i] || []
    if (excelFrameMode === 'allInOneFrame') {
      return [Array.isArray(row) ? row.map((c) => String(c ?? '')).join('\n') : String(row ?? '')]
    }
    const parts = Array.isArray(row) ? row.map((c) => String(c ?? '')).filter((t) => t.trim()) : [String(row ?? '')]
    return parts.length ? parts : ['']
  }

  const row = excelData[i % excelData.length]
  return Array.isArray(row) ? row.map((c) => String(c ?? '')) : [String(row ?? '')]
}

export function resolveExportRowData({
  jobIndex,
  voiceFile,
  excelData,
  config,
  excelFrameMode,
  excelRowsPerVideo,
  voiceCaptionMap,
  buildExcelRowData,
}) {
  const entry = getCaptionEntry(voiceCaptionMap, voiceFile, jobIndex)
  const useCaptions =
    entry?.segments?.length &&
    (config.textSource === 'captions' || config.captionSync?.enabled)

  if (useCaptions) {
    const built = buildRowDataFromCaptions(
      entry.segments,
      config,
      config.overlays?.length || 1
    )
    if (built) return built
  }
  return buildExcelRowData()
}

export function countCaptionReady(voiceCaptionMap, voiceFiles) {
  if (!voiceFiles?.length) return 0
  return voiceFiles.filter((f, i) => captionsReadyForVoice(voiceCaptionMap, f, i)).length
}
