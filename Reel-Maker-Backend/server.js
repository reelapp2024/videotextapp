const app = require('./app');
const { connectMongo } = require('./config/db');
const { useBullExport } = require('./services/bullExportConfig');
const { useBullCaptions } = require('./services/bullCaptionConfig');
const { useBullTts } = require('./services/bullTtsConfig');
const { startEmbeddedExportWorker } = require('./services/exportWorkerBootstrap');
const { startEmbeddedCaptionWorker } = require('./services/captionWorkerBootstrap');
const { startEmbeddedTtsWorker } = require('./services/ttsWorkerBootstrap');
const { getRedisUrl } = require('./queues/connection');
const { probeRedis } = require('./services/redisProbe');
const { startWhisperServerPool } = require('./services/whisperServerPool');
const { logEncodeCapabilities } = require('./services/encodeOptions');

const PORT = process.env.PORT || 3000;
// Bind IPv4 explicitly — avoids intermittent Windows localhost/::1 NetworkError from the frontend
const HOST = process.env.HOST || '0.0.0.0';

function disableBullEnv() {
  process.env.USE_BULL_EXPORT = 'false';
  process.env.USE_BULL_CAPTIONS = 'false';
  process.env.USE_BULL_TTS = 'false';
}

async function startBullWorkersIfRedisOk() {
  const redis = await probeRedis({ timeoutMs: 1000 });
  const wantBull = useBullExport() || useBullCaptions() || useBullTts();

  if (wantBull && !redis.ok) {
    console.warn(
      `[redis] Not reachable at ${redis.host}:${redis.port} (${redis.reason || 'down'}) — Bull queues OFF, in-process mode ON.`
    );
    console.warn('[redis] To enable queues: start Redis on that port, or keep USE_BULL_*=false in .env.');
    disableBullEnv();
    return;
  }

  if (!wantBull) {
    console.log('[redis] Bull disabled via USE_BULL_* — in-process TTS/captions/export');
    return;
  }

  console.log(`[redis] OK at ${getRedisUrl()} — starting Bull workers`);

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

  if (useBullTts() && process.env.EMBED_TTS_WORKER !== 'false') {
    console.log(`[tts-queue] Bull enabled — Redis ${getRedisUrl()}`);
    connectMongo()
      .then(() => startEmbeddedTtsWorker())
      .then((worker) => {
        if (worker) {
          console.log('[tts-queue] Embedded TTS worker started (set EMBED_TTS_WORKER=false to disable)');
        }
      })
      .catch((err) => {
        console.warn('[tts-queue] Embedded worker failed to start:', err.message);
      });
  } else {
    console.log('[tts-queue] Bull disabled (USE_BULL_TTS=false) — in-process TTS only');
  }
}

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://127.0.0.1:${PORT} (bound ${HOST})`);
  console.log(`📊 Health check: http://127.0.0.1:${PORT}/healthz`);

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

  startBullWorkersIfRedisOk().catch((err) => {
    console.warn('[redis] startup probe failed:', err.message);
    disableBullEnv();
  });
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
