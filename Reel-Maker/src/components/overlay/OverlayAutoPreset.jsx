import React from 'react';
import { useScopedOverlay, useOverlayLineScope } from './OverlayLineEditContext.jsx';
import { buildGlobalLineSettingsPatch } from '../../utils/contentLineSettings.js';

export default function OverlayAutoPreset({
  activeOverlayIndex,
  config,
  updateOverlayConfig,
  AUTO_PRESETS,
  AUTO_PRESET_CATEGORIES,
  videos,
}) {
  const scope = useOverlayLineScope();
  const { ov, setField, patchFields, lineLabel } = useScopedOverlay(activeOverlayIndex, config, updateOverlayConfig);

  const applyAutoPreset = (pid) => {
    setField('autoPresetId', pid || null);
    if (!pid) return;
    const p = AUTO_PRESETS.find((a) => a.id === pid);
    if (!p) return;
    const fields = {
      kineticEffect: p.kinetic,
      animationPreset: p.animation,
      animationLogic: p.animationLogic || 'default',
      fontFamily: p.font,
      fontPreset: p.fontPreset,
      fontChangeLogic: p.fontLogic ?? 'none',
      color: p.color,
      colorPreset: p.colorPreset,
      colorLogic: p.colorLogic,
    };
    if (p.styleType) fields.styleType = p.styleType;
    if (p.strokeColor) fields.strokeColor = p.strokeColor;
    if (p.bgColor) fields.bgColor = p.bgColor;
    if (scope?.isGlobal) {
      patchFields(buildGlobalLineSettingsPatch(scope.baseOverlay, fields, scope.lineCount));
    } else {
      Object.entries(fields).forEach(([key, value]) => setField(key, value));
    }
  };

  return (
    <div className="bg-indigo-500/[0.03] p-2.5 rounded-xl border border-indigo-500/[0.06]">
      <p className="text-[10px] text-gray-500 mb-2 font-medium">AUTO PRESET — {lineLabel}</p>
      <select
        value={ov.autoPresetId || ''}
        onChange={(e) => applyAutoPreset(e.target.value)}
        className="w-full bg-gray-700 rounded text-[10px] p-1.5 border-none"
      >
        <option value="">Custom (manual)</option>
        {AUTO_PRESET_CATEGORIES.map((cat) => {
          const presets = AUTO_PRESETS.filter((p) => p.category === cat.id);
          if (!presets.length) return null;
          return (
            <optgroup key={cat.id} label={cat.label}>
              {presets.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </optgroup>
          );
        })}
      </select>
      {videos.length > 0 && (
        <p className="text-[8px] text-gray-600 mt-1">Video detected — kinetic presets may use motion</p>
      )}
    </div>
  );
}
