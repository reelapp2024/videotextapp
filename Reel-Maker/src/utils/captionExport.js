/** Attach per-voice Whisper segments to config for drawOverlays sync */
export function buildConfigWithVoiceCaptions(cfg, voiceFile, voiceCaptionMap, voiceIndex = 0) {
  if (!voiceFile || !voiceCaptionMap) return cfg

  const entry =
    voiceCaptionMap.byName?.[voiceFile.name] ??
    voiceCaptionMap.byIndex?.[voiceIndex]

  if (!entry?.segments?.length) return cfg

  return {
    ...cfg,
    captionSync: {
      ...(cfg.captionSync || {}),
      enabled: true,
      segments: entry.segments,
      granularity: cfg.captionSync?.granularity || 'line',
      columnIndex: cfg.captionSync?.columnIndex ?? 0,
    },
  }
}

export function voiceCaptionMapFromJobTracks(tracks) {
  const byName = {}
  const byIndex = {}
  ;(tracks || []).forEach((t) => {
    if (!t.segments?.length) return
    const label = t.label || `track-${t.trackIndex}`
    const payload = { segments: t.segments, language: t.language }
    byIndex[t.trackIndex] = payload
    byName[label] = payload
  })
  return { byName, byIndex }
}
