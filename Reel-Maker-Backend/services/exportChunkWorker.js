const { parentPort, workerData } = require('worker_threads');
const { processOneRowWithSharedRenderer } = require('./serverExportRow');

(async () => {
  try {
    const { rowParams } = workerData;
    const result = await processOneRowWithSharedRenderer({
      ...rowParams,
      isCancelled: null,
      onFrameProgress: async (p) => {
        parentPort.postMessage({
          type: 'progress',
          progress: p.progress,
          frameIndex: p.frameIndex,
          totalFrames: p.totalFrames,
        });
      },
    });
    parentPort.postMessage({ ok: true, result });
  } catch (err) {
    parentPort.postMessage({ ok: false, error: err?.message || String(err) });
  }
})();
