const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { VOICE_LIBRARY } = require('../services/ttsService');
const ProcessingJob = require('../models/ProcessingJob');
const { tryEnqueueTtsBatch } = require('../services/ttsQueueService');
const { runTtsBatchInProcess } = require('../services/ttsJobRunner');
const { getTtsWorkerConcurrency } = require('../services/bullTtsConfig');

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
};
