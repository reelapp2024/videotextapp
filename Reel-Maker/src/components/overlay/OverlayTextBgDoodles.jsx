import React from 'react';

export default function OverlayTextBgDoodles({
  activeOverlayIndex,
  config,
  updateOverlayConfig,
  TEXT_BG_LOGIC_PRESETS,
  TEXT_BG_PATTERN_CATEGORIES,
  TEXT_BG_PATTERNS,
  DOODLE_LOGIC_PRESETS,
  DOODLE_CATEGORIES,
  DOODLE_LIBRARY,
  DOODLE_ANIMATION_PRESETS,
}) {
  return (
    <div className="bg-indigo-500/[0.03] p-2.5 rounded-xl border border-indigo-500/[0.06]">
      <div className="flex justify-between items-center mb-2">
        <p className="text-[10px] text-gray-500 font-medium">CANVAS BG PATTERN + DOODLES</p>
        <button
          onClick={() => updateOverlayConfig(activeOverlayIndex, 'textBgEnabled', !(config.overlays[activeOverlayIndex].textBgEnabled ?? false))}
          className={`text-[9px] px-2 py-1 rounded ${(config.overlays[activeOverlayIndex].textBgEnabled ?? false) ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-400'}`}
        >
          {(config.overlays[activeOverlayIndex].textBgEnabled ?? false) ? 'ON' : 'OFF'}
        </button>
      </div>
      {(config.overlays[activeOverlayIndex].textBgEnabled ?? false) && (
        <div className="space-y-2">
          <div>
            <label className="text-[9px] text-gray-500 block mb-0.5">Display Logic</label>
            <select
              value={config.overlays[activeOverlayIndex].textBgLogic || 'perFrame'}
              onChange={(e) => updateOverlayConfig(activeOverlayIndex, 'textBgLogic', e.target.value)}
              className="w-full bg-gray-700 rounded text-[10px] p-1.5 border-none"
            >
              {TEXT_BG_LOGIC_PRESETS.map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[9px] text-gray-500 block mb-0.5">Pattern Style</label>
            <select
              value={config.overlays[activeOverlayIndex].textBgCategory || 'gradient'}
              onChange={(e) => {
                updateOverlayConfig(activeOverlayIndex, 'textBgCategory', e.target.value);
                updateOverlayConfig(activeOverlayIndex, 'textBgPatternId', '');
              }}
              className="w-full bg-gray-700 rounded text-[10px] p-1.5 border-none"
            >
              {TEXT_BG_PATTERN_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {TEXT_BG_PATTERNS[config.overlays[activeOverlayIndex].textBgCategory || 'gradient'] && (
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {TEXT_BG_PATTERNS[config.overlays[activeOverlayIndex].textBgCategory || 'gradient'].map((p) => (
                <button
                  key={p.id}
                  onClick={() => updateOverlayConfig(activeOverlayIndex, 'textBgPatternId', p.id)}
                  className={`text-[8px] px-2 py-1 rounded transition ${config.overlays[activeOverlayIndex].textBgPatternId === p.id ? 'ring-1 ring-blue-400' : 'hover:bg-gray-600'}`}
                  style={{
                    background: p.colors.length > 1 ? `linear-gradient(135deg, ${p.colors.join(',')})` : p.colors[0],
                    color: '#fff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          <div>
            <label className="text-[9px] text-gray-500 block mb-0.5">Opacity</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={config.overlays[activeOverlayIndex].textBgOpacity ?? 0.85}
              onChange={(e) => updateOverlayConfig(activeOverlayIndex, 'textBgOpacity', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-blue-500"
            />
            <span className="text-[8px] text-gray-600">{((config.overlays[activeOverlayIndex].textBgOpacity ?? 0.85) * 100).toFixed(0)}%</span>
          </div>

          <div className="border-t border-gray-700/50 pt-2 mt-1">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[9px] text-gray-500 font-medium">DOODLE OVERLAY</span>
              <button
                onClick={() => updateOverlayConfig(activeOverlayIndex, 'doodleEnabled', !(config.overlays[activeOverlayIndex].doodleEnabled ?? false))}
                className={`text-[9px] px-2 py-0.5 rounded ${(config.overlays[activeOverlayIndex].doodleEnabled ?? false) ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-400'}`}
              >
                {(config.overlays[activeOverlayIndex].doodleEnabled ?? false) ? 'ON' : 'OFF'}
              </button>
            </div>

            {(config.overlays[activeOverlayIndex].doodleEnabled ?? false) && (
              <div className="space-y-2">
                <div>
                  <label className="text-[9px] text-gray-500 block mb-0.5">Doodle Logic</label>
                  <select
                    value={config.overlays[activeOverlayIndex].doodleLogic || 'scatter'}
                    onChange={(e) => updateOverlayConfig(activeOverlayIndex, 'doodleLogic', e.target.value)}
                    className="w-full bg-gray-700 rounded text-[10px] p-1.5 border-none"
                  >
                    {DOODLE_LOGIC_PRESETS.map((l) => (
                      <option key={l.id} value={l.id}>{l.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-gray-500 block mb-0.5">Doodle Style</label>
                  <select
                    value={config.overlays[activeOverlayIndex].doodleCategory || 'star_sparkle'}
                    onChange={(e) => updateOverlayConfig(activeOverlayIndex, 'doodleCategory', e.target.value)}
                    className="w-full bg-gray-700 rounded text-[10px] p-1.5 border-none"
                  >
                    {DOODLE_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap gap-0.5 max-h-12 overflow-y-auto bg-gray-800/50 p-1 rounded">
                  {(DOODLE_LIBRARY[config.overlays[activeOverlayIndex].doodleCategory || 'star_sparkle'] || []).slice(0, 20).map((d, di) => (
                    <span key={di} className="text-sm">
                      {d}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-gray-500 block mb-0.5">Size</label>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      step="1"
                      value={config.overlays[activeOverlayIndex].doodleSize ?? 24}
                      onChange={(e) => updateOverlayConfig(activeOverlayIndex, 'doodleSize', parseInt(e.target.value))}
                      className="w-full h-1.5 accent-purple-500"
                    />
                    <span className="text-[8px] text-gray-600">{config.overlays[activeOverlayIndex].doodleSize ?? 24}px</span>
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-500 block mb-0.5">Opacity</label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={config.overlays[activeOverlayIndex].doodleOpacity ?? 0.7}
                      onChange={(e) => updateOverlayConfig(activeOverlayIndex, 'doodleOpacity', parseFloat(e.target.value))}
                      className="w-full h-1.5 accent-purple-500"
                    />
                    <span className="text-[8px] text-gray-600">{((config.overlays[activeOverlayIndex].doodleOpacity ?? 0.7) * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] text-gray-500 block mb-0.5">Animation</label>
                  <select
                    value={config.overlays[activeOverlayIndex].doodleAnimation || 'none'}
                    onChange={(e) => updateOverlayConfig(activeOverlayIndex, 'doodleAnimation', e.target.value)}
                    className="w-full bg-gray-700 rounded text-[10px] p-1.5 border-none"
                  >
                    {DOODLE_ANIMATION_PRESETS.map((a) => (
                      <option key={a.id} value={a.id}>{a.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
