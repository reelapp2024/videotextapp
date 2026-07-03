import React from 'react';
import { useScopedOverlay } from './OverlayLineEditContext.jsx';

export default function OverlayLayout({
  activeOverlayIndex,
  config,
  updateOverlayConfig,
  excelData = [],
  previewRowIndex = 0,
  captionPreviewWords = null,
}) {
  const { ov, setField, lineLabel } = useScopedOverlay(activeOverlayIndex, config, updateOverlayConfig);
  const colIdx = ov?.excelColumnIndex ?? ov?.id ?? 0;
  const excelPreview =
    excelData.length > 0
      ? (excelData[Math.min(previewRowIndex, excelData.length - 1)] || [])[colIdx] || ''
      : '';
  const useCaptionWords = captionPreviewWords?.length > 0 && (config.textSource === 'captions' || config.captionSync?.enabled);
  const previewText = useCaptionWords ? captionPreviewWords.join(' ') : excelPreview || 'Preview Text';
  const words = previewText.split(/\s+/).filter(Boolean);

  return (
    <div className="bg-indigo-500/[0.03] p-2.5 rounded-xl border border-indigo-500/[0.06]">
      <p className="text-[10px] text-gray-500 mb-2 font-medium">
        LAYOUT {ov?.captionPresetsEnabled ? '(overrides caption preset)' : ''}
      </p>
      {useCaptionWords && (
        <p className="text-[9px] text-cyan-500/80 mb-2">Caption text — layout applies on preview & export</p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
        <div>
          <label className="text-[10px] text-gray-500">Words/Line</label>
          <input
            type="number"
            min="1"
            max="20"
            value={ov.wordsPerLine ?? 4}
            onChange={(e) => setField('wordsPerLine', parseInt(e.target.value) || 4)}
            className="w-full bg-gray-700 rounded text-xs p-1.5 border-none"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-500">Lines/Frame (0=all)</label>
          <input
            type="number"
            min="0"
            max="20"
            value={ov.linesPerFrame ?? 0}
            onChange={(e) => setField('linesPerFrame', parseInt(e.target.value) || 0)}
            className="w-full bg-gray-700 rounded text-xs p-1.5 border-none"
            placeholder="0"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-500">Line Height</label>
          <input
            type="number"
            min="0.8"
            max="3"
            step="0.1"
            value={ov.lineHeight ?? 1.4}
            onChange={(e) => setField('lineHeight', parseFloat(e.target.value))}
            className="w-full bg-gray-700 rounded text-xs p-1.5 border-none"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-500">Letter Gap</label>
          <input
            type="number"
            min="0"
            max="10"
            step="1"
            value={ov.letterSpacing ?? 0}
            onChange={(e) => setField('letterSpacing', parseInt(e.target.value) || 0)}
            className="w-full bg-gray-700 rounded text-xs p-1.5 border-none"
          />
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-gray-700/30">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[10px] text-gray-400 font-medium uppercase">Individual Overrides</p>
          <div className="flex gap-1">
            <select
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') return;
                const gIdx = parseInt(val);
                const current = ov.wordOverrides || {};
                setField('wordOverrides', {
                  ...current,
                  [gIdx]: { color: '#FFD700', fontWeight: 'bold', fontSize: ov.fontSize },
                });
                e.target.value = '';
              }}
              className="text-[9px] bg-indigo-600/50 hover:bg-indigo-600 text-white px-1 py-0.5 rounded outline-none border-none cursor-pointer"
            >
              <option value="">+ Word</option>
              {words.map((w, i) => (
                <option key={i} value={i}>{i}: {w.substring(0, 10)}</option>
              ))}
            </select>
            <select
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') return;
                const lIdx = parseInt(val);
                const current = ov.lineOverrides || {};
                setField('lineOverrides', {
                  ...current,
                  [lIdx]: { color: '#FF69B4' },
                });
                e.target.value = '';
              }}
              className="text-[9px] bg-purple-600/50 hover:bg-purple-600 text-white px-1 py-0.5 rounded outline-none border-none cursor-pointer"
            >
              <option value="">+ Line</option>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <option key={i} value={i}>Line {i}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {Object.entries(ov.wordOverrides || {}).map(([idx, style]) => (
            <div key={`w-${idx}`} className="bg-gray-800/50 p-1.5 rounded flex flex-col gap-1 border border-gray-700/30">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-indigo-400">Word {idx}</span>
                <button
                  onClick={() => {
                    const current = { ...ov.wordOverrides };
                    delete current[idx];
                    setField('wordOverrides', current);
                  }}
                  className="text-[9px] text-red-400"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="color"
                  value={style.color || '#ffffff'}
                  onChange={(e) => {
                    const current = { ...ov.wordOverrides };
                    current[idx] = { ...current[idx], color: e.target.value };
                    setField('wordOverrides', current);
                  }}
                  className="w-full h-4 bg-transparent border-none cursor-pointer"
                />
                <select
                  value={style.fontWeight || 'bold'}
                  onChange={(e) => {
                    const current = { ...ov.wordOverrides };
                    current[idx] = { ...current[idx], fontWeight: e.target.value };
                    setField('wordOverrides', current);
                  }}
                  className="bg-gray-700 text-[9px] rounded p-0.5"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="900">Black</option>
                </select>
              </div>
            </div>
          ))}
          {Object.entries(ov.lineOverrides || {}).map(([idx, style]) => (
            <div key={`l-${idx}`} className="bg-gray-800/50 p-1.5 rounded flex flex-col gap-1 border border-gray-700/30">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-purple-400">Line {idx}</span>
                <button
                  onClick={() => {
                    const current = { ...ov.lineOverrides };
                    delete current[idx];
                    setField('lineOverrides', current);
                  }}
                  className="text-[9px] text-red-400"
                >
                  Remove
                </button>
              </div>
              <input
                type="color"
                value={style.color || '#ffffff'}
                onChange={(e) => {
                  const current = { ...ov.lineOverrides };
                  current[idx] = { ...current[idx], color: e.target.value };
                  setField('lineOverrides', current);
                }}
                className="w-full h-4 bg-transparent border-none cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-2">
        <label className="text-[10px] text-gray-500 block mb-1">Alignment</label>
        <div className="grid grid-cols-3 gap-1">
          {['left', 'center', 'right'].map((align) => (
            <button
              key={align}
              onClick={() => setField('textAlign', align)}
              className={`p-1.5 rounded text-xs transition ${
                (ov.textAlign || 'center') === align
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-500/[0.05] text-gray-500 hover:bg-indigo-500/[0.08]'
              }`}
            >
              {align === 'left' ? '◀' : align === 'center' ? '●' : '▶'}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>X Position</span>
          <span>{ov.positionX ?? 50}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          className="w-full h-1.5 bg-gray-600 rounded-lg"
          value={ov.positionX ?? 50}
          onChange={(e) => setField('positionX', parseInt(e.target.value))}
        />
      </div>
      <div>
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>Y Position</span>
          <span>{ov.positionY}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          className="w-full h-1.5 bg-gray-600 rounded-lg"
          value={ov.positionY}
          onChange={(e) => setField('positionY', parseInt(e.target.value))}
        />
      </div>
    </div>
  );
}
