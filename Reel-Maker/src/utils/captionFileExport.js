/** Client-side caption exports: Excel (.xlsx), plain text (.txt), subtitle files (.srt / .vtt). */

function pad2(n) {
  return String(n).padStart(2, '0')
}

function pad3(n) {
  return String(n).padStart(3, '0')
}

/** SRT timestamp: HH:MM:SS,mmm */
export function formatSrtTime(sec) {
  const t = Math.max(0, Number(sec) || 0)
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const s = Math.floor(t % 60)
  const ms = Math.round((t - Math.floor(t)) * 1000)
  return `${pad2(h)}:${pad2(m)}:${pad2(s)},${pad3(ms)}`
}

/** VTT timestamp: HH:MM:SS.mmm */
export function formatVttTime(sec) {
  return formatSrtTime(sec).replace(',', '.')
}

export function sanitizeFileBase(name, fallback = 'captions') {
  const base = String(name || fallback)
    .replace(/\.[^.]+$/, '')
    .replace(/[<>:"/\\|?*\x00-\x1f]+/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 80)
  return base || fallback
}

function readyTracks(tracks) {
  return (tracks || []).filter(
    (t) => (t.status === 'ready' || t.status === 'done') && t.segments?.length
  )
}

export function segmentsToSrt(segments = []) {
  return segments
    .map((seg, i) => {
      const text = String(seg.text || '').trim()
      if (!text) return null
      return `${i + 1}\n${formatSrtTime(seg.start)} --> ${formatSrtTime(seg.end)}\n${text}\n`
    })
    .filter(Boolean)
    .join('\n')
}

export function segmentsToVtt(segments = []) {
  const body = segments
    .map((seg) => {
      const text = String(seg.text || '').trim()
      if (!text) return null
      return `${formatVttTime(seg.start)} --> ${formatVttTime(seg.end)}\n${text}\n`
    })
    .filter(Boolean)
    .join('\n')
  return `WEBVTT\n\n${body}`
}

export function segmentsToTxt(segments = [], { withTimecodes = true } = {}) {
  return segments
    .map((seg) => {
      const text = String(seg.text || '').trim()
      if (!text) return null
      if (!withTimecodes) return text
      const start = Number(seg.start || 0).toFixed(2)
      const end = Number(seg.end || 0).toFixed(2)
      return `[${start}s – ${end}s] ${text}`
    })
    .filter(Boolean)
    .join('\n')
}

function trackLabel(track, index) {
  return track?.label || `voice_${(track?.trackIndex ?? index) + 1}`
}

function downloadBlob(blob, filename) {
  if (typeof window.saveAs === 'function') {
    window.saveAs(blob, filename)
    return
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

function resolveExportTracks({ tracks, selectedTrackIndex, localSegments, scope }) {
  if (scope === 'current') {
    const t = tracks?.[selectedTrackIndex]
    if (!t) return []
    const segments = localSegments?.length ? localSegments : t.segments
    if (!segments?.length) return []
    return [{ ...t, segments }]
  }
  return readyTracks(tracks).map((t) => {
    const idx = tracks.findIndex((x) => x.id === t.id)
    if (idx === selectedTrackIndex && localSegments?.length) {
      return { ...t, segments: localSegments }
    }
    return t
  })
}

/**
 * @param {'excel'|'txt'|'srt'|'vtt'} format
 * @param {'current'|'all'} scope
 */
export async function exportCaptionsFiles({
  format,
  scope = 'current',
  tracks = [],
  selectedTrackIndex = 0,
  localSegments = [],
  jobId = '',
} = {}) {
  const list = resolveExportTracks({ tracks, selectedTrackIndex, localSegments, scope })
  if (!list.length) {
    throw new Error('No ready captions to export. Generate captions first.')
  }

  const stamp = new Date().toISOString().slice(0, 10)
  const prefix = jobId ? `captions_${String(jobId).slice(0, 8)}` : `captions_${stamp}`

  if (format === 'excel') {
    if (!window.XLSX) throw new Error('Excel library not loaded yet. Wait a moment and retry.')
    const rows = [['Voice', 'Voice #', 'Language', 'Segment #', 'Start (s)', 'End (s)', 'Duration (s)', 'Text']]
    list.forEach((t, ti) => {
      const voice = trackLabel(t, ti)
      const voiceNum = (t.trackIndex ?? ti) + 1
      const lang = t.language || ''
      ;(t.segments || []).forEach((seg, si) => {
        const start = Number(seg.start || 0)
        const end = Number(seg.end || 0)
        rows.push([
          voice,
          voiceNum,
          lang,
          si + 1,
          Number(start.toFixed(3)),
          Number(end.toFixed(3)),
          Number(Math.max(0, end - start).toFixed(3)),
          String(seg.text || '').trim(),
        ])
      })
    })
    const ws = window.XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [
      { wch: 28 },
      { wch: 8 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 60 },
    ]
    const wb = window.XLSX.utils.book_new()
    window.XLSX.utils.book_append_sheet(wb, ws, 'Captions')
    const out = window.XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    downloadBlob(
      new Blob([out], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      `${prefix}_${scope}.xlsx`,
    )
    return { files: 1, format: 'excel' }
  }

  const buildContent = (segments) => {
    if (format === 'txt') return segmentsToTxt(segments, { withTimecodes: true })
    if (format === 'vtt') return segmentsToVtt(segments)
    return segmentsToSrt(segments)
  }
  const ext = format === 'txt' ? 'txt' : format === 'vtt' ? 'vtt' : 'srt'
  const mime =
    format === 'txt' ? 'text/plain;charset=utf-8' : format === 'vtt' ? 'text/vtt;charset=utf-8' : 'application/x-subrip;charset=utf-8'

  if (list.length === 1) {
    const t = list[0]
    const name = `${sanitizeFileBase(trackLabel(t, 0))}.${ext}`
    downloadBlob(new Blob([buildContent(t.segments)], { type: mime }), name)
    return { files: 1, format }
  }

  if (!window.JSZip) throw new Error('Zip library not loaded yet. Wait a moment and retry.')
  const zip = new window.JSZip()
  list.forEach((t, i) => {
    const base = sanitizeFileBase(trackLabel(t, i), `voice_${i + 1}`)
    zip.file(`${base}.${ext}`, buildContent(t.segments))
  })
  const content = await zip.generateAsync({ type: 'blob' })
  downloadBlob(content, `${prefix}_${format}_all.zip`)
  return { files: list.length, format }
}
