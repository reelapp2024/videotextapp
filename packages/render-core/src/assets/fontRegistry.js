import { FontLoadError } from '../errors/renderErrors.js';

const DEFAULT_FAMILIES = new Set([
  'Arial',
  'sans-serif',
  'Impact',
  'Roboto',
  'Helvetica',
  'Times New Roman',
]);

const FALLBACK_FAMILY = 'Arial';

/**
 * @typedef {object} FontProvider
 * @property {(families: string[]) => Promise<void>} [ensureFamilies]
 * @property {(family: string, weight?: string | number) => Promise<string | null>} [resolvePath]
 * @property {(family: string, filePath: string, weight?: string) => Promise<void>} [registerOnCanvas]
 */

/**
 * Central font registry — renderers never load fonts directly.
 */
export class FontRegistry {
  constructor() {
    /** @type {Set<string>} */
    this._registered = new Set(DEFAULT_FAMILIES);
    /** @type {Map<string, string>} */
    this._paths = new Map();
    /** @type {FontProvider | null} */
    this._provider = null;
    /** @type {Set<string>} */
    this._canvasRegistered = new Set();
  }

  /** @param {FontProvider} provider */
  setProvider(provider) {
    this._provider = provider;
  }

  /** @param {string} family */
  register(family) {
    if (family) this._registered.add(family.trim());
  }

  /**
   * @param {string} family
   * @param {string | number} [weight]
   * @param {string} filePath
   */
  registerPath(family, weight, filePath) {
    const key = this._pathKey(family, weight);
    this._paths.set(key, filePath);
    this._registered.add(family.trim());
  }

  /** @param {string} family */
  isRegistered(family) {
    return this._registered.has((family || '').trim());
  }

  /**
   * @param {string | number} weight
   * @param {number} sizePx
   * @param {string} family
   */
  buildFontCss(weight, sizePx, family) {
    const w = this._normalizeWeight(weight);
    const f = (family || FALLBACK_FAMILY).trim() || FALLBACK_FAMILY;
    return `${w} ${sizePx}px ${f}`;
  }

  /**
   * @param {string} family
   * @param {string | number} [weight]
   */
  resolveFamily(family) {
    const f = (family || '').trim();
    if (!f) return FALLBACK_FAMILY;
    if (this.isRegistered(f)) return f;
    return FALLBACK_FAMILY;
  }

  /**
   * @param {string} family
   * @param {string | number} [weight]
   */
  getPath(family, weight) {
    const key = this._pathKey(family, weight);
    if (this._paths.has(key)) return this._paths.get(key);
    const regularKey = this._pathKey(family, 'regular');
    if (this._paths.has(regularKey)) return this._paths.get(regularKey);
    return null;
  }

  /** @param {string[]} families */
  async ensureFamilies(families) {
    const unique = [...new Set(families.map((f) => String(f || '').trim()).filter(Boolean))];
    for (const f of unique) this.register(f);
    if (this._provider?.ensureFamilies) {
      await this._provider.ensureFamilies(unique);
    }
    if (this._provider?.resolvePath) {
      for (const family of unique) {
        for (const weight of ['regular', 'bold', '700']) {
          const path = await this._provider.resolvePath(family, weight);
          if (path) this.registerPath(family, weight, path);
        }
      }
    }
  }

  /**
   * Register resolved font files with the Node canvas backend.
   * @param {string[]} families
   */
  async registerOnCanvas(families) {
    const unique = [...new Set(families.map((f) => String(f || '').trim()).filter(Boolean))];
    for (const family of unique) {
      const path = this.getPath(family, 'bold') || this.getPath(family, 'regular');
      if (!path) continue;
      const regKey = `${family}:${path}`;
      if (this._canvasRegistered.has(regKey)) continue;
      if (this._provider?.registerOnCanvas) {
        await this._provider.registerOnCanvas(family, path, 'bold');
      } else {
        throw new FontLoadError(family, {
          path,
          cause: 'No FontRegistry provider configured for canvas registration',
        });
      }
      this._canvasRegistered.add(regKey);
      this._registered.add(family);
    }
  }

  _pathKey(family, weight) {
    return `${(family || '').trim()}|${this._normalizeWeight(weight)}`;
  }

  _normalizeWeight(weight) {
    if (weight === 'bold' || weight === 700 || weight === '700') return 'bold';
    if (typeof weight === 'number' && weight >= 600) return 'bold';
    return 'regular';
  }
}

let sharedFontRegistry = null;

export function getFontRegistry() {
  if (!sharedFontRegistry) sharedFontRegistry = new FontRegistry();
  return sharedFontRegistry;
}

export function resetFontRegistry() {
  sharedFontRegistry = new FontRegistry();
  return sharedFontRegistry;
}
