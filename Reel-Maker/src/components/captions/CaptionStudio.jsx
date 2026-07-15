import React, { useEffect, useState } from 'react'
import {
  Subtitles,
  Loader2,
  Save,
  Zap,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  Captions,
  Download,
} from 'lucide-react'
import { exportCaptionsFiles } from '../../utils/captionFileExport.js'

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

const CAPTION_LANGUAGES = [
  { id: 'auto', label: 'Auto-detect' },
  { id: 'hi', label: 'Hindi (हिन्दी)' },
  { id: 'en', label: 'English' },
  { id: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { id: 'hinglish', label: 'Hinglish (Hindi + English)' },
  { id: 'ur', label: 'Urdu (اردو)' },
  { id: 'ta', label: 'Tamil (தமிழ்)' },
  { id: 'te', label: 'Telugu (తెలుగు)' },
  { id: 'bn', label: 'Bengali (বাংলা)' },
  { id: 'mr', label: 'Marathi (मराठी)' },
  { id: 'gu', label: 'Gujarati (ગુજરાતી)' },
]

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
  captionProgressPct,
}) {
  const [localSegments, setLocalSegments] = useState([])
  const [captionLanguage, setCaptionLanguage] = useState('auto')
  const [exportScope, setExportScope] = useState('current')
  const [exporting, setExporting] = useState(false)
  const [exportMsg, setExportMsg] = useState('')

  useEffect(() => {
    if (selectedTrack?.segments) {
      setLocalSegments(selectedTrack.segments.map((s) => ({ ...s })))
    } else setLocalSegments([])
  }, [selectedTrack?.id, selectedTrack?.segments])

  if (activeTab !== 'captions') return null

  const totalTracks = captionJob?.totalTracks ?? voiceFiles?.length ?? 0
  const captionJobActive = polling || uploading || captionJob?.status === 'transcribing'
  const canExportCaptions = (captionsReadyCount ?? 0) > 0

  const startFromVoices = async () => {
    const lang = captionLanguage === 'hinglish' ? 'hi' : captionLanguage
    await uploadFromVoiceFiles(voiceFiles, [], { language: lang })
  }

  const runExport = async (format) => {
    if (!canExportCaptions || exporting) return
    setExporting(true)
    setExportMsg('')
    try {
      const result = await exportCaptionsFiles({
        format,
        scope: exportScope,
        tracks,
        selectedTrackIndex,
        localSegments,
        jobId: captionJobId,
      })
      const label =
        format === 'excel' ? 'Excel (.xlsx)' : format === 'txt' ? 'Text (.txt)' : format === 'vtt' ? 'WebVTT (.vtt)' : 'Subtitles (.srt)'
      setExportMsg(
        result.files > 1
          ? `Downloaded ${result.files} ${label} files (zip).`
          : `Downloaded ${label}.`,
      )
    } catch (e) {
      setExportMsg(e?.message || 'Export failed')
    } finally {
      setExporting(false)
    }
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
        <div className="space-y-2">
          <label className="text-[10px] text-gray-400 block">
            Language
            <select
              value={captionLanguage}
              onChange={(e) => setCaptionLanguage(e.target.value)}
              className="w-full mt-0.5 bg-black/40 border border-cyan-500/25 rounded-lg px-2 py-1.5 text-xs text-gray-200 outline-none focus:border-cyan-400/50"
            >
              {CAPTION_LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>
          </label>
          <p className="text-[9px] text-gray-600 leading-snug">
            {captionLanguage === 'auto'
              ? 'Auto: detects language first (Hindi / Punjabi / English), then captions in that script. For best accuracy pick Hindi or Punjabi manually.'
              : captionLanguage === 'hinglish'
                ? 'Forces Hindi (Devanagari) with Hinglish-aware prompt.'
                : `Forces ${CAPTION_LANGUAGES.find((l) => l.id === captionLanguage)?.label || captionLanguage} transcription in the correct script.`}
          </p>
          <button
            type="button"
            disabled={uploading || !voiceFiles?.length}
            onClick={startFromVoices}
            className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-[10px] font-semibold flex items-center justify-center gap-1.5"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            Generate captions ({voiceFiles?.length || 0} voices)
          </button>
        </div>
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
        <div className="text-[10px] text-gray-400 bg-cyan-500/5 border border-cyan-500/15 rounded-lg p-2.5 space-y-2">
          <div className="flex justify-between items-center gap-2">
            <span>
              Status: <span className="text-cyan-300">{jobStatusLabel(captionJob?.status)}</span>
            </span>
            <span className="text-cyan-200/80 font-mono tabular-nums shrink-0">
              {captionsReadyCount ?? 0} / {captionJob?.totalTracks ?? voiceFiles?.length ?? 0}
            </span>
          </div>

          <div className="flex justify-between items-center text-[9px]">
            <span className="text-gray-500 uppercase tracking-wide">Progress</span>
            <span className="text-cyan-300 font-mono font-semibold tabular-nums">{captionProgressPct ?? 0}%</span>
          </div>
          <div className="relative h-2.5 bg-[#0a0e1a] rounded-full overflow-hidden border border-cyan-500/10">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-cyan-600 via-sky-500 to-cyan-400 relative"
              style={{ width: `${captionProgressPct ?? 0}%` }}
            >
              {captionJobActive && captionProgressPct < 100 && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 animate-shimmer rounded-full" />
              )}
            </div>
          </div>

          {(polling || uploading) && (
            <span className="flex items-center gap-1 text-amber-300">
              <Loader2 className="w-3 h-3 animate-spin shrink-0" /> Processing on CPU…
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
                title={t.status === 'error' && t.error ? t.error : t.language ? `Detected: ${t.language}` : undefined}
                className={`text-[9px] px-2 py-1 rounded border ${
                  t.status === 'error'
                    ? 'border-rose-500/40 text-rose-300 bg-rose-500/10'
                    : i === selectedTrackIndex
                      ? 'border-cyan-400 text-cyan-200 bg-cyan-500/15'
                      : 'border-gray-700 text-gray-500'
                }`}
              >
                Voice {i + 1} {trackStatusLabel(t.status)}
                {t.language && (t.status === 'ready' || t.status === 'done') && (
                  <span className="ml-1 text-[8px] text-gray-500 uppercase">{t.language}</span>
                )}
              </button>
            ))}
          </div>

          {selectedTrack?.status === 'error' && selectedTrack?.error && (
            <p className="text-[10px] text-rose-300/90 whitespace-pre-line">{selectedTrack.error}</p>
          )}
        </>
      )}

      {canExportCaptions && (
        <div className="bg-[#0c1022]/80 border border-emerald-500/20 rounded-xl p-3 space-y-2.5">
          <div className="flex items-center gap-1.5 text-emerald-300">
            <Download className="w-3.5 h-3.5" />
            <p className="text-[10px] font-semibold uppercase tracking-wide">Export captions</p>
          </div>

          <div className="flex gap-1">
            {[
              { id: 'current', label: 'This voice' },
              { id: 'all', label: `All ready (${captionsReadyCount})` },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setExportScope(opt.id)}
                className={`flex-1 text-[9px] py-1.5 rounded-md border transition ${
                  exportScope === opt.id
                    ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200'
                    : 'border-gray-700 text-gray-500 hover:border-gray-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              disabled={exporting}
              onClick={() => runExport('excel')}
              className="flex flex-col items-center gap-1 py-2 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 disabled:opacity-40 text-white text-[9px] font-semibold"
              title="Download .xlsx with timings + text"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Excel
            </button>
            <button
              type="button"
              disabled={exporting}
              onClick={() => runExport('txt')}
              className="flex flex-col items-center gap-1 py-2 rounded-lg bg-sky-600/90 hover:bg-sky-500 disabled:opacity-40 text-white text-[9px] font-semibold"
              title="Download plain text with timestamps"
            >
              <FileText className="w-3.5 h-3.5" />
              Text
            </button>
            <button
              type="button"
              disabled={exporting}
              onClick={() => runExport('srt')}
              className="flex flex-col items-center gap-1 py-2 rounded-lg bg-violet-600/90 hover:bg-violet-500 disabled:opacity-40 text-white text-[9px] font-semibold"
              title="Download .srt subtitle / captions file"
            >
              <Captions className="w-3.5 h-3.5" />
              Captions
            </button>
          </div>

          <button
            type="button"
            disabled={exporting}
            onClick={() => runExport('vtt')}
            className="w-full text-[9px] py-1.5 rounded-md border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500 disabled:opacity-40"
          >
            Also download WebVTT (.vtt)
          </button>

          {(exporting || exportMsg) && (
            <p className={`text-[9px] ${exporting ? 'text-amber-300' : exportMsg.includes('fail') || exportMsg.includes('No ready') ? 'text-rose-300' : 'text-emerald-300/90'}`}>
              {exporting ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Preparing download…
                </span>
              ) : (
                exportMsg
              )}
            </p>
          )}
        </div>
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
