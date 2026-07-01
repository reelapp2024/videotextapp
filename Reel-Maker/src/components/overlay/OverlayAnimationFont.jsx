import React from 'react';

export default function OverlayAnimationFont({
  activeOverlayIndex,
  config,
  updateOverlayConfig,
  ANIMATION_PRESETS,
  ANIMATION_LOGIC_PRESETS,
  FONT_LOGIC_PRESETS,
}) {
  return (
    <div className="bg-indigo-500/[0.03] p-2.5 rounded-xl border border-indigo-500/[0.06]">
      <p className="text-[10px] text-gray-500 mb-2 font-medium">ANIMATION & FONT</p>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="text-[9px] text-gray-500">Animation</label>
          <select
            value={config.overlays[activeOverlayIndex].animationPreset || 'none'}
            onChange={(e) => updateOverlayConfig(activeOverlayIndex, 'animationPreset', e.target.value)}
            className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1"
          >
            {ANIMATION_PRESETS.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[9px] text-gray-500">Animation Logic</label>
          <select
            value={config.overlays[activeOverlayIndex].animationLogic || 'default'}
            onChange={(e) => updateOverlayConfig(activeOverlayIndex, 'animationLogic', e.target.value)}
            className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1"
          >
            {ANIMATION_LOGIC_PRESETS.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-2 mt-1 pt-2 border-t border-gray-700/30">
          <div>
            <label className="text-[9px] text-gray-500">Anim Start (sec)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={config.overlays[activeOverlayIndex].animationStartTime ?? 0}
              onChange={(e) => updateOverlayConfig(activeOverlayIndex, 'animationStartTime', parseFloat(e.target.value))}
              className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1"
            />
          </div>
          <div>
            <label className="text-[9px] text-gray-500">Anim Dur (sec)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={config.overlays[activeOverlayIndex].animationDuration ?? 1}
              onChange={(e) => updateOverlayConfig(activeOverlayIndex, 'animationDuration', parseFloat(e.target.value))}
              className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1"
            />
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="animLoop"
              checked={config.overlays[activeOverlayIndex].animationLoop ?? false}
              onChange={(e) => updateOverlayConfig(activeOverlayIndex, 'animationLoop', e.target.checked)}
              className="w-3 h-3"
            />
            <label htmlFor="animLoop" className="text-[9px] text-gray-500 cursor-pointer">Loop Animation</label>
          </div>
        </div>
        <div className="col-span-2">
          <label className="text-[9px] text-gray-500">Font Logic (50 options)</label>
          <select
            value={config.overlays[activeOverlayIndex].fontChangeLogic || 'none'}
            onChange={(e) => updateOverlayConfig(activeOverlayIndex, 'fontChangeLogic', e.target.value)}
            className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1"
          >
            {FONT_LOGIC_PRESETS.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
