import { ImageLoadError, SvgLoadError } from '../errors/renderErrors.js';

/**
 * Loaded asset bundle passed into renderFrame — renderer never loads files directly.
 */
export class LoadedAssets {
  constructor() {
    /** @type {Map<string, import('./assetTypes.js').ImageAssetHandle>} */
    this.images = new Map();
    /** @type {Map<string, import('./assetTypes.js').SvgAssetHandle>} */
    this.svgs = new Map();
    /** @type {Map<string, string>} */
    this.emoji = new Map();
    /** @type {string[]} */
    this.fontFamilies = [];
    /** @type {Record<string, unknown>} */
    this.meta = {};
  }

  /** @returns {import('./assetTypes.js').AssetResolver} */
  asResolver() {
    return {
      resolveImage: (ref) => this.images.get(ref) || null,
      resolveSvg: (ref) => this.svgs.get(ref) || null,
    };
  }

  /**
   * @param {string} ref
   * @param {import('./assetTypes.js').ImageAssetHandle} handle
   */
  setImage(ref, handle) {
    this.images.set(ref, handle);
  }

  /**
   * @param {string} ref
   * @param {import('./assetTypes.js').SvgAssetHandle} handle
   */
  setSvg(ref, handle) {
    this.svgs.set(ref, handle);
  }
}

/**
 * @typedef {object} AssetLoaderBackend
 * @property {(path: string) => Promise<import('./assetTypes.js').ImageAssetHandle>} loadImage
 * @property {(pathOrMarkup: string, id: string) => Promise<import('./assetTypes.js').SvgAssetHandle>} [loadSvg]
 * @property {(families: string[]) => Promise<void>} [ensureFonts]
 */

/**
 * Hydrate a LoadedAssets bundle from declarative input + platform loader.
 * @param {import('./assetTypes.js').AssetBundleInput} input
 * @param {AssetLoaderBackend} backend
 */
export async function loadAssetBundle(input = {}, backend) {
  const bundle = new LoadedAssets();
  const t0 = performance.now?.() ?? Date.now();

  if (input.fontFamilies?.length) {
    bundle.fontFamilies = [...input.fontFamilies];
    if (backend.ensureFonts) {
      await backend.ensureFonts(bundle.fontFamilies);
    }
  }

  if (input.fontFiles) {
    const { getFontRegistry } = await import('./fontRegistry.js');
    const registry = getFontRegistry();
    for (const [key, filePath] of Object.entries(input.fontFiles)) {
      const [family, weight = 'regular'] = key.split('|');
      registry.registerPath(family, weight, filePath);
      registry.register(family);
    }
  }

  if (input.images && backend.loadImage) {
    for (const [ref, filePath] of Object.entries(input.images)) {
      try {
        const handle = await backend.loadImage(filePath);
        bundle.setImage(ref, { ...handle, path: filePath });
      } catch (err) {
        throw new ImageLoadError(ref, {
          path: filePath,
          cause: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  if (input.svgs && backend.loadSvg) {
    for (const [ref, markupOrPath] of Object.entries(input.svgs)) {
      try {
        const handle = await backend.loadSvg(markupOrPath, ref);
        bundle.setSvg(ref, handle);
        if (handle.rasterized) bundle.setImage(`svg:${ref}`, handle.rasterized);
      } catch (err) {
        throw new SvgLoadError(ref, {
          cause: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  if (input.emoji) {
    for (const [ref, char] of Object.entries(input.emoji)) {
      bundle.emoji.set(ref, char);
    }
  }

  bundle.meta.assetLoadMs = (performance.now?.() ?? Date.now()) - t0;
  return bundle;
}
