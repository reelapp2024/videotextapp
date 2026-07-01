export async function mergeVideosInBatchesImpl(ctx) {
  const {
    videos,
    tryBackendProcessing,
    batchSize,
    transitionId,
    setVideoMerging,
    setMergeProgress,
    setMergedResults,
    setMergeStartTime,
    setLogs,
    setMergeTimeTotal,
    setMergeTimeElapsed,
  } = ctx;

  if (videos.length === 0) {
    alert('Please add videos from the Upload tab first.');
    return;
  }
  if (batchSize < 2) {
    alert('Batch size must be at least 2.');
    return;
  }

  setVideoMerging(true);
  setMergeProgress(0);
  setMergedResults([]);
  setMergeStartTime(Date.now());
  setLogs('Queuing video merge on server…');

  const ok = await tryBackendProcessing('merge', () => {
    const fd = new FormData();
    videos.forEach((v) => fd.append('videos', v instanceof File ? v : (v.file || v)));
    fd.append('batchSize', String(batchSize));
    fd.append('transition', transitionId === 'crossfade' ? 'fade' : (transitionId || 'fade'));
    fd.append('transitionDuration', '0.5');
    return fd;
  });

  if (!ok) {
    setVideoMerging(false);
    setLogs('Server video merge failed. Ensure backend is running.');
  }
}
