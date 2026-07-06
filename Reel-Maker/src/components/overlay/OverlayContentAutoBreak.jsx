import React from 'react';
import { useOverlayLineScope } from './OverlayLineEditContext.jsx';

export default function OverlayContentAutoBreak({
  activeOverlayIndex,
  config,
  updateOverlayConfig,
}) {
  const lineScope = useOverlayLineScope();
  const overlay = config.overlays[activeOverlayIndex];
  const enabled = overlay.contentTextSectionEnabled ?? false;

  const breakParts = lineScope?.breakParts ?? [];
  const lineCount = breakParts.length;
  const lineSelection = lineScope?.lineSelection ?? 'all';
  const setLineSelection = lineScope?.setLineSelection;
  const hasBreakRules = lineScope?.hasBreakRules ?? false;
  const usingCaptions = lineScope?.usingCaptions ?? false;

  const resetLineSelectionIfGlobal = (nextMarks, nextCustomBreak) => {
    const nextHasRules = nextMarks.length > 0 || String(nextCustomBreak || '').trim().length > 0;
    if (!nextHasRules && lineCount <= 1 && (overlay.contentBreakLineSelection || 'all') !== 'all') {
      setLineSelection?.('all');
    }
  };

  return (
    <div className="bg-indigo-500/[0.03] p-2.5 rounded-xl border border-indigo-500/[0.06]">
      <div className="flex justify-between items-center mb-2">
        <p className="text-[10px] text-gray-500 font-medium">Content Text & Auto-Break</p>
        <button
          onClick={() => updateOverlayConfig(activeOverlayIndex, 'contentTextSectionEnabled', !enabled)}
          className={`text-[10px] px-2 py-1 rounded font-medium transition ${enabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-400'}`}
        >
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>
      {enabled && (
        <div className="space-y-3 pt-1 border-t border-gray-700/50">
          <p className="text-[9px] text-gray-500">
            {usingCaptions
              ? 'Text comes from generated captions. Each caption segment is a line; punctuation can split further.'
              : 'Text comes from Excel. Lines auto-break when punctuation is selected.'}
          </p>
          <div className="pt-2">
            <p className="text-[9px] text-gray-500 mb-2 font-medium">AUTO-BREAK AT PUNCTUATION (breaks on selection)</p>
            <div className="grid grid-cols-4 gap-1.5">
              {['.', '?', '!', '...', '=', ';', ':', ','].map((mark) => (
                <label key={mark} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(overlay.punctuationBreakMarks || []).includes(mark)}
                    onChange={(e) => {
                      const current = overlay.punctuationBreakMarks || [];
                      const updated = e.target.checked ? [...current, mark] : current.filter((m) => m !== mark);
                      updateOverlayConfig(activeOverlayIndex, 'punctuationBreakMarks', updated);
                      resetLineSelectionIfGlobal(updated, overlay.customBreakText);
                    }}
                    className="w-3 h-3"
                  />
                  <span className="text-[10px] text-gray-400">{mark}</span>
                </label>
              ))}
            </div>
            <div className="mt-2">
              <label className="text-[9px] text-gray-500 block mb-1">Custom Break (type any character to break at)</label>
              <input
                type="text"
                placeholder="e.g. - | / or any word/symbol"
                value={overlay.customBreakText || ''}
                onChange={(e) => {
                  const nextCustom = e.target.value;
                  updateOverlayConfig(activeOverlayIndex, 'customBreakText', nextCustom);
                  resetLineSelectionIfGlobal(overlay.punctuationBreakMarks || [], nextCustom);
                }}
                className="w-full bg-gray-700 border-none rounded text-[10px] p-1.5 text-gray-300 placeholder-gray-600"
              />
              <p className="text-[8px] text-gray-600 mt-0.5">Separate multiple with space: - | / or any word</p>
            </div>
            <div className="mt-2">
              <label className="text-[9px] text-gray-500 block mb-1">SELECT LINE FOR EDIT</label>
              <select
                value={lineSelection}
                disabled={lineCount === 0}
                onChange={(e) => setLineSelection?.(e.target.value)}
                className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1.5 text-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="all">All lines</option>
                {breakParts.map((line, idx) => (
                  <option key={idx} value={String(idx + 1)}>
                    Line {idx + 1}
                    {line ? ` — ${line.length > 28 ? `${line.slice(0, 28)}…` : line}` : ''}
                  </option>
                ))}
              </select>
              {lineCount === 0 && (
                <p className="text-[8px] text-amber-400/90 mt-1">
                  {usingCaptions ? 'Generate captions first to list lines.' : 'Upload Excel + select a column to list lines.'}
                </p>
              )}
              {lineCount > 0 && !hasBreakRules && usingCaptions && (
                <p className="text-[8px] text-gray-500 mt-1">Caption segments listed as lines. Add punctuation to split lines further.</p>
              )}
              {lineCount > 0 && lineSelection !== 'all' && (
                <p className="text-[8px] text-cyan-400/90 mt-1">
                  Preview pinned to {lineScope?.lineLabel || `Line ${lineSelection}`} while editing (play to resume timeline).
                </p>
              )}
            </div>

            <div className="my-3 border-t-2 border-indigo-500/25" aria-hidden="true" />
            <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wide">
              Settings below → {lineScope?.lineLabel || (lineSelection === 'all' ? 'All lines' : `Line ${lineSelection}`)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
