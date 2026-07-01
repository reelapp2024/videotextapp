import React from 'react';
import { Check, Clock, Download, FolderInput, Image, Loader2, Pause, PlayCircle, Square, Zap } from 'lucide-react';

export default function RunControlsPanel({
  processing,
  finished,
  libsLoaded,
  logs,
  progress,
  estimatedTime,
  parallelProgress,
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
  exportButtonLabel = 'Download Video',
  hideImageButton = false,
}) {
  return (
    <>
      {/* STATUS - Always Visible */}
      <div className="relative rounded-xl overflow-hidden">
        {(processing || serverProcessing) && (
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-violet-500/30 to-indigo-600/0 animate-shimmer" />
          </div>
        )}
        <div
          className={`glass-card rounded-xl p-3 sm:p-4 ${processing || serverProcessing ? 'border-indigo-500/20 shadow-lg shadow-indigo-950/40' : ''} transition-all duration-500`}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              {processing || serverProcessing ? (
                <div className="relative">
                  <div className="w-5 h-5 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
                  <div
                    className="absolute inset-0.5 w-4 h-4 rounded-full border border-violet-500/20 border-b-violet-400 animate-spin"
                    style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
                  />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/10 flex items-center justify-center">
                  {finished ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Zap className="w-2.5 h-2.5 text-indigo-400/50" />}
                </div>
              )}
              <span className="text-[10px] sm:text-xs font-sans font-semibold uppercase tracking-widest text-indigo-300/60">
                {processing || serverProcessing ? 'Processing' : finished ? 'Complete' : 'Ready'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {processing && estimatedTime && (
                <span className="text-[9px] text-violet-300/70 font-mono flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> ~{estimatedTime}
                </span>
              )}
              <span
                className={`text-sm font-bold font-mono tabular-nums ${(serverProcessing ? serverProgress : progress) >= 100 ? 'text-emerald-400' : 'text-indigo-300'} transition-colors`}
              >
                {serverProcessing ? serverProgress : progress}%
              </span>
            </div>
          </div>

          <div className="relative h-2.5 bg-[#0a0e1a] rounded-full overflow-hidden border border-indigo-500/[0.06]">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out relative ${
                progress >= 100
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500'
                  : 'bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-500'
              }`}
              style={{ width: `${serverProcessing ? serverProgress : progress}%` }}
            >
              {(processing || serverProcessing) && (serverProcessing ? serverProgress : progress) < 100 && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer rounded-full" />
              )}
            </div>
            {(processing || serverProcessing) && (serverProcessing ? serverProgress : progress) > 0 && (serverProcessing ? serverProgress : progress) < 100 && (
              <div
                className="absolute top-0 h-full w-1 bg-white/40 rounded-full blur-[1px]"
                style={{ left: `${serverProcessing ? serverProgress : progress}%`, transform: 'translateX(-50%)' }}
              />
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1.5 truncate font-sans flex-1 min-w-0">
              {(processing || serverProcessing || !libsLoaded) && <Loader2 className="w-3 h-3 animate-spin flex-shrink-0 text-indigo-400" />}
              <span className="truncate">{logs}</span>
            </p>
          </div>

          {processing && Object.keys(parallelProgress).length > 1 && (
            <div className="mt-3 pt-3 border-t border-indigo-500/[0.06] font-sans">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[9px] text-indigo-300/50 font-semibold uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="w-2.5 h-2.5 text-violet-400" />
                  Parallel Jobs
                </p>
                <span className="text-[9px] text-indigo-400/50 font-mono">{config.parallelJobs}x</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-28 overflow-y-auto">
                {Object.entries(parallelProgress)
                  .filter(([, v]) => v.status === 'encoding' || v.status === 'done')
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([idx, v]) => {
                    const isDone = v.status === 'done' || v.pct >= 100;
                    return (
                      <div
                        key={idx}
                        className={`rounded-lg px-2 py-1.5 transition-all duration-300 ${
                          isDone ? 'bg-emerald-500/[0.06] border border-emerald-500/10' : 'bg-indigo-500/[0.04] border border-indigo-500/[0.07]'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[8px] text-gray-500 font-semibold">#{Number(idx) + 1}</span>
                          {isDone ? (
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                          ) : (
                            <span className="text-[8px] text-indigo-300 font-mono tabular-nums font-bold">{v.pct}%</span>
                          )}
                        </div>
                        <div className="h-1 bg-[#0a0e1a] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isDone ? 'bg-emerald-400' : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                            }`}
                            style={{ width: `${v.pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

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

      {/* SERVER PROCESSING INDICATOR */}
      {serverProcessing && (
        <div className="bg-gradient-to-br from-emerald-500/[0.05] to-cyan-500/[0.03] border border-emerald-500/10 p-3 rounded-xl space-y-2.5">
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs text-emerald-300/80 font-medium flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              {serverJobType === 'tts'
                ? 'TTS generating on server…'
                : serverJobType === 'video' || serverJobType === 'slideshow'
                  ? 'Video generate ho rahi hai…'
                  : 'Processing on server…'}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {serverEstimatedTime && (
                <span className="text-[10px] text-emerald-200/70 font-mono flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> ~{serverEstimatedTime} left
                </span>
              )}
              <span className="text-xs text-emerald-400 font-bold tabular-nums">{serverProgress}%</span>
            </div>
          </div>
          <div className="relative h-2.5 bg-emerald-500/[0.08] rounded-full overflow-hidden border border-emerald-500/10">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500 ease-out rounded-full shadow-sm shadow-emerald-500/20 relative"
              style={{ width: `${Math.max(2, serverProgress)}%` }}
            >
              {serverProgress > 0 && serverProgress < 100 && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 animate-shimmer rounded-full" />
              )}
            </div>
          </div>
          {(serverJobType === 'video' || serverJobType === 'slideshow') && serverJobMeta?.total > 0 && (
            <p className="text-[10px] text-emerald-300/60 text-center font-mono">
              {serverJobMeta.completed}/{serverJobMeta.total} video ready — panel mein download karo
            </p>
          )}
          <p className="text-[10px] text-gray-500 text-center">
            {serverJobType === 'tts'
              ? 'Audios ready hote hi list mein dikhengi'
              : 'Har video ready hote hi right panel mein download ke liye aa jayegi'}
          </p>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="space-y-2">
        {!processing && !finished && !serverProcessing ? (
          <>
            <button
              onClick={startProcessing}
              disabled={!libsLoaded || (excelData.length === 0 && imageFiles.length === 0 && videos.length === 0)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:via-violet-500 hover:to-purple-500 text-white disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/25 ring-1 ring-white/10 disabled:ring-0 disabled:shadow-none"
            >
              <Download className="w-4 h-4" /> {exportButtonLabel} {config.parallelJobs > 1 ? `[${config.parallelJobs}x]` : ''}
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
            <Square className="w-4 h-4" /> Stop generation
          </button>
        ) : finished ? (
          <button
            onClick={handleResetRun}
            className="w-full bg-indigo-500/[0.05] hover:bg-indigo-500/[0.08] text-gray-300 px-4 py-2.5 rounded-xl font-semibold text-sm transition border border-indigo-500/[0.1]"
          >
            Reset
          </button>
        ) : null}
      </div>
    </>
  );
}

