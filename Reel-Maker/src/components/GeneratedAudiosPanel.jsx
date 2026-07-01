import React from 'react';
import { Mic, Plus, Download, Play } from 'lucide-react';
import { formatAudioDuration } from '../utils/audioFormat.js';

export default function GeneratedAudiosPanel({
  generatedAudios,
  isGenerating,
  addAllGeneratedToVoiceLibrary,
  downloadAllTTSAudios,
  addGeneratedAudioToVoiceLibrary,
  downloadSingleAudio,
}) {
  const list = generatedAudios || [];
  if (list.length === 0 && !isGenerating) return null;

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-2.5 border-b border-indigo-500/[0.08]">
        <div className="flex justify-between items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-xs flex items-center gap-1.5 text-gray-200">
            <Mic className="w-3.5 h-3.5 text-purple-400" />
            {isGenerating && list.length === 0
              ? 'Generating voices…'
              : `Generated Audios (${list.length}${isGenerating ? '+' : ''})`}
          </h3>
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={addAllGeneratedToVoiceLibrary}
              className="text-[10px] bg-amber-600/70 hover:bg-amber-600 px-2 py-1 rounded text-amber-100 transition flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add All to Library
            </button>
            <button
              onClick={downloadAllTTSAudios}
              className="text-[10px] bg-purple-600/50 hover:bg-purple-600 px-2 py-1 rounded text-purple-200 transition flex items-center gap-1"
            >
              <Download className="w-3 h-3" /> Download All ZIP
            </button>
          </div>
        </div>
      </div>
      <div className="max-h-[220px] overflow-y-auto p-1.5 space-y-1">
        {isGenerating && list.length === 0 && (
          <p className="text-[10px] text-indigo-300/80 px-1 py-2 animate-pulse">
            First audio will appear here in a few seconds…
          </p>
        )}
        {list.map((audio) => (
          <div key={audio.id} className="bg-gray-800/50 p-1.5 rounded flex items-center gap-2 hover:bg-gray-800 transition group">
            <span className="text-[10px] text-gray-500 w-5 text-right flex-shrink-0">{audio.id}</span>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] sm:text-xs font-medium text-gray-200 truncate block">{audio.name}</span>
              <span className="text-[8px] text-gray-500 tabular-nums">{formatAudioDuration(audio.durationSec)}</span>
              {audio.text && <span className="text-[8px] text-gray-500 truncate block">{audio.text}</span>}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => { const a = new Audio(audio.url); a.play(); }}
                className="bg-green-600 hover:bg-green-700 text-white p-1 rounded transition"
                title="Play"
              >
                <Play className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => addGeneratedAudioToVoiceLibrary(audio.url, audio.name)}
                className="bg-amber-600 hover:bg-amber-700 text-white p-1 rounded transition"
                title="Add to Voice Library"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => downloadSingleAudio(audio.url, audio.name)}
                className="bg-purple-600 hover:bg-purple-700 text-white p-1 rounded transition"
                title="Download"
              >
                <Download className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

