/**
 * Text layout cache for server export — mirrors Reel-Maker ExportTextLayoutCache (M9).
 */
class ExportTextLayoutCache {
  constructor(maxEntries = 8000) {
    this._wrapCache = new Map();
    this._measureCache = new Map();
    this._maxEntries = maxEntries;
    this.hits = 0;
    this.misses = 0;
  }

  _wrapKey(text, wordsPerLine, font, maxWidth) {
    return `${font}\0${wordsPerLine}\0${maxWidth ?? 0}\0${text}`;
  }

  _measureKey(text, font) {
    return `${font}\0${text}`;
  }

  _touch(map, key, value) {
    if (map.size >= this._maxEntries) {
      const first = map.keys().next().value;
      map.delete(first);
    }
    map.set(key, value);
  }

  wrapText(text, wordsPerLine, ctx, maxWidth, wrapFn) {
    if (!text) return [];
    const font = ctx?.font || '';
    const key = this._wrapKey(text, wordsPerLine, font, maxWidth ?? 0);
    if (this._wrapCache.has(key)) {
      this.hits += 1;
      return this._wrapCache.get(key);
    }
    this.misses += 1;
    const lines = wrapFn(text, wordsPerLine, ctx, maxWidth);
    this._touch(this._wrapCache, key, lines);
    return lines;
  }

  installOnContext(ctx) {
    const cache = this;
    const original = ctx.measureText.bind(ctx);
    ctx.measureText = function measureTextCached(text) {
      const font = ctx.font || '';
      const key = cache._measureKey(text, font);
      if (cache._measureCache.has(key)) {
        cache.hits += 1;
        const w = cache._measureCache.get(key);
        return { width: w, actualBoundingBoxAscent: 0, actualBoundingBoxDescent: 0 };
      }
      cache.misses += 1;
      const m = original(text);
      cache._touch(cache._measureCache, key, m.width);
      return m;
    };
    return () => {
      ctx.measureText = original;
    };
  }

  get hitRatio() {
    const total = this.hits + this.misses;
    return total > 0 ? this.hits / total : 0;
  }

  clear() {
    this._wrapCache.clear();
    this._measureCache.clear();
    this.hits = 0;
    this.misses = 0;
  }
}

module.exports = { ExportTextLayoutCache };
