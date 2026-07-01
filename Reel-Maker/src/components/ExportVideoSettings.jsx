import React from 'react';
import { Film, Server, Monitor } from 'lucide-react';
import {
  EXPORT_PRESETS,
  EXPORT_QUALITY_TIERS,
  EXPORT_RESOLUTIONS,
  EXPORT_FPS_OPTIONS,
  EXPORT_BITRATE_PRESETS,
  EXPORT_FORMATS,
  applyExportPresetToVideo,
  formatDurationShort,
  isLandscapeAspect,
  resolutionToAspectRatio,
  inferExportResolution,
} from '../utils/exportSettings';

export default function ExportVideoSettings({
  config,
  updateGlobalConfig,
  setConfig,
  detectedVideoDims,
  detectedSourceFps,
  exportFileEstimate,
  estimatedExportDurationSec,
  getAutoExportSettings,
  exportPathLabel,
  exportPathDetail,
  fpsWarning,
}) {
  const v = config.video || {};
  const landscape = isLandscapeAspect(v.aspectRatio);
  const exportRes = v.exportResolution || inferExportResolution(v.aspectRatio);

  const applyPreset = (presetId) => {
    setConfig((prev) => ({
      ...prev,
      video: applyExportPresetToVideo(prev.video || {}, presetId),
    }));
  };

  const setResolution = (resId) => {
    const ar = resolutionToAspectRatio(resId, landscape);
    updateGlobalConfig('video', 'exportResolution', resId);
    updateGlobalConfig('video', 'aspectRatio', ar);
    updateGlobalConfig('video', 'exportPreset', 'custom');
  };

  const effectiveFps = exportFileEstimate?.fps ?? (v.frameRateMode === 'match' ? detectedSourceFps : v.fps) ?? 30;
  const estMbps = exportFileEstimate?.vMbps ?? getAutoExportSettings().vBitrate;
  const estMb = exportFileEstimate?.mb;
  const estDur = estimatedExportDurationSec?.final;

  return (
    <div className="space-y-3">
      {/* Source media info */}
      <div className="rounded-lg bg-black/40 border border-gray-700/60 p-2.5 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
          <Monitor className="w-3.5 h-3.5" /> Source media
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
          <div className="flex justify-between">
            <span className="text-gray-500">Resolution</span>
            <span className="text-gray-200 font-mono">
              {detectedVideoDims ? `${detectedVideoDims.width}×${detectedVideoDims.height}` : '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Source FPS</span>
            <span className="text-gray-200 font-mono">{detectedSourceFps || '—'}</span>
          </div>
          {estDur != null && (
            <div className="flex justify-between col-span-2">
              <span className="text-gray-500">Duration (est.)</span>
              <span className="text-gray-200">{formatDurationShort(estDur)}</span>
            </div>
          )}
        </div>
        {fpsWarning && (
          <p className="text-[9px] text-amber-400/90 leading-relaxed border-t border-amber-500/20 pt-1.5 mt-1">
            {fpsWarning}
          </p>
        )}
      </div>

      {/* Export path */}
      <div className="rounded-lg bg-emerald-950/30 border border-emerald-500/25 p-2.5">
        <div className="flex items-center gap-2 text-[10px] text-emerald-200">
          <Server className="w-3.5 h-3.5" />
          <span className="font-semibold">{exportPathLabel}</span>
        </div>
        <p className="text-[9px] text-gray-500 mt-1 leading-relaxed">{exportPathDetail}</p>
      </div>

      {/* Editor-style settings */}
      <div className="bg-gradient-to-br from-indigo-950/40 to-gray-900/60 p-2.5 rounded-lg border border-indigo-500/20 space-y-2.5">
        <label className="text-xs text-indigo-200 font-semibold flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5" /> Export settings
        </label>

        <div>
          <label className="text-[10px] text-gray-500 block mb-0.5">Preset</label>
          <select
            className="w-full bg-gray-800 border border-gray-700 rounded text-xs p-1.5"
            value={v.exportPreset || 'instagram_reel'}
            onChange={(e) => applyPreset(e.target.value)}
          >
            {EXPORT_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-500 block mb-0.5">Resolution</label>
            <select
              className="w-full bg-gray-700 border-none rounded text-[10px] p-1.5"
              value={exportRes}
              onChange={(e) => setResolution(e.target.value)}
            >
              {EXPORT_RESOLUTIONS.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-0.5">Frame rate</label>
            <select
              className="w-full bg-gray-700 border-none rounded text-[10px] p-1.5"
              value={v.frameRateMode === 'match' ? 'match' : `manual:${v.fps || 30}`}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'match') {
                  updateGlobalConfig('video', 'frameRateMode', 'match');
                  updateGlobalConfig('video', 'useSourceFps', true);
                } else {
                  const fps = parseInt(val.split(':')[1], 10) || 30;
                  updateGlobalConfig('video', 'frameRateMode', 'manual');
                  updateGlobalConfig('video', 'useSourceFps', false);
                  updateGlobalConfig('video', 'fps', fps);
                }
                updateGlobalConfig('video', 'exportPreset', 'custom');
              }}
            >
              <option value="match">Match source ({detectedSourceFps || 30})</option>
              {EXPORT_FPS_OPTIONS.map((f) => (
                <option key={f} value={`manual:${f}`}>{f} fps{f === 30 ? ' (Default)' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-500 block mb-0.5">Quality</label>
            <select
              className="w-full bg-gray-700 border-none rounded text-[10px] p-1.5"
              value={v.exportQuality || 'high'}
              onChange={(e) => {
                updateGlobalConfig('video', 'exportQuality', e.target.value);
                updateGlobalConfig('video', 'exportPreset', 'custom');
              }}
            >
              {EXPORT_QUALITY_TIERS.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-0.5">Format</label>
            <select
              className="w-full bg-gray-700 border-none rounded text-[10px] p-1.5"
              value={v.format || 'mp4'}
              onChange={(e) => {
                updateGlobalConfig('video', 'format', e.target.value);
                updateGlobalConfig('video', 'exportPreset', 'custom');
              }}
            >
              {EXPORT_FORMATS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-500 block mb-0.5">Codec</label>
            <select
              className="w-full bg-gray-700 border-none rounded text-[10px] p-1.5"
              value={v.videoCodec || 'h264'}
              onChange={(e) => {
                updateGlobalConfig('video', 'videoCodec', e.target.value);
                updateGlobalConfig('video', 'exportPreset', 'custom');
              }}
            >
              <option value="h264">H.264 (Default)</option>
              <option value="h265">H.265 / HEVC</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-0.5">Bitrate</label>
            <select
              className="w-full bg-gray-700 border-none rounded text-[10px] p-1.5"
              value={v.videoBitrateMode === 'custom' ? `custom:${v.videoBitrateCustom || 12}` : 'auto'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'auto') {
                  updateGlobalConfig('video', 'videoBitrateMode', 'auto');
                } else {
                  const mbps = parseInt(val.split(':')[1], 10) || 12;
                  updateGlobalConfig('video', 'videoBitrateMode', 'custom');
                  updateGlobalConfig('video', 'videoBitrateCustom', mbps);
                }
                updateGlobalConfig('video', 'exportPreset', 'custom');
              }}
            >
              <option value="auto">Auto</option>
              {EXPORT_BITRATE_PRESETS.map((b) => (
                <option key={b} value={`custom:${b}`}>{b} Mbps</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-gray-500 block mb-0.5">Timeline speed</label>
          <select
            className="w-full bg-gray-700 border-none rounded text-[10px] p-1.5"
            value={String(v.exportSpeed ?? 1)}
            onChange={(e) => updateGlobalConfig('video', 'exportSpeed', parseFloat(e.target.value))}
          >
            <option value="0.25">0.25×</option>
            <option value="0.5">0.5×</option>
            <option value="0.75">0.75×</option>
            <option value="1">1× Normal</option>
            <option value="1.25">1.25×</option>
            <option value="1.5">1.5×</option>
            <option value="2">2×</option>
            <option value="4">4×</option>
          </select>
        </div>

        <div className="rounded-lg bg-black/40 border border-gray-700/60 p-2 text-[10px] text-gray-300 space-y-0.5">
          <div className="flex justify-between">
            <span className="text-gray-500">Export FPS</span>
            <span className="text-indigo-200 font-semibold">{effectiveFps} fps</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Video bitrate</span>
            <span className="text-emerald-300">{estMbps.toFixed(1)} Mbps</span>
          </div>
          {estDur != null && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span>{formatDurationShort(estDur)}</span>
              </div>
              {estMb != null && (
                <div className="flex justify-between font-medium text-indigo-200">
                  <span>Est. file size</span>
                  <span>~{estMb < 1 ? `${(estMb * 1024).toFixed(0)} KB` : `${estMb.toFixed(1)} MB`}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
