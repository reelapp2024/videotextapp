const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { applyAdvancedAudioFx } = require('./advancedAudioFx');
const {
  resolveAdvancedVoice,
  mapAdvancedProsody,
  listAdvancedVoices,
  applyPaceTransform,
  applyAccentTextTransform,
} = require('./advancedTtsMap');
const { loadCloneProfile, applyCloneMatchFx } = require('./advancedCloneService');

function getXttsUrl() {
  return process.env.XTTS_FASTAPI_URL || process.env.ADVANCED_TTS_URL || '';
}

function xttsEnabled() {
  return process.env.ADVANCED_TTS_ENABLED === 'true' || process.env.XTTS_ENABLED === 'true' || !!getXttsUrl();
}

let _healthCache = { at: 0, value: null };
const HEALTH_TTL_MS = 20000;

async function probeXtts({ force = false } = {}) {
  const now = Date.now();
  if (!force && _healthCache.value?.online && now - _healthCache.at < HEALTH_TTL_MS) {
    return _healthCache.value;
  }
  const base = getXttsUrl().replace(/\/$/, '');
  if (!base) {
    _healthCache = { at: now, value: { online: false, reason: 'XTTS_FASTAPI_URL not set' } };
    return _healthCache.value;
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1200);
    const r = await fetch(`${base}/health`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!r.ok) {
      _healthCache = { at: now, value: { online: false, reason: `health ${r.status}` } };
      return _healthCache.value;
    }
    const j = await r.json().catch(() => ({}));
    _healthCache = { at: now, value: { online: true, ...j, url: base } };
    return _healthCache.value;
  } catch (e) {
    _healthCache = { at: now, value: { online: false, reason: e.message || 'unreachable' } };
    return _healthCache.value;
  }
}

/**
 * Self-hosted Piper worker only — never Azure / Edge.
 */
async function tryLocalWorkerSynthesize({
  text,
  outPath,
  language,
  speakerWavPath,
  speed,
  pitch,
  volume,
  emotion,
  localVoice,
  lengthScale,
  noiseScale,
  speakerId,
  temperature,
  stability,
  accent,
  espeakVoice,
}) {
  const base = getXttsUrl().replace(/\/$/, '');
  if (!base) throw new Error('Advanced worker URL not configured (XTTS_FASTAPI_URL)');

  const payload = {
    text,
    language: language || 'en',
    speed: speed || 1,
    pitch: pitch || 1,
    volume: volume || 1,
    emotion: emotion || 'vocal_smile',
    voice: localVoice || 'en_US-lessac-medium',
    temperature: temperature || 0.75,
    stability: stability || 0.72,
    length_scale: lengthScale ?? undefined,
    noise_scale: noiseScale ?? undefined,
    speaker_id: speakerId ?? undefined,
    accent: accent || undefined,
    espeak_voice: espeakVoice || undefined,
  };

  if (speakerWavPath && fs.existsSync(speakerWavPath)) {
    const form = new FormData();
    form.append('text', text);
    form.append('language', payload.language);
    form.append('speed', String(payload.speed));
    form.append('pitch', String(payload.pitch));
    form.append('volume', String(payload.volume));
    form.append('voice', payload.voice);
    if (payload.length_scale != null) form.append('length_scale', String(payload.length_scale));
    if (payload.noise_scale != null) form.append('noise_scale', String(payload.noise_scale));
    if (payload.accent) form.append('accent', payload.accent);
    if (payload.espeak_voice) form.append('espeak_voice', payload.espeak_voice);
    const buf = fs.readFileSync(speakerWavPath);
    form.append('speaker_wav', new Blob([buf]), path.basename(speakerWavPath));
    const r2 = await fetch(`${base}/synthesize`, { method: 'POST', body: form });
    if (!r2.ok) {
      const err = await r2.text().catch(() => '');
      throw new Error(`Advanced worker synthesize failed: ${r2.status} ${err}`);
    }
    const ab2 = await r2.arrayBuffer();
    const ct = r2.headers.get('content-type') || '';
    const finalPath = ct.includes('wav') ? outPath.replace(/\.mp3$/i, '.wav') : outPath;
    fs.writeFileSync(finalPath, Buffer.from(ab2));
    return finalPath;
  }

  const r = await fetch(`${base}/synthesize_json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const err = await r.text().catch(() => '');
    throw new Error(`Advanced worker synthesize_json failed: ${r.status} ${err}`);
  }
  const ab = await r.arrayBuffer();
  const ct = r.headers.get('content-type') || '';
  const finalPath = ct.includes('wav') ? outPath.replace(/\.mp3$/i, '.wav') : outPath;
  fs.writeFileSync(finalPath, Buffer.from(ab));
  return finalPath;
}

/**
 * Advanced synthesize — self-hosted Piper worker + studio FX.
 * Basic tab keeps Azure/Edge; this path never falls back to Edge.
 */
async function synthesizeAdvanced(opts = {}) {
  let text = String(opts.text || '').trim();
  if (!text) throw new Error('No text provided');

  text = applyPaceTransform(text, opts.paceId || 'natural');
  text = applyAccentTextTransform(text, opts.accent || 'American (Gen)');

  const voice = resolveAdvancedVoice({
    voiceId: opts.voiceId || opts.voiceName,
    voiceType: opts.voiceType,
    accent: opts.accent,
  });

  const cloneProfile = opts.cloneId ? loadCloneProfile(opts.cloneId) : null;
  const speakerWavPath = opts.speakerWavPath || cloneProfile?.wavPath || null;

  const prosody = mapAdvancedProsody({
    ...opts,
    voiceType: opts.voiceType || voice.type,
    accent: opts.accent || voice.accent,
    pitch: Number.isFinite(opts.pitch)
      ? opts.pitch * (cloneProfile?.pitchBias || 1)
      : cloneProfile?.pitchBias || opts.pitch,
  });

  const outDir = opts.outDir || path.join(__dirname, '../uploads/processed', `adv_${uuidv4()}`);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  let outPath = opts.outPath || path.join(outDir, opts.fileName || 'advanced.wav');

  let engine = 'piper-local';
  let xtts = null;
  let fx = null;
  let cloneFx = null;

  const fxOpts = {
    emotion: opts.emotion,
    emotionAmt: opts.emotionAmt ?? 0.82,
    precision: opts.precision || 'studio',
    stability: opts.stability,
    temperature: opts.temperature ?? 0.95,
    sampleRate: opts.sampleRate,
    accent: opts.accent || voice.accent,
    paceId: opts.paceId || 'natural',
    pitch: prosody.pitch,
    voiceType: opts.voiceType || voice.type,
  };

  if (!xttsEnabled()) {
    throw new Error(
      'Advanced TTS requires the self-hosted worker. Set XTTS_FASTAPI_URL and start xtts-worker (Piper).'
    );
  }

  xtts = await probeXtts();
  if (!xtts.online) {
    throw new Error(
      `Advanced worker offline (${xtts.reason || 'unreachable'}). Start xtts-worker on port 8020 — Advanced does not use Azure.`
    );
  }

  const written = await tryLocalWorkerSynthesize({
    text,
    outPath,
    language: opts.language || 'en',
    speakerWavPath,
    speed: prosody.rate,
    pitch: prosody.pitch,
    volume: prosody.volume,
    emotion: opts.emotion,
    localVoice: voice.localVoice || voice.speaker,
    lengthScale: voice.lengthScale,
    noiseScale: voice.noiseScale,
    speakerId: voice.speakerId,
    temperature: opts.temperature,
    stability: opts.stability,
    accent: opts.accent || voice.accent,
    espeakVoice: voice.espeakVoice,
  });

  if (!written || !fs.existsSync(written) || fs.statSync(written).size < 80) {
    throw new Error('Advanced worker returned empty audio');
  }
  outPath = written;
  engine = xtts.engine || 'piper-local';

  // Make FX failure hard-fail preview in logs but still return audio only if FX applied
  // Production: style/pace/accent MUST apply
  fx = await applyAdvancedAudioFx(outPath, fxOpts);
  if (!fx?.applied) {
    throw new Error(fx?.error || 'Advanced studio FX failed — accent/style/pace not applied');
  }

  if (cloneProfile) {
    try {
      cloneFx = await applyCloneMatchFx(outPath, cloneProfile);
      if (cloneFx.applied) engine = `${engine}+clone-match`;
    } catch (e) {
      console.warn('[advanced-tts] clone match skipped:', e.message);
      cloneFx = { applied: false, error: e.message };
    }
  }

  return {
    outputPath: outPath,
    engine,
    speaker: voice.speaker,
    voice,
    prosody,
    xtts,
    fx,
    cloneFx,
    pacedText: text,
  };
}

module.exports = {
  synthesizeAdvanced,
  probeXtts,
  xttsEnabled,
  getXttsUrl,
  listAdvancedVoices,
  resolveAdvancedVoice,
  mapAdvancedProsody,
  applyAdvancedAudioFx,
};
