/**
 * Guarantees that every font used by the overlays (and logo) is fully loaded
 * before we draw to an export canvas.
 *
 * Why this matters: the HTML canvas silently falls back to a default font when
 * the requested font face is not yet loaded. The live preview redraws on an
 * animation loop, so fonts finish loading and the preview ends up correct — but
 * an export renders all frames immediately and can capture the fallback font,
 * producing different metrics (wrapping, width, position) and a different look
 * than the preview. Awaiting the fonts here keeps export == preview.
 */

const PRELOAD_WEIGHTS = ['400', '700', 'normal', 'bold']

function collectFamilies(cfg) {
  const families = new Set()
  const overlays = Array.isArray(cfg?.overlays) ? cfg.overlays : []
  for (const ov of overlays) {
    if (!ov || ov.enabled === false) continue
    const fam = String(ov.fontFamily ?? '').trim()
    if (fam) families.add(fam)
  }
  const logoFam = String(cfg?.logo?.fontFamily ?? '').trim()
  if (logoFam) families.add(logoFam)
  return families
}

/**
 * @param {object} cfg draw config (expects cfg.overlays[].fontFamily / fontWeight)
 * @returns {Promise<void>} resolves once the fonts are loaded (or skipped/failed safely)
 */
export async function ensureOverlayFontsReady(cfg) {
  if (typeof document === 'undefined' || !document.fonts || !document.fonts.load) return
  const families = collectFamilies(cfg)
  if (!families.size) return

  const jobs = []
  for (const fam of families) {
    for (const weight of PRELOAD_WEIGHTS) {
      // Size is irrelevant for which font file loads; any valid spec triggers the load.
      try {
        jobs.push(document.fonts.load(`${weight} 64px ${fam}`))
      } catch {
        /* invalid font shorthand — ignore this spec */
      }
    }
  }

  try {
    await Promise.all(jobs)
  } catch {
    /* a single font failing to load must not block the export */
  }
  try {
    await document.fonts.ready
  } catch {
    /* ignore */
  }
}

export default ensureOverlayFontsReady
