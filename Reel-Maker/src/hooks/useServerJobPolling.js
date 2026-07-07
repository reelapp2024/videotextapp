import { useEffect, useRef } from 'react';
import { buildExportVideoSlots } from '../utils/exportVideoSlots';
import { formatDurationMs } from '../utils/formatExportTime';

function ttsSortKey(name) {
  const m = String(name || '').match(/tts_(\d+)\.mp3/i);
  return m ? parseInt(m[1], 10) : 0;
}

function mp4SortKey(name) {
  const m = String(name || '').match(/out_(\d+)\.mp4/i);
  return m ? parseInt(m[1], 10) : 0;
}

function fileToAudioEntry(fp, i, toUrl) {
  const name = fp.split('/').pop() || `tts_${i + 1}.mp3`;
  const num = ttsSortKey(name);
  return {
    id: num || i + 1,
    name,
    url: toUrl(fp),
    text: `Audio ${num || i + 1}`,
    durationSec: 0,
  };
}

function fileToVideoEntry(fp, toUrl) {
  const name = fp.split('/').pop() || 'video.mp4';
  return {
    id: `vid-${name}`,
    name,
    url: toUrl(fp),
    sortKey: mp4SortKey(name),
  };
}

function loadAudioDuration(entry) {
  return new Promise((resolve) => {
    const el = document.createElement('audio');
    el.preload = 'metadata';
    el.onloadedmetadata = () => {
      resolve({
        ...entry,
        durationSec: Number.isFinite(el.duration) ? el.duration : 0,
      });
    };
    el.onerror = () => resolve(entry);
    el.src = entry.url;
  });
}

function formatEta(ms) {
  if (!ms || ms < 0 || !Number.isFinite(ms)) return '--:--';
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  const hours = Math.floor(ms / 1000 / 3600);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function useServerJobPolling(params) {
  const {
    api,
    serverJobId,
    serverJobType,
    setServerProgress,
    setServerProcessing,
    setServerJobId,
    setGeneratedAudios,
    setProcessedVideos,
    setFinished,
    setLogs,
    setEstimatedTime,
    setServerJobMeta,
  } = params;

  const knownTtsFilesRef = useRef(new Set());
  const knownVideoFilesRef = useRef(new Set());
  const jobStartRef = useRef(0);
  const lastPollSigRef = useRef('');

  useEffect(() => {
    knownTtsFilesRef.current = new Set();
    knownVideoFilesRef.current = new Set();
    jobStartRef.current = Date.now();
    lastPollSigRef.current = '';
    setEstimatedTime?.(null);
  }, [serverJobId, setEstimatedTime]);

  useEffect(() => {
    if (!serverJobId) return;

    const mediaBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    const toUrl = (fp) => {
      if (fp == null || fp === '') return '';
      const s = String(fp);
      if (s.startsWith('http')) return s;
      const p = s.startsWith('/') ? s : `/${s}`;
      return mediaBase ? `${mediaBase}${p}` : p;
    };

    const updateEta = (progress) => {
      if (!setEstimatedTime || !progress || progress <= 0 || progress >= 100) {
        setEstimatedTime?.(null);
        return;
      }
      const elapsed = Date.now() - jobStartRef.current;
      const remaining = (elapsed / progress) * (100 - progress);
      setEstimatedTime(formatEta(remaining));
    };

    const mergeTtsOutputs = async (outputFiles, { zipUrl, totalItems, isDone }) => {
      const mp3Files = (outputFiles || []).filter((f) => /\.mp3$/i.test(String(f)));
      const fresh = mp3Files.filter((f) => !knownTtsFilesRef.current.has(f));
      if (fresh.length === 0 && !isDone) return;

      for (const f of fresh) knownTtsFilesRef.current.add(f);

      const newEntries = await Promise.all(
        fresh.map((fp, i) => loadAudioDuration(fileToAudioEntry(fp, i, toUrl)))
      );

      if (newEntries.length > 0) {
        setGeneratedAudios((prev) => {
          const byUrl = new Map(prev.map((a) => [a.url, a]));
          for (const e of newEntries) byUrl.set(e.url, e);
          return [...byUrl.values()].sort((a, b) => a.id - b.id);
        });
      }

      const count = knownTtsFilesRef.current.size;
      const total = totalItems || mp3Files.length || count;
      if (isDone) {
        setGeneratedAudios((prev) =>
          prev.map((a) => (zipUrl ? { ...a, zipUrl } : a))
        );
        setLogs(`Done! ${count} audio(s) ready. Play, download, or add to library.`);
      } else if (newEntries.length > 0) {
        setLogs(`TTS: ${count}/${total} audio(s) ready — more generating…`);
      }
    };

    const mergeVideoOutputs = (outputFiles, { totalItems, completedItems, rowProgress, parallelJobs, isDone, elapsedMs, exportDurationMs }) => {
      const mp4Files = (outputFiles || []).filter((f) => /\.mp4$/i.test(String(f)));
      const fresh = mp4Files.filter((f) => !knownVideoFilesRef.current.has(f));

      for (const f of fresh) knownVideoFilesRef.current.add(f);

      const newEntries = fresh
        .map((fp) => fileToVideoEntry(fp, toUrl))
        .sort((a, b) => a.sortKey - b.sortKey);

      if (newEntries.length > 0) {
        setProcessedVideos((prev) => {
          const byUrl = new Map(prev.map((v) => [v.url, v]));
          for (const e of newEntries) byUrl.set(e.url, e);
          return [...byUrl.values()].sort((a, b) => (a.sortKey ?? 0) - (b.sortKey ?? 0));
        });
      }

      const count = knownVideoFilesRef.current.size;
      const total = totalItems || mp4Files.length || count;
      const completed = completedItems ?? count;
      const slots = buildExportVideoSlots({
        total,
        completed,
        outputFiles: mp4Files,
        rowProgress: rowProgress || {},
        parallelJobs: parallelJobs ?? 4,
        toUrl,
      });
      setServerJobMeta?.((prev) => ({
        ...prev,
        total,
        completed,
        slots,
        parallelJobs: parallelJobs ?? 4,
        ...(elapsedMs != null ? { elapsedMs } : {}),
        ...(exportDurationMs != null ? { exportDurationMs } : {}),
      }));

      if (isDone) {
        const durLabel = exportDurationMs != null ? formatDurationMs(exportDurationMs) : null;
        setLogs(
          durLabel
            ? `Done! ${count} video(s) exported in ${durLabel} — download from right panel.`
            : `Done! ${count} video(s) ready — download from right panel.`,
        );
      } else if (newEntries.length > 0) {
        setLogs(`Video ${count}/${total} ready — others still processing…`);
      }
      return newEntries.length;
    };

    const isVideoJob = serverJobType === 'video' || serverJobType === 'slideshow';
    const pollMs = serverJobType === 'tts' ? 1000 : isVideoJob ? 800 : 2000;

    const tick = async () => {
      try {
        const d = await api.getVideoJobStatus(serverJobId);
        const progress = d.progress || 0;
        const sig = `${d.status}|${progress}|${d.completedItems ?? ''}|${d.totalItems ?? ''}|${(d.outputFiles || []).length}|${JSON.stringify(d.rowProgress || {})}`;
        if (sig !== lastPollSigRef.current) {
          lastPollSigRef.current = sig;
          setServerProgress(progress);
          updateEta(progress);
        }

        if (d.type === 'tts' && d.status === 'processing') {
          await mergeTtsOutputs(d.outputFiles, {
            totalItems: d.totalItems,
            isDone: false,
          });
        }

        if (isVideoJob && (d.status === 'processing' || d.status === 'queued')) {
          const elapsedMs = Date.now() - jobStartRef.current;
          mergeVideoOutputs(d.outputFiles, {
            totalItems: d.totalItems,
            completedItems: d.completedItems,
            rowProgress: d.rowProgress,
            parallelJobs: d.parallelJobs,
            elapsedMs,
            exportDurationMs: d.exportDurationMs ?? undefined,
            isDone: false,
          });
          const total = d.totalItems || 0;
          const completed = d.completedItems ?? 0;
          const parallel = d.parallelJobs ?? 4;
          if (total > 1) {
            const inFlight = Math.min(parallel, Math.max(0, total - completed));
            setLogs(
              `Exporting ${inFlight} video(s) in parallel — ${completed}/${total} done — ${progress}% overall`,
            );
          } else if (total === 1 && progress > 0 && progress < 100) {
            setLogs(`Exporting video — ${progress}%`);
          }
        }

        if (d.status === 'done') {
          lastPollSigRef.current = '';
          setServerProcessing(false);
          setEstimatedTime?.(null);

          if (d.type === 'tts' && (d.outputFiles?.length > 0 || d.resultUrl)) {
            await mergeTtsOutputs(d.outputFiles || [], {
              zipUrl: d.resultUrl ? toUrl(d.resultUrl) : undefined,
              totalItems: d.totalItems,
              isDone: true,
            });
            setFinished(true);
          } else if (d.type === 'image' && (d.outputFiles?.length > 0 || d.resultUrl)) {
            const imgs = (d.outputFiles || []).map((fp, i) => ({
              id: 'img-' + Date.now() + '-' + i,
              name: fp.split('/').pop() || `image_${i + 1}.png`,
              url: toUrl(fp),
            }));
            const list = [];
            if (d.resultUrl) {
              list.push({ id: 'zip-' + Date.now(), name: 'images.zip', url: toUrl(d.resultUrl) });
            }
            setProcessedVideos((prev) => [...list, ...imgs, ...prev]);
            setFinished(true);
            setLogs(`Done! ${imgs.length} images generated.${d.resultUrl ? ' Download "images.zip" for bulk.' : ''}`);
          } else if (isVideoJob) {
            const finalDurationMs = d.exportDurationMs ?? (Date.now() - jobStartRef.current);
            const outCount = mergeVideoOutputs(d.outputFiles || (d.resultUrl ? [d.resultUrl] : []), {
              totalItems: d.totalItems,
              completedItems: d.completedItems,
              rowProgress: d.rowProgress,
              parallelJobs: d.parallelJobs,
              exportDurationMs: finalDurationMs,
              elapsedMs: finalDurationMs,
              isDone: true,
            });
            if (d.outputFiles?.length > 0 || d.resultUrl) {
              setFinished(true);
            } else {
              setFinished(false);
              setLogs('Export failed: server finished but produced no video file.');
            }
          } else {
            setFinished(true);
          }
          setServerJobId(null);
          knownTtsFilesRef.current = new Set();
          knownVideoFilesRef.current = new Set();
        } else if (d.status === 'cancelled') {
          lastPollSigRef.current = '';
          setServerProcessing(false);
          setEstimatedTime?.(null);
          setServerJobId(null);
          knownTtsFilesRef.current = new Set();
          knownVideoFilesRef.current = new Set();
          setLogs('Video generation stopped.');
        } else if (d.status === 'error') {
          lastPollSigRef.current = '';
          setServerProcessing(false);
          setEstimatedTime?.(null);
          setServerJobId(null);
          setFinished(false);
          knownTtsFilesRef.current = new Set();
          knownVideoFilesRef.current = new Set();
          setLogs(`Export failed: ${d.error || 'server error'}`);
        }
      } catch (err) {
        setLogs(`Status check: ${err?.message || err}`);
      }
    };

    tick();
    const t = setInterval(tick, pollMs);
    return () => clearInterval(t);
  }, [
    api,
    serverJobId,
    serverJobType,
    setEstimatedTime,
    setFinished,
    setGeneratedAudios,
    setLogs,
    setProcessedVideos,
    setServerJobId,
    setServerJobMeta,
    setServerProcessing,
    setServerProgress,
  ]);
}
