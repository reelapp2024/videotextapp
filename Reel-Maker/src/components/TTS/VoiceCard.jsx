import React from 'react';
import { Play, Check } from 'lucide-react';
import { accentLabelForCharacter, shortVoiceName } from './ttsBasicConfig';

export default function VoiceCard({
  voice,
  selected = false,
  onSelect,
  onPlaySample,
  playing = false,
  loading = false,
}) {
  if (!voice) return null;
  const name = shortVoiceName(voice);
  const accent = accentLabelForCharacter(voice);
  const initial = (name || '?').charAt(0).toUpperCase();
  const color = voice.color || '#7c3aed';

  return (
    <button
      type="button"
      onClick={() => onSelect?.(voice)}
      className={`group relative text-left rounded-2xl border p-3.5 transition-all duration-200 ${
        selected
          ? 'bg-violet-600/20 border-violet-400/50 shadow-lg shadow-violet-900/25 ring-1 ring-violet-400/30'
          : 'bg-[#0c1022]/90 border-white/[0.06] hover:border-violet-500/35 hover:bg-[#12182e] hover:-translate-y-0.5'
      }`}
    >
      {selected && (
        <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center shadow-md">
          <Check className="w-3 h-3 text-white" />
        </span>
      )}

      <div className="flex items-start gap-3 pr-5">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-inner"
          style={{
            background: `linear-gradient(145deg, ${color}cc, ${color}66)`,
            boxShadow: `0 0 0 1px ${color}44, 0 8px 20px ${color}22`,
          }}
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white tracking-tight truncate">{name}</p>
          <p className="text-[11px] text-violet-200/80 font-medium mt-0.5 truncate">
            {voice.role || 'Neural Voice'}
          </p>
          <p className="text-[10px] text-gray-500 mt-1 leading-snug line-clamp-2">
            {voice.vibe || voice.label || ''}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-sky-500/15 text-sky-300 font-semibold border border-sky-500/20">
          Azure Neural
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/[0.06] text-gray-400 font-semibold uppercase tracking-wide">
          {accent}
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/[0.06] text-gray-400 capitalize">
          {voice.gender || voice.type || ''}
        </span>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          if (!loading) onPlaySample?.(voice);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            if (!loading) onPlaySample?.(voice);
          }
        }}
        className={`mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition ${
          loading || playing
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            : 'bg-violet-500/15 text-violet-200 border border-violet-500/20 hover:bg-violet-500/25'
        }`}
      >
        <Play className={`w-3 h-3 ${loading || playing ? 'animate-pulse' : ''}`} />
        {loading ? 'Generating…' : playing ? 'Playing…' : 'Play Sample'}
      </div>
    </button>
  );
}
