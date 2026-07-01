import React from 'react';
import {
  Download,
  Film,
  Check,
  AlertCircle,
  Loader2,
  FolderArchive,
  Video,
} from 'lucide-react';
import ExportVideoSettings from './ExportVideoSettings';
import RunControlsPanel from './RunControlsPanel';
import { resolveExportFps } from '../utils/exportSettings';

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
  // run controls
  processing,
  finished,
  logs,
  progress,
  estimatedTime,
  parallelProgress,
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
  downloadSingleVideo,
  downloadAllZip,
}) {
  if (activeTab !== 'export') return null;

  const hasMedia = videos.length > 0 || imageFiles.length > 0 || voiceFiles.length > 0;
  const canExport = libsLoaded && (excelData.length > 0 || imageFiles.length > 0 || videos.length > 0 || voiceFiles.length > 0);
  const exportFps = resolveExportFps(config.video, detectedSourceFps);
  const fpsWarning =
    detectedSourceFps &&
    exportFps < detectedSourceFps - 2 &&
    config.video?.frameRateMode !== 'match'
      ? `Source video is ${detectedSourceFps} FPS. Exporting at ${exportFps} FPS may reduce motion smoothness.`
      : null;

  const exportPathLabel = 'Server export (FFmpeg)';
  const exportPathDetail = 'Shared render-core → FFmpeg on backend. Requires backend running (npm start).';

  return (
    <div className="glass-card p-3 sm:p-4 rounded-xl space-y-3">
      <div className="flex items-center justify-between border-b border-indigo-500/[0.08] pb-2">
        <h3 className="text-xs sm:text-sm font-bold text-gray-300 flex items-center gap-2">
          <Film className="w-4 h-4 text-indigo-400" /> Export Video
        </h3>
        {finished && !processing && !serverProcessing && processedVideos.length > 0 && (
          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" /> Ready
          </span>
        )}
        {finished && !processing && !serverProcessing && processedVideos.length === 0 && (
          <span className="text-[9px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Failed
          </span>
        )}
      </div>

      {logs && /failed|error/i.test(logs) && processedVideos.length === 0 && !processing && !serverProcessing && (
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

      {/* Parallel jobs */}
      <div className="bg-gray-900/50 p-2 rounded border border-gray-700/50">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-300 font-semibold">Parallel exports</span>
          <span className="text-[10px] bg-indigo-600/30 text-indigo-300 px-1.5 py-0.5 rounded">
            {config.parallelJobs} at once
          </span>
        </div>
        <input
          type="range"
          min="1"
          max={Math.min(8, navigator.hardwareConcurrency || 4)}
          step="1"
          value={config.parallelJobs}
          onChange={(e) => updateGlobalConfig('parallelJobs', '', parseInt(e.target.value, 10))}
          className="w-full h-1.5 accent-indigo-500"
        />
      </div>

      {/* Progress + export actions */}
      <RunControlsPanel
        processing={processing}
        finished={finished}
        libsLoaded={libsLoaded}
        logs={logs}
        progress={progress}
        estimatedTime={estimatedTime}
        parallelProgress={parallelProgress}
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
        exportButtonLabel="Export Video"
        hideImageButton
      />

      {/* Downloads */}
      {processedVideos.length > 0 && (
        <div className="rounded-xl border border-indigo-500/15 bg-indigo-950/20 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-semibold text-indigo-200 uppercase tracking-wide flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Downloads
            </h4>
            {processedVideos.length > 1 && (
              <button
                type="button"
                onClick={downloadAllZip}
                className="text-[9px] px-2 py-1 rounded bg-indigo-600/30 text-indigo-200 hover:bg-indigo-600/50 transition flex items-center gap-1"
              >
                <FolderArchive className="w-3 h-3" /> ZIP all
              </button>
            )}
          </div>

          <ul className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
            {processedVideos.map((pv, i) => (
                <li
                  key={pv.url || i}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/30 border border-gray-700/40"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Video className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="text-[10px] text-gray-300 truncate">{pv.name || `video_${i + 1}.mp4`}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadSingleVideo(pv.url, pv.name)}
                    className="shrink-0 text-[9px] px-2.5 py-1 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:from-indigo-500 hover:to-violet-500 transition flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Save
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}

      {(processing || serverProcessing) && (
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
