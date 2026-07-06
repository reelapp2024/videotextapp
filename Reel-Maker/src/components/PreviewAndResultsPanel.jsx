import React from 'react';
import { ChevronLeft, ChevronRight, Download, Eye, Film, FolderArchive, Image, List, Loader2, Pause, Play, Video } from 'lucide-react';

function PreviewBulkNav({ nav, onPrev, onNext, positionClass = 'top-2 right-2' }) {
  if (!nav || nav.total <= 1) return null;
  const atStart = nav.current <= 0;
  const atEnd = nav.current >= nav.total - 1;
  return (
    <div
      className={`absolute ${positionClass} z-10 flex items-center gap-0.5 bg-black/75 backdrop-blur-sm border border-indigo-500/30 rounded-lg px-1 py-0.5 shadow-lg shadow-black/40`}
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={atStart}
        aria-label={`Previous ${nav.label.toLowerCase()}`}
        className="p-1 rounded-md text-gray-300 hover:bg-indigo-500/20 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      <span className="text-[10px] text-gray-200 font-medium tabular-nums px-1 min-w-[4.5rem] text-center">
        {nav.label} {nav.current + 1}/{nav.total}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={atEnd}
        aria-label={`Next ${nav.label.toLowerCase()}`}
        className="p-1 rounded-md text-gray-300 hover:bg-indigo-500/20 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function PreviewAndResultsPanel({
  excelData,
  previewRowIndex,
  setPreviewRowIndex,
  previewVideoNav,
  onPreviewVideoPrev,
  onPreviewVideoNext,
  previewImageNav,
  onPreviewImagePrev,
  onPreviewImageNext,
  effectivePreviewVideoIndex,
  previewStageRef,
  previewBgCanvasRef,
  previewCanvasRef,
  previewVideoRef,
  useLayeredPreview,
  estimatedExportDurationSec,
  exportFileEstimate,
  config,
  imageFiles,
  videos,
  voiceFiles,
  musicFiles,
  togglePreviewPlay,
  isPreviewPlaying,
  getAspectRatioDimensions,
  getEffectiveDimensions,
  processedVideos,
  finished,
  serverProcessing,
  serverJobMeta,
  downloadAllZip,
  downloadSingleVideo,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div
          ref={previewStageRef}
          className="md:col-span-3 bg-black/90 rounded-xl border border-indigo-500/[0.1] overflow-hidden relative flex items-center justify-center group shadow-2xl shadow-indigo-950/40 ring-1 ring-indigo-500/[0.05]"
          style={{
            aspectRatio: (() => {
              const isImgOnly = imageFiles.length > 0 && videos.length === 0 && voiceFiles.length === 0 && musicFiles.length === 0;
              if (isImgOnly) {
                const d = getAspectRatioDimensions(config.imageAspectRatio || config.video?.aspectRatio || '1080x1920');
                return `${d.width} / ${d.height}`;
              }
              const d = getEffectiveDimensions();
              return `${d.width} / ${d.height}`;
            })(),
            maxHeight: '70vh',
          }}
        >
          {excelData.length > 0 && (
            <div className="absolute top-2 left-2 z-10 flex items-center gap-2 max-w-[calc(100%-8rem)]">
              <label className="text-[10px] text-gray-400 shrink-0">Preview row:</label>
              <select
                value={Math.min(previewRowIndex, excelData.length - 1)}
                onChange={(e) => setPreviewRowIndex(parseInt(e.target.value, 10))}
                className="bg-black/70 border border-indigo-500/30 rounded-lg text-[10px] text-gray-300 px-2 py-1 focus:border-indigo-500/50 focus:outline-none min-w-0 flex-1"
              >
                {excelData.map((row, ri) => (
                  <option key={ri} value={ri}>
                    Row {ri + 1}
                    {row?.length ? ` (${row.length} cols)` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
          <PreviewBulkNav
            nav={previewVideoNav}
            onPrev={onPreviewVideoPrev}
            onNext={onPreviewVideoNext}
            positionClass="top-2 right-2"
          />
          {imageFiles.length > 0 && videos.length === 0 && voiceFiles.length === 0 && musicFiles.length === 0 && (
            <PreviewBulkNav
              nav={previewImageNav}
              onPrev={onPreviewImagePrev}
              onNext={onPreviewImageNext}
              positionClass={previewVideoNav ? 'top-10 right-2' : 'top-2 right-2'}
            />
          )}
          {videos.length > 1 && effectivePreviewVideoIndex != null && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <span className="text-[9px] text-indigo-200/70 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full border border-indigo-500/20 truncate max-w-[12rem] block">
                {videos[effectivePreviewVideoIndex]?.name || `Video ${effectivePreviewVideoIndex + 1}`}
              </span>
            </div>
          )}
          <canvas
            ref={previewBgCanvasRef}
            className={`absolute inset-0 max-w-full max-h-full w-full h-full object-contain pointer-events-none ${useLayeredPreview ? 'z-0' : 'hidden'}`}
            aria-hidden="true"
          />
          <video
            ref={previewVideoRef}
            className={`absolute pointer-events-none object-cover ${useLayeredPreview ? 'z-[1]' : 'hidden'}`}
            playsInline
            muted
            loop
            crossOrigin="anonymous"
          />
          <canvas
            ref={previewCanvasRef}
            className={`max-w-full max-h-full w-full h-full object-contain ${useLayeredPreview ? 'relative z-[2]' : 'relative'}`}
          />

          {estimatedExportDurationSec != null && (
            <div className="absolute bottom-3 left-2 text-[10px] text-indigo-200/90 bg-black/50 backdrop-blur-sm px-2 py-1 rounded pointer-events-none border border-indigo-500/20">
              Export: {estimatedExportDurationSec.final.toFixed(1)}s
              {exportFileEstimate?.fps != null && (
                <span className="text-gray-400"> · {exportFileEstimate.fps} fps</span>
              )}
              {exportFileEstimate?.mb != null && (
                <span className="text-emerald-300/90">
                  {' '}
                  · ~
                  {exportFileEstimate.mb < 1
                    ? `${(exportFileEstimate.mb * 1024).toFixed(0)} KB`
                    : `${exportFileEstimate.mb.toFixed(1)} MB`}
                </span>
              )}
              {(config.video?.exportSpeed ?? 1) !== 1 && (
                <span className="text-gray-400 ml-1 block sm:inline">
                  ({estimatedExportDurationSec.content.toFixed(1)}s @ {config.video?.exportSpeed ?? 1}×)
                </span>
              )}
            </div>
          )}

          {!videos.length && !voiceFiles.length && !musicFiles.length && !imageFiles.length && (
            <div className="absolute text-gray-600 flex flex-col items-center pointer-events-none">
              <Eye className="w-8 h-8 sm:w-10 sm:h-10 mb-2 opacity-30" />
              <span className="text-xs sm:text-sm text-gray-600">Preview</span>
            </div>
          )}
          {imageFiles.length > 0 && videos.length === 0 && voiceFiles.length === 0 && musicFiles.length === 0 && (
            <div className="absolute top-2 left-2 text-[10px] text-pink-300/80 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-lg pointer-events-none border border-indigo-500/[0.08]">
              Image Preview
              {previewImageNav && previewImageNav.total > 1 ? ` · ${previewImageNav.current + 1}/${previewImageNav.total}` : ''}
            </div>
          )}
          <button
            type="button"
            onClick={togglePreviewPlay}
            aria-label={isPreviewPlaying ? 'Pause preview' : 'Play preview'}
            className="absolute bottom-3 right-3 z-20 bg-indigo-600/40 backdrop-blur-md border border-indigo-400/40 p-2.5 rounded-xl hover:bg-indigo-600/55 transition shadow-lg shadow-indigo-950/40 text-white"
          >
            {isPreviewPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>

        <div className="md:col-span-2 glass-card rounded-xl flex flex-col overflow-hidden max-h-[300px] md:max-h-full">
          <div className="p-2.5 sm:p-3 border-b border-indigo-500/[0.08] flex justify-between items-center">
            <h3 className="font-semibold text-xs sm:text-sm flex items-center gap-2 text-gray-200">
              {serverProcessing ? (
                <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              ) : (
                <List className="w-3.5 h-3.5 text-indigo-400" />
              )}
              {serverProcessing ? 'Videos' : 'Done'}
              {' '}({processedVideos.length}
              {serverProcessing && serverJobMeta?.total > 0 ? ` / ${serverJobMeta.total}` : ''})
            </h3>
            {(finished || processedVideos.length > 0) && (
              <button
                onClick={downloadAllZip}
                className="text-[10px] sm:text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 px-2.5 py-1 rounded-lg flex gap-1 items-center transition border border-emerald-500/15"
              >
                <FolderArchive className="w-3 h-3" /> ZIP
              </button>
            )}
          </div>
          <div className="h-[200px] sm:h-[250px] lg:h-[300px] overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
            {processedVideos.length === 0 && (
              <div className="text-gray-600 text-[10px] text-center mt-8 flex flex-col items-center gap-2">
                {serverProcessing ? (
                  <>
                    <Loader2 className="w-8 h-8 opacity-40 animate-spin text-emerald-400" />
                    <span>Pehli video ready hote hi yahan dikhegi…</span>
                  </>
                ) : (
                  <>
                    <Film className="w-8 h-8 opacity-20" />
                    <span>Processed videos appear here</span>
                  </>
                )}
              </div>
            )}
            {processedVideos.map((vid) => {
              const isImage = /\.(png|jpg|jpeg|webp)$/i.test(vid.name || '');
              return (
                <div
                  key={vid.id}
                  className="bg-indigo-500/[0.03] border border-indigo-500/[0.06] p-1.5 sm:p-2 rounded-lg flex justify-between items-center gap-2 hover:bg-indigo-500/[0.06] transition"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {isImage ? (
                      <Image className="w-3 h-3 text-pink-400 flex-shrink-0" />
                    ) : (
                      <Video className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    )}
                    <span className="text-[10px] sm:text-xs truncate text-gray-300">{vid.name}</span>
                  </div>
                  <button
                    onClick={() => downloadSingleVideo(vid.url, vid.name)}
                    className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 p-1 sm:p-1.5 rounded-lg transition flex-shrink-0 border border-blue-500/15"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
    </div>
  );
}

