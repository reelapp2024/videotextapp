import React from 'react';
import { Sliders, Image } from 'lucide-react';
import BackgroundImagesSection from './BackgroundImagesSection';
import BackgroundVideosSection from './BackgroundVideosSection';
import BackgroundEffectsPanel from './settings/BackgroundEffectsPanel';

export default function OutputSettingsPanel({
  config,
  updateGlobalConfig,
  detectedVideoDims,
  getAutoExportSettings,
  setConfig,
  BACKGROUND_PATTERN_PRESETS,
}) {
  return (
    <div className="glass-card p-3 sm:p-4 rounded-xl space-y-3 w-full min-w-0">
      <h3 className="text-xs sm:text-sm font-bold text-gray-300 flex items-center gap-2 border-b border-indigo-500/[0.08] pb-2">
        <Sliders className="w-4 h-4" /> Output Settings
      </h3>

      <p className="text-[9px] text-indigo-300/70 bg-indigo-500/10 border border-indigo-500/15 rounded-lg px-2 py-1.5">
        Video export (resolution, FPS, quality, download) is on the <strong>Export</strong> tab in the top nav.
        Parallel export workers are configured on the server via <code className="text-indigo-200">EXPORT_WORKER_CONCURRENCY</code> in backend .env (default 4).
      </p>

      {/* ASPECT RATIO */}
      <div className="bg-gray-900/50 p-2 rounded border border-gray-700/50">
        <label className="text-xs text-gray-400 block mb-1.5">Aspect Ratio</label>
        <select
          className="w-full bg-gray-700 border-none rounded text-xs p-1.5 mb-2"
          value={config.video.aspectRatio}
          onChange={(e) => updateGlobalConfig('video', 'aspectRatio', e.target.value)}
          disabled={config.video.useVideoAspectRatio}
        >
          <option value="1080x1920">1080 x 1920 (Portrait)</option>
          <option value="720x1280">720 x 1280 (Portrait)</option>
          <option value="1920x1080">1920 x 1080 (Landscape)</option>
          <option value="1280x720">1280 x 720 (Landscape)</option>
          <option value="1:1">1:1 (Square - 1080x1080)</option>
          <option value="2:3">2:3 (1080x1620)</option>
          <option value="4:5">4:5 (1080x1350)</option>
        </select>
        <label className="text-[10px] flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={config.video.useVideoAspectRatio || false}
            onChange={(e) => updateGlobalConfig('video', 'useVideoAspectRatio', e.target.checked)}
            className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-0 w-3 h-3"
          />
          <span className={config.video.useVideoAspectRatio ? 'text-indigo-300' : 'text-gray-500'}>Use uploaded video's aspect ratio</span>
        </label>
        {config.video.useVideoAspectRatio && detectedVideoDims && (
          <p className="text-[9px] text-green-400/80 mt-1">
            Detected: {detectedVideoDims.width} x {detectedVideoDims.height}
          </p>
        )}
        {config.video.useVideoAspectRatio && !detectedVideoDims && (
          <p className="text-[9px] text-yellow-400/80 mt-1">Upload a video to auto-detect its aspect ratio</p>
        )}
      </div>

      {/* IMAGE SETTINGS */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Image Format</label>
          <select
            className="w-full bg-gray-700 border-none rounded text-xs p-1"
            value={config.imageFormat || 'png'}
            onChange={(e) => updateGlobalConfig('root', 'imageFormat', e.target.value)}
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Image Ratio</label>
          <select
            className="w-full bg-gray-700 border-none rounded text-xs p-1"
            value={config.imageAspectRatio || '1080x1920'}
            onChange={(e) => updateGlobalConfig('root', 'imageAspectRatio', e.target.value)}
          >
            <option value="1080x1920">1080 x 1920</option>
            <option value="720x1280">720 x 1280</option>
            <option value="1920x1080">1920 x 1080</option>
            <option value="1280x720">1280 x 720</option>
            <option value="1:1">1:1</option>
            <option value="2:3">2:3</option>
            <option value="4:5">4:5</option>
          </select>
        </div>
      </div>

      {/* AUDIO EXPORT SETTINGS */}
      <div className="bg-gray-900/50 p-2 rounded border border-gray-700/50 space-y-2">
        <label className="text-xs text-indigo-300 block font-semibold">Audio Export Settings</label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] text-gray-400 block mb-0.5">Audio Bitrate (kbps)</label>
            <div className="flex flex-col gap-0.5">
              <select
                className="bg-gray-700 border-none rounded text-[10px] p-0.5"
                value={config.video.audioBitrateMode || 'auto'}
                onChange={(e) => updateGlobalConfig('video', 'audioBitrateMode', e.target.value)}
              >
                <option value="auto">Auto</option>
                <option value="custom">Custom</option>
              </select>
              {config.video.audioBitrateMode === 'custom' ? (
                <select
                  className="bg-gray-700 border-none rounded text-[10px] p-0.5"
                  value={config.video.audioBitrateCustom || 192}
                  onChange={(e) => updateGlobalConfig('video', 'audioBitrateCustom', parseInt(e.target.value))}
                >
                  <option value={64}>64 kbps</option>
                  <option value={96}>96 kbps</option>
                  <option value={128}>128 kbps</option>
                  <option value={192}>192 kbps</option>
                  <option value={256}>256 kbps</option>
                  <option value={320}>320 kbps</option>
                </select>
              ) : (
                <span className="text-[10px] text-green-400">{getAutoExportSettings().aBitrate} kbps</span>
              )}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-0.5">Channels</label>
            <div className="flex flex-col gap-0.5">
              <select
                className="bg-gray-700 border-none rounded text-[10px] p-0.5"
                value={config.video.audioChannels || 'auto'}
                onChange={(e) => updateGlobalConfig('video', 'audioChannels', e.target.value)}
              >
                <option value="auto">Auto</option>
                <option value="custom">Custom</option>
              </select>
              {config.video.audioChannels === 'custom' ? (
                <select
                  className="bg-gray-700 border-none rounded text-[10px] p-0.5"
                  value={config.video.audioChannelsCustom || 2}
                  onChange={(e) => updateGlobalConfig('video', 'audioChannelsCustom', parseInt(e.target.value))}
                >
                  <option value={1}>Mono (1)</option>
                  <option value={2}>Stereo (2)</option>
                </select>
              ) : (
                <span className="text-[10px] text-green-400">{getAutoExportSettings().aChannels === 2 ? 'Stereo' : 'Mono'}</span>
              )}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-0.5">Sample Rate</label>
            <div className="flex flex-col gap-0.5">
              <select
                className="bg-gray-700 border-none rounded text-[10px] p-0.5"
                value={config.video.audioSampleRateMode || 'auto'}
                onChange={(e) => updateGlobalConfig('video', 'audioSampleRateMode', e.target.value)}
              >
                <option value="auto">Auto</option>
                <option value="custom">Custom</option>
              </select>
              {config.video.audioSampleRateMode === 'custom' ? (
                <select
                  className="bg-gray-700 border-none rounded text-[10px] p-0.5"
                  value={config.video.audioSampleRateCustom || 48000}
                  onChange={(e) => updateGlobalConfig('video', 'audioSampleRateCustom', parseInt(e.target.value))}
                >
                  <option value={22050}>22050 Hz</option>
                  <option value={44100}>44100 Hz</option>
                  <option value={48000}>48000 Hz</option>
                </select>
              ) : (
                <span className="text-[10px] text-green-400">{getAutoExportSettings().aSampleRate} Hz</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Volume Sliders */}
      <div className="space-y-2 pt-2">
        <div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Video Opacity</span>
            <span>{Math.round(config.video.opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.video.opacity}
            onChange={(e) => updateGlobalConfig('video', 'opacity', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-600 rounded-lg"
          />
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Video Zoom</span>
            <span>{Math.round((config.video.zoomScale ?? 1) * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={config.video.zoomScale ?? 1}
            onChange={(e) => updateGlobalConfig('video', 'zoomScale', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-600 rounded-lg"
            title="100% = full, lower = zoom out, higher = zoom in, ratio maintained"
          />
          <p className="text-[9px] text-gray-500">50–150%, ratio same</p>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-400">Video Volume</span>
            <button
              type="button"
              onClick={() => updateGlobalConfig('video', 'volumeEnabled', !(config.video.volumeEnabled !== false))}
              className={`text-[10px] px-2 py-0.5 rounded ${(config.video.volumeEnabled !== false) ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-400'}`}
            >
              {(config.video.volumeEnabled !== false) ? 'ON' : 'OFF'}
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.video.volume}
            onChange={(e) => updateGlobalConfig('video', 'volume', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-600 rounded-lg"
            disabled={config.video.volumeEnabled === false}
          />
          <span className="text-[9px] text-gray-500">{Math.round(config.video.volume * 100)}%</span>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-400">Audio Volume</span>
            <button
              type="button"
              onClick={() => updateGlobalConfig('audio', 'volumeEnabled', !(config.audio.volumeEnabled !== false))}
              className={`text-[10px] px-2 py-0.5 rounded ${(config.audio.volumeEnabled !== false) ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-400'}`}
            >
              {(config.audio.volumeEnabled !== false) ? 'ON' : 'OFF'}
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.1"
            value={config.audio.volume}
            onChange={(e) => updateGlobalConfig('audio', 'volume', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-600 rounded-lg"
            disabled={config.audio.volumeEnabled === false}
          />
          <span className="text-[9px] text-gray-500">{Math.round(config.audio.volume * 100)}%</span>
        </div>
      </div>

      {/* VIDEO BACKGROUND */}
      <div className="border-t border-gray-700 pt-3 mt-3 space-y-2">
        <h4 className="text-xs font-bold text-gray-300 flex items-center gap-2">
          <Image className="w-3.5 h-3.5" /> Video Background
        </h4>
        <div>
          <label className="text-[10px] text-gray-500 block mb-1">Background Type</label>
          <select
            className="w-full bg-gray-700 border-none rounded text-xs p-1"
            value={config.background?.type || 'solid'}
            onChange={(e) => updateGlobalConfig('background', 'type', e.target.value)}
          >
            <option value="solid">Solid Color</option>
            <option value="gradient">Gradient</option>
            <option value="pattern">Pattern (50+ presets)</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>
        {(config.background?.type || 'solid') === 'solid' && (
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Color</label>
            <div className="flex gap-1 items-center">
              <input
                type="color"
                value={config.background?.solidColor || '#000000'}
                onChange={(e) => updateGlobalConfig('background', 'solidColor', e.target.value)}
                className="w-8 h-6 rounded cursor-pointer p-0 border-none"
              />
              <input
                type="text"
                value={config.background?.solidColor || '#000000'}
                onChange={(e) => updateGlobalConfig('background', 'solidColor', e.target.value)}
                className="flex-1 bg-gray-700 rounded text-[10px] p-1"
              />
            </div>
          </div>
        )}
        {(config.background?.type || 'solid') === 'gradient' && (
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 block">Gradient Colors (2+)</label>
            {(config.background?.gradientColors || ['#1a1a2e', '#16213e']).map((c, i) => (
              <div key={i} className="flex gap-1 items-center">
                <input
                  type="color"
                  value={c}
                  onChange={(e) => {
                    const arr = [...(config.background?.gradientColors || ['#1a1a2e', '#16213e'])];
                    arr[i] = e.target.value;
                    updateGlobalConfig('background', 'gradientColors', arr);
                  }}
                  className="w-6 h-5 rounded cursor-pointer p-0 border-none"
                />
                <input
                  type="text"
                  value={c}
                  onChange={(e) => {
                    const arr = [...(config.background?.gradientColors || ['#1a1a2e', '#16213e'])];
                    arr[i] = e.target.value;
                    updateGlobalConfig('background', 'gradientColors', arr);
                  }}
                  className="flex-1 bg-gray-700 rounded text-[10px] p-1"
                />
              </div>
            ))}
          </div>
        )}
        {(config.background?.type || 'solid') === 'pattern' && (
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Pattern Preset</label>
            <select
              className="w-full bg-gray-700 border-none rounded text-xs p-1"
              value={config.background?.patternId || 'none'}
              onChange={(e) => updateGlobalConfig('background', 'patternId', e.target.value)}
            >
              {BACKGROUND_PATTERN_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            <div className="flex gap-1 items-center mt-1">
              <input
                type="color"
                value={(() => {
                  const c = config.background?.patternColor || 'rgba(255,255,255,0.12)';
                  const m = c.match(/\d+/g);
                  if (m && m.length >= 3) {
                    return (
                      '#' +
                      [m[0], m[1], m[2]]
                        .map((x) => parseInt(x).toString(16).padStart(2, '0'))
                        .join('')
                    );
                  }
                  return '#ffffff';
                })()}
                onChange={(e) => {
                  const hex = e.target.value;
                  const r = parseInt(hex.slice(1, 3), 16);
                  const g = parseInt(hex.slice(3, 5), 16);
                  const b = parseInt(hex.slice(5, 7), 16);
                  updateGlobalConfig('background', 'patternColor', `rgba(${r},${g},${b},0.12)`);
                }}
                className="w-6 h-5 rounded cursor-pointer p-0 border-none"
              />
              <span className="text-[9px] text-gray-500">Pattern color</span>
            </div>
          </div>
        )}
        {(config.background?.type || 'solid') === 'image' && (
          <BackgroundImagesSection config={config} setConfig={setConfig} updateGlobalConfig={updateGlobalConfig} />
        )}
        {(config.background?.type || 'solid') === 'video' && (
          <BackgroundVideosSection config={config} setConfig={setConfig} updateGlobalConfig={updateGlobalConfig} />
        )}

        <BackgroundEffectsPanel config={config} updateGlobalConfig={updateGlobalConfig} />
      </div>
    </div>
  );
}

