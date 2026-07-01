const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { batchGenerateTTS, VOICE_LIBRARY } = require('../services/ttsService');
const { zipDir } = require('../services/videoProcessor');
const ProcessingJob = require('../models/ProcessingJob');

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
      const { texts, speaker, rate, pitch, volume, quality, column, excelData, mode, rows } = req.body;

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

      textList = textList.filter((t) => String(t ?? '').trim().length > 0);
      if (textList.length === 0) {
        return res.status(400).json({ error: 'No texts provided' });
      }

      const edgeRate = formatRate(rate);
      const edgePitch = formatPitch(pitch);
      const edgeVolume = formatVolume(volume);

      const jobId = uuidv4();
      await ProcessingJob.create({ jobId, type: 'tts', status: 'queued', progress: 0, totalItems: textList.length });
      res.status(202).json({ jobId, totalItems: textList.length });

      setImmediate(async () => {
        try {
          await ProcessingJob.findOneAndUpdate({ jobId }, { status: 'processing' });
          const outDir = path.join(__dirname, '../uploads/processed', jobId);

          const toPublicUrl = (fp) => `/uploads/processed/${jobId}/${path.basename(fp)}`;

          const outputs = await batchGenerateTTS(
            textList,
            outDir,
            speaker || 'en_jenny',
            edgeRate,
            edgePitch,
            edgeVolume,
            quality,
            async (ev) => {
              const outputFiles = ev.outputPaths.map(toPublicUrl);
              await ProcessingJob.findOneAndUpdate(
                { jobId },
                {
                  progress: ev.percent,
                  completedItems: ev.completed,
                  totalItems: textList.length,
                  outputFiles,
                },
              );
            },
          );

          const outputFiles = outputs.map(toPublicUrl);

          await ProcessingJob.findOneAndUpdate({ jobId }, { progress: 92 });
          const zipPath = path.join(outDir, 'tts_audios.zip');
          await zipDir(outDir, zipPath);
          const resultUrl = `/uploads/processed/${jobId}/tts_audios.zip`;
          await ProcessingJob.findOneAndUpdate({ jobId }, {
            status: 'done',
            progress: 100,
            resultUrl,
            outputFiles,
            completedItems: outputs.length,
          });
        } catch (e) {
          await ProcessingJob.findOneAndUpdate({ jobId }, { status: 'error', error: e.message });
        }
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
};
