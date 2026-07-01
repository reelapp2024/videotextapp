import React from 'react';

export default function OverlayFontSettings({
  activeOverlayIndex,
  config,
  updateOverlayConfig,
  FONT_PRESETS,
  FONTS,
}) {
  return (
    <div className="bg-indigo-500/[0.03] p-2.5 rounded-xl border border-indigo-500/[0.06]">
      <p className="text-[10px] text-gray-500 mb-2 font-medium">
        FONT {config.overlays[activeOverlayIndex]?.captionPresetsEnabled ? '(overrides caption preset)' : '(Preset applies; custom overrides)'}
      </p>
      <div className="mb-2">
        <label className="text-[9px] text-gray-500">Preset</label>
        <select
          value={config.overlays[activeOverlayIndex].fontPreset || 'default'}
          onChange={(e) => {
            const pid = e.target.value;
            updateOverlayConfig(activeOverlayIndex, 'fontPreset', pid);
            const preset = FONT_PRESETS.find((p) => p.id === pid);
            if (preset?.font) updateOverlayConfig(activeOverlayIndex, 'fontFamily', preset.font);
            if (preset?.weight) updateOverlayConfig(activeOverlayIndex, 'fontWeight', preset.weight);
          }}
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
            value={config.overlays[activeOverlayIndex].fontFamily}
            onChange={(e) => updateOverlayConfig(activeOverlayIndex, 'fontFamily', e.target.value)}
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
            value={config.overlays[activeOverlayIndex].fontWeight || 'bold'}
            onChange={(e) => updateOverlayConfig(activeOverlayIndex, 'fontWeight', e.target.value)}
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
            value={config.overlays[activeOverlayIndex].fontSize}
            onChange={(e) => updateOverlayConfig(activeOverlayIndex, 'fontSize', parseFloat(e.target.value))}
            className="w-full bg-gray-700 rounded text-xs p-1.5 border-none"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-500">Transform</label>
          <select
            value={config.overlays[activeOverlayIndex].textTransform || 'none'}
            onChange={(e) => updateOverlayConfig(activeOverlayIndex, 'textTransform', e.target.value)}
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
