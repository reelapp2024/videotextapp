/**
 * Standalone Bull caption transcription worker.
 *
 * Usage:
 *   node workers/captionTranscribeWorker.js
 *
 * Run multiple terminals/processes for more parallel transcription (each uses CAPTION_WORKER_CONCURRENCY).
 */
require('dotenv').config();

const { connectMongo } = require('../config/db');
const { closeRedisConnections } = require('../queues/connection');
const { startEmbeddedCaptionWorker, stopEmbeddedCaptionWorker } = require('../services/captionWorkerBootstrap');
const { getRedisUrl } = require('../queues/connection');

async function main() {
  const url = getRedisUrl();
  console.log(`[caption-worker] connecting to Redis ${url}`);

  await connectMongo();
  const worker = await startEmbeddedCaptionWorker();
  if (!worker) {
    console.error('[caption-worker] Failed to start — check Redis at', url);
    process.exit(1);
  }

  const shutdown = async (signal) => {
    console.log(`[caption-worker] shutdown (${signal})`);
    await stopEmbeddedCaptionWorker();
    await closeRedisConnections();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('[caption-worker] fatal:', err.message);
  process.exit(1);
});
