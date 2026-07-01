/**
 * Export renderer mode (M7/M10).
 * server — shared render-core RGBA → FFmpeg stdin (default)
 * legacy — removed in M10; maps to server with deprecation warning
 */
function resolveExportRenderer() {
  const raw = String(process.env.EXPORT_RENDERER || 'server').trim().toLowerCase();
  if (raw === 'legacy') {
    console.warn('[export] EXPORT_RENDERER=legacy is deprecated (M10). Using shared server renderer.');
    return 'server';
  }
  if (raw === 'server' || raw === 'shared' || raw === 'render-core') return 'server';
  return 'server';
}

function isServerSharedRenderer() {
  return resolveExportRenderer() === 'server';
}

module.exports = {
  resolveExportRenderer,
  isServerSharedRenderer,
};
