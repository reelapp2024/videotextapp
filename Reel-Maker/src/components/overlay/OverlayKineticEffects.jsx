import React from 'react';
import { useScopedOverlay } from './OverlayLineEditContext.jsx';
import { KINETIC_LOGIC_ALL } from '../../textStylePresets.js';

export default function OverlayKineticEffects({
  activeOverlayIndex,
  config,
  updateOverlayConfig,
  KINETIC_EFFECTS,
}) {
  const { ov, setField, lineLabel } = useScopedOverlay(activeOverlayIndex, config, updateOverlayConfig);
  return (
    <div className="bg-indigo-500/[0.03] p-2.5 rounded-xl border border-indigo-500/[0.06]">
      <p className="text-[10px] text-gray-500 mb-2 font-medium">KINETIC EFFECTS</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] text-gray-500">Effect</label>
          <select
            value={ov.kineticEffect || 'none'}
            onChange={(e) => setField('kineticEffect', e.target.value)}
            className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1"
          >
            {KINETIC_EFFECTS.map((k) => (
              <option key={k.id} value={k.id}>{k.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[9px] text-gray-500">Logic</label>
          <select
            value={ov.kineticLogic || 'oneWord'}
            onChange={(e) => setField('kineticLogic', e.target.value)}
            className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1"
          >
            {KINETIC_LOGIC_ALL.map((k) => (
              <option key={k.id} value={k.id}>{k.label}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-[9px] text-gray-500">Pop Scale (intensity)</label>
          <div className="flex gap-2 items-center">
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={ov.popScale ?? 1}
              onChange={(e) => setField('popScale', parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-gray-600 rounded"
            />
            <span className="text-[10px] w-8">{(ov.popScale ?? 1).toFixed(1)}</span>
          </div>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-2 mt-1 pt-2 border-t border-gray-700/30">
          <div>
            <label className="text-[9px] text-gray-500">Start (sec)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={ov.kineticStartTime ?? 0}
              onChange={(e) => setField('kineticStartTime', parseFloat(e.target.value))}
              className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1"
            />
          </div>
          <div>
            <label className="text-[9px] text-gray-500">Dur (sec)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={ov.kineticDuration ?? 1}
              onChange={(e) => setField('kineticDuration', parseFloat(e.target.value))}
              className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1"
            />
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="kineticLoop"
              checked={ov.kineticLoop ?? false}
              onChange={(e) => setField('kineticLoop', e.target.checked)}
              className="w-3 h-3"
            />
            <label htmlFor="kineticLoop" className="text-[9px] text-gray-500 cursor-pointer">Loop Effect</label>
          </div>
        </div>
      </div>
    </div>
  );
}
