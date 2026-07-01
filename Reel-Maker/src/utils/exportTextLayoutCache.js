/**
 * Caches wrapped text lines and measureText results for preview/export drawing.
 */

export class ExportTextLayoutCache {
  constructor() {
    this._wrapCache = new Map();
    this._measureCache = new Map();
  }

  _wrapKey(text, wordsPerLine, font, maxWidth) {
    return `${font}\0${wordsPerLine}\0${maxWidth}\0${text}`;
  }

  _measureKey(text, font) {
    return `${font}\0${text}`;
  }

  wrapText(text, wordsPerLine, ctx, maxWidth, wrapFn) {
    if (!text) return [];
    const font = ctx?.font || '';
    const key = this._wrapKey(text, wordsPerLine, font, maxWidth ?? 0);
    if (this._wrapCache.has(key)) return this._wrapCache.get(key);
    const lines = wrapFn(text, wordsPerLine, ctx, maxWidth);
    this._wrapCache.set(key, lines);
    return lines;
  }

  measureWidth(ctx, text) {
    const font = ctx?.font || '';
    const key = this._measureKey(text, font);
    if (this._measureCache.has(key)) return this._measureCache.get(key);
    const width = ctx.measureText(text).width;
    this._measureCache.set(key, width);
    return width;
  }

  installOnContext(ctx) {
    const cache = this;
    const original = ctx.measureText.bind(ctx);
    const patched = function measureTextCached(text) {
      const font = ctx.font || '';
      const key = cache._measureKey(text, font);
      if (cache._measureCache.has(key)) {
        const w = cache._measureCache.get(key);
        return { width: w, actualBoundingBoxAscent: 0, actualBoundingBoxDescent: 0 };
      }
      const m = original(text);
      cache._measureCache.set(key, m.width);
      return m;
    };
    ctx.measureText = patched;
    return () => {
      ctx.measureText = original;
    };
  }

  clear() {
    this._wrapCache.clear();
    this._measureCache.clear();
  }
}
