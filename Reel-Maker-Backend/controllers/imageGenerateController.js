const path = require('path');
const fs = require('fs');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
const { v4: uuidv4 } = require('uuid');
const { zipDir } = require('../services/videoProcessor');
const ProcessingJob = require('../models/ProcessingJob');
const { imageJobUpload } = require('../middleware/upload');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

function esc(s) {
  return String(s ?? '')
    .replace(/\\/g, '\\\\\\\\')
    .replace(/'/g, '\u2019')
    .replace(/:/g, '\\:')
    .replace(/\n/g, ' ');
}

function hexToFF(hex) {
  if (!hex?.startsWith('#')) return 'white';
  return `0x${hex.slice(1)}`;
}

function clampNum(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

async function generateImage(outPath, w, h, bgColor, overlays, row, bgImagePath) {
  return new Promise((resolve, reject) => {
    let cmd;
    if (bgImagePath && fs.existsSync(bgImagePath)) {
      const vf = `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:black`;
      cmd = ffmpeg(bgImagePath).outputOptions(['-vf', vf]);
    } else {
      cmd = ffmpeg(`color=c=${bgColor}:s=${w}x${h}:d=1:r=1`).inputOptions(['-f', 'lavfi']);
    }

    const drawFilters = [];
    const rowArr = Array.isArray(row) ? row : (row && typeof row === 'object' ? Object.values(row) : []);
    for (const o of (overlays || [])) {
      if (o.enabled === false) continue;
      const colIdx = o.excelColumnIndex ?? o.columnIndex ?? o.id ?? 0;
      const text = esc(String(rowArr[colIdx] ?? ''));
      if (!text.trim()) continue;
      const fontSize = clampNum(Math.floor(w * ((o.fontSize ?? 5) / 100)), 12, 120);
      const color = hexToFF(o.color || '#FFFFFF');
      const posY = clampNum(o.positionY ?? 50, 5, 95);
      let box = '';
      if (o.styleType === 'box' && (o.bgOpacity ?? 0) > 0) {
        box = `:box=1:boxcolor=${hexToFF(o.bgColor || '#000000')}@${o.bgOpacity ?? 0.8}:boxborderw=8`;
      }
      drawFilters.push(
        `drawtext=text='${text}':fontsize=${fontSize}:fontcolor=${color}:x=(w-text_w)/2:y=h*${posY / 100}:borderw=2:bordercolor=black${box}`,
      );
    }

    if (drawFilters.length === 0) {
      const fallbackText = (rowArr || []).map((c) => esc(String(c ?? ''))).filter(Boolean).join(' | ') || ' ';
      const fontSize = clampNum(Math.floor(w * 0.05), 12, 120);
      drawFilters.push(`drawtext=text='${fallbackText}':fontsize=${fontSize}:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:borderw=2:bordercolor=black`);
    }

    cmd.outputOptions(['-vf', drawFilters.join(','), '-vframes', '1', '-q:v', '2'])
      .output(outPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

module.exports = {
  generate: async (req, res) => {
    const jobId = uuidv4();
    req.jobId = jobId;

    imageJobUpload.array('images', 50)(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      try {
        let config = {};
        try {
          const configStr = req.body?.config;
          if (typeof configStr === 'string') config = JSON.parse(configStr);
          else if (configStr && typeof configStr === 'object') config = configStr;
        } catch (_) {}
        let excelData = [[]];
        try {
          const excelStr = req.body?.excelData;
          if (typeof excelStr === 'string') excelData = JSON.parse(excelStr);
          else if (Array.isArray(excelStr)) excelData = excelStr;
          else if (excelStr && Array.isArray(excelStr.rows)) excelData = excelStr.rows;
        } catch (_) {}
        const bgImages = req.files;

        const overlays = config?.overlays || [];
        let w = config?.video?.width;
        let h = config?.video?.height;
        if (!w || !h) {
          const ratio = config?.video?.aspectRatio || config?.imageAspectRatio || '1080x1920';
          const match = String(ratio).match(/^(\d{2,5})x(\d{2,5})$/i);
          if (match) {
            w = parseInt(match[1], 10) || 1080;
            h = parseInt(match[2], 10) || 1920;
          } else {
            w = w || 1080;
            h = h || 1920;
          }
        }
        const bgColor = config?.background?.solidColor || config?.background?.color || 'black';
        const rawFormat = (config?.imageFormat || config?.image?.format || 'png').toLowerCase();
        const format = ['jpg', 'jpeg', 'webp'].includes(rawFormat) ? (rawFormat === 'jpeg' ? 'jpg' : rawFormat) : 'png';

        if (!Array.isArray(excelData) || excelData.length === 0) return res.status(400).json({ error: 'No excelData' });

        await ProcessingJob.create({ jobId, type: 'image', status: 'queued', progress: 0, totalItems: excelData.length });
        res.status(202).json({ jobId });

        setImmediate(async () => {
          try {
            await ProcessingJob.findOneAndUpdate({ jobId }, { status: 'processing' });
            const outDir = path.join(__dirname, '../uploads/processed', jobId);
            fs.mkdirSync(outDir, { recursive: true });

            for (let i = 0; i < excelData.length; i++) {
              await ProcessingJob.findOneAndUpdate({ jobId }, { progress: Math.round((i / excelData.length) * 90) });
              const bgImg = bgImages && bgImages.length > 0 ? bgImages[i % bgImages.length]?.path : undefined;
              const outPath = path.join(outDir, `image_${i + 1}.${format}`);
              try {
                await generateImage(outPath, w, h, bgColor, overlays, excelData[i] || [], bgImg);
              } catch (e) {
                console.error(`Image ${i + 1} error:`, e.message);
              }
            }

            const zipPath = path.join(outDir, 'images.zip');
            await zipDir(outDir, zipPath);
            const resultUrl = `/uploads/processed/${jobId}/images.zip`;

            const files = fs.readdirSync(outDir)
              .filter((n) => n.startsWith('image_') && !n.endsWith('.zip'));
            const outputFiles = files.map((n) => `/uploads/processed/${jobId}/${n}`);

            await ProcessingJob.findOneAndUpdate(
              { jobId },
              {
                status: 'done',
                progress: 100,
                resultUrl,
                outputFiles,
                completedItems: outputFiles.length,
                totalItems: excelData.length,
              },
            );
          } catch (e) {
            await ProcessingJob.findOneAndUpdate({ jobId }, { status: 'error', error: e.message });
          }
        });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
  },
};
