export function mp4SortKey(name) {
  const m = String(name || '').match(/out_(\d+)\./i);
  return m ? parseInt(m[1], 10) : 0;
}

/**
 * Build per-video export slots for bulk UI.
 * Ready = backend confirmed row complete AND file listed in outputFiles (validated size).
 */
export function buildExportVideoSlots({
  total = 0,
  completed = 0,
  outputFiles = [],
  rowProgress = {},
  parallelJobs = 4,
  toUrl = (x) => x,
}) {
  const totalN = Math.max(0, Number(total) || 0);
  if (totalN === 0) return [];

  const filesByIndex = new Map();
  for (const fp of outputFiles) {
    const name = String(fp).split('/').pop() || '';
    const num = mp4SortKey(name);
    if (num > 0) {
      filesByIndex.set(num - 1, { name, url: toUrl(fp) });
    }
  }

  const parallel = Math.max(1, Number(parallelJobs) || 4);
  const slots = [];

  for (let i = 0; i < totalN; i++) {
    const file = filesByIndex.get(i);
    const name = file?.name || `out_${i + 1}.mp4`;

    // Ready only when row is fully done on server (completed count) and file is published
    if (i < completed && file?.url) {
      slots.push({
        index: i,
        name,
        status: 'ready',
        progress: 100,
        url: file.url,
      });
      continue;
    }

    const rowPct = rowProgress?.[i] ?? rowProgress?.[String(i)];
    const hasRowPct = typeof rowPct === 'number';

    if (hasRowPct) {
      slots.push({
        index: i,
        name,
        status: 'processing',
        progress: Math.min(99, Math.max(0, Math.round(rowPct))),
        url: null,
      });
      continue;
    }

    const inFlight = i >= completed && i < completed + parallel;

    if (inFlight) {
      slots.push({
        index: i,
        name,
        status: 'processing',
        progress: 0,
        url: null,
      });
    } else {
      slots.push({
        index: i,
        name,
        status: 'pending',
        progress: 0,
        url: null,
      });
    }
  }

  return slots;
}
