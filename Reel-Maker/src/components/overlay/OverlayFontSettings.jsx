import React from 'react';
import { useScopedOverlay, useOverlayLineScope } from './OverlayLineEditContext.jsx';
import { buildGlobalLineSettingsPatch } from '../../utils/contentLineSettings.js';

export default function OverlayFontSettings({
  activeOverlayIndex,
  config,
  updateOverlayConfig,
  FONT_PRESETS,
  FONTS,
}) {
  const scope = useOverlayLineScope();
  const { ov, setField, patchFields, lineLabel } = useScopedOverlay(activeOverlayIndex, config, updateOverlayConfig);

  const applyFontPreset = (pid) => {
    const preset = FONT_PRESETS.find((p) => p.id === pid);
    const fields = { fontPreset: pid };
    if (preset?.font) fields.fontFamily = preset.font;
    if (preset?.weight) fields.fontWeight = preset.weight;
    if (scope?.isGlobal) {
      patchFields(buildGlobalLineSettingsPatch(scope.baseOverlay, fields, scope.lineCount));
    } else {
      Object.entries(fields).forEach(([key, value]) => setField(key, value));
    }
  };

  return (
    <div className="bg-indigo-500/[0.03] p-2.5 rounded-xl border border-indigo-500/[0.06]">
      <p className="text-[10px] text-gray-500 mb-2 font-medium">
        FONT — {lineLabel}
        {ov?.captionPresetsEnabled ? ' (overrides caption preset)' : ''}
      </p>
      <div className="mb-2">
        <label className="text-[9px] text-gray-500">Preset</label>
        <select
          value={ov.fontPreset || 'default'}
          onChange={(e) => applyFontPreset(e.target.value)}
          className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1"
        >
          {FONT_PRESETS.filter((p) => p.font).map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-gray-500">Font Family</label>
          <select
            value={ov.fontFamily}
            onChange={(e) => setField('fontFamily', e.target.value)}
            className="w-full bg-gray-700 rounded text-xs p-1.5 border-none"
          >
            {FONTS.map((f) => (
              <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-gray-500">Weight</label>
          <select
            value={ov.fontWeight || 'bold'}
            onChange={(e) => setField('fontWeight', e.target.value)}
            className="w-full bg-gray-700 rounded text-xs p-1.5 border-none"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
            <option value="lighter">Light</option>
            <option value="900">Extra Bold</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] text-gray-500">Size (%)</label>
          <input
            type="number"
            min="1"
            max="20"
            step="0.5"
            value={ov.fontSize}
            onChange={(e) => setField('fontSize', parseFloat(e.target.value))}
            className="w-full bg-gray-700 rounded text-xs p-1.5 border-none"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-500">Transform</label>
          <select
            value={ov.textTransform || 'none'}
            onChange={(e) => setField('textTransform', e.target.value)}
            className="w-full bg-gray-700 rounded text-xs p-1.5 border-none"
          >
            <option value="none">Normal</option>
            <option value="uppercase">UPPERCASE</option>
            <option value="lowercase">lowercase</option>
            <option value="capitalize">Capitalize</option>
          </select>
        </div>
      </div>
    </div>
  );
}
