import React from 'react';
import { useScopedOverlay } from './OverlayLineEditContext.jsx';

export default function OverlayColorGradient({
  activeOverlayIndex,
  config,
  updateOverlayConfig,
  COLOR_PRESETS,
  GRADIENT_PRESETS,
  COLOR_LOGIC_PRESETS,
  extractedPalette = [],
  extractPaletteFromMedia,
}) {
  const { ov, setField, lineLabel } = useScopedOverlay(activeOverlayIndex, config, updateOverlayConfig);
  return (
    <div className="bg-indigo-500/[0.03] p-2.5 rounded-xl border border-indigo-500/[0.06]">
      <p className="text-[10px] text-gray-500 mb-2 font-medium">COLOR & GRADIENT</p>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[9px] text-gray-500">Gradient</span>
        <button
          onClick={() => {
            const next = !(ov.gradientEnabled ?? false);
            setField('gradientEnabled', next);
            if (next && !(ov.gradientColors?.length)) {
              setField('gradientColors', ['#FF6B6B', '#FFE66D']);
              setField('gradientPreset', 'sunset');
            }
          }}
          className={`text-[9px] px-2 py-1 rounded ${(ov.gradientEnabled ?? false) ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-400'}`}
        >
          {(ov.gradientEnabled ?? false) ? 'ON' : 'OFF'}
        </button>
      </div>
      {(ov.gradientEnabled ?? false) ? (
        <div className="space-y-2 mb-2">
          <label className="text-[9px] text-gray-500">Gradient Preset (30+)</label>
          <select
            value={ov.gradientPreset || 'sunset'}
            onChange={(e) => {
              const gid = e.target.value;
              setField('gradientPreset', gid || null);
              const g = GRADIENT_PRESETS.find((p) => p.id === gid);
              if (g?.colors) setField('gradientColors', g.colors);
              else if (!ov.gradientColors?.length)
                setField('gradientColors', ['#FFFFFF', '#CCCCCC']);
            }}
            className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1"
          >
            {GRADIENT_PRESETS.filter((p) => p.colors).map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <div className="flex flex-wrap gap-1">
            {(ov.gradientColors || ['#FFFFFF', '#CCCCCC']).map((c, i) => (
              <div key={i} className="flex items-center gap-1">
                <input
                  type="color"
                  value={c}
                  onChange={(e) => {
                    const arr = [...(ov.gradientColors || ['#FFFFFF', '#CCCCCC'])];
                    arr[i] = e.target.value;
                    setField('gradientColors', arr);
                  }}
                  className="h-6 w-8 rounded cursor-pointer border border-gray-600"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-[9px] text-gray-500">Color Preset (30+)</label>
            <select
              value={ov.colorPreset || 'white'}
              onChange={(e) => {
                const cid = e.target.value;
                setField('colorPreset', cid);
                const preset = COLOR_PRESETS.find((p) => p.id === cid);
                if (preset?.color) setField('color', preset.color);
              }}
              className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1"
            >
              {COLOR_PRESETS.filter((p) => p.color).map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
          {extractedPalette.length > 0 && (
            <div className="col-span-2 mt-2">
              <p className="text-[9px] text-gray-500 mb-1">Background Colors (Auto-extracted)</p>
              <div className="flex flex-wrap gap-1">
                {extractedPalette.map((color) => (
                  <button
                    key={color}
                    onClick={() => setField('color', color)}
                    className="w-5 h-5 rounded-full border border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                <button
                  onClick={extractPaletteFromMedia}
                  className="text-[8px] bg-gray-700 hover:bg-gray-600 px-1.5 py-1 rounded text-gray-300"
                >
                  Refetch
                </button>
              </div>
            </div>
          )}
          <div>
            <label className="text-[9px] text-gray-500">Color Logic</label>
            <select
              value={ov.colorLogic || 'none'}
              onChange={(e) => setField('colorLogic', e.target.value)}
              className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1"
            >
              {COLOR_LOGIC_PRESETS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <label className="text-[9px] text-gray-500">Color</label>
            <input
              type="color"
              value={ov.color || '#ffffff'}
              onChange={(e) => setField('color', e.target.value)}
              className="h-7 w-10 rounded cursor-pointer border border-gray-600"
            />
            <input
              type="text"
              value={ov.color || '#ffffff'}
              onChange={(e) => setField('color', e.target.value)}
              className="flex-1 bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1"
            />
          </div>
        </div>
      )}
    </div>
  );
}
