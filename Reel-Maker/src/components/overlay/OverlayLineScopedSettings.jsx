import React from 'react';
import { useOverlayLineScope } from './OverlayLineEditContext.jsx';

export default function OverlayLineScopedSettings({
  LINE_ANIM_MODES,
  LINE_ANIM_EFFECTS,
}) {
  const scope = useOverlayLineScope();
  if (!scope) return null;

  const {
    overlay: ov,
    setField,
    getField,
    isGlobal,
    lineIndex,
    lineLabel,
    breakParts,
  } = scope;

  if (breakParts.length === 0) {
    return (
      <div className="bg-indigo-500/[0.03] p-2.5 rounded-xl border border-indigo-500/[0.06] -mt-2">
        <p className="text-[9px] text-amber-400/90">
          Add Excel text or generate captions to edit per-line timing and animation.
        </p>
      </div>
    );
  }

  const activeReveal = getField('contentLineRevealMode', 'wordByWord');
  const activeAnimType = getField('contentLineAnimType', 'fadeIn');
  const activeAnimSpeed = getField('contentLineAnimSpeed', 2);
  const activeDuration = getField('contentPartDuration', 5);
  const activeHold = getField('contentPartHold', 0);
  const activeLineAnim = getField('contentPartLineAnimate', false);
  const activeSameFrame = getField('contentPartSameFrame', false);

  const speedUnit = activeReveal === 'characterByChar'
    ? 'chars'
    : activeReveal === 'lineByLine'
      ? 'lines'
      : activeReveal === 'frameByFrame'
        ? 'block'
        : 'words';

  const previewLine = !isGlobal && lineIndex != null ? breakParts[lineIndex] : null;

  return (
    <div className="bg-indigo-500/[0.03] p-2.5 rounded-xl border border-indigo-500/[0.06] -mt-2 space-y-2">
      <p className="text-[9px] text-cyan-400/90 font-medium">
        Editing: <span className="text-cyan-200">{lineLabel}</span>
        {isGlobal ? ' — changes apply to every line unless a line has its own override' : ' — only this line'}
      </p>
      {previewLine && (
        <p className="text-[8px] text-gray-500 truncate" title={previewLine}>
          “{previewLine.length > 64 ? `${previewLine.slice(0, 64)}…` : previewLine}”
        </p>
      )}

      <div className="space-y-1.5">
        <div>
          <span className="text-[9px] text-gray-500 block mb-0.5">Reveal (kaise dikhega):</span>
          <select
            value={activeReveal}
            onChange={(e) => setField('contentLineRevealMode', e.target.value)}
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
            value={LINE_ANIM_EFFECTS.some((e) => e.id === activeAnimType) ? activeAnimType : 'fadeIn'}
            onChange={(e) => setField('contentLineAnimType', e.target.value)}
            className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1 text-gray-300"
          >
            {LINE_ANIM_EFFECTS.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-gray-500">Anim Speed ({speedUnit}/sec):</span>
          <input
            type="number"
            min={0.1}
            max={100}
            step={0.5}
            value={activeAnimSpeed}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v) && v >= 0.1) setField('contentLineAnimSpeed', v);
            }}
            className="w-14 bg-gray-700 rounded text-[10px] p-1 text-right border-none text-gray-300"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(activeLineAnim)}
            onChange={(e) => setField('contentPartLineAnimate', e.target.checked)}
            className="w-3 h-3"
          />
          <span className="text-[9px] text-gray-400">Line animation enabled</span>
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] text-gray-500">Display:</span>
          <input
            type="number"
            min={0.1}
            max={20}
            step={0.1}
            value={activeDuration >= 0.1 && activeDuration <= 20 ? activeDuration : 5}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v) && v >= 0.1 && v <= 20) setField('contentPartDuration', v);
            }}
            className="w-14 bg-gray-700 rounded text-[10px] p-1 text-right border-none text-gray-300"
          />
          <span className="text-[8px] text-gray-500">sec</span>
          <span className="text-[9px] text-gray-500 ml-1">Hold after:</span>
          <input
            type="number"
            min={0}
            max={30}
            step={0.1}
            value={activeHold >= 0 && activeHold <= 30 ? activeHold : 0}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v) && v >= 0 && v <= 30) setField('contentPartHold', v);
            }}
            className="w-14 bg-gray-700 rounded text-[10px] p-1 text-right border-none text-gray-300"
          />
          <span className="text-[8px] text-gray-500">sec</span>
        </div>
        {!isGlobal && lineIndex > 0 && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(activeSameFrame)}
              onChange={(e) => setField('contentPartSameFrame', e.target.checked)}
              className="w-3 h-3"
            />
            <span className="text-[9px] text-gray-400">Show on same frame as previous line (SAME)</span>
          </label>
        )}
      </div>

      {breakParts.length > 1 && (
        <div className="pt-1 border-t border-gray-700/40 space-y-1 max-h-24 overflow-y-auto">
          <p className="text-[8px] text-gray-600">Lines in this overlay:</p>
          {breakParts.map((line, idx) => (
            <p key={idx} className={`text-[8px] truncate ${!isGlobal && idx === lineIndex ? 'text-cyan-300' : 'text-gray-500'}`}>
              #{idx + 1} {line.length > 48 ? `${line.slice(0, 48)}…` : line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
