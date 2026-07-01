import React from 'react';

export default function OverlayContentAutoBreak({
  activeOverlayIndex,
  config,
  updateOverlayConfig,
  excelData,
  LINE_ANIM_MODES,
  LINE_ANIM_EFFECTS,
}) {
  return (
    <div className="bg-indigo-500/[0.03] p-2.5 rounded-xl border border-indigo-500/[0.06]">
      <div className="flex justify-between items-center mb-2">
        <p className="text-[10px] text-gray-500 font-medium">Content Text & Auto-Break</p>
        <button
          onClick={() => updateOverlayConfig(activeOverlayIndex, 'contentTextSectionEnabled', !(config.overlays[activeOverlayIndex].contentTextSectionEnabled ?? false))}
          className={`text-[10px] px-2 py-1 rounded font-medium transition ${(config.overlays[activeOverlayIndex].contentTextSectionEnabled ?? false) ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-400'}`}
        >
          {(config.overlays[activeOverlayIndex].contentTextSectionEnabled ?? false) ? 'ON' : 'OFF'}
        </button>
      </div>
      {(config.overlays[activeOverlayIndex].contentTextSectionEnabled ?? false) && (
        <div className="space-y-3 pt-1 border-t border-gray-700/50">
          <p className="text-[9px] text-gray-500">Text comes from Excel. Lines auto-break when punctuation is selected.</p>
          <div className="pt-2">
            <p className="text-[9px] text-gray-500 mb-2 font-medium">AUTO-BREAK AT PUNCTUATION (breaks on selection)</p>
            <div className="grid grid-cols-4 gap-1.5">
              {['.', '?', '!', '...', '=', ';', ':', ','].map((mark) => (
                <label key={mark} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(config.overlays[activeOverlayIndex].punctuationBreakMarks || []).includes(mark)}
                    onChange={(e) => {
                      const current = config.overlays[activeOverlayIndex].punctuationBreakMarks || [];
                      const updated = e.target.checked ? [...current, mark] : current.filter((m) => m !== mark);
                      updateOverlayConfig(activeOverlayIndex, 'punctuationBreakMarks', updated);
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
                value={config.overlays[activeOverlayIndex].customBreakText || ''}
                onChange={(e) => updateOverlayConfig(activeOverlayIndex, 'customBreakText', e.target.value)}
                className="w-full bg-gray-700 border-none rounded text-[10px] p-1.5 text-gray-300 placeholder-gray-600"
              />
              <p className="text-[8px] text-gray-600 mt-0.5">Separate multiple with space: - | / or any word</p>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-700/50">
            <p className="text-[9px] text-gray-500 mb-2 font-medium">LINE DURATION, HOLD & ANIM (Reveal + Anim Type + Speed)</p>
            {(() => {
              const colIdx = config.overlays[activeOverlayIndex].excelColumnIndex ?? config.overlays[activeOverlayIndex].id;
              const sampleText = excelData.length > 0 ? String(excelData[0][colIdx] || '').trim() : '';
              const marks = config.overlays[activeOverlayIndex].punctuationBreakMarks || [];
              const customBreak = (config.overlays[activeOverlayIndex].customBreakText || '').trim();
              const allBreaks = [...marks];
              if (customBreak) {
                customBreak.split(/\s+/).forEach((b) => { if (b && !allBreaks.includes(b)) allBreaks.push(b); });
              }
              let parts = [];
              if (sampleText && allBreaks.length > 0) {
                try {
                  const pattern = allBreaks.map((m) => String(m).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
                  const regex = new RegExp(`(${pattern})`, 'g');
                  parts = sampleText.replace(regex, '$1\n').split('\n').map((p) => p.trim()).filter((p) => p);
                } catch (_) { parts = [sampleText]; }
              } else if (sampleText) {
                parts = [sampleText];
              }
              if (parts.length === 0) {
                return (
                  <p className="text-[9px] text-amber-400/90">Upload Excel + select a column — lines will appear here</p>
                );
              }
              const durations = config.overlays[activeOverlayIndex].contentPartDurations || [];
              const holdAfters = config.overlays[activeOverlayIndex].contentPartHoldAfter || [];
              const lineAnimates = config.overlays[activeOverlayIndex].contentPartLineAnimate || [];
              const animSpeed = config.overlays[activeOverlayIndex].contentLineAnimSpeed ?? 2;
              return (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <div className="space-y-1.5 mb-1">
                    <div>
                      <span className="text-[9px] text-gray-500 block mb-0.5">Reveal (kaise dikhega):</span>
                      <select
                        value={config.overlays[activeOverlayIndex].contentLineRevealMode || 'wordByWord'}
                        onChange={(e) => updateOverlayConfig(activeOverlayIndex, 'contentLineRevealMode', e.target.value)}
                        className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1 text-gray-300"
                      >
                        {LINE_ANIM_MODES.map((m) => (
                          <option key={m.id} value={m.id}>{m.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 block mb-0.5">Anim Type (effect):</span>
                      <select
                        value={LINE_ANIM_EFFECTS.some((e) => e.id === config.overlays[activeOverlayIndex].contentLineAnimType) ? config.overlays[activeOverlayIndex].contentLineAnimType : 'fadeIn'}
                        onChange={(e) => updateOverlayConfig(activeOverlayIndex, 'contentLineAnimType', e.target.value)}
                        className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1 text-gray-300"
                      >
                        {LINE_ANIM_EFFECTS.map((t) => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-gray-500">
                        Anim Speed ({(() => { const m = config.overlays[activeOverlayIndex].contentLineRevealMode || 'wordByWord'; return m === 'characterByChar' ? 'chars' : m === 'lineByLine' ? 'lines' : m === 'frameByFrame' ? 'block' : 'words'; })()}/sec):
                      </span>
                      <input
                        type="number"
                        min={0.1}
                        max={100}
                        step={0.5}
                        value={animSpeed}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          if (!isNaN(v) && v >= 0.1) updateOverlayConfig(activeOverlayIndex, 'contentLineAnimSpeed', v);
                        }}
                        className="w-14 bg-gray-700 rounded text-[10px] p-1 text-right border-none text-gray-300"
                        placeholder="0.1+"
                      />
                    </div>
                  </div>
                  {parts.map((line, idx) => {
                    const sameFrameArr = config.overlays[activeOverlayIndex].contentPartSameFrame || [];
                    const isSameFrame = idx > 0 && (sameFrameArr[idx] ?? false);
                    return (
                      <div key={idx} className={`flex flex-col gap-1 p-1.5 rounded ${isSameFrame ? 'bg-blue-900/20 border-l-2 border-blue-500/40' : 'bg-gray-800/50'}`}>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[8px] text-gray-500 w-5 shrink-0">#{idx + 1}</span>
                          {idx > 0 && (
                            <button
                              onClick={() => {
                                const arr = [...(config.overlays[activeOverlayIndex].contentPartSameFrame || [])];
                                arr[idx] = !arr[idx];
                                updateOverlayConfig(activeOverlayIndex, 'contentPartSameFrame', arr);
                              }}
                              className={`text-[7px] px-1.5 py-0.5 rounded font-medium ${isSameFrame ? 'bg-indigo-600/40 text-indigo-300' : 'bg-gray-700 text-gray-400'}`}
                              title={isSameFrame ? 'Same frame: shows with previous part' : 'Next frame: shows on separate frame'}
                            >
                              {isSameFrame ? 'SAME' : 'NEXT'}
                            </button>
                          )}
                          {idx === 0 && <span className="text-[7px] px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-500">1st</span>}
                          <label className="flex items-center gap-1 cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={lineAnimates[idx] ?? false}
                              onChange={(e) => {
                                const arr = [...(config.overlays[activeOverlayIndex].contentPartLineAnimate || [])];
                                arr[idx] = e.target.checked;
                                updateOverlayConfig(activeOverlayIndex, 'contentPartLineAnimate', arr);
                              }}
                              className="w-3 h-3"
                            />
                            <span className="text-[8px] text-gray-400">Anim</span>
                          </label>
                          <span className="text-[9px] text-gray-400 truncate flex-1 min-w-0" title={line}>
                            {line.length > 22 ? line.slice(0, 22) + '…' : line}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pl-5">
                          <span className="text-[8px] text-gray-500 w-16 shrink-0">Disp:</span>
                          <input
                            type="number"
                            min={0.1}
                            max={20}
                            step={0.1}
                            value={durations[idx] != null && durations[idx] >= 0.1 && durations[idx] <= 20 ? durations[idx] : 5}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              if (isNaN(v) || v < 0.1 || v > 20) return;
                              const arr = [...(config.overlays[activeOverlayIndex].contentPartDurations || [])];
                              arr[idx] = v;
                              updateOverlayConfig(activeOverlayIndex, 'contentPartDurations', arr);
                            }}
                            className="w-12 bg-gray-700 rounded text-[10px] p-1 text-right border-none text-gray-300"
                            title="Line display duration (sec)"
                          />
                          <span className="text-[8px] text-gray-500">sec</span>
                          <span className="text-[8px] text-gray-500 ml-2">Hold:</span>
                          <input
                            type="number"
                            min={0}
                            max={30}
                            step={0.1}
                            value={holdAfters[idx] != null && holdAfters[idx] >= 0 && holdAfters[idx] <= 30 ? holdAfters[idx] : 0}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              if (isNaN(v) || v < 0 || v > 30) return;
                              const arr = [...(config.overlays[activeOverlayIndex].contentPartHoldAfter || [])];
                              arr[idx] = v;
                              updateOverlayConfig(activeOverlayIndex, 'contentPartHoldAfter', arr);
                            }}
                            className="w-12 bg-gray-700 rounded text-[10px] p-1 text-right border-none text-gray-300"
                            title="Blank gap after this line (no text) — next line appears after"
                          />
                          <span className="text-[8px] text-gray-500">sec</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

