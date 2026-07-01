import React, { useEffect, useState } from 'react'
import {
  Subtitles,
  Loader2,
  Save,
  Zap,
  AlertCircle,
} from 'lucide-react'

function trackStatusLabel(status) {
  if (status === 'ready' || status === 'done') return '✓'
  if (status === 'error') return '✗'
  if (status === 'transcribing') return '…'
  if (status === 'pending') return '…'
  return status
}

function jobStatusLabel(status) {
  if (status === 'editor_ready') return 'Ready to edit'
  if (status === 'transcribing') return 'Transcribing…'
  if (status === 'error') return 'Failed'
  return status
}

export default function CaptionStudio({
  activeTab,
  voiceFiles,
  captionJob,
  captionJobId,
  uploading,
  polling,
  error,
  editorReady,
  tracks,
  selectedTrackIndex,
  setSelectedTrackIndex,
  selectedTrack,
  uploadFromVoiceFiles,
  saveTrackSegments,
  applyCaptionsToBulkExport,
  previewVoiceIndex,
  setPreviewVoiceIndex,
  captionsReadyCount,
}) {
  const [localSegments, setLocalSegments] = useState([])

  useEffect(() => {
    if (selectedTrack?.segments) {
      setLocalSegments(selectedTrack.segments.map((s) => ({ ...s })))
    } else setLocalSegments([])
  }, [selectedTrack?.id, selectedTrack?.segments])

  if (activeTab !== 'captions') return null

  const startFromVoices = async () => {
    await uploadFromVoiceFiles(voiceFiles, [])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-cyan-300">
        <Subtitles className="w-4 h-4" />
        <h2 className="text-xs font-bold uppercase tracking-wide">Captions (CPU · HI/EN/PA)</h2>
      </div>

      <p className="text-[10px] text-gray-500 leading-relaxed">
        Faster-Whisper (free, offline). Pehli voice ki captions jaldi — phir style lagakar bulk export karein.
      </p>

      {error && (
        <div className="text-[10px] text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2 flex gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span className="whitespace-pre-line">{error}</span>
        </div>
      )}

      {!captionJobId && (
        <button
          type="button"
          disabled={uploading || !voiceFiles?.length}
          onClick={startFromVoices}
          className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-[10px] font-semibold flex items-center justify-center gap-1.5"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
          Generate captions ({voiceFiles?.length || 0} voices)
        </button>
      )}

      {voiceFiles?.length > 1 && (
        <label className="text-[10px] text-gray-500 block">
          Preview voice #
          <select
            value={previewVoiceIndex}
            onChange={(e) => setPreviewVoiceIndex(Number(e.target.value))}
            className="w-full mt-0.5 bg-black/30 border border-gray-700 rounded px-2 py-1 text-gray-200"
          >
            {voiceFiles.map((f, i) => (
              <option key={f.name + i} value={i}>
                {i + 1}: {f.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {captionJobId && (
        <div className="text-[10px] text-gray-400 bg-cyan-500/5 border border-cyan-500/15 rounded-lg p-2 space-y-0.5">
          <div>Status: <span className="text-cyan-300">{jobStatusLabel(captionJob?.status)}</span></div>
          <div>Ready: {captionsReadyCount ?? 0} / {captionJob?.totalTracks ?? voiceFiles?.length ?? 0}</div>
          {(polling || uploading) && (
            <span className="flex items-center gap-1 text-amber-300">
              <Loader2 className="w-3 h-3 animate-spin" /> Processing on CPU…
            </span>
          )}
        </div>
      )}

      {captionJobId && tracks.length > 0 && (
        <>
          <div className="flex flex-wrap gap-1">
            {tracks.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTrackIndex(i)}
                title={t.status === 'error' && t.error ? t.error : undefined}
                className={`text-[9px] px-2 py-1 rounded border ${
                  t.status === 'error'
                    ? 'border-rose-500/40 text-rose-300 bg-rose-500/10'
                    : i === selectedTrackIndex
                      ? 'border-cyan-400 text-cyan-200 bg-cyan-500/15'
                      : 'border-gray-700 text-gray-500'
                }`}
              >
                Voice {i + 1} {trackStatusLabel(t.status)}
              </button>
            ))}
          </div>

          {selectedTrack?.status === 'error' && selectedTrack?.error && (
            <p className="text-[10px] text-rose-300/90 whitespace-pre-line">{selectedTrack.error}</p>
          )}
        </>
      )}

      {editorReady && tracks.length > 0 && (
        <>
          <div className="bg-[#0c1022]/80 border border-amber-500/15 rounded-xl p-3 max-h-40 overflow-y-auto custom-scrollbar">
            <p className="text-[10px] font-semibold text-amber-200 mb-2">Caption editor</p>
            {localSegments.map((seg, idx) => (
              <div key={seg.id || idx} className="mb-2">
                <span className="text-[9px] text-gray-500">
                  {seg.start?.toFixed(2)}s – {seg.end?.toFixed(2)}s
                </span>
                <input
                  className="w-full text-[10px] bg-black/40 border border-gray-700 rounded px-2 py-1 mt-0.5"
                  value={seg.text}
                  onChange={(e) =>
                    setLocalSegments((p) =>
                      p.map((s, i) => (i === idx ? { ...s, text: e.target.value } : s))
                    )
                  }
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => saveTrackSegments(selectedTrack.id, localSegments)}
              className="text-[10px] text-amber-300 flex items-center gap-1"
            >
              <Save className="w-3 h-3" /> Save edits
            </button>
          </div>

          <button
            type="button"
            onClick={applyCaptionsToBulkExport}
            className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold"
          >
            Use synced captions in main bulk export
          </button>
        </>
      )}
    </div>
  )
}
