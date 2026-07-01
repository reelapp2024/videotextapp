/** Video editor–style export presets, quality tiers, and estimates. */

export const EXPORT_QUALITY_TIERS = [
  { id: 'draft', label: 'Draft', desc: 'Smaller file', videoMult: 0.65, audioMult: 0.75 },
  { id: 'standard', label: 'Standard', desc: 'Balanced', videoMult: 1, audioMult: 1 },
  { id: 'high', label: 'High', desc: 'Recommended', videoMult: 1.25, audioMult: 1 },
  { id: 'maximum', label: 'Ultra', desc: 'Best quality', videoMult: 1.55, audioMult: 1.15 },
]

export const EXPORT_RESOLUTIONS = [
  { id: '720p', label: '720p' },
  { id: '1080p', label: '1080p (Default)' },
  { id: '1440p', label: '1440p' },
  { id: '4k', label: '4K' },
]

export const EXPORT_FPS_OPTIONS = [24, 25, 30, 50, 60]

export const EXPORT_BITRATE_PRESETS = [5, 10, 15, 20, 40]

export const EXPORT_FORMATS = [
  { id: 'mp4', label: 'MP4 (Default)' },
  { id: 'webm', label: 'WebM' },
  { id: 'webm-vp9', label: 'WebM VP9' },
  { id: 'mkv', label: 'MKV' },
]

export function isLandscapeAspect(aspectRatio) {
  const s = String(aspectRatio || '1080x1920')
  const m = s.match(/^(\d+)x(\d+)$/)
  if (m) return Number(m[1]) > Number(m[2])
  return false
}

/** Map resolution tier + orientation to aspectRatio string used by the renderer. */
export function resolutionToAspectRatio(resId, landscape = false) {
  const map = landscape
    ? {
        '720p': '1280x720',
        '1080p': '1920x1080',
        '1440p': '2560x1440',
        '4k': '3840x2160',
      }
    : {
        '720p': '720x1280',
        '1080p': '1080x1920',
        '1440p': '1440x2560',
        '4k': '2160x3840',
      }
  return map[resId] || map['1080p']
}

export function inferExportResolution(aspectRatio) {
  const s = String(aspectRatio || '1080x1920')
  const m = s.match(/^(\d+)x(\d+)$/)
  if (!m) return '1080p'
  const short = Math.min(Number(m[1]), Number(m[2]))
  if (short <= 720) return '720p'
  if (short <= 1080) return '1080p'
  if (short <= 1440) return '1440p'
  return '4k'
}

export const EXPORT_PRESETS = [
  {
    id: 'instagram_reel',
    label: 'Instagram Reel / Shorts',
    patch: {
      aspectRatio: '1080x1920',
      format: 'mp4',
      fps: 30,
      useSourceFps: false,
      frameRateMode: 'manual',
      exportQuality: 'high',
      videoBitrateMode: 'custom',
      videoBitrateCustom: 12,
      audioBitrateMode: 'custom',
      audioBitrateCustom: 192,
    },
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp (small file)',
    patch: {
      aspectRatio: '1080x1920',
      format: 'mp4',
      fps: 30,
      useSourceFps: false,
      frameRateMode: 'manual',
      exportQuality: 'standard',
      videoBitrateMode: 'custom',
      videoBitrateCustom: 8,
      audioBitrateMode: 'custom',
      audioBitrateCustom: 128,
    },
  },
  {
    id: 'youtube_1080',
    label: 'YouTube 1080p',
    patch: {
      aspectRatio: '1920x1080',
      format: 'mp4',
      fps: 30,
      useSourceFps: false,
      frameRateMode: 'manual',
      exportQuality: 'high',
      videoBitrateMode: 'custom',
      videoBitrateCustom: 14,
      audioBitrateMode: 'custom',
      audioBitrateCustom: 192,
    },
  },
  {
    id: 'max_smooth',
    label: 'Maximum Smooth (no stutter)',
    patch: {
      aspectRatio: '1080x1920',
      format: 'mp4',
      fps: 30,
      useSourceFps: true,
      frameRateMode: 'match',
      exportQuality: 'maximum',
      videoBitrateMode: 'custom',
      videoBitrateCustom: 18,
      audioBitrateMode: 'custom',
      audioBitrateCustom: 256,
    },
  },
  {
    id: 'custom',
    label: 'Custom (manual controls)',
    patch: {},
  },
]

export function getQualityTier(id) {
  return EXPORT_QUALITY_TIERS.find((t) => t.id === id) || EXPORT_QUALITY_TIERS[2]
}

/** Base Mbps from resolution (before quality tier). */
export function getBaseVideoMbps(pixelCount) {
  if (pixelCount >= 1920 * 1080) return 12
  if (pixelCount >= 1280 * 720) return 8
  return 5
}

export function getBaseAudioKbps(pixelCount) {
  if (pixelCount >= 1920 * 1080) return 192
  if (pixelCount >= 1280 * 720) return 128
  return 128
}

/**
 * @param {object} videoCfg config.video
 * @param {{ width: number, height: number }} dims
 */
export function resolveExportBitrates(videoCfg, dims) {
  const pixels = (dims?.width || 1080) * (dims?.height || 1920)
  const tier = getQualityTier(videoCfg?.exportQuality || 'high')
  const baseV = getBaseVideoMbps(pixels) * tier.videoMult
  const baseA = getBaseAudioKbps(pixels) * tier.audioMult

  let vMbps =
    videoCfg?.videoBitrateMode === 'custom'
      ? Number(videoCfg.videoBitrateCustom) || baseV
      : baseV
  let aKbps =
    videoCfg?.audioBitrateMode === 'custom'
      ? Number(videoCfg.audioBitrateCustom) || baseA
      : baseA

  vMbps = Math.max(4, Math.min(50, vMbps))
  aKbps = Math.max(96, Math.min(320, Math.round(aKbps)))

  return {
    vMbps,
    aKbps,
    vBps: Math.round(vMbps * 1_000_000),
    aBps: Math.round(aKbps * 1000),
    aChannels: videoCfg?.audioChannels === 'custom' ? videoCfg.audioChannelsCustom || 2 : 2,
    aSampleRate:
      videoCfg?.audioSampleRateMode === 'custom'
        ? videoCfg.audioSampleRateCustom || 48000
        : pixels >= 1920 * 1080
          ? 48000
          : 44100,
  }
}

/** Pick export FPS — match source when requested (smooth, no frame skip). */
export function resolveExportFps(videoCfg, sourceFps = null) {
  const manual = parseInt(videoCfg?.fps, 10) || 30
  const useMatch =
    videoCfg?.frameRateMode === 'match' ||
    (videoCfg?.frameRateMode !== 'manual' && videoCfg?.useSourceFps !== false)

  if (!useMatch || sourceFps == null || !isFinite(sourceFps) || sourceFps <= 0) {
    return manual
  }

  const rounded = Math.round(sourceFps)
  if (rounded <= 26) return 24
  if (rounded <= 45) return 30
  if (rounded <= 75) return 60
  return Math.min(60, Math.max(24, rounded))
}

export function applyResolvedExportFps(videoCfg, sourceFps = null) {
  const fps = resolveExportFps(videoCfg, sourceFps)
  return {
    ...videoCfg,
    fps,
    frameRateMode: videoCfg?.frameRateMode || (videoCfg?.useSourceFps !== false ? 'match' : 'manual'),
    useSourceFps: videoCfg?.useSourceFps !== false,
  }
}

export function estimateExportFileSizeMb(vMbps, aKbps, durationSec) {
  const sec = Math.max(0.1, Number(durationSec) || 0)
  const totalMbps = vMbps + aKbps / 1000
  return (totalMbps * sec) / 8
}

export function formatDurationShort(sec) {
  const s = Math.max(0, Number(sec) || 0)
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return m > 0 ? `${m}:${String(r).padStart(2, '0')}` : `${r}s`
}

export function applyExportPresetToVideo(videoCfg, presetId) {
  const preset = EXPORT_PRESETS.find((p) => p.id === presetId)
  if (!preset || presetId === 'custom') {
    return { ...videoCfg, exportPreset: presetId || 'custom' }
  }
  return { ...videoCfg, ...preset.patch, exportPreset: presetId }
}
