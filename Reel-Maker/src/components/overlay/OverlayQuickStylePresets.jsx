import React from 'react';
import { useScopedOverlay, useOverlayLineScope } from './OverlayLineEditContext.jsx';
import { buildGlobalLineSettingsPatch } from '../../utils/contentLineSettings.js';
import {
  QUICK_STYLE_PRESETS,
  presetToPatch,
  QuickPresetButton,
} from './quickStylePresets.jsx';

export default function OverlayQuickStylePresets({ activeOverlayIndex, config, updateOverlayConfig }) {
  const scope = useOverlayLineScope();
  const { setField, patchFields, lineLabel, getField, ov } = useScopedOverlay(
    activeOverlayIndex,
    config,
    updateOverlayConfig,
  );

  const activeId = getField('quickPresetId', ov?.quickPresetId);

  const applyQuick = (preset) => {
    const fields = presetToPatch(preset);
    if (scope?.applyScopedPreset) {
      scope.applyScopedPreset(fields);
      return;
    }
    if (scope?.isGlobal) {
      patchFields(buildGlobalLineSettingsPatch(scope.baseOverlay, fields, scope.lineCount));
    } else {
      Object.entries(fields).forEach(([key, value]) => setField(key, value));
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-2.5 rounded-xl border border-purple-700/30">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] text-gray-400 font-medium">QUICK PRESETS — {lineLabel}</p>
        {activeId && QUICK_STYLE_PRESETS.some((p) => p.id === activeId) && (
          <span className="text-[9px] text-purple-300">
            {QUICK_STYLE_PRESETS.find((p) => p.id === activeId)?.name}
          </span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {QUICK_STYLE_PRESETS.map((preset) => (
          <QuickPresetButton
            key={preset.id}
            preset={preset}
            label={preset.name}
            selected={activeId === preset.id}
            onClick={() => applyQuick(preset)}
          />
        ))}
      </div>
    </div>
  );
}
