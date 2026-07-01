import React from 'react';
import { Layers } from 'lucide-react';

export default function OverlayEditorPanel({
  config,
  activeOverlayIndex,
  setActiveOverlayIndex,
  updateOverlayConfig,
  children,
}) {
  return (
    <div className="glass-card p-4 rounded-xl h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center border-b border-indigo-500/[0.08] pb-2 mb-3">
        <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
          <Layers className="w-4 h-4" /> Text Overlays
        </h3>
        <div className="flex gap-1">
          {config.overlays.map((o, i) => (
            <button
              key={i}
              onClick={() => setActiveOverlayIndex(i)}
              className={`px-2 py-0.5 rounded text-[10px] transition ${
                activeOverlayIndex === i
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-500/[0.05] text-gray-500 hover:bg-indigo-500/[0.08]'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {config.overlays.length > 0 && (
        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded">
            <span className="text-xs font-bold text-indigo-300">
              📝 {config.overlays[activeOverlayIndex].name}
            </span>
            <button
              onClick={() => updateOverlayConfig(activeOverlayIndex, 'enabled', !config.overlays[activeOverlayIndex].enabled)}
              className={`text-xs px-2 py-0.5 rounded ${config.overlays[activeOverlayIndex].enabled ? 'bg-green-600 text-white' : 'bg-red-600/50 text-red-300'}`}
            >
              {config.overlays[activeOverlayIndex].enabled ? '✓ ON' : '✗ OFF'}
            </button>
          </div>

          {children}
        </div>
      )}
    </div>
  );
}
