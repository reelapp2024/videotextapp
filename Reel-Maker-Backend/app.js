require('dotenv').config();
const cors = require('cors');
const compression = require('compression');
const express = require('express');
const path = require('path');
const fs = require('fs');
const { connectMongo, getMongoStatus } = require('./config/db');

const projectsRouter = require('./routes/projects');
const authRouter = require('./routes/auth');
const uploadsRouter = require('./routes/uploads');
const analyticsRouter = require('./routes/analytics');
const excelRouter = require('./routes/excel');
const exportsRouter = require('./routes/exports');
const adminRouter = require('./routes/admin');
const userPresetsRouter = require('./routes/userPresets');

connectMongo().catch((e) => console.error('❌ Initial MongoDB connect failed:', e.message));

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());
app.use(express.json({ limit: 100 * 1024 * 1024 }));

app.use('/api', async (_req, _res, next) => {
  try {
    await connectMongo();
  } catch (e) {
    console.error('MongoDB middleware connect error:', e.message);
  }
  next();
});

app.use('/api/projects', projectsRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/excel', excelRouter);
app.use('/api/exports', exportsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user-presets', userPresetsRouter);

const loadedFeatures = {
  video: false,
  audio_extract: false,
  thumbnails: false,
  video_merge: false,
  tts_generate: false,
  image_generate: false,
  captions: false,
  background_effects: false,
  server_render: false,
};

const heavyRoutes = [
  ['/api/video', './routes/video', 'video'],
  ['/api/audio/extract', './routes/audioExtract', 'audio_extract'],
  ['/api/thumbnails/extract', './routes/thumbnails', 'thumbnails'],
  ['/api/video/merge', './routes/videoMerge', 'video_merge'],
  ['/api/tts/generate', './routes/ttsGenerate', 'tts_generate'],
  ['/api/images/generate', './routes/imageGenerate', 'image_generate'],
  ['/api/captions', './routes/captions', 'captions'],
  ['/api/background-effects', './routes/backgroundEffects', 'background_effects'],
  ['/api/render', './routes/render', 'server_render'],
];

const fallbackHandler = (_req, res) => {
  res.status(503).json({ error: 'This feature requires a dedicated server (not available on serverless)' });
};

for (const [routePath, modulePath, featureKey] of heavyRoutes) {
  try {
    const mod = require(modulePath);
    app.use(routePath, mod);
    loadedFeatures[featureKey] = true;
    console.log(`✅ Loaded route: ${routePath}`);
  } catch (err) {
    console.warn(`⚠️  Skipped route ${routePath}: ${err.message}`);
    app.use(routePath, fallbackHandler);
  }
}

const { useBullExport } = require('./services/bullExportConfig');
const { useBullCaptions } = require('./services/bullCaptionConfig');
const { useBullTts, getTtsWorkerConcurrency } = require('./services/bullTtsConfig');
const os = require('os');

function buildHardwareSnapshot() {
  let encoder = null;
  let availableEncoders = [];
  let hasNvidiaNvenc = false;
  try {
    const enc = require('./services/encodeOptions');
    encoder = enc.HW_ENCODER || null;
    availableEncoders = (enc.DETECTED_ENCODERS?.available || []).map((e) => e.name || e.config?.codec).filter(Boolean);
    hasNvidiaNvenc = availableEncoders.includes('nvenc') || String(encoder).includes('nvenc');
  } catch (_) {}

  return {
    platform: process.platform,
    arch: process.arch,
    cpuCores: os.cpus().length,
    cpuModel: os.cpus()[0]?.model || 'Unknown CPU',
    totalMemGb: Math.round((os.totalmem() / (1024 ** 3)) * 10) / 10,
    freeMemGb: Math.round((os.freemem() / (1024 ** 3)) * 10) / 10,
    hostname: os.hostname(),
    encoder,
    availableEncoders,
    hasNvidiaNvenc,
    // XTTS FastAPI worker is future — report env if configured
    xttsFastapiUrl: process.env.XTTS_FASTAPI_URL || process.env.ADVANCED_TTS_URL || null,
    xttsEnabled: process.env.ADVANCED_TTS_ENABLED === 'true' || process.env.XTTS_ENABLED === 'true',
  };
}

app.get('/api/capabilities', (_req, res) => {
  const mongo = getMongoStatus();
  const hardware = buildHardwareSnapshot();
  res.json({
    serverless: !!process.env.VERCEL,
    exportRenderer: process.env.EXPORT_RENDERER || 'server',
    useBullExport: useBullExport(),
    useBullCaptions: useBullCaptions(),
    useBullTts: useBullTts(),
    ttsWorkerConcurrency: getTtsWorkerConcurrency(),
    features: loadedFeatures,
    mongo: {
      connected: mongo.isConnected,
      status: mongo.status,
    },
    redis: {
      configured: !!(process.env.REDIS_URL || process.env.REDIS_HOST),
      bullExport: useBullExport(),
      bullTts: useBullTts(),
      bullCaptions: useBullCaptions(),
    },
    hardware,
    stack: {
      frontend: 'React',
      api: 'Node.js',
      database: 'MongoDB',
      queue: 'Redis / BullMQ',
      advancedTts: 'Python FastAPI + XTTS v2',
      gpuWorker: 'NVIDIA GPU worker',
    },
  });
});

app.get('/uploads/*', (req, res) => {
  const rel = req.path.replace(/^\/+/, '');
  const filePath = path.join(__dirname, rel);
  if (!fs.existsSync(filePath)) return res.status(404).type('text/plain').send('Not found');
  const stat = fs.statSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.mp4': 'video/mp4', '.webm': 'video/webm', '.mkv': 'video/x-matroska',
    '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.zip': 'application/zip',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  };
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunkSize = end - start + 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType,
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Content-Disposition': ext === '.zip' ? `attachment; filename="${path.basename(filePath)}"` : 'inline',
      'Cache-Control': 'public, max-age=3600',
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.type('html').send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Reel Maker API</title>
      </head>
      <body>
        <h1>Reel Maker Backend API</h1>
        <p><a href="/healthz">Health check</a></p>
        <p><a href="/api/capabilities">Capabilities</a></p>
      </body>
    </html>
  `);
});

app.get('/healthz', async (req, res) => {
  try { await connectMongo(); } catch (_) {}
  const mongoStatus = getMongoStatus();
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: {
      connected: mongoStatus.isConnected,
      status: mongoStatus.status,
      readyState: mongoStatus.readyState,
    },
  });
});

module.exports = app;
