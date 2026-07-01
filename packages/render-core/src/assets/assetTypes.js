/**
 * @typedef {object} ImageAssetHandle
 * @property {unknown} source — CanvasImageSource (browser Image / node canvas Image)
 * @property {number} [width]
 * @property {number} [height]
 * @property {string} [path]
 */

/**
 * @typedef {object} FontAssetHandle
 * @property {string} family
 * @property {string} [weight]
 * @property {string} filePath
 */

/**
 * @typedef {object} SvgAssetHandle
 * @property {string} id
 * @property {string} markup
 * @property {ImageAssetHandle} [rasterized]
 */

/**
 * @typedef {object} AssetResolver
 * @property {(ref: string) => ImageAssetHandle | null} resolveImage
 * @property {(ref: string) => SvgAssetHandle | null} [resolveSvg]
 * @property {(family: string, weight?: string) => FontAssetHandle | null} [resolveFont]
 */

/**
 * @typedef {object} AssetBundleInput
 * @property {Record<string, string>} [images] — key → filesystem or URL path
 * @property {string[]} [fontFamilies]
 * @property {Record<string, string>} [fontFiles] — `${family}|${weight}` → path
 * @property {Record<string, string>} [svgs] — key → SVG markup or path
 * @property {Record<string, string>} [emoji] — key → emoji char (rendered as text)
 */

export {};
