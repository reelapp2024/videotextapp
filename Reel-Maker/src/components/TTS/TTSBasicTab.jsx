import React, { useEffect, useMemo, useState } from 'react';
import { Play, Volume2, Mic2 } from 'lucide-react';
import VoiceCard from './VoiceCard';
import {
  VOICE_TYPES,
  STYLE_PRESETS,
  PACE_OPTIONS,
  ACCENT_OPTIONS,
  filterBasicVoices,
  computeBasicRatePitch,
  shortVoiceName,
  accentLabelForCharacter,
  findCharacterBySpeakerId,
} from './ttsBasicConfig';

export default function TTSBasicTab({
  voices = [],
  ttsSpeaker,
  setTtsSpeaker,
  setTtsRate,
  setTtsPitch,
  setTtsMood,
  setTtsEffect,
  setTtsSpeakerGender,
  setVoiceQualityMode,
  ttsPreviewText,
  setTtsPreviewText,
  previewTTS,
  ttsSampleLoading,
  excelData,
  ttsColumn,
  voiceType,
  setVoiceType,
  accent,
  setAccent,
  styleId,
  setStyleId,
  paceId,
  setPaceId,
}) {
  const [samplePlayingId, setSamplePlayingId] = useState(null);

  const filtered = useMemo(
    () => filterBasicVoices(voices, { voiceType, accent }),
    [voices, voiceType, accent]
  );

  const selectedVoice = useMemo(() => {
    const fromFilter = filtered.find((v) => v.id === ttsSpeaker || v.speakerId === ttsSpeaker);
    if (fromFilter) return fromFilter;
    return findCharacterBySpeakerId(ttsSpeaker, voices, voiceType, accent) || filtered[0] || null;
  }, [filtered, ttsSpeaker, voices, voiceType, accent]);

  const styleMeta = STYLE_PRESETS.find((s) => s.id === styleId) || STYLE_PRESETS[0];
  const paceMeta = PACE_OPTIONS.find((p) => p.id === paceId) || PACE_OPTIONS[1];
  const accentMeta = ACCENT_OPTIONS.find((a) => a.id === accent) || ACCENT_OPTIONS[0];

  useEffect(() => {
    if (filtered.length === 0) return;
    if (!filtered.some((v) => v.id === ttsSpeaker || v.speakerId === ttsSpeaker)) {
      setTtsSpeaker(filtered[0].id);
    }
  }, [filtered, ttsSpeaker, setTtsSpeaker]);

  useEffect(() => {
    const { rate, pitch, mood } = computeBasicRatePitch(styleId, paceId);
    setTtsRate(rate);
    setTtsPitch(pitch);
    setTtsMood?.(mood);
    setTtsEffect?.('none');
    setTtsSpeakerGender?.('neutral');
    setVoiceQualityMode?.('clear');
  }, [
    styleId,
    paceId,
    setTtsRate,
    setTtsPitch,
    setTtsMood,
    setTtsEffect,
    setTtsSpeakerGender,
    setVoiceQualityMode,
  ]);

  const selectVoice = (voice) => {
    if (!voice) return;
    setTtsSpeaker(voice.id);
  };

  const playFinalSample = async (voice = selectedVoice) => {
    if (!voice || ttsSampleLoading) return;
    const id = voice.id;
    setTtsSpeaker(id);
    setSamplePlayingId(id);
    const { rate, mood } = computeBasicRatePitch(styleId, paceId);
    setTtsRate(rate);
    setTtsPitch(1.0);
    setTtsMood?.(mood);
    setTtsEffect?.('none');
    setTtsSpeakerGender?.('neutral');
    setVoiceQualityMode?.('clear');
    try {
      // Final audio = selected voice + style + pace (same settings Generate uses)
      await previewTTS?.(id, { rate, pitch: 1.0, volume: 1 });
    } finally {
      setTimeout(() => setSamplePlayingId(null), 400);
    }
  };

  const defaultPreview =
    (excelData?.length > 0 && excelData[0]?.[ttsColumn]) ||
    'Hello, this is your final Microsoft Azure Neural voice with the selected style and pace.';

  return (
    <div className="space-y-5 animate-fadeIn pb-2">
      <div className="rounded-xl border border-sky-500/25 bg-sky-500/[0.08] px-3 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[11px] text-sky-100/90 leading-relaxed">
          <span className="font-bold text-sky-200">Powered by Microsoft Azure Neural AI</span>
          <span className="text-gray-400"> — real Neural voices (Jenny, Guy, Roger…).</span>
        </p>
        <span className="text-[9px] font-bold uppercase tracking-wider text-sky-300/90 bg-sky-500/15 border border-sky-500/25 px-2 py-0.5 rounded-md">
          Neural
        </span>
      </div>

      <section>
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          Voice Type
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {VOICE_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setVoiceType(t.id)}
              className={`rounded-xl border px-3 py-3 text-left transition ${
                voiceType === t.id
                  ? 'bg-violet-600/25 border-violet-400/50 text-white'
                  : 'bg-[#0c1022]/70 border-white/[0.06] text-gray-400 hover:border-violet-500/25'
              }`}
            >
              <p className="text-sm font-semibold">{t.label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{t.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          Accent
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ACCENT_OPTIONS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAccent(a.id)}
              className={`rounded-lg border px-3 py-2 text-[12px] font-semibold transition ${
                accent === a.id
                  ? 'bg-indigo-600/30 border-indigo-400/40 text-white'
                  : 'bg-[#0c1022]/70 border-white/[0.06] text-gray-400 hover:border-indigo-500/25'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2 gap-2">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Microsoft Neural Voices
          </h4>
          <span className="text-[10px] text-sky-300/80 font-semibold tabular-nums">
            {filtered.length} unique
          </span>
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-6 text-center">
            <p className="text-sm text-amber-200/90">No Neural voices for this combo.</p>
            <p className="text-[11px] text-gray-500 mt-1">
              Try American + Female (Jenny, Aria…) or wait for backend voices to load.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
            {filtered.map((v) => (
              <VoiceCard
                key={v.id}
                voice={v}
                selected={ttsSpeaker === v.id}
                onSelect={selectVoice}
                onPlaySample={() => playFinalSample(v)}
                playing={ttsSampleLoading ? samplePlayingId === v.id : false}
                loading={ttsSampleLoading && samplePlayingId === v.id}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          Style Preset
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {STYLE_PRESETS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStyleId(s.id)}
              className={`rounded-xl border px-3 py-2.5 text-left transition ${
                styleId === s.id
                  ? 'bg-fuchsia-600/20 border-fuchsia-400/40 text-white'
                  : 'bg-[#0c1022]/70 border-white/[0.06] text-gray-400 hover:border-fuchsia-500/25'
              }`}
            >
              <p className="text-[12px] font-semibold">{s.label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{s.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          Pace
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {PACE_OPTIONS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPaceId(p.id)}
              className={`rounded-xl border px-3 py-2.5 text-center transition ${
                paceId === p.id
                  ? 'bg-cyan-600/20 border-cyan-400/40 text-white'
                  : 'bg-[#0c1022]/70 border-white/[0.06] text-gray-400 hover:border-cyan-500/25'
              }`}
            >
              <p className="text-[12px] font-semibold">{p.label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{p.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* FINAL AUDIO PREVIEW — always below Pace */}
      <section className="rounded-2xl border-2 border-sky-400/40 bg-gradient-to-br from-sky-600/15 via-[#0c1022] to-violet-600/15 p-4 space-y-3 shadow-lg shadow-sky-900/20">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
              <Mic2 className="w-4 h-4 text-sky-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Final Audio Preview</h4>
              <p className="text-[10px] text-gray-500">
                Plays your selected voice + style + accent + pace
              </p>
            </div>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-md">
            Final output
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div className="rounded-lg bg-black/40 border border-sky-500/20 px-2.5 py-2">
            <p className="text-gray-500 text-[9px] uppercase tracking-wider mb-0.5">Voice</p>
            <p className="font-semibold text-sky-100 truncate">
              {selectedVoice ? shortVoiceName(selectedVoice) : '—'}
            </p>
          </div>
          <div className="rounded-lg bg-black/40 border border-fuchsia-500/20 px-2.5 py-2">
            <p className="text-gray-500 text-[9px] uppercase tracking-wider mb-0.5">Style</p>
            <p className="font-semibold text-fuchsia-100 truncate">{styleMeta.label}</p>
          </div>
          <div className="rounded-lg bg-black/40 border border-indigo-500/20 px-2.5 py-2">
            <p className="text-gray-500 text-[9px] uppercase tracking-wider mb-0.5">Accent</p>
            <p className="font-semibold text-indigo-100 truncate">
              {selectedVoice ? accentLabelForCharacter(selectedVoice) : accentMeta.label}
            </p>
          </div>
          <div className="rounded-lg bg-black/40 border border-cyan-500/20 px-2.5 py-2">
            <p className="text-gray-500 text-[9px] uppercase tracking-wider mb-0.5">Pace</p>
            <p className="font-semibold text-cyan-100 truncate">{paceMeta.label}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Volume2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              value={ttsPreviewText || ''}
              onChange={(e) => setTtsPreviewText(e.target.value)}
              placeholder={String(defaultPreview).slice(0, 90)}
              className="w-full bg-black/50 border border-sky-500/25 rounded-xl pl-8 pr-3 py-3 text-xs text-gray-200 outline-none focus:border-sky-400/50"
            />
          </div>
          <button
            type="button"
            onClick={() => playFinalSample(selectedVoice)}
            disabled={!selectedVoice || ttsSampleLoading}
            className="shrink-0 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-violet-600 hover:from-sky-500 hover:to-violet-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 text-white px-5 py-3 rounded-xl text-xs font-bold transition shadow-lg shadow-sky-900/40 min-w-[140px]"
          >
            <Play className={`w-4 h-4 ${ttsSampleLoading ? 'animate-pulse' : ''}`} />
            {ttsSampleLoading ? 'Generating…' : 'Play Final Audio'}
          </button>
        </div>

        <p className="text-[10px] text-gray-500 text-center">
          This is the same Neural audio Generate All Audio will use for your Excel rows.
        </p>
      </section>
    </div>
  );
}
