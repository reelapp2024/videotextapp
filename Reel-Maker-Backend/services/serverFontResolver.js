const path = require('path');
const fs = require('fs');
const fontManager = require('./fontManager');

/**
 * Resolve bundled font file path for a family + weight.
 * @param {string} family
 * @param {string | number} [weight]
 * @returns {string | null}
 */
function resolveFontFilePath(family, weight = 'regular') {
  const name = String(family || '').trim();
  if (!name) return null;
  if (fontManager.isSystemFont(name)) return null;

  const manifest = fontManager.loadManifest();
  const entry = manifest[name];
  if (!entry?.files?.length) return null;

  const fontsDir = fontManager.getFontsDirectory();
  const isBold = weight === 'bold' || weight === 700 || weight === '700'
    || (typeof weight === 'number' && weight >= 600);

  const file = entry.files.find((f) => (isBold ? /bold/i.test(f) : /regular/i.test(f)))
    || entry.files[0];
  const full = path.join(fontsDir, file);
  return fs.existsSync(full) ? full : null;
}

/**
 * Font provider for @reel-maker/render-core FontRegistry (M5).
 */
function createServerFontProvider() {
  return {
    async ensureFamilies(families) {
      await fontManager.ensureFontFamilies(families);
    },
    async resolvePath(family, weight) {
      return resolveFontFilePath(family, weight);
    },
    async registerOnCanvas(family, filePath) {
      const { GlobalFonts } = await import('@napi-rs/canvas');
      GlobalFonts.registerFromPath(filePath, family);
    },
  };
}

module.exports = {
  resolveFontFilePath,
  createServerFontProvider,
};
