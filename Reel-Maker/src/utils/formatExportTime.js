/** Format seconds as human-readable duration (e.g. "2m 34s", "45s"). */
export function formatDurationHuman(sec) {
  const s = Math.max(0, Math.round(Number(sec) || 0));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
  }
  return r > 0 ? `${m}m ${r}s` : `${m}m`;
}

/** Format milliseconds as human-readable duration. */
export function formatDurationMs(ms) {
  return formatDurationHuman((Number(ms) || 0) / 1000);
}
