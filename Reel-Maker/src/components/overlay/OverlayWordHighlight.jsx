import React from 'react';
import { useScopedOverlay } from './OverlayLineEditContext.jsx';

export default function OverlayWordHighlight({
  activeOverlayIndex,
  config,
  updateOverlayConfig,
  WORD_HIGHLIGHT_LINE_OPTIONS,
}) {
  const { ov, setField, lineLabel } = useScopedOverlay(activeOverlayIndex, config, updateOverlayConfig);
  return (
    <div className="bg-indigo-500/[0.03] p-2.5 rounded-xl border border-indigo-500/[0.06]">
      <p className="text-[10px] text-gray-500 mb-2 font-medium">WORD HIGHLIGHT (har line me)</p>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[9px] text-gray-500">Word bada ho (voice ya fixed)</span>
        <button
          onClick={() => setField('wordHighlightEnabled', !(ov.wordHighlightEnabled ?? false))}
          className={`text-[9px] px-2 py-1 rounded ${(ov.wordHighlightEnabled ?? false) ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-400'}`}
        >
          {(ov.wordHighlightEnabled ?? false) ? 'ON' : 'OFF'}
        </button>
      </div>
      {(ov.wordHighlightEnabled ?? false) && (
        <div className="space-y-2">
          <div>
            <label className="text-[9px] text-gray-500">Mode</label>
            <select
              value={ov.wordHighlightMode || 'voiceSync'}
              onChange={(e) => setField('wordHighlightMode', e.target.value)}
              className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1"
            >
              <option value="voiceSync">Voice sync (jab bola jaye)</option>
              <option value="fixedPerLine">Fixed: har line me Nth word</option>
            </select>
          </div>
          {(ov.wordHighlightMode || 'voiceSync') === 'fixedPerLine' && (
            <div>
              <label className="text-[9px] text-gray-500">Kaun sa word bada (20 options)</label>
              <select
                value={ov.wordHighlightLineOpt ?? '2'}
                onChange={(e) => setField('wordHighlightLineOpt', e.target.value)}
                className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1"
              >
                {WORD_HIGHLIGHT_LINE_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="text-[9px] text-gray-500">Size (1.0–2.5x)</label>
            <div className="flex gap-2 items-center mt-0.5">
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.1"
                value={ov.wordHighlightScale ?? 1.3}
                onChange={(e) => setField('wordHighlightScale', parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-gray-600 rounded"
              />
              <span className="text-[10px] w-10">{(ov.wordHighlightScale ?? 1.3).toFixed(1)}x</span>
            </div>
          </div>
          {(ov.wordHighlightMode || 'voiceSync') === 'voiceSync' && (
            <>
              <div>
                <label className="text-[9px] text-gray-500">Voice sync speed (0.5–2.0)</label>
                <div className="flex gap-2 items-center mt-0.5">
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={ov.wordHighlightSpeed ?? 1}
                    onChange={(e) => setField('wordHighlightSpeed', parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-gray-600 rounded"
                  />
                  <span className="text-[10px] w-8">{(ov.wordHighlightSpeed ?? 1).toFixed(1)}</span>
                </div>
              </div>
              <p className="text-[8px] text-amber-400/90">Character-weighted: lambi words zyada time</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

