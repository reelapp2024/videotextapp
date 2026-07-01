/**
 * Caption preset = base style stored in captionPresetPatch.
 * Font / Layout / Style panel edits live on overlay and override the preset at render time.
 */

/** Text-tab fields — stored on overlay only, not in captionPresetPatch (so user edits always win). */
const USER_STYLE_OVERRIDE_KEYS = new Set([
  'fontFamily', 'fontSize', 'fontWeight', 'color', 'strokeColor', 'strokeOpacity',
  'strokeWidthPercent', 'strokeWidthPx', 'bgColor', 'bgOpacity', 'textAlign',
  'positionX', 'positionY', 'letterSpacing', 'lineHeight', 'styleType',
  'boxPaddingPercent', 'boxPaddingPx', 'boxCornerRadiusPercent', 'boxCornerRadiusPx',
  'shadowEnabled', 'shadowColor', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY',
  'textTransform', 'wordsPerLine', 'linesPerFrame',
])

export function mergeCaptionPresetWithOverlay(overlay) {
  if (!overlay?.captionPresetsEnabled || !overlay.captionPresetPatch) {
    return overlay
  }
  const patch = overlay.captionPresetPatch
  const merged = { ...patch, ...overlay }
  merged.captionPresetPatch = overlay.captionPresetPatch
  merged.captionPresetCaptionSync = overlay.captionPresetCaptionSync
  merged.captionTextPresetId = overlay.captionTextPresetId
  merged.captionPresetsEnabled = overlay.captionPresetsEnabled
  return merged
}

/** Apply a caption text preset onto overlay state (updates UI fields + stores patch for merge). */
export function applyCaptionPresetToOverlay(overlay, patch) {
  if (!patch || typeof patch !== 'object') return overlay
  const { _captionSync, ...overlayPatch } = patch
  const presetId = overlayPatch.captionTextPresetId || patch.captionTextPresetId || null
  const storedPatch = { ...overlayPatch }
  for (const key of USER_STYLE_OVERRIDE_KEYS) {
    delete storedPatch[key]
  }
  return {
    ...overlay,
    ...overlayPatch,
    captionPresetPatch: storedPatch,
    captionPresetCaptionSync: _captionSync || null,
    captionTextPresetId: presetId,
    captionPresetsEnabled: true,
  }
}

export function mergeCaptionSyncForPreset(cfg, overlay) {
  if (!overlay?.captionPresetsEnabled || !overlay.captionPresetCaptionSync) return cfg
  const user = cfg.captionSync || {}
  const preset = overlay.captionPresetCaptionSync
  return {
    ...cfg,
    captionSync: {
      ...preset,
      ...user,
      enabled: user.enabled !== false,
      segments: user.segments?.length ? user.segments : preset.segments || [],
    },
  }
}

/** Caption column overlay with preset + Text-tab overrides (same as preview). */
export function getCaptionExportOverlay(cfg) {
  if (!cfg?.overlays?.length) return null
  const overlays = cfg.overlays.map((ov) => mergeCaptionPresetWithOverlay(ov))
  const capCol =
    cfg.captionSync?.columnIndex != null ? Number(cfg.captionSync.columnIndex) || 0 : null
  if (capCol != null) {
    const byCol = overlays.find((o) => (o.excelColumnIndex ?? o.id) === capCol)
    if (byCol) return byCol
  }
  return (
    overlays.find((o) => o?.enabled !== false && o.captionPresetsEnabled) ||
    overlays.find((o) => o?.enabled !== false) ||
    overlays[0] ||
    null
  )
}

export function prepareConfigForServerExport(cfg) {
  const overlays = (cfg.overlays || []).map((ov) => mergeCaptionPresetWithOverlay(ov))
  let out = { ...cfg, overlays }
  const capOverlay = getCaptionExportOverlay(out)
  if (capOverlay) out = mergeCaptionSyncForPreset(out, capOverlay)
  return out
}
