import React, { useEffect, useState, useMemo } from 'react';
import {
  Film,
  Check,
  AlertCircle,
  Loader2,
  Video,
  Clock,
  Timer,
} from 'lucide-react';
import ExportVideoSettings from './ExportVideoSettings';
import RunControlsPanel from './RunControlsPanel';
import { resolveExportFps } from '../utils/exportSettings';
import { planVideoExportCount } from '../utils/exportJobPlanning';
import { buildExportVideoSlots } from '../utils/exportVideoSlots';
import { estimateBulkExportTiming } from '../utils/estimateBulkExport';
import { formatDurationHuman, formatDurationMs } from '../utils/formatExportTime';
import { buildExportMediaPairing } from '../utils/mediaPairing';

export default function ExportTab({
  activeTab,
  libsLoaded,
  config,
  setConfig,
  updateGlobalConfig,
  detectedVideoDims,
  detectedSourceFps,
  exportFileEstimate,
  estimatedExportDurationSec,
  getAutoExportSettings,
  voiceCaptionMap,
  videos,
  imageFiles,
  excelData,
  voiceFiles,
  imageSlideDurationSec = 2,
  videoMode = 'sequence',
  audioMode = 'sequence',
  imageMode = 'sequence',
  processing,
  finished,
  logs,
  progress,
  estimatedTime,
  zipFolderName,
  setZipFolderName,
  serverProcessing,
  serverProgress,
  serverJobType,
  serverJobMeta,
  startProcessing,
  startImageProcessing,
  handlePauseProcessing,
  handleStopProcessing,
  handleResetRun,
  isPaused,
  processedVideos,
}) {
  if (activeTab !== 'export') return null;

  const hasMedia = videos.length > 0 || imageFiles.length > 0 || voiceFiles.length > 0;
  const canExport = libsLoaded && (excelData.length > 0 || imageFiles.length > 0 || videos.length > 0 || voiceFiles.length > 0);
  const exportFps = resolveExportFps(config.video, detectedSourceFps);
  const plannedVideos = planVideoExportCount({
    excelData,
    config,
    voiceFiles,
    voiceCaptionMap,
    videos,
    imageFiles,
  });
  const fpsWarning =
    detectedSourceFps &&
    exportFps < detectedSourceFps - 2 &&
    config.video?.frameRateMode !== 'match'
      ? `Source video is ${detectedSourceFps} FPS. Exporting at ${exportFps} FPS may reduce motion smoothness.`
      : null;

  const isExporting = serverProcessing || processing;

  const bulkTiming = useMemo(
    () => {
      const pairing = buildExportMediaPairing({
        outputRows: plannedVideos,
        videoMode,
        audioMode,
        imageMode,
        videoCount: videos.length,
        voiceCount: voiceFiles.length,
        imageCount: imageFiles.length,
      });
      return estimateBulkExportTiming({
        excelData,
        config,
        voiceFiles,
        voiceCaptionMap,
        videos,
        imageFiles,
        imageSlideDurationSec,
        singleVideoContentSec: estimatedExportDurationSec?.final ?? null,
        parallelWorkers: serverJobMeta?.parallelJobs ?? 4,
        exportMediaPairing: pairing,
      });
    },
    [
      plannedVideos,
      excelData,
      config,
      voiceFiles,
      voiceCaptionMap,
      videos,
      imageFiles,
      imageSlideDurationSec,
      estimatedExportDurationSec,
      serverJobMeta?.parallelJobs,
      videoMode,
      audioMode,
      imageMode,
    ],
  );

  const [liveElapsedMs, setLiveElapsedMs] = useState(0);
  useEffect(() => {
    if (!isExporting) {
      setLiveElapsedMs(0);
      return;
    }
    const start = serverJobMeta?.exportStartedAt ?? Date.now();
    const tick = () => setLiveElapsedMs(Date.now() - start);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isExporting, serverJobMeta?.exportStartedAt]);

  const elapsedMs =
    !isExporting && serverJobMeta?.exportDurationMs != null
      ? serverJobMeta.exportDurationMs
      : serverJobMeta?.elapsedMs ?? liveElapsedMs;

  const progressSlots =
    serverJobMeta?.slots?.length > 0
      ? serverJobMeta.slots
      : isExporting
        ? buildExportVideoSlots({
            total: plannedVideos,
            completed: 0,
            outputFiles: [],
          })
        : [];

  const exportPathLabel = 'Server export (FFmpeg)';
  const exportPathDetail = 'Shared render-core → FFmpeg on backend. Requires backend running (npm start).';

  return (
    <div className="glass-card p-3 sm:p-4 rounded-xl space-y-3">
      <div className="flex items-center justify-between border-b border-indigo-500/[0.08] pb-2">
        <h3 className="text-xs sm:text-sm font-bold text-gray-300 flex items-center gap-2">
          <Film className="w-4 h-4 text-indigo-400" /> Export Video
        </h3>
        {finished && !isExporting && processedVideos.length > 0 && (
          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" /> Ready
          </span>
        )}
        {finished && !isExporting && processedVideos.length === 0 && (
          <span className="text-[9px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Failed
          </span>
        )}
      </div>

      {logs && /failed|error/i.test(logs) && processedVideos.length === 0 && !isExporting && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/25 text-[10px] text-red-200/90">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{logs}</span>
        </div>
      )}

      {!hasMedia && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-200/90">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Upload a video, images, or voice from the Upload tab before exporting.</span>
        </div>
      )}

      {hasMedia && plannedVideos > 0 && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-[10px] text-indigo-100/90">
          <Video className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
          {plannedVideos > 1
            ? `This export will create ${plannedVideos} videos — count is based on Excel rows and audio/captions (background videos cycle as ${videoMode === 'shuffle' ? 'shuffle' : 'sequence'}).`
            : 'This export will create 1 video — driven by your audio/captions or Excel row.'}
        </div>
      )}

      {bulkTiming && (
        <div className="rounded-xl border border-violet-500/20 bg-violet-950/20 p-3 space-y-2">
          <h4 className="text-[10px] font-semibold text-violet-200 uppercase tracking-wide flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Export time
          </h4>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
            <div className="flex justify-between col-span-2">
              <span className="text-gray-500">Videos</span>
              <span className="text-gray-200 font-mono">{bulkTiming.videoCount}</span>
            </div>
            <div className="flex justify-between col-span-2">
              <span className="text-gray-500">Total output duration</span>
              <span className="text-gray-200 font-mono">{formatDurationHuman(bulkTiming.totalContentSec)}</span>
            </div>
            {!isExporting && (
              <div className="flex justify-between col-span-2">
                <span className="text-gray-500">Est. processing time</span>
                <span className="text-violet-300 font-mono font-semibold">
                  ~{formatDurationHuman(bulkTiming.estimatedProcessingSec)}
                </span>
              </div>
            )}
            {isExporting && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">Elapsed</span>
                  <span className="text-amber-300 font-mono">{formatDurationMs(elapsedMs)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Est. remaining</span>
                  <span className="text-violet-300 font-mono">
                    {estimatedTime ? `~${estimatedTime}` : '—'}
                  </span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span className="text-gray-500">Est. total (all videos)</span>
                  <span className="text-gray-400 font-mono">
                    ~{formatDurationHuman(bulkTiming.estimatedProcessingSec)}
                  </span>
                </div>
              </>
            )}
            {!isExporting && finished && serverJobMeta?.exportDurationMs != null && (
              <div className="flex justify-between col-span-2 pt-1.5 border-t border-emerald-500/20">
                <span className="text-emerald-400/90 flex items-center gap-1">
                  <Timer className="w-3 h-3" /> System took
                </span>
                <span className="text-emerald-300 font-mono font-semibold">
                  {formatDurationMs(serverJobMeta.exportDurationMs)}
                </span>
              </div>
            )}
          </div>
          {!isExporting && bulkTiming.videoCount > 1 && (
            <p className="text-[9px] text-gray-500 leading-relaxed">
              Estimate assumes {bulkTiming.parallelWorkers} parallel workers on the server. Actual time varies with resolution, effects, and hardware.
            </p>
          )}
        </div>
      )}

      <ExportVideoSettings
        config={config}
        updateGlobalConfig={updateGlobalConfig}
        setConfig={setConfig}
        detectedVideoDims={detectedVideoDims}
        detectedSourceFps={detectedSourceFps}
        exportFileEstimate={exportFileEstimate}
        estimatedExportDurationSec={estimatedExportDurationSec}
        getAutoExportSettings={getAutoExportSettings}
        exportPathLabel={exportPathLabel}
        exportPathDetail={exportPathDetail}
        fpsWarning={fpsWarning}
      />

      <RunControlsPanel
        processing={processing}
        finished={finished}
        libsLoaded={libsLoaded}
        logs={logs}
        progress={progress}
        estimatedTime={estimatedTime}
        config={config}
        zipFolderName={zipFolderName}
        setZipFolderName={setZipFolderName}
        serverProcessing={serverProcessing}
        serverProgress={serverProgress}
        serverJobType={serverJobType}
        serverEstimatedTime={serverProcessing ? estimatedTime : null}
        serverJobMeta={serverJobMeta}
        startProcessing={startProcessing}
        startImageProcessing={startImageProcessing}
        handlePauseProcessing={handlePauseProcessing}
        handleStopProcessing={handleStopProcessing}
        handleResetRun={handleResetRun}
        isPaused={isPaused}
        excelData={excelData}
        imageFiles={imageFiles}
        videos={videos}
        exportButtonLabel="Export now"
        hideImageButton
      />

      {/* Per-video progress — left panel only, shown after Export now */}
      {isExporting && progressSlots.length > 0 && (
        <div className="rounded-xl border border-indigo-500/15 bg-indigo-950/20 p-3 space-y-2">
          <h4 className="text-[10px] font-semibold text-indigo-200 uppercase tracking-wide">
            Video progress ({progressSlots.filter((s) => s.status === 'ready').length}/{progressSlots.length} done)
          </h4>
          <ul className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar">
            {progressSlots.map((slot) => (
              <li
                key={slot.index}
                className="p-2 rounded-lg bg-black/30 border border-gray-700/40"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    {slot.status === 'ready' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : slot.status === 'processing' ? (
                      <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
                    ) : (
                      <Video className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    )}
                    <span className="text-[10px] text-gray-300 truncate">{slot.name}</span>
                  </div>
                  <span className="text-[9px] font-mono tabular-nums shrink-0 text-gray-400">
                    {slot.status === 'ready'
                      ? 'Done'
                      : slot.status === 'pending'
                        ? 'Pending'
                        : `${slot.progress}%`}
                  </span>
                </div>
                {slot.status !== 'pending' && (
                  <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        slot.status === 'ready'
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-amber-500 to-orange-400'
                      }`}
                      style={{ width: `${slot.status === 'ready' ? 100 : Math.max(4, slot.progress)}%` }}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
          <p className="text-[9px] text-gray-500 text-center">
            Completed videos appear in the right panel for download.
          </p>
        </div>
      )}

      {isExporting && (
        <p className="text-[9px] text-center text-gray-500 flex items-center justify-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Server is rendering your video…
        </p>
      )}

      {!canExport && hasMedia && (
        <p className="text-[9px] text-gray-600 text-center">Loading libraries…</p>
      )}
    </div>
  );
}
