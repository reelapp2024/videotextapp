const path = require('path');
const fs = require('fs');
const { Worker } = require('worker_threads');
const { processOneRowWithSharedRenderer } = require('./serverExportRow');
const { resolveChunkCount, buildFrameChunks } = require('./exportResourcePlanner');
const { mergeChunkedExport } = require('./exportChunkMerge');
const { exportLog } = require('./exportLogger');

const WORKER_SCRIPT = path.join(__dirname, 'exportChunkWorker.js');

function runChunkInWorker(workerData, onChunkProgress) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const worker = new Worker(WORKER_SCRIPT, { workerData });
    worker.on('message', (msg) => {
      if (msg?.type === 'progress') {
        onChunkProgress?.(msg.progress, msg.frameIndex, msg.totalFrames);
        return;
      }
      if (settled) return;
      if (msg?.ok) {
        settled = true;
        resolve(msg.result);
      } else if (msg?.ok === false) {
        settled = true;
        reject(new Error(msg?.error || 'chunk worker failed'));
      }
    });
    worker.on('error', (err) => {
      if (!settled) {
        settled = true;
        reject(err);
      }
    });
    worker.on('exit', (code) => {
      if (!settled && code !== 0) {
        settled = true;
        reject(new Error(`chunk worker exited with code ${code}`));
      }
    });
  });
}

/**
 * Export one row using parallel frame chunks when beneficial.
 * Falls back to single-pass export when chunkCount === 1.
 */
async function processRowWithChunkPipeline(rowParams) {
  const {
    outputPath,
    fps,
    config,
    w,
    h,
    exportSpeed = 1,
    onFrameProgress,
    isCancelled,
    jobId,
    rowIndex,
    ...rest
  } = rowParams;

  const duration = rowParams.durationSec
    || rowParams.outputDuration
    || Math.max(1 / fps, (rowParams.totalFrames || 0) / fps);

  const outputDuration = rowParams.outputDuration
    || Math.max(duration / Math.max(0.25, Math.min(4, Number(config?.video?.exportSpeed) || 1)), 1 / fps);

  const totalFrames = rowParams.totalFrames
    || Math.max(1, Math.ceil(outputDuration * fps));

  const chunkCount = await resolveChunkCount({
    totalFrames,
    allowChunks: String(outputPath).endsWith('.mp4'),
  });

  if (chunkCount <= 1) {
    return processOneRowWithSharedRenderer(rowParams);
  }

  const chunks = buildFrameChunks(totalFrames, chunkCount);
  const outDir = path.dirname(outputPath);
  const chunkDir = path.join(outDir, `_chunks_row_${rowIndex}`);
  fs.mkdirSync(chunkDir, { recursive: true });

  exportLog('export.chunk.start', {
    jobId,
    rowIndex,
    totalFrames,
    chunkCount: chunks.length,
  });

  const t0 = Date.now();
  const chunkPaths = chunks.map((_, i) => path.join(chunkDir, `chunk_${i}.mp4`));
  const chunkFrameCounts = chunks.map((c) => c.endFrameExclusive - c.startFrame);
  const chunkPct = new Array(chunks.length).fill(0);
  let lastReportMs = 0;

  const reportAggregatedProgress = async (force = false) => {
    if (!onFrameProgress) return;
    const now = Date.now();
    if (!force && now - lastReportMs < 400) return;
    lastReportMs = now;

    let weighted = 0;
    for (let i = 0; i < chunks.length; i++) {
      weighted += (chunkPct[i] / 100) * chunkFrameCounts[i];
    }
    const rowPct = Math.min(89, Math.round((weighted / totalFrames) * 90));
    await onFrameProgress({
      frameIndex: Math.min(totalFrames - 1, Math.round(weighted)),
      totalFrames,
      progress: rowPct,
    });
  };

  if (onFrameProgress) {
    await onFrameProgress({ frameIndex: 0, totalFrames, progress: 3 });
  }

  try {
    await Promise.all(chunks.map((range, i) => runChunkInWorker({
      rowParams: {
        ...rest,
        outputPath: chunkPaths[i],
        fps,
        w,
        h,
        config,
        rowIndex,
        jobId,
        frameRange: range,
        videoOnly: true,
      },
      range,
    }, (pct) => {
      chunkPct[i] = pct;
      reportAggregatedProgress().catch(() => {});
    })));

    for (const p of chunkPaths) {
      if (!fs.existsSync(p) || fs.statSync(p).size < 1000) {
        throw new Error(`Chunk export failed: invalid file ${p}`);
      }
    }

    await mergeChunkedExport({
      chunkPaths,
      outputPath,
      config,
      w,
      h,
      fps,
      outputDuration,
      exportSpeed: Math.max(0.25, Math.min(4, Number(config?.video?.exportSpeed) || 1)),
      videoPath: rowParams.videoPath,
      voicePath: rowParams.voicePath,
      musicPath: rowParams.musicPath,
      hasVideoAudio: rowParams.hasVideoAudio,
      videoVol: rowParams.videoVol,
      voiceVol: rowParams.voiceVol,
      musicVol: rowParams.musicVol,
    });

    if (onFrameProgress) {
      await reportAggregatedProgress(true);
      await onFrameProgress({ frameIndex: totalFrames - 1, totalFrames, progress: 90 });
    }

    exportLog('export.chunk.completed', {
      jobId,
      rowIndex,
      chunkCount: chunks.length,
      totalMs: Date.now() - t0,
    });

    return {
      exportPath: 'server-chunked',
      width: w,
      height: h,
      fps,
      totalFrames,
      durationSec: outputDuration,
      chunkCount: chunks.length,
    };
  } finally {
    try {
      if (fs.existsSync(chunkDir)) fs.rmSync(chunkDir, { recursive: true, force: true });
    } catch { /* ignore */ }
  }
}

module.exports = {
  processRowWithChunkPipeline,
};
