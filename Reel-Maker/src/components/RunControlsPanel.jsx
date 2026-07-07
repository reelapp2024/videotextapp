import React from 'react';
import { Check, Clock, FolderInput, Image, Loader2, Pause, PlayCircle, Square, Zap } from 'lucide-react';

export default function RunControlsPanel({
  processing,
  finished,
  libsLoaded,
  logs,
  progress,
  estimatedTime,
  config,
  zipFolderName,
  setZipFolderName,
  serverProcessing,
  serverProgress,
  serverJobType,
  serverEstimatedTime,
  serverJobMeta,
  startProcessing,
  startImageProcessing,
  handlePauseProcessing,
  handleStopProcessing,
  handleResetRun,
  isPaused,
  excelData,
  imageFiles,
  videos,
  exportButtonLabel = 'Export now',
  hideImageButton = false,
}) {
  const isActive = processing || serverProcessing;
  const activeProgress = serverProcessing ? serverProgress : progress;
  const activeEta = serverProcessing ? serverEstimatedTime : estimatedTime;

  return (
    <>
      {/* Overall progress — single bar, shown only after export starts */}
      {isActive && (
        <div className="relative rounded-xl overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-violet-500/30 to-indigo-600/0 animate-shimmer" />
          </div>
          <div className="glass-card rounded-xl p-3 sm:p-4 border-indigo-500/20 shadow-lg shadow-indigo-950/40 transition-all duration-500">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-5 h-5 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
                </div>
                <span className="text-[10px] sm:text-xs font-sans font-semibold uppercase tracking-widest text-indigo-300/60">
                  {serverJobType === 'tts' ? 'TTS Processing' : 'Exporting'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {activeEta && (
                  <span className="text-[9px] text-violet-300/70 font-mono flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> ~{activeEta}
                  </span>
                )}
                <span className="text-sm font-bold font-mono tabular-nums text-indigo-300">
                  {activeProgress}%
                </span>
              </div>
            </div>

            <div className="relative h-2.5 bg-[#0a0e1a] rounded-full overflow-hidden border border-indigo-500/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out relative bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-500"
                style={{ width: `${activeProgress}%` }}
              >
                {activeProgress < 100 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer rounded-full" />
                )}
              </div>
            </div>

            {(serverJobType === 'video' || serverJobType === 'slideshow') && serverJobMeta?.total > 1 && (
              <p className="text-[10px] text-indigo-300/60 text-center font-mono mt-2">
                {serverJobMeta.completed ?? 0} / {serverJobMeta.total} videos complete — {activeProgress}% overall
              </p>
            )}

            <p className="text-[10px] text-gray-400 flex items-center gap-1.5 truncate font-sans mt-2">
              <Loader2 className="w-3 h-3 animate-spin flex-shrink-0 text-indigo-400" />
              <span className="truncate">{logs}</span>
            </p>
          </div>
        </div>
      )}

      {/* ZIP FOLDER NAME */}
      <div className="flex items-center gap-2 bg-[#080b16]/60 p-2 rounded-xl border border-indigo-500/[0.08]">
        <FolderInput className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        <input
          type="text"
          value={zipFolderName}
          onChange={(e) => setZipFolderName(e.target.value)}
          className="flex-1 bg-transparent border-none text-xs text-gray-300 focus:outline-none placeholder:text-gray-600"
          placeholder="Output folder name"
        />
      </div>

      {/* ACTION BUTTONS */}
      <div className="space-y-2">
        {!processing && !finished && !serverProcessing ? (
          <>
            <button
              onClick={startProcessing}
              disabled={!libsLoaded || (excelData.length === 0 && imageFiles.length === 0 && videos.length === 0)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:via-violet-500 hover:to-purple-500 text-white disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/25 ring-1 ring-white/10 disabled:ring-0 disabled:shadow-none"
            >
              <Zap className="w-4 h-4" /> {exportButtonLabel}
            </button>
            {!hideImageButton && (
              <button
                onClick={startImageProcessing}
                disabled={!libsLoaded || (excelData.length === 0 && imageFiles.length === 0)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl font-semibold text-sm bg-indigo-500/[0.05] hover:bg-indigo-500/[0.08] text-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-all border border-indigo-500/[0.1] hover:border-indigo-500/[0.15]"
              >
                <Image className="w-4 h-4" /> Generate Images
              </button>
            )}
          </>
        ) : processing ? (
          <div className="flex gap-2">
            <button
              onClick={handlePauseProcessing}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 transition border border-amber-500/15"
            >
              {isPaused ? (
                <>
                  <PlayCircle className="w-4 h-4" /> Resume
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" /> Pause
                </>
              )}
            </button>
            <button
              onClick={handleStopProcessing}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs bg-red-500/15 hover:bg-red-500/25 text-red-300 transition border border-red-500/15"
            >
              <Square className="w-4 h-4" /> Stop
            </button>
          </div>
        ) : serverProcessing ? (
          <button
            onClick={handleStopProcessing}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-red-500/15 hover:bg-red-500/25 text-red-300 transition border border-red-500/15"
          >
            <Square className="w-4 h-4" /> Stop export
          </button>
        ) : finished ? (
          <button
            onClick={handleResetRun}
            className="w-full bg-indigo-500/[0.05] hover:bg-indigo-500/[0.08] text-gray-300 px-4 py-2.5 rounded-xl font-semibold text-sm transition border border-indigo-500/[0.1] flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400" /> New export
          </button>
        ) : null}
      </div>
    </>
  );
}
