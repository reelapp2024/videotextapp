/**
 * Bull export worker — runs video export outside the API process (M8/M9).
 * Uses Bull (Redis 3.x compatible — same as redisHost/redisPort projects on Windows).
 *
 * Usage:
 *   node workers/exportVideoWorker.js
 *
 * Redis defaults to redis://127.0.0.1:6379 (REDIS_HOST/REDIS_PORT or redisHost/redisPort).
 */
require('dotenv').config();

const { connectMongo } = require('../config/db');
const { closeRedisConnections } = require('../queues/connection');
const { startEmbeddedExportWorker, stopEmbeddedExportWorker } = require('../services/exportWorkerBootstrap');
const { exportLog } = require('../services/exportLogger');
const { getRedisUrl } = require('../queues/connection');

async function main() {
  const url = getRedisUrl();
  console.log(`[export-worker] connecting to Redis ${url}`);

  await connectMongo();
  const worker = await startEmbeddedExportWorker();
  if (!worker) {
    console.error('[export-worker] Failed to start — check Redis at', url);
    process.exit(1);
  }

  const shutdown = async (signal) => {
    exportLog('export.worker.shutdown', { signal, standalone: true });
    await stopEmbeddedExportWorker();
    await closeRedisConnections();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  exportLog('export.worker.fatal', { error: err.message });
  process.exit(1);
});
