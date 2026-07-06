import React from 'react';
import { useScopedOverlay } from './OverlayLineEditContext.jsx';

export default function OverlayAnimationFont({
  activeOverlayIndex,
  config,
  updateOverlayConfig,
  ANIMATION_PRESETS,
  ANIMATION_LOGIC_PRESETS,
  FONT_LOGIC_PRESETS,
}) {
  const { setField, getField, lineLabel, lineSelection } = useScopedOverlay(activeOverlayIndex, config, updateOverlayConfig);
  const animationPreset = getField('animationPreset', 'none');
  const animationLogic = getField('animationLogic', 'default');
  const animationStartTime = getField('animationStartTime', 0);
  const animationDuration = getField('animationDuration', 1);
  const animationLoop = Boolean(getField('animationLoop', false));
  const fontChangeLogic = getField('fontChangeLogic', 'none');

  return (
    <div key={`anim-font-${lineSelection}`} className="bg-indigo-500/[0.03] p-2.5 rounded-xl border border-indigo-500/[0.06]">
      <p className="text-[10px] text-gray-500 mb-2 font-medium">ANIMATION & FONT</p>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="text-[9px] text-gray-500">Animation</label>
          <select
            value={animationPreset}
            onChange={(e) => setField('animationPreset', e.target.value)}
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
            value={animationLogic}
            onChange={(e) => setField('animationLogic', e.target.value)}
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
              value={animationStartTime}
              onChange={(e) => setField('animationStartTime', parseFloat(e.target.value))}
              className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1"
            />
          </div>
          <div>
            <label className="text-[9px] text-gray-500">Anim Dur (sec)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={animationDuration}
              onChange={(e) => setField('animationDuration', parseFloat(e.target.value))}
              className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1"
            />
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="animLoop"
              checked={animationLoop}
              onChange={(e) => setField('animationLoop', e.target.checked)}
              className="w-3 h-3"
            />
            <label htmlFor="animLoop" className="text-[9px] text-gray-500 cursor-pointer">Loop Animation</label>
          </div>
        </div>
        <div className="col-span-2">
          <label className="text-[9px] text-gray-500">Font Logic (50 options)</label>
          <select
            value={fontChangeLogic}
            onChange={(e) => setField('fontChangeLogic', e.target.value)}
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
