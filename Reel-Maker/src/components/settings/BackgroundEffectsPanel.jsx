import React, { useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import {
  BACKGROUND_EFFECT_CATEGORIES,
  DEFAULT_BACKGROUND_EFFECTS,
} from '../../effects/backgroundEffectsCatalog.js'

export default function BackgroundEffectsPanel({ config, updateGlobalConfig }) {
  const fx = { ...DEFAULT_BACKGROUND_EFFECTS, ...(config.backgroundEffects || {}) }
  const [openCat, setOpenCat] = useState('motion')
  const [filter, setFilter] = useState('')

  const bgType = config.background?.type || 'solid'
  const appliesToBg = bgType === 'image' || bgType === 'video'

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return BACKGROUND_EFFECT_CATEGORIES
    return BACKGROUND_EFFECT_CATEGORIES.map((c) => ({
      ...c,
      effects: c.effects.filter(
        (e) => e.name.toLowerCase().includes(q) || c.label.toLowerCase().includes(q)
      ),
    })).filter((c) => c.effects.length > 0)
  }, [filter])

  const patchFx = (partial) => {
    updateGlobalConfig('root', 'backgroundEffects', { ...fx, ...partial })
  }

  const usePxDuration = fx.durationMode === 'manual'

  return (
    <div className="border-t border-gray-700 pt-3 mt-1 space-y-2">
      <h4 className="text-xs font-bold text-gray-300 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Background Effects
      </h4>

      {!appliesToBg && fx.enabled !== false && fx.effectId && fx.effectId !== 'none' && (
        <p className="text-[9px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
          Settings mein <strong>Background Type = Image/Video</strong> select karein, ya Upload tab ki image use hogi jab effects ON hon.
        </p>
      )}

      <label className="flex items-center gap-2 text-[10px] text-gray-400 cursor-pointer">
        <input
          type="checkbox"
          checked={fx.enabled !== false}
          onChange={(e) => patchFx({ enabled: e.target.checked })}
          className="rounded"
        />
        Enable background effects
      </label>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] text-gray-500 block mb-0.5">Intensity</label>
          <div className="flex items-center gap-1">
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={fx.intensity ?? 0.75}
              onChange={(e) => patchFx({ intensity: parseFloat(e.target.value) })}
              className="flex-1 h-1.5 accent-amber-500"
            />
            <span className="text-[9px] w-7">{(fx.intensity ?? 0.75).toFixed(2)}</span>
          </div>
        </div>
        <div>
          <label className="text-[9px] text-gray-500 block mb-0.5">Speed</label>
          <div className="flex items-center gap-1">
            <input
              type="range"
              min="0.25"
              max="2.5"
              step="0.05"
              value={fx.speed ?? 1}
              onChange={(e) => patchFx({ speed: parseFloat(e.target.value) })}
              className="flex-1 h-1.5 accent-amber-500"
            />
            <span className="text-[9px] w-7">{(fx.speed ?? 1).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-lg p-2 border border-gray-700/40">
        <label className="text-[9px] text-gray-500 block mb-1">Effect loop (pure final video tak)</label>
        <div className="flex gap-2 mb-1">
          <button
            type="button"
            onClick={() => patchFx({ durationMode: 'auto' })}
            className={`flex-1 py-1 rounded text-[9px] ${
              !usePxDuration ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-500'
            }`}
          >
            Auto (voice/music length)
          </button>
          <button
            type="button"
            onClick={() => patchFx({ durationMode: 'manual' })}
            className={`flex-1 py-1 rounded text-[9px] ${
              usePxDuration ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-500'
            }`}
          >
            Manual loop (sec)
          </button>
        </div>
        <p className="text-[9px] text-gray-600 mb-1">
          Auto: 1 cycle = poori voice/music length, phir loop — final video ki poori length tak chalega.
        </p>
        {usePxDuration && (
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="120"
              step="1"
              value={fx.durationSec ?? 10}
              onChange={(e) => patchFx({ durationSec: parseInt(e.target.value, 10) || 10 })}
              className="flex-1 h-1.5 accent-amber-500"
            />
            <input
              type="number"
              min="1"
              max="600"
              value={fx.durationSec ?? 10}
              onChange={(e) => patchFx({ durationSec: parseFloat(e.target.value) || 10 })}
              className="w-14 bg-gray-800 rounded text-[10px] p-1 border border-gray-700"
            />
            <span className="text-[9px] text-gray-500">sec</span>
          </div>
        )}
      </div>

      <input
        type="search"
        placeholder="Search effects…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full text-[10px] bg-black/40 border border-gray-700 rounded-lg px-2 py-1.5"
      />

      <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1 pr-0.5">
        <button
          type="button"
          onClick={() => patchFx({ effectId: 'none' })}
          className={`w-full text-left px-2 py-1.5 rounded text-[10px] border ${
            fx.effectId === 'none' || !fx.effectId
              ? 'border-amber-400 bg-amber-500/15 text-amber-100'
              : 'border-gray-700 text-gray-500'
          }`}
        >
          None (no effect)
        </button>
        {filtered.map((cat) => (
          <div key={cat.id} className="rounded border border-gray-800 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenCat(openCat === cat.id ? '' : cat.id)}
              className="w-full flex justify-between px-2 py-1 text-[10px] bg-black/30 text-gray-400"
            >
              {cat.label}
              <span>{cat.effects.length}</span>
            </button>
            {(openCat === cat.id || filter.trim()) && (
              <div className="grid grid-cols-2 gap-0.5 p-1">
                {cat.effects.map((eff) => (
                  <button
                    key={eff.id}
                    type="button"
                    disabled={!appliesToBg || fx.enabled === false}
                    onClick={() => patchFx({ effectId: eff.id })}
                    className={`text-left px-1.5 py-1 rounded text-[9px] truncate disabled:opacity-40 ${
                      fx.effectId === eff.id
                        ? 'bg-amber-500/25 text-amber-100 border border-amber-500/40'
                        : 'text-gray-500 hover:bg-gray-800'
                    }`}
                    title={eff.name}
                  >
                    {eff.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
