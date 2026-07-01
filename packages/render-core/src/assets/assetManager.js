import { LoadedAssets } from './assetLoader.js';

/**
 * Facade for asset handles used by renderers.
 */
export class AssetManager {
  constructor() {
    /** @type {LoadedAssets | null} */
    this._bundle = null;
    /** @type {Map<string, unknown>} */
    this._cache = new Map();
  }

  /** @param {LoadedAssets} bundle */
  setBundle(bundle) {
    this._bundle = bundle;
  }

  /** @returns {import('./assetTypes.js').AssetResolver | null} */
  getResolver() {
    return this._bundle?.asResolver() ?? null;
  }

  /** @returns {LoadedAssets | null} */
  getBundle() {
    return this._bundle;
  }

  /** @param {string} key */
  get(key) {
    return this._cache.get(key);
  }

  /** @param {string} key @param {unknown} value */
  set(key, value) {
    this._cache.set(key, value);
  }

  clear() {
    this._bundle = null;
    this._cache.clear();
  }
}

let sharedAssetManager = null;

export function getAssetManager() {
  if (!sharedAssetManager) sharedAssetManager = new AssetManager();
  return sharedAssetManager;
}

export function resetAssetManager() {
  sharedAssetManager = new AssetManager();
  return sharedAssetManager;
}
