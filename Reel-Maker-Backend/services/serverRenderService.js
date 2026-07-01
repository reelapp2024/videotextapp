const path = require('path');
const { pathToFileURL } = require('url');
const { createServerAssetLoader } = require('./serverAssetLoader');
const { createServerFontProvider } = require('./serverFontResolver');
const { getServerOverlayDeps } = require('./serverOverlayDeps');

let renderCoreModule = null;
let globalAssetLoader = null;
let globalOverlayDeps = null;
let isFontProviderSet = false;

async function getRenderCore() {
  if (!renderCoreModule) {
    const pkgPath = path.resolve(__dirname, '../../packages/render-core/src/index.node.js');
    renderCoreModule = await import(pathToFileURL(pkgPath).href);
  }
  return renderCoreModule;
}

/**
 * Render a single RGBA frame on the server (M6 — drawOverlaysCore parity path).
 * @param {object} params
 */
async function renderServerFrame(params) {
  const renderCore = await getRenderCore();
  
  // OPTIMIZATION: Cache loader and configuration structures out of per-frame allocation loops
  if (!globalAssetLoader) {
    globalAssetLoader = createServerAssetLoader();
  }
  if (!globalOverlayDeps) {
    globalOverlayDeps = await getServerOverlayDeps();
  }

  const loader = params.assetLoader || globalAssetLoader;
  const overlayDeps = params.overlayDeps || globalOverlayDeps;

  if (!isFontProviderSet) {
    const fontRegistry = renderCore.getFontRegistry();
    fontRegistry.setProvider(createServerFontProvider());
    isFontProviderSet = true;
  }

  const overlays = params.config?.overlays || [];
  const fontFamilies = [...new Set(
    overlays.map((o) => o?.fontFamily).filter(Boolean).concat(['Arial']),
  )];

  const assetInput = {
    fontFamilies,
    ...(params.assets || {}),
  };

  const result = await renderCore.renderFrame({
    width: params.width,
    height: params.height,
    videoTime: params.videoTime ?? 0,
    duration: params.duration ?? 10,
    config: params.config || {},
    data: params.data,
    assets: assetInput,
    assetLoader: loader,
    platform: 'node',
    renderMode: 'overlays',
    overlayDeps,
    logo: params.logo || params.config?.logo || null,
  });

  return result;
}

/**
 * Render frame and return PNG buffer for comparison / inspection.
 * @param {object} params
 */
async function renderServerFramePng(params) {
  const { createNodeCanvas, disposeNodeCanvas } = await getRenderCore();
  const frame = await renderServerFrame(params);
  const { canvas, ctx } = await createNodeCanvas(frame.width, frame.height);
  const imageData = ctx.createImageData(frame.width, frame.height);
  imageData.data.set(frame.rgba);
  ctx.putImageData(imageData, 0, 0);
  const png = canvas.toBuffer('image/png');
  disposeNodeCanvas({ canvas });
  return { png, metrics: frame.metrics, width: frame.width, height: frame.height };
}

module.exports = {
  renderServerFrame,
  renderServerFramePng,
  getRenderCore,
};