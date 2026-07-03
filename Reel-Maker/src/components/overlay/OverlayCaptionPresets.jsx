import React, { useMemo, useState } from 'react'
import { CAPTION_TEXT_PRESET_CATEGORIES } from '../../presets/captionTextPresets.js'
import { useOverlayLineScope } from './OverlayLineEditContext.jsx'

function PresetSwatch({ preset }) {
  const p = preset.patch
  const isBox = p.styleType === 'box'
  const bg = isBox ? p.bgColor : '#0a0a12'
  const fg = p.color || '#fff'
  const border = p.strokeColor || '#333'
  return (
    <span
      className="inline-block w-3 h-3 rounded-sm shrink-0 border border-white/20"
      style={{
        background: bg?.startsWith('rgba') ? bg : bg,
        boxShadow: p.shadowEnabled ? `0 0 6px ${p.shadowColor}` : undefined,
        outline: `2px solid ${border}`,
      }}
      title={fg}
    />
  )
}

export default function OverlayCaptionPresets({
  activeOverlayIndex,
  config,
  applyOverlayPreset,
  updateOverlayConfig,
}) {
  const scope = useOverlayLineScope()
  const [openCat, setOpenCat] = useState('word-focus')
  const [filter, setFilter] = useState('')
  const overlay = config.overlays[activeOverlayIndex] || {}
  const presetsOn = overlay.captionPresetsEnabled ?? false
  const activeId = presetsOn ? overlay.captionTextPresetId : null

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return CAPTION_TEXT_PRESET_CATEGORIES
    return CAPTION_TEXT_PRESET_CATEGORIES.map((c) => ({
      ...c,
      presets: c.presets.filter(
        (p) => p.name.toLowerCase().includes(q) || c.label.toLowerCase().includes(q)
      ),
    })).filter((c) => c.presets.length > 0)
  }, [filter])

  return (
    <div className="bg-gradient-to-br from-cyan-950/40 to-indigo-950/30 p-2.5 rounded-xl border border-cyan-500/20 mb-2">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[10px] text-cyan-300 font-semibold uppercase tracking-wide">Caption Presets</p>
        <div className="flex items-center gap-2">
          {activeId && (
            <span className="text-[9px] text-gray-500 truncate max-w-[80px]" title={activeId}>
              {activeId.replace(/-/g, ' ')}
            </span>
          )}
          <button
            type="button"
            onClick={() => updateOverlayConfig(activeOverlayIndex, 'captionPresetsEnabled', !presetsOn)}
            className={`text-[9px] px-2 py-1 rounded font-medium ${presetsOn ? 'bg-cyan-600 text-white' : 'bg-gray-600 text-gray-400'}`}
          >
            {presetsOn ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
      {!presetsOn && (
        <p className="text-[9px] text-amber-400/90 mb-2 leading-relaxed">
          Presets OFF — captions normal style se dikhenge. ON karke preset select karo.
        </p>
      )}
      <input
        type="search"
        placeholder="Search presets…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        disabled={!presetsOn}
        className="w-full mb-2 text-[10px] bg-black/40 border border-gray-700 rounded-lg px-2 py-1 text-gray-200 disabled:opacity-40"
      />
      <div className={`space-y-1 max-h-52 overflow-y-auto custom-scrollbar pr-0.5 ${!presetsOn ? 'opacity-40 pointer-events-none' : ''}`}>
        {filtered.map((category) => (
          <div key={category.id} className="rounded-lg border border-gray-800/80 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenCat(openCat === category.id ? '' : category.id)}
              className="w-full flex items-center justify-between px-2 py-1.5 text-left bg-black/30 hover:bg-black/50 text-[10px] text-gray-300 font-medium"
            >
              {category.label}
              <span className="text-gray-600 text-[9px]">{category.presets.length}</span>
            </button>
            {(openCat === category.id || filter.trim()) && (
              <div className="grid grid-cols-2 gap-1 p-1.5 bg-black/20">
                {category.presets.map((preset) => {
                  const selected = activeId === preset.id
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        if (scope) {
                          scope.setField('captionPresetsEnabled', true)
                          scope.applyScopedPreset(preset.patch)
                        } else {
                          updateOverlayConfig(activeOverlayIndex, 'captionPresetsEnabled', true)
                          applyOverlayPreset(activeOverlayIndex, preset.patch)
                        }
                      }}
                      className={`flex items-center gap-1.5 px-1.5 py-1 rounded text-left text-[9px] transition border ${
                        selected
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-100'
                          : 'border-transparent bg-gray-800/50 text-gray-400 hover:bg-gray-700/60 hover:text-gray-200'
                      }`}
                      title={preset.typographyStyle ? `${preset.name} — ${preset.typographyStyle}` : preset.name}
                    >
                      <PresetSwatch preset={preset} />
                      <span className="truncate leading-tight flex flex-col min-w-0">
                        <span className="truncate">{preset.name}</span>
                        {preset.typographyStyle && (
                          <span className="truncate text-[7px] text-gray-500 font-normal">{preset.typographyStyle}</span>
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-[8px] text-gray-600 mt-2 leading-relaxed">
        Preset select karo, phir neeche Font / Layout / Style se customize karo — dono preview aur export mein apply honge.
      </p>
    </div>
  )
}
