import React from 'react';
import { useScopedOverlay, useOverlayLineScope } from './OverlayLineEditContext.jsx';
import {
  OVERLAY_QUICK_PRESETS,
  presetToPatch,
  QuickPresetButton,
} from './quickStylePresets.jsx';

export default function OverlayQuickPresets({ activeOverlayIndex, config, updateOverlayConfig }) {
  const scope = useOverlayLineScope();
  const { getField, ov } = useScopedOverlay(activeOverlayIndex, config, updateOverlayConfig);
  const activeId = getField('quickPresetId', ov?.quickPresetId);

  const applyPreset = (preset) => {
    const patch = presetToPatch(preset);
    if (scope?.applyScopedPreset) {
      scope.applyScopedPreset(patch);
      return;
    }
    Object.entries(patch).forEach(([key, value]) => {
      updateOverlayConfig(activeOverlayIndex, key, value);
    });
  };

  return (
    <div className="bg-indigo-500/[0.03] p-2.5 rounded-xl border border-indigo-500/[0.06]">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] text-gray-500 font-medium">QUICK PRESETS</p>
        {activeId && OVERLAY_QUICK_PRESETS.some((p) => p.id === activeId) && (
          <span className="text-[9px] text-indigo-300 capitalize">
            {OVERLAY_QUICK_PRESETS.find((p) => p.id === activeId)?.label} selected
          </span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {OVERLAY_QUICK_PRESETS.map((preset) => (
          <QuickPresetButton
            key={preset.id}
            preset={preset}
            label={preset.label}
            selected={activeId === preset.id}
            onClick={() => applyPreset(preset)}
          />
        ))}
      </div>
    </div>
  );
}
