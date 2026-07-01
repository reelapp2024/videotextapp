const path = require('path');
const { pathToFileURL } = require('url');

let overlayDepsModule = null;
let wrapTextModule = null;

/**
 * Load shared overlay draw dependencies from Reel-Maker (ESM).
 */
async function getServerOverlayDeps() {
  if (!overlayDepsModule) {
    const depsPath = path.resolve(__dirname, '../../Reel-Maker/src/overlay/overlayDrawDeps.js');
    overlayDepsModule = await import(pathToFileURL(depsPath).href);
  }
  if (!wrapTextModule) {
    const wrapPath = path.resolve(__dirname, '../../packages/render-core/src/layout/wrapText.js');
    wrapTextModule = await import(pathToFileURL(wrapPath).href);
  }

  const wrapText = (text, wordsPerLine, ctx, maxWidth, textCache) => {
    if (textCache?.wrapText) {
      return textCache.wrapText(text, wordsPerLine, ctx, maxWidth, wrapTextModule.wrapText);
    }
    return wrapTextModule.wrapText(text, wordsPerLine, ctx, maxWidth);
  };

  return overlayDepsModule.createOverlayDrawDeps({ wrapText });
}

module.exports = {
  getServerOverlayDeps,
};
