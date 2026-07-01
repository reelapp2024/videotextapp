import { useState, useCallback, useRef, useEffect } from 'react'
import api from '../api.js'
import { syncVoiceCaptionMap } from '../utils/captionIntegration.js'

export function useCaptions({
  setConfig,
  setLogs,
  setActiveTab,
  voiceFiles,
  voiceCaptionMap,
  setVoiceCaptionMap,
}) {
  const [captionJob, setCaptionJob] = useState(null)
  const [captionJobId, setCaptionJobId] = useState(null)
  const [polling, setPolling] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0)
  const [error, setError] = useState('')
  const pollRef = useRef(null)
  // How many tracks were "ready/done" the last time we loaded full segments.
  // Used so we only fetch the heavy (segments + words) payload when readiness actually changes.
  const lastReadyCountRef = useRef(0)

  const readyCountOf = (data) =>
    (data?.tracks || []).filter((t) => t.status === 'ready' || t.status === 'done').length

  const failedTracksOf = (data) =>
    (data?.tracks || []).filter((t) => t.status === 'error')

  const syncTrackErrors = (data) => {
    const failed = failedTracksOf(data)
    if (failed.length === 0) {
      if (data?.status !== 'error') setError('')
      return
    }
    const lines = failed.map((t) => {
      const label = t.label || `Voice ${(t.trackIndex ?? 0) + 1}`
      return t.error ? `${label}: ${t.error}` : `${label}: voice-to-text failed`
    })
    setError(lines.join('\n'))
  }

  // Transcription finished for every track (success or error) -> safe to stop polling.
  const transcriptionComplete = (data) => {
    if (!data) return false
    if (data.status === 'done' || data.status === 'error') return true
    if (
      typeof data.totalTracks === 'number' &&
      data.totalTracks > 0 &&
      (data.transcribedCount ?? 0) >= data.totalTracks
    ) {
      return true
    }
    const tracks = data.tracks || []
    return (
      tracks.length > 0 &&
      tracks.every((t) => t.status === 'ready' || t.status === 'done' || t.status === 'error')
    )
  }

  // Keep already-loaded segments when merging a lightweight (summary) status poll.
  const mergeStatusKeepingSegments = (prev, summary) => {
    if (!prev?.tracks?.length) return summary
    const prevByIdx = new Map(prev.tracks.map((t) => [t.trackIndex, t]))
    const tracks = (summary.tracks || []).map((st) => {
      const old = prevByIdx.get(st.trackIndex)
      return old?.segments ? { ...st, segments: old.segments } : st
    })
    return { ...summary, tracks }
  }

  // Avoid re-rendering when a poll returns the same status (no visible change).
  const statusSignature = (data) =>
    !data
      ? ''
      : [
          data.status,
          data.transcribedCount,
          data.editorReady,
          (data.tracks || []).map((t) => t.status).join(','),
        ].join('|')

  const applyMapFromJob = useCallback(
    (data, files) => {
      const map = syncVoiceCaptionMap(files || voiceFiles, data?.tracks || [])
      setVoiceCaptionMap(map)
      const ready = (data?.tracks || []).filter((t) => t.status === 'ready' || t.status === 'done').length
      if (ready > 0) {
        setConfig((c) => ({
          ...c,
          textSource: 'captions',
          captionSync: {
            ...(c.captionSync || {}),
            enabled: true,
            granularity: c.captionSync?.granularity || 'line',
            columnIndex: c.captionSync?.columnIndex ?? 0,
          },
        }))
      }
      return map
    },
    [voiceFiles, setConfig, setVoiceCaptionMap]
  )

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    setPolling(false)
  }, [])

  // Full fetch (segments + words). Use sparingly: initial load, when new tracks become
  // ready, manual refresh, and after saving edits.
  const refreshJob = useCallback(
    async (jobId) => {
      const data = await api.getCaptionJob(jobId)
      setCaptionJob(data)
      applyMapFromJob(data, voiceFiles)
      lastReadyCountRef.current = readyCountOf(data)
      syncTrackErrors(data)
      return data
    },
    [applyMapFromJob, voiceFiles]
  )

  const startPolling = useCallback(
    (jobId) => {
      stopPolling()
      setPolling(true)
      pollRef.current = setInterval(async () => {
        try {
          // Lightweight status poll: no segments/words, tiny payload.
          const summary = await api.getCaptionJob(jobId, { summary: true })
          setCaptionJob((prev) =>
            statusSignature(prev) === statusSignature(summary)
              ? prev
              : mergeStatusKeepingSegments(prev, summary)
          )

          if (failedTracksOf(summary).length) syncTrackErrors(summary)

          // Only pull the heavy payload when more tracks have finished than last time.
          const readyNow = readyCountOf(summary)
          if (readyNow > lastReadyCountRef.current) {
            await refreshJob(jobId)
          }

          if (transcriptionComplete(summary)) {
            // Ensure the final full payload (with all segments) is loaded once, then stop.
            if (readyCountOf(summary) !== lastReadyCountRef.current) {
              await refreshJob(jobId)
            } else {
              syncTrackErrors(summary)
            }
            stopPolling()
          }
        } catch (e) {
          setError(e.message)
          stopPolling()
        }
      }, 1500)
    },
    [refreshJob, stopPolling]
  )

  useEffect(() => () => stopPolling(), [stopPolling])

  const uploadFromVoiceFiles = useCallback(
    async (files, videoFiles = []) => {
      const list = files?.length ? files : voiceFiles
      if (!list?.length) {
        setError('Pehle voice files upload karein (Upload tab).')
        return null
      }
      setError('')
      setUploading(true)
      try {
        const { jobId } = await api.uploadCaptionBatch(list, videoFiles, {
          whisperModel: 'base',
          language: 'auto',
        })
        setCaptionJobId(jobId)
        await refreshJob(jobId)
        startPolling(jobId)
        setLogs(`${list.length} voice(s) — alag alag captions generate ho rahi hain…`)
        return jobId
      } catch (e) {
        setError(e.message)
        throw e
      } finally {
        setUploading(false)
      }
    },
    [voiceFiles, refreshJob, startPolling, setLogs]
  )

  const saveTrackSegments = useCallback(
    async (trackId, segments) => {
      await api.updateCaptionTrack(trackId, segments)
      if (captionJobId) {
        const data = await refreshJob(captionJobId)
        applyMapFromJob(data, voiceFiles)
      } else if (segments?.length) {
        const idx = selectedTrackIndex
        const name = voiceFiles?.[idx]?.name
        setVoiceCaptionMap((prev) => {
          const byName = { ...(prev?.byName || {}) }
          const byIndex = { ...(prev?.byIndex || {}) }
          const payload = { segments, language: null }
          if (name) byName[name] = payload
          byIndex[idx] = payload
          return { byName, byIndex }
        })
        setConfig((c) => ({
          ...c,
          textSource: 'captions',
          captionSync: {
            ...(c.captionSync || {}),
            enabled: true,
            segments,
            granularity: c.captionSync?.granularity || 'line',
          },
        }))
      }
    },
    [
      captionJobId,
      refreshJob,
      applyMapFromJob,
      voiceFiles,
      selectedTrackIndex,
      setVoiceCaptionMap,
      setConfig,
    ]
  )

  const applyCaptionsToBulkExport = useCallback(() => {
    applyMapFromJob(captionJob, voiceFiles)
    setLogs('Captions preview + export ke liye active hain (Text tab effects apply honge).')
    setActiveTab?.('overlay')
  }, [captionJob, voiceFiles, applyMapFromJob, setLogs, setActiveTab])

  const tracks = captionJob?.tracks || []
  const selectedTrack = tracks[selectedTrackIndex] || null
  const editorReady = Boolean(captionJob?.editorReady)
  const captionsReadyCount = tracks.filter((t) => t.status === 'ready' || t.status === 'done').length

  return {
    captionJob,
    captionJobId,
    polling,
    uploading,
    error,
    setError,
    selectedTrackIndex,
    setSelectedTrackIndex,
    selectedTrack,
    tracks,
    editorReady,
    captionsReadyCount,
    uploadFromVoiceFiles,
    saveTrackSegments,
    applyCaptionsToBulkExport,
    stopPolling,
  }
}
