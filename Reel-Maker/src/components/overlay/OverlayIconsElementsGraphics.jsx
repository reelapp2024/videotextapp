import React from 'react';
import { useScopedOverlay } from './OverlayLineEditContext.jsx';

export default function OverlayIconsElementsGraphics({
  activeOverlayIndex,
  config,
  updateOverlayConfig,
  ICON_LOGIC_PRESETS,
  ICON_CATEGORIES,
  ICON_LIBRARY,
  ELEMENT_LIBRARY,
  GRAPHIC_LIBRARY,
  ICON_POSITION_PRESETS,
  ICON_ANIMATION_PRESETS,
}) {
  const { ov, setField, lineLabel } = useScopedOverlay(activeOverlayIndex, config, updateOverlayConfig);
  return (
    <div className="bg-indigo-500/[0.03] p-2.5 rounded-xl border border-indigo-500/[0.06]">
      <div className="flex justify-between items-center mb-2">
        <p className="text-[10px] text-gray-500 font-medium">ICONS / ELEMENTS / GRAPHICS</p>
        <button
          onClick={() => setField('iconSectionEnabled', !(ov.iconSectionEnabled ?? false))}
          className={`text-[9px] px-2 py-1 rounded ${(ov.iconSectionEnabled ?? false) ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-400'}`}
        >
          {(ov.iconSectionEnabled ?? false) ? 'ON' : 'OFF'}
        </button>
      </div>
      {(ov.iconSectionEnabled ?? false) && (
        <div className="space-y-2">
          <div className="flex gap-1">
            {[{ id: 'icons', label: 'Icons' }, { id: 'elements', label: 'Elements' }, { id: 'graphics', label: 'Graphics' }].map((t) => (
              <button
                key={t.id}
                onClick={() => setField('iconSourceType', t.id)}
                className={`flex-1 text-[9px] py-1.5 rounded font-medium transition ${(ov.iconSourceType || 'icons') === t.id ? 'bg-indigo-600 text-white' : 'bg-indigo-500/[0.05] text-gray-500 hover:bg-indigo-500/[0.08]'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div>
            <label className="text-[9px] text-gray-500 block mb-1">Display Logic</label>
            <select
              value={ov.iconLogic || 'none'}
              onChange={(e) => setField('iconLogic', e.target.value)}
              className="w-full bg-gray-700 rounded text-[10px] p-1.5 border-none"
            >
              <option value="none">None</option>
              {ICON_LOGIC_PRESETS.map((i) => (
                <option key={i.id} value={i.id}>{i.label}</option>
              ))}
            </select>
          </div>

          {(ov.iconSourceType || 'icons') === 'icons' && (
            <div>
              <label className="text-[9px] text-gray-500 block mb-1">Intent (auto-detect from Excel)</label>
              <div className="flex gap-1">
                <select
                  value={ov.iconIntent || 'auto'}
                  onChange={(e) => setField('iconIntent', e.target.value)}
                  className="flex-1 bg-gray-700 rounded text-[10px] p-1.5 border-none"
                >
                  <option value="auto">Auto-detect</option>
                  {ICON_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              {ov.iconIntent && ov.iconIntent !== 'auto' && ICON_LIBRARY[ov.iconIntent] && (
                <div className="mt-1 flex flex-wrap gap-0.5 max-h-16 overflow-y-auto bg-gray-800/50 p-1 rounded">
                  {ICON_LIBRARY[ov.iconIntent].slice(0, 30).map((ic, ii) => (
                    <span
                      key={ii}
                      className="text-sm cursor-pointer hover:bg-gray-600 rounded p-0.5"
                      title={ic}
                      onClick={() => setField('iconCustomChar', ic)}
                    >
                      {ic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {ov.iconSourceType === 'elements' && (
            <div>
              <label className="text-[9px] text-gray-500 block mb-1">Element Category</label>
              <select
                value={ov.elementCategory || 'arrows_3d'}
                onChange={(e) => setField('elementCategory', e.target.value)}
                className="w-full bg-gray-700 rounded text-[10px] p-1.5 border-none"
              >
                {Object.keys(ELEMENT_LIBRARY).map((k) => (
                  <option key={k} value={k}>{k.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
                ))}
              </select>
              <div className="mt-1 flex flex-wrap gap-0.5 max-h-20 overflow-y-auto bg-gray-800/50 p-1 rounded">
                {(ELEMENT_LIBRARY[ov.elementCategory || 'arrows_3d'] || []).map((el, ei) => (
                  <span
                    key={ei}
                    className="text-sm cursor-pointer hover:bg-gray-600 rounded px-1 py-0.5 font-mono"
                    title={el}
                    onClick={() => setField('iconCustomChar', el)}
                  >
                    {el}
                  </span>
                ))}
              </div>
            </div>
          )}

          {ov.iconSourceType === 'graphics' && (
            <div>
              <label className="text-[9px] text-gray-500 block mb-1">Graphic Category</label>
              <select
                value={ov.graphicCategory || 'badges_3d'}
                onChange={(e) => setField('graphicCategory', e.target.value)}
                className="w-full bg-gray-700 rounded text-[10px] p-1.5 border-none"
              >
                {Object.keys(GRAPHIC_LIBRARY).map((k) => (
                  <option key={k} value={k}>{k.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
                ))}
              </select>
              <div className="mt-1 flex flex-wrap gap-0.5 max-h-20 overflow-y-auto bg-gray-800/50 p-1 rounded">
                {(GRAPHIC_LIBRARY[ov.graphicCategory || 'badges_3d'] || []).map((gr, gi) => (
                  <span
                    key={gi}
                    className="text-xs cursor-pointer hover:bg-gray-600 rounded px-1 py-0.5 font-mono text-gray-300"
                    title={gr}
                    onClick={() => {
                      const chars = [...gr];
                      const picked = chars.length <= 3 ? gr : chars.slice(0, 3).join('');
                      setField('iconCustomChar', picked);
                    }}
                  >
                    {gr}
                  </span>
                ))}
              </div>
            </div>
          )}

          {ov.iconCustomChar && (
            <div className="flex items-center gap-1 bg-gray-800/50 p-1.5 rounded">
              <span className="text-sm">{ov.iconCustomChar}</span>
              <span className="text-[9px] text-gray-500 flex-1">Selected</span>
              <button
                onClick={() => setField('iconCustomChar', '')}
                className="text-[9px] text-red-400 hover:text-red-300 px-1"
              >
                Clear
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-gray-500 block mb-0.5">Size Scale</label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={ov.iconSizeScale ?? 1}
                onChange={(e) => setField('iconSizeScale', parseFloat(e.target.value))}
                className="w-full h-1.5 accent-blue-500"
              />
              <span className="text-[8px] text-gray-600">{(ov.iconSizeScale ?? 1).toFixed(1)}x</span>
            </div>
            <div>
              <label className="text-[9px] text-gray-500 block mb-0.5">Position</label>
              <select
                value={ov.iconPosition || 'beforeWord'}
                onChange={(e) => setField('iconPosition', e.target.value)}
                className="w-full bg-gray-700 rounded text-[9px] p-1 border-none"
              >
                {ICON_POSITION_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-gray-500 block mb-0.5">Show Delay (s)</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={ov.iconShowDelay ?? 0}
                onChange={(e) => setField('iconShowDelay', parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-700 rounded text-[9px] p-1 border-none"
              />
            </div>
            <div>
              <label className="text-[9px] text-gray-500 block mb-0.5">Duration (s)</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={ov.iconDuration ?? 0}
                onChange={(e) => setField('iconDuration', parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-700 rounded text-[9px] p-1 border-none"
              />
              <span className="text-[8px] text-gray-600">0 = always</span>
            </div>
          </div>

          <div>
            <label className="text-[9px] text-gray-500 block mb-0.5">Animation</label>
            <select
              value={ov.iconAnimation || 'none'}
              onChange={(e) => setField('iconAnimation', e.target.value)}
              className="w-full bg-gray-700 rounded text-[10px] p-1.5 border-none"
            >
              {ICON_ANIMATION_PRESETS.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>

          {(ov.iconPosition === 'aboveWord' || ov.iconPosition === 'belowWord') && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-gray-500 block mb-0.5">X Offset</label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={ov.iconOffsetX ?? 0}
                  onChange={(e) => setField('iconOffsetX', parseInt(e.target.value))}
                  className="w-full h-1.5 accent-blue-500"
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-500 block mb-0.5">Y Offset</label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={ov.iconOffsetY ?? 0}
                  onChange={(e) => setField('iconOffsetY', parseInt(e.target.value))}
                  className="w-full h-1.5 accent-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
