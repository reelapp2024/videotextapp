const app = require('./app');
const { connectMongo } = require('./config/db');
const { useBullExport } = require('./services/bullExportConfig');
const { useBullCaptions } = require('./services/bullCaptionConfig');
const { startEmbeddedExportWorker } = require('./services/exportWorkerBootstrap');
const { startEmbeddedCaptionWorker } = require('./services/captionWorkerBootstrap');
const { getRedisUrl } = require('./queues/connection');
const { startWhisperServerPool } = require('./services/whisperServerPool');
const { logEncodeCapabilities } = require('./services/encodeOptions');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/healthz`);
  
  logEncodeCapabilities();

  connectMongo().catch((err) => {
    console.warn('[server] Mongo connect warning:', err.message);
  });

  startWhisperServerPool()
    .then((ok) => {
      if (ok) {
        console.log('[whisper-pool] Model pre-loaded — Generate captions will be faster on first click');
      }
    })
    .catch((err) => {
      console.warn('[whisper-pool] pre-load failed:', err.message);
    });

  if (useBullExport() && process.env.EMBED_EXPORT_WORKER !== 'false') {
    console.log(`[export-queue] Bull enabled — Redis ${getRedisUrl()}`);
    connectMongo()
      .then(() => startEmbeddedExportWorker())
      .then((worker) => {
        if (worker) {
          console.log('[export-queue] Embedded export worker started (set EMBED_EXPORT_WORKER=false to disable)');
        }
      })
      .catch((err) => {
        console.warn('[export-queue] Embedded worker failed to start:', err.message);
      });
  } else {
    console.log('[export-queue] Bull disabled (USE_BULL_EXPORT=false) — in-process export only');
  }

  if (useBullCaptions() && process.env.EMBED_CAPTION_WORKER !== 'false') {
    console.log(`[caption-queue] Bull enabled — Redis ${getRedisUrl()}`);
    connectMongo()
      .then(() => startEmbeddedCaptionWorker())
      .then((worker) => {
        if (worker) {
          console.log('[caption-queue] Embedded caption worker started (set EMBED_CAPTION_WORKER=false to disable)');
        }
      })
      .catch((err) => {
        console.warn('[caption-queue] Embedded worker failed to start:', err.message);
      });
  } else {
    console.log('[caption-queue] Bull disabled (USE_BULL_CAPTIONS=false) — in-process captions only');
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use. Either:`);
    console.error(`   • Close the other app using port ${PORT}, or`);
    console.error(`   • Set PORT=3002 (or another port) in .env and restart.\n`);
  } else {
    console.error('Server error:', err.message);
  }
  process.exit(1);
});

server.timeout = 0;
server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;
server.requestTimeout = 0;
