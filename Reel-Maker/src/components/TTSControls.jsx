import React from 'react';
import { Mic, Volume2, Loader2, Check, Sliders, Zap, Award } from 'lucide-react';

export default function TTSControls({
  libsLoaded,
  activeTab,
  ttsMode,
  setTtsMode,
  ttsColumn,
  setTtsColumn,
  excelData,
  ttsSelectedRows,
  setTtsSelectedRows,
  backendVoices,
  availableVoices,
  ttsSpeaker,
  setTtsSpeaker,
  getNeuralVoiceCategoriesForUI,
  getNeuralVoicesForUI,
  speakerGenderOptions,
  ttsSpeakerGender,
  setTtsSpeakerGender,
  moodPresets,
  applyMood,
  ttsMood,
  audioEffects,
  ttsEffect,
  setTtsEffect,
  getFinalVoiceSettings,
  ttsRate,
  setTtsRate,
  ttsPitch,
  setTtsPitch,
  ttsPreviewText,
  setTtsPreviewText,
  previewTTS,
  serverProcessing,
  serverJobType,
  serverProgress,
  ttsProgress,
  ttsGenerating,
  generateAllTTS,
  voiceQualityMode,
  setVoiceQualityMode,
  voiceQualityModes,
}) {
  if (activeTab !== 'tts') return null;

  return (
    <div className="animate-fadeIn">
      <div className="glass-card p-3 sm:p-4 rounded-xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-indigo-100/90 flex items-center gap-1.5 uppercase tracking-wide">
            <Mic className="w-3.5 h-3.5 text-indigo-400" /> Neural TTS Engine
          </h3>
          <span className="text-[9px] px-2 py-0.5 bg-indigo-500/20 rounded-full text-indigo-300 border border-indigo-500/20 font-bold" title="Numbers, ₹, %, phones read clearly via server SSML">
            PRO · SMART NUMBERS
          </span>
        </div>

        {/* Voice Quality - For Clarity */}
        <div className="bg-indigo-500/[0.05] p-2 rounded-lg border border-indigo-500/10">
          <label className="text-[10px] text-indigo-300 font-bold mb-1.5 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Voice Engine Quality (Clarity)
          </label>
          <div className="grid grid-cols-4 gap-1">
            {Object.entries(voiceQualityModes || {}).map(([id, q]) => (
              <button
                key={id}
                onClick={() => setVoiceQualityMode(id)}
                className={`text-[9px] py-1.5 rounded font-bold transition flex flex-col items-center gap-0.5 ${
                  voiceQualityMode === id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-gray-800/50 text-gray-500 hover:text-gray-300'
                }`}
              >
                <span>{q.label}</span>
              </button>
            ))}
          </div>
          <p className="text-[8px] text-gray-500 mt-1.5 px-0.5">
            {voiceQualityModes[voiceQualityMode]?.desc || 'Select quality mode'}
          </p>
        </div>

        {/* Data Selection Mode */}
        <div className="space-y-2">
          <div className="flex gap-1 bg-gray-900/50 p-0.5 rounded-lg border border-gray-800">
            <button
              onClick={() => setTtsMode('column')}
              className={`flex-1 text-[10px] py-1.5 rounded-md font-bold transition ${
                ttsMode === 'column'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Column Mode
            </button>
            <button
              onClick={() => setTtsMode('row')}
              className={`flex-1 text-[10px] py-1.5 rounded-md font-bold transition ${
                ttsMode === 'row'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Row Mode
            </button>
          </div>

          {ttsMode === 'column' ? (
            <div className="bg-gray-900/30 p-2 rounded-lg border border-gray-800/50">
              <label className="text-[9px] text-gray-500 block mb-1">Target Excel Column</label>
              <select
                className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-md p-1.5 text-xs text-gray-300 outline-none focus:border-indigo-500/30"
                value={ttsColumn}
                onChange={(e) => setTtsColumn(parseInt(e.target.value))}
                disabled={excelData.length === 0}
              >
                {excelData.length > 0 ? excelData[0].map((_, idx) => (
                  <option key={idx} value={idx}>Column {idx + 1} ({excelData.length} entries)</option>
                )) : <option value={0}>Upload Excel first</option>}
              </select>
            </div>
          ) : (
            <div className="bg-gray-900/30 p-2 rounded-lg border border-gray-800/50">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[9px] text-gray-500">Selected Content Rows</label>
                {excelData.length > 0 && (
                   <button
                    onClick={() => setTtsSelectedRows(ttsSelectedRows.length === excelData.length ? [] : excelData.map((_, i) => i))}
                    className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold"
                  >
                    {ttsSelectedRows.length === excelData.length ? 'NONE' : 'ALL'}
                  </button>
                )}
              </div>
              {excelData.length > 0 ? (
                <div className="max-h-24 overflow-y-auto bg-black/20 rounded border border-gray-800 p-1 space-y-1 custom-scrollbar">
                  {excelData.map((row, ri) => (
                    <label key={ri} className="flex items-center gap-1.5 text-[9px] text-gray-400 cursor-pointer hover:bg-indigo-500/10 rounded px-1.5 py-1 transition-colors">
                      <input
                        type="checkbox"
                        checked={ttsSelectedRows.includes(ri)}
                        onChange={(e) => {
                          if (e.target.checked) setTtsSelectedRows((prev) => [...prev, ri].sort((a, b) => a - b));
                          else setTtsSelectedRows((prev) => prev.filter((x) => x !== ri));
                        }}
                        className="w-2.5 h-2.5 rounded accent-indigo-500 border-gray-700 bg-gray-800"
                      />
                      <span className="truncate">Row {ri + 1}</span>
                    </label>
                  ))}
                </div>
              ) : <p className="text-[9px] text-gray-600 italic">No data available</p>}
            </div>
          )}
        </div>

        {/* Speaker Selection - LOGICAL GROUPING */}
        <div className="space-y-2">
          <label className="text-[10px] text-indigo-300 font-bold flex items-center gap-1">
            <Award className="w-3 h-3" /> Select Neural Speaker
          </label>
          <select
            className="w-full bg-[#080b16] border border-indigo-500/[0.2] rounded-lg p-2 text-xs text-white font-medium outline-none shadow-inner"
            value={ttsSpeaker}
            onChange={(e) => setTtsSpeaker(e.target.value)}
          >
            {getNeuralVoiceCategoriesForUI().map((cat) => (
              <optgroup
                key={cat}
                label={
                  ({
                    Premium: '⭐ PREMIUM',
                    Punjabi: '🎵 PUNJABI',
                    'English USA': '🇺🇸 USA (17 voices)',
                    'English UK': '🇬🇧 UK (5 voices)',
                    'English AU': '🇦🇺 AUSTRALIA (2 voices)',
                    'English Canada': '🇨🇦 CANADA (2 voices)',
                    'English Ireland': '🇮🇪 IRELAND (2 voices)',
                    'English NZ': '🇳🇿 NEW ZEALAND (2 voices)',
                  }[cat] || cat)
                }
                className="bg-gray-900 text-indigo-300"
              >
                {getNeuralVoicesForUI().filter((v) => v.category === cat).map((v) => (
                  <option key={v.id} value={v.id} className="bg-gray-900 text-white">
                    {v.gender === 'female' ? '♀' : '♂'} {v.label}
                    {v.pitchTier === 'low' ? ' · deep' : v.pitchTier === 'high' ? ' · bright' : ''}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="flex gap-1">
            {speakerGenderOptions.map(({ id, label, icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTtsSpeakerGender(id)}
                className={`flex-1 p-2 rounded-lg text-center text-[10px] font-bold transition-all border ${
                  ttsSpeakerGender === id 
                  ? 'bg-indigo-600/20 text-white border-indigo-500 shadow-sm' 
                  : 'bg-gray-800/40 text-gray-500 border-transparent hover:bg-gray-800/60'
                }`}
              >
                <span className="block text-xs mb-0.5">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Effects & Mood Dashboard */}
        <div className="grid grid-cols-2 gap-2">
          {/* Mood */}
          <div className="space-y-1.5">
            <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider pl-1">Voice Mood</label>
            <div className="grid grid-cols-4 gap-1 h-28 overflow-y-auto pr-1 custom-scrollbar">
              {Object.entries(moodPresets).map(([id, mood]) => (
                <button
                  key={id}
                  onClick={() => applyMood(id)}
                  className={`p-1 rounded-md text-center transition-all border ${
                    ttsMood === id 
                    ? 'bg-indigo-600/30 text-white border-indigo-500/50' 
                    : 'bg-gray-800/40 text-gray-400 border-transparent hover:text-gray-200'
                  }`}
                  title={mood.desc}
                >
                  <div className="text-xs">{mood.icon}</div>
                  <div className="text-[6px] leading-tight mt-0.5 font-bold truncate">{mood.label}</div>
                </button>
              ))}
            </div>
          </div>
          {/* Effects */}
          <div className="space-y-1.5">
            <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider pl-1">Voice Effects</label>
            <div className="grid grid-cols-4 gap-1 h-28 overflow-y-auto pr-1 custom-scrollbar">
              {Object.entries(audioEffects).map(([id, effect]) => (
                <button
                  key={id}
                  onClick={() => setTtsEffect(id)}
                  className={`p-1 rounded-md text-center transition-all border ${
                    ttsEffect === id 
                    ? 'bg-purple-600/30 text-white border-purple-500/50' 
                    : 'bg-gray-800/40 text-gray-400 border-transparent hover:text-gray-200'
                  }`}
                  title={effect.desc}
                >
                  <div className="text-xs">{effect.icon}</div>
                  <div className="text-[6px] leading-tight mt-0.5 font-bold truncate">{effect.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Final Settings Visualization */}
        <div className="bg-black/40 p-2 rounded-xl border border-white/5 space-y-2">
           <div className="flex items-center justify-between px-1">
              <span className="text-[8px] font-bold text-gray-500">PITCH: <span className="text-emerald-400">{getFinalVoiceSettings().pitch.toFixed(2)}</span></span>
              <span className="text-[8px] font-bold text-gray-500">SPEED: <span className="text-indigo-400">{getFinalVoiceSettings().rate.toFixed(2)}x</span></span>
              <span className="text-[8px] font-bold text-gray-500">GAIN: <span className="text-amber-400">{(getFinalVoiceSettings().volume * 100).toFixed(0)}%</span></span>
           </div>
           
           <div className="space-y-2 px-1">
             <div className="relative pt-1">
               <input type="range" min="0.5" max="2" step="0.01" value={ttsRate}
                 onChange={(e) => setTtsRate(parseFloat(e.target.value))} className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
             </div>
             <div className="relative pt-1">
               <input type="range" min="0.1" max="2" step="0.01" value={ttsPitch}
                 onChange={(e) => setTtsPitch(parseFloat(e.target.value))} className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
             </div>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
             <div className="flex gap-1.5 mb-2">
               <input
                  type="text"
                  placeholder="Test text here..."
                  value={ttsPreviewText}
                  onChange={(e) => setTtsPreviewText(e.target.value)}
                  className="flex-1 bg-black/40 border border-indigo-500/10 rounded-lg p-2 text-xs text-gray-300 outline-none focus:border-indigo-500/30"
                />
                <button
                  onClick={previewTTS}
                  className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 p-2 rounded-lg border border-indigo-500/20 transition group"
                  title="Preview Voice"
                >
                  <Volume2 className="w-4 h-4 group-active:scale-90" />
                </button>
             </div>
          </div>
          
          <button
            onClick={generateAllTTS}
            disabled={ttsGenerating || excelData.length === 0}
            className="col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-900/20 active:scale-[0.98]"
          >
            {ttsGenerating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> GENERATING...</>
            ) : (
              <><Zap className="w-4 h-4" /> GENERATE ALL AUDIO</>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        {(ttsGenerating || (serverProcessing && serverJobType === 'tts')) && (() => {
          const ttsPct = serverProcessing && serverJobType === 'tts' ? serverProgress : ttsProgress;
          return (
            <div className="bg-indigo-900/10 border border-indigo-500/10 p-2 rounded-lg space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] text-indigo-300 font-bold uppercase animate-pulse">Processing...</span>
                <span className="text-[10px] font-mono text-indigo-400 font-bold">{ttsPct}%</span>
              </div>
              <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-500"
                  style={{ width: `${ttsPct}%` }}
                />
              </div>
            </div>
          );
        })()}
      </div>
      
      {backendVoices.length > 0 && (
        <div className="mt-3 bg-indigo-600/5 rounded-lg p-2 border border-indigo-500/10">
          <p className="text-[8px] text-indigo-300/60 text-center uppercase tracking-[0.2em] font-bold">
            Powered by Microsoft Azure Neural AI
          </p>
        </div>
      )}
    </div>
  );
}
