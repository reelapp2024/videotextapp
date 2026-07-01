const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  useBullExport,
  getExportQueueName,
  getRedisPrefix,
  getWorkerConcurrency,
} = require('../services/bullExportConfig');
const { phaseFromProgress, PHASE } = require('../services/exportJobRunner');

describe('bull export config (M8)', () => {
  it('USE_BULL_EXPORT defaults to true', () => {
    const prev = process.env.USE_BULL_EXPORT;
    delete process.env.USE_BULL_EXPORT;
    assert.equal(useBullExport(), true);
    process.env.USE_BULL_EXPORT = prev;
  });

  it('USE_BULL_EXPORT=false when explicitly disabled', () => {
    const prev = process.env.USE_BULL_EXPORT;
    process.env.USE_BULL_EXPORT = 'false';
    assert.equal(useBullExport(), false);
    process.env.USE_BULL_EXPORT = prev;
  });

  it('USE_BULL_EXPORT=true when env set', () => {
    const prev = process.env.USE_BULL_EXPORT;
    process.env.USE_BULL_EXPORT = 'true';
    assert.equal(useBullExport(), true);
    process.env.USE_BULL_EXPORT = prev;
  });

  it('queue name and prefix have defaults', () => {
    const prevQ = process.env.EXPORT_QUEUE_NAME;
    const prevP = process.env.REDIS_PREFIX;
    delete process.env.EXPORT_QUEUE_NAME;
    delete process.env.REDIS_PREFIX;
    assert.equal(getExportQueueName(), 'video-export');
    assert.equal(getRedisPrefix(), 'reel-maker');
    process.env.EXPORT_QUEUE_NAME = prevQ;
    process.env.REDIS_PREFIX = prevP;
  });

  it('worker concurrency is clamped 1-16', () => {
    const prev = process.env.EXPORT_WORKER_CONCURRENCY;
    process.env.EXPORT_WORKER_CONCURRENCY = '4';
    assert.equal(getWorkerConcurrency(), 4);
    process.env.EXPORT_WORKER_CONCURRENCY = '99';
    assert.equal(getWorkerConcurrency(), 16);
    process.env.EXPORT_WORKER_CONCURRENCY = prev;
  });
});

describe('export progress phases (M8)', () => {
  it('maps progress ranges to phases', () => {
    assert.equal(phaseFromProgress(0), PHASE.ASSET_LOADING);
    assert.equal(phaseFromProgress(10), PHASE.RENDERING);
    assert.equal(phaseFromProgress(75), PHASE.ENCODING);
    assert.equal(phaseFromProgress(95), PHASE.FINALIZING);
    assert.equal(phaseFromProgress(100), PHASE.COMPLETED);
  });
});
