import React from 'react';
import { Film, Clock, Download, Loader2, Play, FileAudio, Plus, Music, Image } from 'lucide-react';

export default function MoreFeaturesPanel({
  activeTab,
  videos,

  VIDEO_MERGE_TRANSITIONS,
  mergedResults,
  videoMerging,
  mergeProgress,
  mergeStartTime,
  mergeTimeTotal,
  formatTime,
  mergeVideosInBatches,

  audioExtractionQuality,
  setAudioExtractionQuality,
  handleBatchExtractAudio,
  batchExtracting,
  progress,
  extractedAudios,
  addAllExtractedToVoice,
  addAllExtractedToMusic,
  downloadAllExtractedAudios,
  clearExtractedAudios,
  downloadExtractedAudio,

  thumbnailFolderName,
  setThumbnailFolderName,
  thumbnailFormat,
  setThumbnailFormat,
  thumbnailQuality,
  setThumbnailQuality,
  thumbnailExtracting,
  thumbnailProgress,
  handleBatchExtractThumbnails,
  extractedThumbnails,
  downloadAllThumbnailsAsZip,
  clearThumbnails,
  downloadThumbnail,
}) {
  if (activeTab !== 'moreFeatures') return null;

  return (
    <div className="animate-fadeIn space-y-3">
      {/* VIDEO MERGING */}
      <div className="glass-card p-3 sm:p-4 rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs sm:text-sm font-semibold text-indigo-100/80 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5" /> Video Merging
          </h3>
          {mergedResults.length > 0 && !videoMerging && (
            <span className="text-[9px] px-1.5 py-0.5 bg-green-600/20 border border-green-500/20 rounded text-green-300">{mergedResults.length} ready</span>
          )}
        </div>
        <p className="text-[10px] text-gray-400">Videos from Upload tab will be used. Merged in sequence order by batch.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Batch Size (videos per merged output)</label>
            <select id="mergeBatchSize" className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg p-1.5 text-xs text-gray-300">
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n} videos = 1 merged video</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Transition (between every 2 videos)</label>
            <select id="mergeTransition" className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg p-1.5 text-xs text-gray-300">
              {VIDEO_MERGE_TRANSITIONS.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
        {videos.length === 0 && <p className="text-[10px] text-amber-400">Please add videos from the Upload tab first</p>}
        {videos.length > 0 && !videoMerging && mergedResults.length === 0 && (
          <p className="text-[10px] text-green-400">
            {videos.length} videos → {Math.ceil(videos.length / (parseInt(document.getElementById('mergeBatchSize')?.value) || 2))} merged output(s) (approx)
          </p>
        )}
        {videoMerging && (
          <div className="relative rounded-lg overflow-hidden">
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/0 via-indigo-500/30 to-violet-600/0 animate-shimmer" />
            </div>
            <div className="bg-[#0c1022]/80 border border-violet-500/15 p-3 rounded-lg space-y-2 shadow-lg shadow-violet-950/20">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-[10px] text-gray-300 font-medium">
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 border-t-violet-400 animate-spin" />
                  </div>
                  Merging Clips...
                </span>
                <span className={`text-xs font-bold font-mono tabular-nums ${mergeProgress >= 100 ? 'text-emerald-400' : 'text-violet-300'}`}>{mergeProgress}%</span>
              </div>
              <div className="relative h-2 bg-[#0a0e1a] rounded-full overflow-hidden border border-violet-500/[0.06]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out relative ${mergeProgress >= 100 ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500' : 'bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-500'}`}
                  style={{ width: `${mergeProgress}%` }}
                >
                  {mergeProgress < 100 && <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer rounded-full" />}
                </div>
                {mergeProgress > 0 && mergeProgress < 100 && (
                  <div className="absolute top-0 h-full w-0.5 bg-white/40 rounded-full blur-[1px]" style={{ left: `${mergeProgress}%`, transform: 'translateX(-50%)' }} />
                )}
              </div>
              {mergeStartTime && (
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-indigo-400/50" /> <span className="text-indigo-300">{formatTime(Date.now() - mergeStartTime)}</span>
                  </span>
                  {mergeTimeTotal > 0 && <span>Duration: <span className="text-indigo-300">~{formatTime(mergeTimeTotal * 1000)}</span></span>}
                  {mergeProgress > 5 && mergeStartTime && (
                    <span>ETA: <span className="text-violet-300 font-semibold">~{formatTime(((Date.now() - mergeStartTime) / mergeProgress) * (100 - mergeProgress))}</span></span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        <button
          onClick={() => {
            const batchSelect = document.getElementById('mergeBatchSize');
            const transSelect = document.getElementById('mergeTransition');
            mergeVideosInBatches(parseInt(batchSelect?.value) || 2, transSelect?.value || 'crossfade');
          }}
          disabled={videoMerging || videos.length < 2}
          className="w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:via-violet-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-950/30"
        >
          {videoMerging ? <><Loader2 className="w-3 h-3 animate-spin" /> Merging...</> : <><Film className="w-3.5 h-3.5" /> Merge Videos</>}
        </button>

        {mergedResults.length > 0 && !videoMerging && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-indigo-300 font-semibold">{mergedResults.length} Merged Video(s)</span>
              <div className="flex gap-1.5">
                <button
                  onClick={async () => {
                    if (!window.JSZip) return;
                    const zip = new window.JSZip();
                    mergedResults.forEach((r) => zip.file(r.name, r.blob));
                    const zipBlob = await zip.generateAsync({ type: 'blob' });
                    const url = URL.createObjectURL(zipBlob);
                    const a = document.createElement('a');
                    a.href = url; a.download = 'merged_videos.zip'; a.click();
                    setTimeout(() => URL.revokeObjectURL(url), 5000);
                  }}
                  className="px-2 py-1 bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/20 rounded text-[9px] text-violet-300 font-semibold flex items-center gap-1 transition"
                >
                  <Download className="w-2.5 h-2.5" /> Bulk Download ZIP
                </button>
              </div>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {mergedResults.map((r, ri) => (
                <div key={ri} className="flex items-center justify-between bg-[#080b16]/80 border border-indigo-500/[0.07] rounded-lg px-2.5 py-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <Film className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span className="text-[10px] text-gray-300 truncate">{r.name}</span>
                    <span className="text-[8px] text-gray-500 shrink-0">{(r.blob.size / (1024 * 1024)).toFixed(1)} MB</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={() => {
                        const v = window.open('', '_blank');
                        if (v) v.document.write(`<video src="${r.url}" controls autoplay style="max-width:100%;max-height:100vh"></video>`);
                      }}
                      className="p-1 rounded hover:bg-indigo-600/20 text-indigo-400 transition"
                      title="Preview"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => { const a = document.createElement('a'); a.href = r.url; a.download = r.name; a.click(); }}
                      className="p-1 rounded hover:bg-violet-600/20 text-violet-400 transition"
                      title="Download"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AUDIO EXTRACTOR */}
      <div className="glass-card p-3 sm:p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-indigo-300 flex items-center gap-1.5">
            <FileAudio className="w-3.5 h-3.5" /> Audio Extractor
          </h3>
          <span className="text-[8px] px-1.5 py-0.5 bg-indigo-600/30 rounded text-indigo-300">WAV</span>
        </div>

        <div className="flex gap-2">
          <select
            className="flex-1 bg-[#080b16] border border-indigo-500/[0.1] rounded-lg p-1.5 text-[10px] sm:text-xs text-gray-300"
            value={audioExtractionQuality}
            onChange={(e) => setAudioExtractionQuality(parseInt(e.target.value))}
          >
            <option value={128000}>16-bit (Standard)</option>
            <option value={256000}>24-bit (High Quality)</option>
          </select>
          <button
            onClick={handleBatchExtractAudio}
            disabled={batchExtracting || videos.length === 0}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white px-2 py-1.5 rounded text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition"
          >
            {batchExtracting ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileAudio className="w-3 h-3" />}
            <span className="hidden sm:inline">Extract All</span>
            <span className="sm:hidden">Extract</span>
          </button>
        </div>

        {videos.length === 0 && (
          <p className="text-[10px] text-amber-400">Upload videos in Upload tab first</p>
        )}

        {batchExtracting && (
          <div className="bg-gray-900/50 p-2 rounded">
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>Extracting...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 transition-all" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}

        {extractedAudios.length > 0 && (
          <div className="bg-gray-900/50 rounded-lg overflow-hidden border border-blue-700/30">
            <div className="p-2 bg-blue-900/30 flex justify-between items-center border-b border-blue-700/30 flex-wrap gap-1">
              <span className="text-[10px] sm:text-xs text-indigo-300 font-medium">
                Extracted ({extractedAudios.length})
              </span>
              <div className="flex gap-1 flex-wrap">
                <button onClick={addAllExtractedToVoice} className="text-[9px] bg-amber-600/70 hover:bg-amber-600 px-1.5 py-0.5 rounded text-amber-100 transition flex items-center gap-0.5">
                  <Plus className="w-2.5 h-2.5" /> Add All to Voice
                </button>
                <button onClick={addAllExtractedToMusic} className="text-[9px] bg-purple-600/70 hover:bg-purple-600 px-1.5 py-0.5 rounded text-purple-100 transition flex items-center gap-0.5">
                  <Plus className="w-2.5 h-2.5" /> Add All to Music
                </button>
                <button onClick={downloadAllExtractedAudios} className="text-[9px] bg-green-600/50 hover:bg-green-600 px-1.5 py-0.5 rounded text-green-200 transition">
                  ZIP All
                </button>
                <button onClick={clearExtractedAudios} className="text-[9px] bg-red-600/50 hover:bg-red-600 px-1.5 py-0.5 rounded text-red-200 transition">
                  Clear
                </button>
              </div>
            </div>
            <div className="max-h-[120px] overflow-y-auto p-1.5 space-y-1">
              {extractedAudios.map((audio) => (
                <div key={audio.id} className="bg-gray-800/50 p-1.5 rounded flex justify-between items-center gap-2 hover:bg-gray-800 transition">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Music className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-medium text-gray-200 truncate block">{audio.name}</span>
                      <span className="text-[8px] text-gray-500">{audio.size} MB</span>
                    </div>
                  </div>
                  <button onClick={() => downloadExtractedAudio(audio.url, audio.name)} className="bg-indigo-600 hover:bg-indigo-700 text-white p-1 rounded transition flex-shrink-0">
                    <Download className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* VIDEO THUMBNAILS EXTRACTOR */}
      <div className="glass-card p-3 sm:p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-semibold text-indigo-100/80 flex items-center gap-1.5">
            <Image className="w-3.5 h-3.5" /> Video Thumbnails
          </h3>
        </div>
        <p className="text-[10px] text-gray-400">Har video ka thumbnail (frame) – video ke same ratio me, high quality. Bulk download bhi kar sakte ho.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Folder name (ZIP me)</label>
            <input
              type="text"
              value={thumbnailFolderName}
              onChange={(e) => setThumbnailFolderName(e.target.value)}
              placeholder="video_thumbnails"
              className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg p-1.5 text-xs text-gray-300"
            />
            <p className="text-[8px] text-gray-500 mt-0.5">Images: 1.png, 2.png... (numeric sequence)</p>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Image Format</label>
            <select
              value={thumbnailFormat}
              onChange={(e) => setThumbnailFormat(e.target.value)}
              className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg p-1.5 text-xs text-gray-300"
            >
              <option value="png">PNG (Lossless, best quality)</option>
              <option value="jpeg">JPEG (Smaller size)</option>
              <option value="webp">WebP (Balanced)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Quality {thumbnailFormat !== 'png' && '(JPEG/WebP)'}</label>
            <select
              value={thumbnailQuality}
              onChange={(e) => setThumbnailQuality(parseFloat(e.target.value))}
              disabled={thumbnailFormat === 'png'}
              className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg p-1.5 text-xs text-gray-300 disabled:opacity-60"
            >
              <option value={1}>100% (Best)</option>
              <option value={0.95}>95%</option>
              <option value={0.9}>90%</option>
              <option value={0.85}>85%</option>
              <option value={0.8}>80%</option>
            </select>
          </div>
        </div>

        {videos.length === 0 && <p className="text-[10px] text-amber-400">Please add videos from the Upload tab first</p>}
        {videos.length > 0 && (
          <p className="text-[10px] text-emerald-400">{videos.length} videos → {videos.length} thumbnails (video ratio + full resolution)</p>
        )}

        {thumbnailExtracting && (
          <div className="bg-gray-900/50 p-2 rounded">
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>Extracting thumbnails...</span>
              <span>{thumbnailProgress}%</span>
            </div>
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${thumbnailProgress}%` }}></div>
            </div>
          </div>
        )}

        <button
          onClick={handleBatchExtractThumbnails}
          disabled={thumbnailExtracting || videos.length === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-3 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition"
        >
          {thumbnailExtracting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Extracting...</> : <><Image className="w-3.5 h-3.5" /> Extract All Thumbnails</>}
        </button>

        {extractedThumbnails.length > 0 && (
          <div className="bg-gray-900/50 rounded-lg overflow-hidden border border-emerald-700/30">
            <div className="p-2 bg-emerald-900/30 flex justify-between items-center border-b border-emerald-700/30 flex-wrap gap-1">
              <span className="text-[10px] sm:text-xs text-emerald-300 font-medium">Thumbnails ({extractedThumbnails.length})</span>
              <div className="flex gap-1 flex-wrap">
                <button onClick={downloadAllThumbnailsAsZip} className="text-[9px] bg-emerald-600 hover:bg-emerald-700 px-1.5 py-0.5 rounded text-white transition">
                  ZIP All
                </button>
                <button onClick={clearThumbnails} className="text-[9px] bg-red-600/50 hover:bg-red-600 px-1.5 py-0.5 rounded text-red-200 transition">
                  Clear
                </button>
              </div>
            </div>
            <div className="max-h-[200px] overflow-y-auto p-1.5 grid grid-cols-3 sm:grid-cols-4 gap-2">
              {extractedThumbnails.map((t) => (
                <div key={t.id} className="bg-gray-800/50 rounded overflow-hidden group">
                  <img src={t.url} alt={t.name} className="w-full aspect-video object-cover" />
                  <div className="p-1 flex justify-between items-center gap-0.5">
                    <span className="text-[8px] text-gray-400 truncate flex-1" title={t.name}>{t.name}</span>
                    <button onClick={() => downloadThumbnail(t.url, t.name)} className="bg-emerald-600 hover:bg-emerald-700 text-white p-0.5 rounded flex-shrink-0">
                      <Download className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

