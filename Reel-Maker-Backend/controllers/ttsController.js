const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { VOICE_LIBRARY, generateTTS } = require('../services/ttsService');
const ProcessingJob = require('../models/ProcessingJob');
const { tryEnqueueTtsBatch } = require('../services/ttsQueueService');
const { runTtsBatchInProcess, runAdvancedTtsBatchInProcess } = require('../services/ttsJobRunner');
const { getTtsWorkerConcurrency } = require('../services/bullTtsConfig');
const {
  synthesizeAdvanced,
  probeXtts,
  xttsEnabled,
  getXttsUrl,
  listAdvancedVoices,
  resolveAdvancedVoice,
  mapAdvancedProsody,
} = require('../services/advancedTtsService');
const { saveAndAnalyzeClone } = require('../services/advancedCloneService');
const { PACE_PRESETS } = require('../services/advancedTtsMap');

const EDGE_RATE_PCT = { min: -50, max: 100 };
const EDGE_PITCH_HZ = { min: -50, max: 50 };
const EDGE_VOLUME_PCT = { min: -50, max: 50 };

function clampPct(pct, min, max) {
  if (!Number.isFinite(pct)) return 0;
  return Math.max(min, Math.min(max, pct));
}

function formatRate(rate) {
  if (typeof rate === 'string') {
    const s = rate.trim();
    if (s === 'default' || s === 'medium') return 'default';
    const m = s.match(/^([+-]?\d+(?:\.\d+)?)%$/);
    if (m) {
      const pct = clampPct(Math.round(parseFloat(m[1])), EDGE_RATE_PCT.min, EDGE_RATE_PCT.max);
      return (pct >= 0 ? '+' : '') + pct + '%';
    }
  }
  const n = parseFloat(rate);
  if (isNaN(n) || n === 1) return '+0%';
  const pct = clampPct(Math.round((n - 1) * 100), EDGE_RATE_PCT.min, EDGE_RATE_PCT.max);
  return (pct >= 0 ? '+' : '') + pct + '%';
}

function formatPitch(pitch) {
  if (typeof pitch === 'string') {
    const s = pitch.trim();
    if (s === 'default' || s === 'medium') return '+0Hz';
    const hz = s.match(/^([+-]?\d+(?:\.\d+)?)Hz$/i);
    if (hz) {
      const h = clampPct(Math.round(parseFloat(hz[1])), EDGE_PITCH_HZ.min, EDGE_PITCH_HZ.max);
      return (h >= 0 ? '+' : '') + h + 'Hz';
    }
    const m = s.match(/^([+-]?\d+(?:\.\d+)?)%$/);
    if (m) {
      const pct = clampPct(Math.round(parseFloat(m[1])), -100, 100);
      const mapped = clampPct(Math.round(pct / 2), EDGE_PITCH_HZ.min, EDGE_PITCH_HZ.max);
      return (mapped >= 0 ? '+' : '') + mapped + 'Hz';
    }
  }
  const n = parseFloat(pitch);
  if (isNaN(n) || n === 1) return '+0Hz';
  const h = clampPct(Math.round((n - 1) * 35), EDGE_PITCH_HZ.min, EDGE_PITCH_HZ.max);
  return (h >= 0 ? '+' : '') + h + 'Hz';
}

function formatVolume(vol) {
  if (typeof vol === 'string') {
    const s = vol.trim();
    if (s === 'default' || s === 'medium') return 'default';
    const m = s.match(/^([+-]?\d+(?:\.\d+)?)%$/);
    if (m) {
      const pct = clampPct(Math.round(parseFloat(m[1])), EDGE_VOLUME_PCT.min, EDGE_VOLUME_PCT.max);
      return (pct >= 0 ? '+' : '') + pct + '%';
    }
  }
  const n = parseFloat(vol);
  if (isNaN(n) || n === 1) return '+0%';
  const pct = clampPct(Math.round((n - 1) * 100), EDGE_VOLUME_PCT.min, EDGE_VOLUME_PCT.max);
  return (pct >= 0 ? '+' : '') + pct + '%';
}

function buildTextList(reqBody) {
  const { texts, excelData, mode, rows, column } = reqBody;
  let textList = [];

  if (texts && Array.isArray(texts)) {
    textList = texts;
  } else if (excelData && Array.isArray(excelData)) {
    if (mode === 'row' && typeof rows !== 'undefined') {
      const rowIndices = Array.isArray(rows) ? rows : [rows];
      textList = rowIndices.map((ri) => {
        const row = excelData[ri];
        if (!Array.isArray(row)) return '';
        return row.filter((c) => c != null && String(c).trim() !== '').map(String).join(' ');
      });
    } else {
      const col = column ?? 0;
      textList = excelData.map((row) => String(row[col] ?? ''));
    }
  }

  return textList.filter((t) => String(t ?? '').trim().length > 0);
}

module.exports = {
  listVoices: (_req, res) => {
    const voices = Object.entries(VOICE_LIBRARY).map(([id, v]) => ({
      id,
      voice: v.voice,
      lang: v.lang,
      gender: v.gender,
      label: v.label,
      category: v.category,
      pitchTier: v.pitchTier,
      basePitchHz: v.basePitchHz,
    }));
    const categories = [...new Set(voices.map((v) => v.category))];
    res.json({ voices, categories, total: voices.length });
  },

  /**
   * Sync Edge Neural sample — Redis/memory cached, fast Edge timeouts (no 3‑min hangs).
   */
  preview: async (req, res) => {
    const outDir = path.join(__dirname, '../uploads/processed', `preview_${uuidv4()}`);
    const outPath = path.join(outDir, 'sample.mp3');
    try {
      const { speaker, rate, pitch, volume, quality } = req.body || {};
      let text = String(req.body?.text ?? '').trim();
      if (!text) {
        text = 'Hello, this is a sample of my unique neural voice.';
      }
      // Keep samples short for fast UX
      if (text.length > 180) text = text.slice(0, 180);

      const edgeRate = formatRate(rate);
      const edgePitch = formatPitch(pitch);
      const edgeVolume = formatVolume(volume);
      const speakerId = speaker || 'en_jenny';
      const q = quality || 'clear';

      const cachePayload = {
        eng: 'basic-v1',
        text,
        speaker: speakerId,
        rate: edgeRate,
        pitch: edgePitch,
        volume: edgeVolume,
        quality: q,
      };
      const { getCachedPreview, setCachedPreview } = require('../services/advancedTtsCache');
      const cached = await getCachedPreview(cachePayload);
      if (cached?.buffer) {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('X-TTS-Speaker', speakerId);
        res.setHeader('X-TTS-Cache', cached.source === 'memory' ? 'HIT-MEM' : 'HIT');
        return res.send(cached.buffer);
      }

      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

      await generateTTS(text, outPath, speakerId, edgeRate, edgePitch, edgeVolume, q, { fast: true, preview: true });

      if (!fs.existsSync(outPath) || fs.statSync(outPath).size < 80) {
        throw new Error('Preview audio empty — Edge TTS may be blocked or timed out.');
      }

      const buf = fs.readFileSync(outPath);
      const ttl = parseInt(process.env.BASIC_TTS_PREVIEW_CACHE_TTL || '1800', 10) || 1800;
      setCachedPreview(cachePayload, buf, ttl).catch(() => {});

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-TTS-Speaker', speakerId);
      res.setHeader('X-TTS-Cache', 'MISS');
      res.send(buf);
      fs.rm(outDir, { recursive: true, force: true }, () => {});
    } catch (e) {
      try {
        fs.rmSync(outDir, { recursive: true, force: true });
      } catch (_) {}
      console.error('[TTS preview]', e?.message || e);
      res.status(500).json({ error: e?.message || 'TTS preview failed' });
    }
  },

  generate: async (req, res) => {
    try {
      const { speaker, rate, pitch, volume, quality } = req.body;
      const textList = buildTextList(req.body);

      if (textList.length === 0) {
        return res.status(400).json({ error: 'No texts provided' });
      }

      const edgeRate = formatRate(rate);
      const edgePitch = formatPitch(pitch);
      const edgeVolume = formatVolume(volume);

      const jobId = uuidv4();
      const outDir = path.join(__dirname, '../uploads/processed', jobId);
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

      const ttsPayload = {
        jobId,
        texts: textList,
        speaker: speaker || 'en_jenny',
        rate: edgeRate,
        pitch: edgePitch,
        volume: edgeVolume,
        quality,
        outDir,
      };

      await ProcessingJob.create({
        jobId,
        type: 'tts',
        status: 'queued',
        progress: 0,
        totalItems: textList.length,
        completedItems: 0,
        config: {
          speaker: ttsPayload.speaker,
          rate: edgeRate,
          pitch: edgePitch,
          volume: edgeVolume,
          quality,
          outDir,
          parallelJobs: getTtsWorkerConcurrency(),
          completedItemIndexes: [],
          failedItemIndexes: [],
          itemProgress: {},
          studio: req.body?.studio || 'basic',
          styleId: req.body?.styleId,
          paceId: req.body?.paceId,
          accent: req.body?.accent,
        },
      });

      res.status(202).json({ jobId, totalItems: textList.length });

      const startInProcess = () => {
        setImmediate(() => {
          runTtsBatchInProcess(ttsPayload).catch(async (e) => {
            await ProcessingJob.findOneAndUpdate({ jobId }, { status: 'error', error: e.message });
          });
        });
      };

      tryEnqueueTtsBatch(ttsPayload)
        .then((enqueued) => {
          if (!enqueued) startInProcess();
        })
        .catch(() => startInProcess());
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  /** Advanced voice catalog (isolated from Basic) */
  listAdvancedVoices: (_req, res) => {
    res.json({ voices: listAdvancedVoices(), total: listAdvancedVoices().length });
  },

  /** Advanced worker status — self-hosted Piper only (no Azure) */
  advancedStatus: async (_req, res) => {
    try {
      const xtts = xttsEnabled() ? await probeXtts() : { online: false, reason: 'disabled' };
      const proOnline = !!xtts.online;
      const piper = !!(xtts.piper || xtts.engine === 'piper-local');
      res.json({
        mode: proOnline ? (xtts.engine || 'piper-local') : 'offline',
        edgeFallback: false,
        azure: false,
        studioFx: true,
        xttsEnabled: xttsEnabled(),
        xttsUrl: getXttsUrl() || null,
        xtts,
        proFeatures: {
          emotionFx: true,
          precisionLoudnorm: true,
          temperatureTreble: true,
          worker: proOnline,
          piperLocal: piper,
          voiceClone: false,
        },
        message: proOnline
          ? `Self-hosted ${xtts.engine || 'piper-local'} online · studio FX active`
          : 'Start xtts-worker (Piper) on port 8020 — Advanced does not use Azure',
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  /** Advanced preview — Redis-cached, fast FX (full accent/style/pace, no loudnorm) */
  advancedPreview: async (req, res) => {
    const outDir = path.join(__dirname, '../uploads/processed', `adv_preview_${uuidv4()}`);
    try {
      let text = String(req.body?.text ?? '').trim();
      if (!text) {
        text = 'Hello, this is your Advanced Neural voice with the selected style and emotion.';
      }
      if (text.length > 400) text = text.slice(0, 400);

      const cachePayload = {
        eng: 'adv-v2',
        text,
        voiceId: req.body?.voiceId || req.body?.voiceName,
        voiceType: req.body?.voiceType,
        accent: req.body?.accent,
        emotion: req.body?.emotion,
        emotionAmt: req.body?.emotionAmt,
        paceId: req.body?.paceId || 'natural',
        speed: req.body?.speed,
        pitch: req.body?.pitch,
        stability: req.body?.stability,
        temperature: req.body?.temperature,
        precision: 'preview',
        cloneId: req.body?.cloneId,
      };

      const { getCachedPreview, setCachedPreview } = require('../services/advancedTtsCache');
      const cached = await getCachedPreview(cachePayload);
      if (cached?.buffer) {
        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('X-TTS-Cache', 'HIT');
        res.setHeader('X-TTS-Engine', 'piper-local');
        res.setHeader('X-TTS-Studio-FX', '1');
        return res.send(cached.buffer);
      }

      const result = await synthesizeAdvanced({
        text,
        outDir,
        fileName: 'sample.wav',
        voiceId: cachePayload.voiceId,
        voiceType: cachePayload.voiceType,
        accent: cachePayload.accent,
        emotion: cachePayload.emotion,
        speed: cachePayload.speed,
        pitch: cachePayload.pitch,
        emotionAmt: cachePayload.emotionAmt,
        stability: cachePayload.stability,
        similarity: req.body?.similarity,
        cfgScale: req.body?.cfgScale,
        temperature: cachePayload.temperature,
        language: req.body?.language,
        sampleRate: req.body?.sampleRate || '22050',
        precision: 'preview',
        quality: 'clear',
        speakerWavPath: req.body?.speakerWavPath,
        engine: req.body?.engine,
        paceId: cachePayload.paceId,
        cloneId: cachePayload.cloneId,
      });

      const outPath = result.outputPath;
      if (!fs.existsSync(outPath) || fs.statSync(outPath).size < 80) {
        throw new Error('Advanced preview audio empty');
      }

      const buf = fs.readFileSync(outPath);
      const ttl = parseInt(process.env.ADVANCED_TTS_PREVIEW_CACHE_TTL || '3600', 10) || 3600;
      setCachedPreview(cachePayload, buf, ttl).catch(() => {});

      const ext = path.extname(outPath).toLowerCase();
      res.setHeader('Content-Type', ext === '.wav' ? 'audio/wav' : 'audio/mpeg');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-TTS-Cache', 'MISS');
      res.setHeader('X-TTS-Engine', result.engine);
      res.setHeader('X-TTS-Speaker', result.speaker || '');
      res.setHeader('X-TTS-Studio-FX', result.fx?.applied ? '1' : '0');
      res.send(buf);
      fs.rm(outDir, { recursive: true, force: true }, () => {});
    } catch (e) {
      try {
        fs.rmSync(outDir, { recursive: true, force: true });
      } catch (_) {}
      console.error('[TTS advanced preview]', e?.message || e);
      res.status(500).json({ error: e?.message || 'Advanced preview failed' });
    }
  },

  /**
   * Advanced batch generate — Redis/Bull parallel jobs when available.
   */
  advancedGenerate: async (req, res) => {
    try {
      const textList = buildTextList(req.body);
      if (textList.length === 0) {
        return res.status(400).json({ error: 'No texts provided' });
      }

      const voice = resolveAdvancedVoice({
        voiceId: req.body?.voiceId || req.body?.voiceName,
        voiceType: req.body?.voiceType,
        accent: req.body?.accent,
      });
      const prosody = mapAdvancedProsody({
        ...(req.body || {}),
        voiceType: req.body?.voiceType || voice.type,
        accent: req.body?.accent || voice.accent,
      });

      const jobId = uuidv4();
      const outDir = path.join(__dirname, '../uploads/processed', jobId);
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

      const advancedOpts = {
        voiceId: voice.id,
        voiceName: voice.name,
        voiceType: req.body?.voiceType,
        accent: req.body?.accent,
        emotion: req.body?.emotion,
        speed: req.body?.speed,
        pitch: req.body?.pitch,
        emotionAmt: req.body?.emotionAmt,
        stability: req.body?.stability,
        similarity: req.body?.similarity,
        cfgScale: req.body?.cfgScale,
        temperature: req.body?.temperature,
        language: req.body?.language,
        sampleRate: req.body?.sampleRate,
        precision: req.body?.precision || 'studio',
        quality: req.body?.quality || 'clear',
        engine: req.body?.engine,
        speakerWavPath: req.body?.speakerWavPath,
        paceId: req.body?.paceId || 'natural',
        cloneId: req.body?.cloneId,
      };

      await ProcessingJob.create({
        jobId,
        type: 'tts',
        status: 'queued',
        progress: 0,
        totalItems: textList.length,
        completedItems: 0,
        config: {
          speaker: voice.speaker,
          advanced: true,
          mode: 'advanced',
          voiceId: voice.id,
          voiceName: voice.name,
          accent: advancedOpts.accent || voice.accent,
          emotion: advancedOpts.emotion,
          paceId: advancedOpts.paceId,
          precision: advancedOpts.precision,
          outDir,
          engine: 'advanced-pro',
          prosody,
          completedItemIndexes: [],
          failedItemIndexes: [],
          itemProgress: {},
          selection: {
            voiceId: advancedOpts.voiceId,
            voiceType: advancedOpts.voiceType,
            accent: advancedOpts.accent,
            emotion: advancedOpts.emotion,
            paceId: advancedOpts.paceId,
            precision: advancedOpts.precision,
            speed: advancedOpts.speed,
            pitch: advancedOpts.pitch,
            emotionAmt: advancedOpts.emotionAmt,
          },
        },
      });

      res.status(202).json({
        jobId,
        totalItems: textList.length,
        engine: 'advanced-pro',
        speaker: voice.speaker,
        voice: voice.name,
        studioFx: true,
        parallel: true,
      });

      setImmediate(async () => {
        const { tryEnqueueTtsBatch } = require('../services/ttsQueueService');
        const enqueued = await tryEnqueueTtsBatch({
          mode: 'advanced',
          jobId,
          texts: textList,
          outDir,
          speaker: voice.speaker,
          advancedOpts,
        });
        if (!enqueued) {
          runAdvancedTtsBatchInProcess({
            jobId,
            texts: textList,
            outDir,
            advancedOpts,
          }).catch(async (e) => {
            await ProcessingJob.findOneAndUpdate({ jobId }, { status: 'error', error: e.message });
          });
        }
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  /** Upload custom voice reference for Advanced clone matching */
  uploadAdvancedClone: async (req, res) => {
    try {
      if (!req.file?.path) {
        return res.status(400).json({ error: 'Audio file required (wav/mp3/m4a)' });
      }
      const profile = await saveAndAnalyzeClone(req.file.path, req.file.originalname);
      try {
        fs.unlinkSync(req.file.path);
      } catch (_) {}
      res.json({
        ok: true,
        cloneId: profile.cloneId,
        fileName: profile.fileName,
        profile: {
          brightness: profile.brightness,
          warmth: profile.warmth,
          pitchBias: profile.pitchBias,
          meanDb: profile.meanDb,
        },
        message: 'Clone reference saved — Advanced will timbre-match this sample (XTTS if available).',
      });
    } catch (e) {
      console.error('[TTS clone upload]', e?.message || e);
      res.status(500).json({ error: e?.message || 'Clone upload failed' });
    }
  },
};
