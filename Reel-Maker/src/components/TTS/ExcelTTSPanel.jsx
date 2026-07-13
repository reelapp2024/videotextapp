import React, { useRef, useState } from 'react';
import { FileSpreadsheet, Upload, Loader2, Zap } from 'lucide-react';

/**
 * Excel-only TTS sidebar workflow.
 * Row/column/target behavior unchanged — styling only.
 */
export default function ExcelTTSPanel({
  activeTab,
  ttsMode,
  setTtsMode,
  ttsColumn,
  setTtsColumn,
  excelData,
  ttsSelectedRows,
  setTtsSelectedRows,
  handleExcelUpload,
  excelFileName,
  ttsGenerating,
  generateAllTTS,
  serverProcessing,
  serverJobType,
  serverProgress,
  ttsProgress,
}) {
  const fileInputRef = useRef(null);
  const [localName, setLocalName] = useState('');

  if (activeTab !== 'tts') return null;

  const displayName = excelFileName || localName;
  const hasExcel = excelData.length > 0;
  const isBusy = ttsGenerating || (serverProcessing && serverJobType === 'tts');
  const progressPct = serverProcessing && serverJobType === 'tts' ? serverProgress : ttsProgress;

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setLocalName(file.name);
    handleExcelUpload?.(e);
  };

  return (
    <div className="animate-fadeIn space-y-3">
      <div className="glass-card rounded-xl overflow-hidden border border-violet-500/15">
        <div className="px-3 py-2.5 border-b border-violet-500/10 bg-gradient-to-r from-violet-600/15 to-transparent flex items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-violet-100 flex items-center gap-1.5 uppercase tracking-wide">
            <FileSpreadsheet className="w-3.5 h-3.5 text-violet-400" />
            TTS Excel
          </h3>
          <span className="text-[9px] font-bold text-violet-300/70 tabular-nums">
            {hasExcel ? `${excelData.length} rows` : 'No file'}
          </span>
        </div>

        <div className="p-3 space-y-3">
          {/* Upload only when Excel is not already loaded from Upload tab */}
          {!hasExcel && (
            <div>
              <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block mb-1.5">
                Upload Excel
              </label>
              <label className="flex items-center justify-center gap-2 w-full cursor-pointer rounded-lg border border-dashed border-violet-500/30 bg-violet-500/[0.06] hover:bg-violet-500/10 hover:border-violet-400/40 px-3 py-2.5 transition">
                <Upload className="w-3.5 h-3.5 text-violet-300" />
                <span className="text-[11px] font-semibold text-violet-200">
                  Choose .xlsx / .csv
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={onFileChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Selected file */}
          <div className="rounded-lg bg-black/30 border border-white/[0.05] px-2.5 py-2">
            <p className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">
              Selected File
            </p>
            <p className="text-[11px] text-gray-200 truncate">
              {hasExcel
                ? displayName || `Spreadsheet · ${excelData.length} rows × ${excelData[0]?.length || 0} cols`
                : 'None — upload Excel to continue'}
            </p>
          </div>

          {/* Mode */}
          <div>
            <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block mb-1.5">
              Mode
            </label>
            <div className="flex gap-1 bg-gray-900/50 p-0.5 rounded-lg border border-gray-800">
              <button
                type="button"
                onClick={() => setTtsMode('column')}
                className={`flex-1 text-[10px] py-1.5 rounded-md font-bold transition ${
                  ttsMode === 'column'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Column Mode
              </button>
              <button
                type="button"
                onClick={() => setTtsMode('row')}
                className={`flex-1 text-[10px] py-1.5 rounded-md font-bold transition ${
                  ttsMode === 'row'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Row Mode
              </button>
            </div>
          </div>

          {ttsMode === 'column' ? (
            <div className="bg-gray-900/30 p-2 rounded-lg border border-gray-800/50">
              <label className="text-[9px] text-gray-500 block mb-1">Target Column</label>
              <select
                className="w-full bg-[#080b16] border border-violet-500/[0.15] rounded-md p-1.5 text-xs text-gray-300 outline-none focus:border-violet-500/40"
                value={ttsColumn}
                onChange={(e) => setTtsColumn(parseInt(e.target.value, 10))}
                disabled={!hasExcel}
              >
                {hasExcel ? (
                  excelData[0].map((_, idx) => (
                    <option key={idx} value={idx}>
                      Column {idx + 1} ({excelData.length} entries)
                    </option>
                  ))
                ) : (
                  <option value={0}>Upload Excel first</option>
                )}
              </select>
            </div>
          ) : (
            <div className="bg-gray-900/30 p-2 rounded-lg border border-gray-800/50">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[9px] text-gray-500">Target Rows</label>
                {hasExcel && (
                  <button
                    type="button"
                    onClick={() =>
                      setTtsSelectedRows(
                        ttsSelectedRows.length === excelData.length
                          ? []
                          : excelData.map((_, i) => i)
                      )
                    }
                    className="text-[9px] text-violet-400 hover:text-violet-300 font-bold"
                  >
                    {ttsSelectedRows.length === excelData.length ? 'NONE' : 'ALL'}
                  </button>
                )}
              </div>
              {hasExcel ? (
                <div className="max-h-28 overflow-y-auto bg-black/20 rounded border border-gray-800 p-1 space-y-1 custom-scrollbar">
                  {excelData.map((row, ri) => (
                    <label
                      key={ri}
                      className="flex items-center gap-1.5 text-[9px] text-gray-400 cursor-pointer hover:bg-violet-500/10 rounded px-1.5 py-1 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={ttsSelectedRows.includes(ri)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTtsSelectedRows((prev) => [...prev, ri].sort((a, b) => a - b));
                          } else {
                            setTtsSelectedRows((prev) => prev.filter((x) => x !== ri));
                          }
                        }}
                        className="w-2.5 h-2.5 rounded accent-violet-500 border-gray-700 bg-gray-800"
                      />
                      <span className="truncate">Row {ri + 1}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-[9px] text-gray-600 italic">No data available</p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={generateAllTTS}
            disabled={isBusy || !hasExcel}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-900/20 active:scale-[0.98]"
          >
            {isBusy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" /> Generate All Audio
              </>
            )}
          </button>
          <p className="text-[9px] text-center text-gray-500 leading-snug">
            Uses the active studio tab (Basic or Advanced) and its current voice / style / pace / accent.
          </p>

          {isBusy && (
            <div className="bg-violet-900/10 border border-violet-500/10 p-2 rounded-lg space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] text-violet-300 font-bold uppercase animate-pulse">
                  Processing…
                </span>
                <span className="text-[10px] font-mono text-violet-400 font-bold">{progressPct}%</span>
              </div>
              <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
