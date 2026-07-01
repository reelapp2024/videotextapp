import React from 'react';

export default function OverlayExcelContentSource({
  config,
  updateGlobalConfig,
  excelData,
  excelFrameMode,
  setExcelFrameMode,
  excelRowsPerVideo,
  setExcelRowsPerVideo,
}) {
  return (
    <div className="bg-indigo-500/[0.03] p-2.5 rounded-xl border border-indigo-500/[0.06]">
      <p className="text-[10px] text-gray-500 mb-2 font-medium">EXCEL CONTENT SOURCE</p>
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-1">
          {[
            { id: 'multiColumn', label: 'Multi Column', desc: 'Sab columns, row-wise' },
            { id: 'singleColumn', label: 'Single Column', desc: '1 row = 1 video, one column' },
            { id: 'rowBased', label: 'Row Based', desc: 'Columns = frames' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => updateGlobalConfig('root', 'contentMode', m.id)}
              className={`p-1.5 rounded text-[9px] text-left transition ${
                (config.contentMode || 'multiColumn') === m.id ? 'bg-indigo-600 text-white' : 'bg-indigo-500/[0.05] text-gray-500 hover:bg-indigo-500/[0.08]'
              }`}
            >
              <span className="font-medium block">{m.label}</span>
              <span className="text-[8px] opacity-80">{m.desc}</span>
            </button>
          ))}
        </div>

        {(config.contentMode || 'multiColumn') === 'singleColumn' && (
          <div>
            <label className="text-[9px] text-gray-500 block mb-1">Select column to use</label>
            <select
              value={config.singleColumnIndex ?? 0}
              onChange={(e) => updateGlobalConfig('root', 'singleColumnIndex', parseInt(e.target.value))}
              className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1"
            >
              {excelData.length > 0
                ? excelData[0].map((_, idx) => (
                  <option key={idx} value={idx}>Column {idx + 1}</option>
                ))
                : <option value={0}>Upload Excel first</option>}
            </select>
            <p className="text-[8px] text-amber-400/90 mt-0.5">Duration defined by audio (voice/music)</p>
          </div>
        )}

        {(config.contentMode || 'multiColumn') === 'rowBased' && (
          <div className="space-y-2 pt-1">
            <div>
              <label className="text-[9px] text-gray-500 block mb-1">Frame Mode</label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => setExcelFrameMode('colPerFrame')}
                  className={`p-1.5 rounded text-[9px] transition ${excelFrameMode === 'colPerFrame' ? 'bg-violet-600 text-white' : 'bg-indigo-500/[0.05] text-gray-500 hover:bg-indigo-500/[0.08]'}`}
                >
                  <span className="font-medium block">Col per Frame</span>
                  <span className="text-[8px] opacity-80">Har column = 1 frame</span>
                </button>
                <button
                  onClick={() => setExcelFrameMode('allInOneFrame')}
                  className={`p-1.5 rounded text-[9px] transition ${excelFrameMode === 'allInOneFrame' ? 'bg-violet-600 text-white' : 'bg-indigo-500/[0.05] text-gray-500 hover:bg-indigo-500/[0.08]'}`}
                >
                  <span className="font-medium block">All in 1 Frame</span>
                  <span className="text-[8px] opacity-80">Sab columns ek sath</span>
                </button>
              </div>
            </div>
            <div>
              <label className="text-[9px] text-gray-500 block mb-1">How many rows to combine into 1 video? (blank = 1 row = 1 video)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 3"
                value={excelRowsPerVideo}
                onChange={(e) => setExcelRowsPerVideo(e.target.value)}
                className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1.5 placeholder-gray-600"
              />
              {parseInt(excelRowsPerVideo) > 0 && excelData.length > 0 && (
                <p className="text-[8px] text-violet-400/80 mt-0.5">
                  {Math.ceil(excelData.length / parseInt(excelRowsPerVideo))} videos will be created ({excelData.length} rows / {excelRowsPerVideo})
                </p>
              )}
            </div>
            <p className="text-[8px] text-gray-500">
              {excelFrameMode === 'colPerFrame'
                ? 'Each column content shows in a separate frame — video duration divided equally'
                : 'All column content displays in a single frame'}
            </p>
          </div>
        )}

        <p className="text-[8px] text-gray-500">
          Multi: Voice/Music count se videos | Single/Row: Excel rows = videos
        </p>
      </div>
    </div>
  );
}

