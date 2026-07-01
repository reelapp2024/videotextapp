const app = require('./app');
const { connectMongo } = require('./config/db');
const { useBullExport } = require('./services/bullExportConfig');
const { startEmbeddedExportWorker } = require('./services/exportWorkerBootstrap');
const { getRedisUrl } = require('./queues/connection');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/healthz`);

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
