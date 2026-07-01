import React from 'react';

export default function OverlayShadow({ activeOverlayIndex, config, updateOverlayConfig }) {
  return (
    <div className="bg-indigo-500/[0.03] p-2.5 rounded-xl border border-indigo-500/[0.06]">
      <div className="flex justify-between items-center mb-2">
        <p className="text-[10px] text-gray-500 font-medium">TEXT SHADOW</p>
        <button
          onClick={() => updateOverlayConfig(activeOverlayIndex, 'shadowEnabled', !config.overlays[activeOverlayIndex].shadowEnabled)}
          className={`text-[10px] px-2 py-0.5 rounded ${
            config.overlays[activeOverlayIndex].shadowEnabled ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
          }`}
        >
          {config.overlays[activeOverlayIndex].shadowEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {config.overlays[activeOverlayIndex].shadowEnabled && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-gray-500 w-12">Color</label>
            <input
              type="color"
              value={config.overlays[activeOverlayIndex].shadowColor || '#000000'}
              onChange={(e) => updateOverlayConfig(activeOverlayIndex, 'shadowColor', e.target.value)}
              className="w-8 h-5 rounded bg-transparent border-none cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-gray-500 w-12">Blur</label>
            <input
              type="range"
              min="0"
              max="20"
              value={config.overlays[activeOverlayIndex].shadowBlur || 4}
              onChange={(e) => updateOverlayConfig(activeOverlayIndex, 'shadowBlur', parseInt(e.target.value))}
              className="flex-1 h-1.5 bg-gray-600 rounded"
            />
            <span className="text-[10px] text-gray-400 w-6">{config.overlays[activeOverlayIndex].shadowBlur || 4}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1">
              <label className="text-[10px] text-gray-500">X</label>
              <input
                type="number"
                min="-20"
                max="20"
                value={config.overlays[activeOverlayIndex].shadowOffsetX || 2}
                onChange={(e) => updateOverlayConfig(activeOverlayIndex, 'shadowOffsetX', parseInt(e.target.value))}
                className="w-full bg-gray-700 rounded text-xs p-1 border-none"
              />
            </div>
            <div className="flex items-center gap-1">
              <label className="text-[10px] text-gray-500">Y</label>
              <input
                type="number"
                min="-20"
                max="20"
                value={config.overlays[activeOverlayIndex].shadowOffsetY || 2}
                onChange={(e) => updateOverlayConfig(activeOverlayIndex, 'shadowOffsetY', parseInt(e.target.value))}
                className="w-full bg-gray-700 rounded text-xs p-1 border-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
