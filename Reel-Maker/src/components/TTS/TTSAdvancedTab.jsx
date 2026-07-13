import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  RefreshCw,
  Play,
  Pause,
  Loader2,
  Sliders,
  Box,
  Gauge,
  Zap,
  ChevronDown,
  ChevronUp,
  Upload,
} from 'lucide-react';
import { api } from '../../api';

const STACK = [
  { id: 'react', label: 'React' },
  { id: 'node', label: 'Node.js' },
  { id: 'mongo', label: 'MongoDB' },
  { id: 'redis', label: 'Redis' },
  { id: 'fastapi', label: 'FastAPI' },
  { id: 'piper', label: 'Piper TTS' },
  { id: 'gpu', label: 'GPU' },
];

const VOICE_TYPES = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'children', label: 'Child / Young' },
  { id: 'old', label: 'Old Person' },
  { id: 'custom', label: 'Custom' },
];

const STYLES = [
  { id: 'vocal_smile', label: 'Vocal Smile' },
  { id: 'newscaster', label: 'Newscaster' },
  { id: 'whisper', label: 'Whisper' },
  { id: 'empathetic', label: 'Empathetic' },
  { id: 'hype', label: 'Promo / Hype' },
  { id: 'deadpan', label: 'Deadpan' },
  { id: 'character', label: 'Character' },
];

const PACE_OPTIONS = [
  { id: 'natural', label: 'Natural' },
  { id: 'rapid_fire', label: 'Rapid Fire' },
  { id: 'the_drift', label: 'The Drift' },
  { id: 'staccato', label: 'Staccato' },
];

const ACCENTS = [
  'Neutral',
  'American (Gen)',
  'American (Valley)',
  'American (South)',
  'British (RP)',
  'British (Brixton)',
  'Transatlantic',
  'Australian',
  'Indian English',
];

const PRECISION_MODES = [
  { id: 'draft', label: 'Draft', desc: 'Faster pass' },
  { id: 'balanced', label: 'Balanced', desc: 'Default quality' },
  { id: 'studio', label: 'Studio', desc: 'Max clarity' },
];

function StatusPill({ ok, label, warn }) {
  const color = ok
    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
    : warn
      ? 'bg-amber-500/15 text-amber-300 border-amber-500/25'
      : 'bg-rose-500/15 text-rose-300 border-rose-500/25';
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-lg border ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-400' : warn ? 'bg-amber-400' : 'bg-rose-400'}`} />
      {label}
      <span className="opacity-70">{ok ? 'ready' : warn ? 'warn' : 'off'}</span>
    </span>
  );
}

/**
 * Advanced TTS — simple studio UI.
 * Self-hosted Piper worker only (Basic tab keeps Azure/Edge).
 */
export default function TTSAdvancedTab({
  excelData = [],
  ttsColumn = 0,
  onAdvancedGenerate,
  advancedGenerating = false,
  registerGetPayload,
}) {
  const [caps, setCaps] = useState(null);
  const [advStatus, setAdvStatus] = useState(null);
  const [voices, setVoices] = useState([]);
  const [capsLoading, setCapsLoading] = useState(true);

  const [voiceType, setVoiceType] = useState('female');
  const [emotion, setEmotion] = useState('newscaster');
  const [accent, setAccent] = useState('American (Gen)');
  const [paceId, setPaceId] = useState('natural');
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [precision, setPrecision] = useState('studio');

  const [proOpen, setProOpen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [emotionAmt, setEmotionAmt] = useState(0.85);
  const [stability, setStability] = useState(0.5);
  const [similarity, setSimilarity] = useState(0.8);
  const [cfgScale, setCfgScale] = useState(0.65);
  const [temperature, setTemperature] = useState(0.95);

  const [language, setLanguage] = useState('en');
  const [sampleRate, setSampleRate] = useState('22050');
  const [workerSlots, setWorkerSlots] = useState(2);
  const [vramGuard, setVramGuard] = useState(true);
  const [streamPartial, setStreamPartial] = useState(true);

  const [cloneFileName, setCloneFileName] = useState('');
  const [cloneId, setCloneId] = useState('');
  const [cloneUploading, setCloneUploading] = useState(false);

  const [previewText, setPreviewText] = useState('');
  const [sampleLoading, setSampleLoading] = useState(false);
  const [samplePlayingId, setSamplePlayingId] = useState(null);
  const [samplePaused, setSamplePaused] = useState(false);
  const audioRef = useRef(null);
  const urlRef = useRef(null);

  const loadAll = async () => {
    setCapsLoading(true);
    try {
      const [c, s, v] = await Promise.all([
        api.getCapabilities().catch(() => null),
        api.fetchAdvancedTTSStatus().catch(() => null),
        api.fetchAdvancedTTSVoices().catch(() => ({ voices: [] })),
      ]);
      setCaps(c || {});
      setAdvStatus(s || {});
      const list = v?.voices || [];
      setVoices(list);
      if (!selectedVoiceId && list.length) {
        const prefer = list.find((x) => x.type === 'female') || list[0];
        setSelectedVoiceId(prefer.id);
      }
    } finally {
      setCapsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hw = caps?.hardware || {};
  const mongoOk = !!caps?.mongo?.connected;
  const redisOk = !!(caps?.redis?.configured || caps?.redis?.bullTts || caps?.useBullTts);
  const workerOnline = !!advStatus?.xtts?.online;
  const nvidiaOk = !!hw.hasNvidiaNvenc;

  const stackStatus = {
    react: true,
    node: !caps?.serverless,
    mongo: mongoOk,
    redis: redisOk,
    fastapi: workerOnline,
    piper: workerOnline && (advStatus?.xtts?.piper || advStatus?.mode === 'piper-local' || !advStatus?.xtts?.edge_tts),
    gpu: nvidiaOk,
  };

  const filteredLibrary = useMemo(() => {
    const list = voices.length ? voices : [];
    if (voiceType === 'custom') return list.filter((v) => v.type === 'custom');
    // Accent filters the cast: Indian → Indian names only, American → American, etc.
    return list.filter((v) => v.type === voiceType && !v.clone && v.accent === accent);
  }, [voices, voiceType, accent]);

  useEffect(() => {
    if (!filteredLibrary.length) {
      setSelectedVoiceId('');
      return;
    }
    if (!filteredLibrary.some((v) => v.id === selectedVoiceId)) {
      setSelectedVoiceId(filteredLibrary[0].id);
    }
  }, [filteredLibrary, selectedVoiceId]);

  const selectedVoice = filteredLibrary.find((v) => v.id === selectedVoiceId) || filteredLibrary[0];

  const buildPayload = (text, voiceOverride = null) => {
    const voice = voiceOverride || selectedVoice;
    return {
      text,
      voiceId: voice?.id,
      voiceName: voice?.name,
      voiceType: voice?.type || voiceType,
      accent,
      emotion,
      speed: proOpen ? speed : 1,
      pitch: proOpen ? pitch : 1,
      emotionAmt: proOpen ? emotionAmt : 0.85,
      stability: proOpen ? stability : 0.5,
      similarity: proOpen ? similarity : 0.8,
      cfgScale: proOpen ? cfgScale : 0.65,
      temperature: proOpen ? temperature : 0.95,
      language,
      sampleRate,
      precision: precision || 'studio',
      workerSlots,
      vramGuard,
      streamPartial,
      engine: 'piper_local',
      paceId,
      cloneId: voiceType === 'custom' || voice?.clone ? cloneId : undefined,
    };
  };

  useEffect(() => {
    if (typeof registerGetPayload !== 'function') return undefined;
    registerGetPayload(() => buildPayload(''));
    return () => registerGetPayload(null);
    // Keep payload in sync with every studio control that affects audio
  }, [
    registerGetPayload,
    selectedVoice,
    voiceType,
    accent,
    emotion,
    paceId,
    speed,
    pitch,
    emotionAmt,
    stability,
    similarity,
    cfgScale,
    temperature,
    language,
    sampleRate,
    precision,
    proOpen,
    cloneId,
  ]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setSamplePlayingId(null);
    setSamplePaused(false);
  };

  const togglePlayForVoice = async (voice) => {
    if (!voice || sampleLoading) return;

    // Pause / resume same voice
    if (samplePlayingId === voice.id && audioRef.current) {
      if (samplePaused) {
        await audioRef.current.play();
        setSamplePaused(false);
      } else {
        audioRef.current.pause();
        setSamplePaused(true);
      }
      return;
    }

    const text =
      previewText.trim() ||
      (excelData?.[0] && String(excelData[0][ttsColumn] || '').trim()) ||
      'Hello, this is Advanced self-hosted TTS with your selected style, pace, and accent.';

    setSelectedVoiceId(voice.id);
    setSamplePlayingId(voice.id);
    setSamplePaused(false);
    setSampleLoading(true);
    try {
      stopAudio();
      setSamplePlayingId(voice.id);

      const blob = await api.previewAdvancedTTS(buildPayload(text.slice(0, 400), voice));
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setSamplePlayingId(null);
        setSamplePaused(false);
      };
      await audio.play();
    } catch (e) {
      setSamplePlayingId(null);
      alert(
        `Advanced sample failed:\n${e?.message || e}\n\nStart xtts-worker (Piper) on port 8020. Advanced does not use Azure.`
      );
    } finally {
      setSampleLoading(false);
    }
  };

  const handleGenerate = () => {
    if (!onAdvancedGenerate) return;
    onAdvancedGenerate(buildPayload(''));
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. System status */}
      <section className="rounded-xl border border-white/[0.08] bg-[#0a0e1c]/90 p-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            System status
          </h4>
          <button
            type="button"
            onClick={loadAll}
            className="text-[10px] font-bold text-violet-300 border border-violet-500/30 rounded-lg px-2 py-1 hover:bg-violet-500/10 flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${capsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STACK.map((s) => (
            <StatusPill
              key={s.id}
              ok={!!stackStatus[s.id]}
              warn={s.id === 'redis' && !stackStatus.redis}
              label={s.label}
            />
          ))}
        </div>
        <p className="text-[10px] text-gray-500">
          {workerOnline
            ? `Self-hosted ${advStatus?.mode || 'piper-local'} · style / pace / accent apply on play`
            : 'Worker offline — start xtts-worker. Advanced uses your server only (not Azure).'}
        </p>
      </section>

      {/* 2. Style · Pace · Accent */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <label className="rounded-xl border border-white/[0.08] bg-[#0c1022]/90 px-3 py-2.5">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Style</span>
          <select
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-white outline-none"
          >
            {STYLES.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#0c1022]">{s.label}</option>
            ))}
          </select>
        </label>
        <label className="rounded-xl border border-white/[0.08] bg-[#0c1022]/90 px-3 py-2.5">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Pace</span>
          <select
            value={paceId}
            onChange={(e) => setPaceId(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-white outline-none"
          >
            {PACE_OPTIONS.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#0c1022]">{p.label}</option>
            ))}
          </select>
        </label>
        <label className="rounded-xl border border-white/[0.08] bg-[#0c1022]/90 px-3 py-2.5">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Accent</span>
          <select
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-white outline-none"
            disabled={voiceType === 'custom'}
          >
            {ACCENTS.map((a) => (
              <option key={a} value={a} className="bg-[#0c1022]">{a}</option>
            ))}
          </select>
          <p className="text-[9px] text-gray-500 mt-1">
            Shows matching names + voices for this accent
          </p>
        </label>
      </section>

      {/* 3. Character type + name list */}
      <section className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {VOICE_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setVoiceType(t.id);
                setSelectedVoiceId('');
                if (t.id === 'custom') setAccent('Custom');
              }}
              className={`rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition ${
                voiceType === t.id
                  ? 'bg-violet-600/30 border-violet-400/40 text-white'
                  : 'bg-[#0c1022]/70 border-white/[0.06] text-gray-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {voiceType === 'custom' && (
          <label className="flex items-center gap-2 rounded-xl border border-dashed border-violet-400/30 bg-violet-500/5 px-3 py-2.5 cursor-pointer">
            <Upload className="w-4 h-4 text-violet-300 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-gray-300 truncate">
                {cloneUploading ? 'Uploading…' : cloneFileName || 'Upload reference wav/mp3 for custom clone'}
              </p>
            </div>
            <input
              type="file"
              accept="audio/*,.wav,.mp3,.m4a,.ogg"
              className="hidden"
              disabled={cloneUploading}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setCloneUploading(true);
                setCloneFileName(f.name);
                try {
                  const r = await api.uploadAdvancedClone(f);
                  setCloneId(r.cloneId);
                  const cloneVoice = (voices || []).find((v) => v.type === 'custom') || { id: 'adv_clone_a' };
                  setSelectedVoiceId(cloneVoice.id);
                } catch (err) {
                  alert(`Clone upload failed:\n${err?.message || err}`);
                  setCloneId('');
                } finally {
                  setCloneUploading(false);
                  e.target.value = '';
                }
              }}
            />
          </label>
        )}

        <div className="rounded-xl border border-white/[0.08] bg-[#0c1022]/70 overflow-hidden">
          <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {accent} · {VOICE_TYPES.find((t) => t.id === voiceType)?.label || voiceType}
            </p>
            <span className="text-[10px] text-gray-500">{filteredLibrary.length} people</span>
          </div>
          <div className="max-h-[320px] overflow-y-auto custom-scrollbar divide-y divide-white/[0.04]">
            {filteredLibrary.map((v) => {
              const selected = selectedVoiceId === v.id;
              const loadingThis = sampleLoading && samplePlayingId === v.id;
              const playingThis = samplePlayingId === v.id && !sampleLoading && !samplePaused;
              const pausedThis = samplePlayingId === v.id && samplePaused;
              return (
                <div
                  key={v.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedVoiceId(v.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedVoiceId(v.id);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition ${
                    selected ? 'bg-violet-600/15' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{v.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">
                      {v.personality || 'Studio voice'}
                      {v.age && v.age !== '—' ? ` · ${v.age}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    title={playingThis ? 'Pause' : pausedThis ? 'Resume' : 'Play'}
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlayForVoice(v);
                    }}
                    disabled={sampleLoading && samplePlayingId !== v.id}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition ${
                      playingThis || pausedThis
                        ? 'bg-violet-500 text-white border-violet-400'
                        : 'bg-black/40 text-violet-300 border-violet-500/30 hover:bg-violet-500/20'
                    }`}
                  >
                    {loadingThis ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : playingThis ? (
                      <Pause className="w-3.5 h-3.5" fill="currentColor" />
                    ) : (
                      <Play className="w-3.5 h-3.5 ml-0.5" fill="currentColor" />
                    )}
                  </button>
                </div>
              );
            })}
            {!filteredLibrary.length && (
              <p className="text-[11px] text-amber-200/80 py-6 text-center">No voices for this type.</p>
            )}
          </div>
        </div>
      </section>

      {/* 4. Pro controls accordion — closed by default */}
      <section className="rounded-xl border border-white/[0.06] bg-[#0c1022]/60 overflow-hidden">
        <button
          type="button"
          onClick={() => setProOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-white/[0.03]"
        >
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            Pro controls
            <span className="normal-case font-medium text-gray-600 tracking-normal">
              {proOpen ? '(on)' : '(off · defaults)'}
            </span>
          </span>
          {proOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </button>
        {proOpen && (
          <div className="px-3 pb-3 space-y-3 border-t border-white/[0.05] pt-3">
            {[
              { label: 'Speed', value: speed, set: setSpeed, min: 0.5, max: 2 },
              { label: 'Pitch', value: pitch, set: setPitch, min: 0.5, max: 2 },
              { label: 'Emotion intensity', value: emotionAmt, set: setEmotionAmt, min: 0, max: 1 },
              { label: 'Stability', value: stability, set: setStability, min: 0, max: 1 },
              { label: 'Speaker similarity', value: similarity, set: setSimilarity, min: 0, max: 1 },
              { label: 'CFG scale', value: cfgScale, set: setCfgScale, min: 0, max: 1 },
              { label: 'Temperature', value: temperature, set: setTemperature, min: 0.1, max: 1.5 },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>{row.label}</span>
                  <span className="tabular-nums text-gray-400">{Number(row.value).toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={row.min}
                  max={row.max}
                  step={0.01}
                  value={row.value}
                  onChange={(e) => row.set(parseFloat(e.target.value))}
                  className="w-full h-1.5 accent-violet-500"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Precision */}
      <section>
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <Box className="w-3.5 h-3.5" />
          Precision
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {PRECISION_MODES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPrecision(p.id)}
              className={`rounded-xl border px-3 py-2.5 text-center transition ${
                precision === p.id
                  ? 'bg-emerald-600/20 border-emerald-400/40 text-white'
                  : 'bg-[#0c1022]/70 border-white/[0.06] text-gray-400'
              }`}
            >
              <p className="text-[12px] font-semibold">{p.label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{p.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* 6. Output · worker */}
      <section className="rounded-xl border border-white/[0.06] bg-[#0c1022]/60 p-3">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <Gauge className="w-3.5 h-3.5" />
          Output · worker
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <label className="rounded-lg bg-black/30 border border-white/[0.05] px-2.5 py-2">
            <span className="text-[9px] text-gray-500 uppercase tracking-wider block mb-1">Language</span>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-transparent text-xs text-gray-200 outline-none">
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </label>
          <label className="rounded-lg bg-black/30 border border-white/[0.05] px-2.5 py-2">
            <span className="text-[9px] text-gray-500 uppercase tracking-wider block mb-1">Sample rate</span>
            <select value={sampleRate} onChange={(e) => setSampleRate(e.target.value)} className="w-full bg-transparent text-xs text-gray-200 outline-none">
              <option value="16000">16 kHz</option>
              <option value="22050">22.05 kHz</option>
              <option value="24000">24 kHz</option>
              <option value="44100">44.1 kHz</option>
            </select>
          </label>
          <label className="rounded-lg bg-black/30 border border-white/[0.05] px-2.5 py-2">
            <span className="text-[9px] text-gray-500 uppercase tracking-wider block mb-1">GPU slots</span>
            <input
              type="number"
              min={1}
              max={8}
              value={workerSlots}
              onChange={(e) => setWorkerSlots(Math.min(8, Math.max(1, parseInt(e.target.value, 10) || 1)))}
              className="w-full bg-transparent text-xs text-gray-200 outline-none tabular-nums"
            />
          </label>
          <div className="rounded-lg bg-black/30 border border-white/[0.05] px-2.5 py-2 flex flex-col justify-center gap-1.5">
            <label className="flex items-center gap-2 text-[10px] text-gray-300 cursor-pointer">
              <input type="checkbox" checked={vramGuard} onChange={(e) => setVramGuard(e.target.checked)} className="accent-violet-500" />
              VRAM guard
            </label>
            <label className="flex items-center gap-2 text-[10px] text-gray-300 cursor-pointer">
              <input type="checkbox" checked={streamPartial} onChange={(e) => setStreamPartial(e.target.checked)} className="accent-violet-500" />
              Stream partials
            </label>
          </div>
        </div>
      </section>

      {/* 7. Final audio */}
      <section className="rounded-2xl border border-violet-400/35 bg-gradient-to-br from-violet-600/10 via-[#0c1022] to-indigo-600/10 p-4 space-y-3">
        <div>
          <h4 className="text-sm font-bold text-white">Final audio</h4>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {selectedVoice?.name || '—'} · {STYLES.find((s) => s.id === emotion)?.label} ·{' '}
            {PACE_OPTIONS.find((p) => p.id === paceId)?.label} · {accent}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Optional preview text…"
            className="flex-1 bg-black/50 border border-violet-500/25 rounded-xl px-3 py-2.5 text-xs text-gray-200 outline-none focus:border-violet-400/50"
          />
          <button
            type="button"
            onClick={() => togglePlayForVoice(selectedVoice)}
            disabled={sampleLoading || !selectedVoice}
            className="shrink-0 inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-800 disabled:text-gray-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition min-w-[120px]"
          >
            {sampleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : samplePlayingId === selectedVoice?.id && !samplePaused ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {sampleLoading ? 'Generating…' : samplePlayingId === selectedVoice?.id && !samplePaused ? 'Pause' : 'Play'}
          </button>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={advancedGenerating || !excelData?.length || !selectedVoice || !workerOnline}
          className="w-full py-3 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 disabled:bg-gray-800 disabled:text-gray-600 text-white transition flex items-center justify-center gap-2"
        >
          {advancedGenerating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating Advanced batch…</>
          ) : (
            <><Zap className="w-4 h-4" /> Generate All Audio (Advanced)</>
          )}
        </button>
        {!workerOnline && (
          <p className="text-[10px] text-center text-amber-300/90">
            Start the local worker: <code className="text-amber-200">xtts-worker</code> on port 8020
          </p>
        )}
      </section>
    </div>
  );
}
