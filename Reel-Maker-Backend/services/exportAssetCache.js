const path = require('path');
const fs = require('fs');

/**
 * Worker-scoped asset caches (M9) — fonts via FontRegistry, images/SVG here.
 */
class ExportAssetCache {
  constructor(opts = {}) {
    this.maxImages = opts.maxImages ?? 64;
    this.maxSvgs = opts.maxSvgs ?? 32;
    /** @type {Map<string, { image: unknown, width: number, height: number }>} */
    this._images = new Map();
    /** @type {Map<string, unknown>} */
    this._svgs = new Map();
    /** @type {Map<string, CanvasGradient>} */
    this._gradients = new Map();
    this.stats = {
      imageHits: 0,
      imageMisses: 0,
      svgHits: 0,
      svgMisses: 0,
      gradientHits: 0,
      gradientMisses: 0,
    };
  }

  _evictOldest(map, max) {
    if (map.size < max) return;
    const first = map.keys().next().value;
    map.delete(first);
  }

  /**
   * @param {string} filePath
   * @param {() => Promise<unknown>} loader
   */
  async loadImage(filePath, loader) {
    if (!filePath) return null;
    const key = path.resolve(filePath);
    if (this._images.has(key)) {
      this.stats.imageHits += 1;
      return this._images.get(key).image;
    }
    if (!fs.existsSync(key)) return null;
    this.stats.imageMisses += 1;
    const image = await loader(key);
    this._evictOldest(this._images, this.maxImages);
    const w = image?.width || image?.naturalWidth || 0;
    const h = image?.height || image?.naturalHeight || 0;
    this._images.set(key, { image, width: w, height: h });
    return image;
  }

  /**
   * Cache parsed SVG raster or markup key.
   * @param {string} cacheKey
   * @param {() => Promise<unknown>} loader
   */
  async loadSvg(cacheKey, loader) {
    if (!cacheKey) return null;
    if (this._svgs.has(cacheKey)) {
      this.stats.svgHits += 1;
      return this._svgs.get(cacheKey);
    }
    this.stats.svgMisses += 1;
    const val = await loader();
    this._evictOldest(this._svgs, this.maxSvgs);
    this._svgs.set(cacheKey, val);
    return val;
  }

  /**
   * @param {string} key
   * @param {() => CanvasGradient} factory
   */
  getGradient(key, factory) {
    if (this._gradients.has(key)) {
      this.stats.gradientHits += 1;
      return this._gradients.get(key);
    }
    this.stats.gradientMisses += 1;
    const g = factory();
    this._evictOldest(this._gradients, 128);
    this._gradients.set(key, g);
    return g;
  }

  /** Snapshot counters at job start for per-export cache metrics. */
  startJobStats() {
    this._jobStatsStart = { ...this.stats };
  }

  getJobCacheStats() {
    const start = this._jobStatsStart || {
      imageHits: 0,
      imageMisses: 0,
      svgHits: 0,
      svgMisses: 0,
      gradientHits: 0,
      gradientMisses: 0,
    };
    const imageHits = this.stats.imageHits - start.imageHits;
    const imageMisses = this.stats.imageMisses - start.imageMisses;
    const svgHits = this.stats.svgHits - start.svgHits;
    const svgMisses = this.stats.svgMisses - start.svgMisses;
    const gradientHits = this.stats.gradientHits - start.gradientHits;
    const gradientMisses = this.stats.gradientMisses - start.gradientMisses;
    const hits = imageHits + svgHits + gradientHits;
    const misses = imageMisses + svgMisses + gradientMisses;
    const total = hits + misses;
    return {
      imageHits,
      imageMisses,
      svgHits,
      svgMisses,
      gradientHits,
      gradientMisses,
      hitRatio: total > 0 ? hits / total : null,
      note: total === 0
        ? 'no asset cache operations during export (images loaded once at job start are misses by design)'
        : undefined,
    };
  }

  get cacheHitRatio() {
    const hits = this.stats.imageHits + this.stats.svgHits + this.stats.gradientHits;
    const total = hits + this.stats.imageMisses + this.stats.svgMisses + this.stats.gradientMisses;
    return total > 0 ? hits / total : 0;
  }

  /** Per-job: clear gradient cache (ctx-bound); keep images across jobs in worker. */
  clearPerJob() {
    this._gradients.clear();
  }

  clearAll() {
    this._images.clear();
    this._svgs.clear();
    this._gradients.clear();
    this.stats = {
      imageHits: 0,
      imageMisses: 0,
      svgHits: 0,
      svgMisses: 0,
      gradientHits: 0,
      gradientMisses: 0,
    };
  }
}

/** Singleton per worker process — isolated per Node process. */
const workerAssetCache = new ExportAssetCache();

module.exports = {
  ExportAssetCache,
  getWorkerAssetCache: () => workerAssetCache,
};
