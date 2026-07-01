const path = require('path');
const fs = require('fs');
const { createServerFontProvider } = require('./serverFontResolver');

const BACKEND_ROOT = path.resolve(__dirname, '..');
const UPLOADS_ROOT = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.join(BACKEND_ROOT, 'uploads');

/**
 * @param {string} p
 */
function resolveUploadPath(p) {
  if (!p) return null;
  if (path.isAbsolute(p) && fs.existsSync(p)) return p;
  if (p.startsWith('/uploads/')) {
    const rel = p.replace(/^\/uploads\//, '');
    const full = path.join(UPLOADS_ROOT, rel);
    return fs.existsSync(full) ? full : null;
  }
  const full = path.join(UPLOADS_ROOT, p);
  return fs.existsSync(full) ? full : null;
}

/**
 * Platform asset loader backend for render-core (M5).
 */
function createServerAssetLoader() {
  const fontProvider = createServerFontProvider();

  return {
    fontProvider,
    async loadImage(filePath) {
      const resolved = resolveUploadPath(filePath) || (fs.existsSync(filePath) ? filePath : null);
      if (!resolved) {
        throw new Error(`Image not found: ${filePath}`);
      }
      const { loadImage } = await import('@napi-rs/canvas');
      const img = await loadImage(resolved);
      return {
        source: img,
        width: img.width,
        height: img.height,
        path: resolved,
      };
    },
    async loadSvg(markupOrPath, id) {
      let markup = markupOrPath;
      const resolved = resolveUploadPath(markupOrPath);
      if (resolved && fs.existsSync(resolved)) {
        markup = fs.readFileSync(resolved, 'utf-8');
      }
      if (!markup || !markup.includes('<svg')) {
        throw new Error(`Invalid SVG for ${id}`);
      }
      const { loadImage } = await import('@napi-rs/canvas');
      const dataUrl = `data:image/svg+xml;base64,${Buffer.from(markup).toString('base64')}`;
      const img = await loadImage(dataUrl);
      return {
        id,
        markup,
        rasterized: {
          source: img,
          width: img.width,
          height: img.height,
        },
      };
    },
    async ensureFonts(families) {
      await fontProvider.ensureFamilies(families);
    },
  };
}

module.exports = {
  createServerAssetLoader,
  resolveUploadPath,
  UPLOADS_ROOT,
};
