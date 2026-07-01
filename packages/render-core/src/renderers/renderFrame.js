import { createBrowserCanvasAdapter } from '../adapters/browserCanvasAdapter.js';
import {
  createNodeCanvas,
  createNodeCanvasAdapter,
  disposeNodeCanvas,
} from '../adapters/nodeCanvasAdapter.js';
import { loadAssetBundle, LoadedAssets } from '../assets/assetLoader.js';
import { getAssetManager } from '../assets/assetManager.js';
import { getFontRegistry } from '../assets/fontRegistry.js';
import { SceneValidationRenderError } from '../errors/renderErrors.js';
import { renderLogger } from '../logging/logger.js';
import { createRenderContext, RENDERER_VERSION } from '../types/renderContext.js';
import { validateScene } from '../validation/sceneValidator.js';
import { buildFrameScene } from './frameBuilder.js';
import { scheduleFrame } from '../schedule/frameScheduler.js';
import { drawScene } from '../adapters/canvasSceneDrawer.js';
import { drawOverlaysCore } from '../overlay/drawOverlaysCore.js';
import { drawLogoCore } from '../overlay/drawLogoCore.js';
import { drawBackgroundCore } from '../overlay/drawBackgroundCore.js';

function nowMs() {
  return typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
}

function memorySnapshot() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const m = process.memoryUsage();
    return { rss: m.rss, heapUsed: m.heapUsed, heapTotal: m.heapTotal, external: m.external };
  }
  return null;
}

/**
 * @typedef {'node' | 'browser'} RenderPlatform
 */

/**
 * @typedef {object} RenderFrameOptions
 * @property {number} width
 * @property {number} height
 * @property {number} [videoTime]
 * @property {number} [duration]
 * @property {object} config — timeline-like config subset
 * @property {string[]} [data] — row text data
 * @property {import('../assets/assetTypes.js').AssetBundleInput | LoadedAssets} [assets]
 * @property {import('../assets/assetLoader.js').AssetLoaderBackend} [assetLoader]
 * @property {RenderPlatform} [platform]
 * @property {CanvasRenderingContext2D} [canvasCtx] — required for browser platform
 * @property {import('../types/sceneGraph.js').SceneNode} [scene] — prebuilt scene (skips buildFrameScene)
 * @property {boolean} [strictValidation]
 * @property {'scene' | 'overlays'} [renderMode] — overlays uses drawOverlaysCore (M6)
 * @property {object} [overlayDeps] — required when renderMode is 'overlays'
 * @property {object} [logo] — optional logo state for overlay mode
 */

/**
 * Render a single frame to RGBA pixels.
 * @param {RenderFrameOptions} options
 * @returns {Promise<{ rgba: Uint8ClampedArray, width: number, height: number, metrics: object }>}
 */
export async function renderFrame(options) {
  const {
    width,
    height,
    videoTime = 0,
    duration = 10,
    config = {},
    data,
    platform = 'node',
    canvasCtx = null,
    scene: presetScene = null,
    strictValidation = true,
    renderMode = null,
    overlayDeps = null,
    logo = null,
  } = options;

  const effectiveMode = renderMode ?? (overlayDeps ? 'overlays' : 'scene');

  const frameT0 = nowMs();
  const metrics = {
    rendererVersion: RENDERER_VERSION,
    platform,
    width,
    height,
    videoTime,
    memoryBefore: memorySnapshot(),
  };

  // --- Asset loading ---
  const assetT0 = nowMs();
  let bundle;
  if (options.assets instanceof LoadedAssets) {
    bundle = options.assets;
  } else if (options.assets && options.assetLoader) {
    bundle = await loadAssetBundle(options.assets, options.assetLoader);
  } else {
    bundle = new LoadedAssets();
    const families = collectFontFamilies(config);
    bundle.fontFamilies = families;
  }
  metrics.assetLoadMs = bundle.meta?.assetLoadMs ?? nowMs() - assetT0;

  const fontRegistry = getFontRegistry();
  if (bundle.fontFamilies.length) {
    await fontRegistry.ensureFamilies(bundle.fontFamilies);
  }

  const assetManager = getAssetManager();
  assetManager.setBundle(bundle);
  const resolver = bundle.asResolver();

  // --- Canvas allocation ---
  const canvasT0 = nowMs();
  let canvas = null;
  let ctx = canvasCtx;

  if (platform === 'node') {
    const created = await createNodeCanvas(width, height);
    canvas = created.canvas;
    ctx = created.ctx;
    metrics.canvasAllocationMs = nowMs() - canvasT0;
    await fontRegistry.registerOnCanvas(bundle.fontFamilies.length ? bundle.fontFamilies : collectFontFamilies(config));
  } else if (!ctx) {
    throw new Error('renderFrame: browser platform requires canvasCtx');
  } else {
    metrics.canvasAllocationMs = 0;
  }

  // --- Scene build / overlay imperative draw ---
  const buildT0 = nowMs();

  if (effectiveMode === 'overlays') {
    if (!overlayDeps) {
      throw new Error('renderFrame: overlay mode requires overlayDeps');
    }

    drawBackgroundCore(ctx, width, height, config.background);
    const rowInput = data ?? config._rowData ?? [''];
    drawOverlaysCore(ctx, width, height, rowInput, videoTime, duration, config, overlayDeps);
    if (logo?.enabled && logo?.image) {
      drawLogoCore(ctx, width, height, logo);
    }

    metrics.sceneBuildMs = nowMs() - buildT0;
    metrics.renderMode = 'overlays';

    const drawT0 = nowMs();
    metrics.drawMs = nowMs() - drawT0;

    const imageData = ctx.getImageData(0, 0, width, height);
    const rgba = new Uint8ClampedArray(imageData.data);

    metrics.totalFrameRenderMs = nowMs() - frameT0;
    metrics.memoryAfter = memorySnapshot();
    if (metrics.memoryBefore && metrics.memoryAfter) {
      metrics.memoryDeltaBytes = metrics.memoryAfter.heapUsed - metrics.memoryBefore.heapUsed;
    }

    renderLogger.rendererCompleted({
      sceneBuildMs: metrics.sceneBuildMs,
      drawMs: metrics.drawMs,
      assetLoadMs: metrics.assetLoadMs,
      canvasAllocationMs: metrics.canvasAllocationMs,
      totalFrameRenderMs: metrics.totalFrameRenderMs,
      rendererVersion: RENDERER_VERSION,
      memoryAfter: metrics.memoryAfter,
      renderMode: 'overlays',
    });

    disposeNodeCanvas({ canvas });
    return { rgba, width, height, metrics };
  }

  const scene = presetScene ?? buildFrameScene({
    config,
    width,
    height,
    videoTime,
    duration,
    measureCtx: ctx,
    data,
  });
  metrics.sceneBuildMs = nowMs() - buildT0;
  metrics.renderMode = 'scene';

  const validation = validateScene(scene, {
    width,
    height,
    checkFonts: true,
  });
  if (validation.warnings.length) {
    renderLogger.sceneValidationWarning({ warnings: validation.warnings, rendererVersion: RENDERER_VERSION });
  }
  if (!validation.valid) {
    throw new SceneValidationRenderError(validation.errors);
  }

  const renderCtx = createRenderContext({ width, height, videoTime, rendererVersion: RENDERER_VERSION });
  const scheduled = scheduleFrame(scene);

  renderLogger.rendererStarted({
    ...metrics,
    frameIndex: renderCtx.frameIndex,
  });

  const drawT0 = nowMs();
  try {
    if (platform === 'node') {
      createNodeCanvasAdapter(ctx, resolver).drawScene(scheduled, { width, height });
    } else {
      createBrowserCanvasAdapter(ctx, resolver).drawScene(scheduled, { width, height });
    }
  } catch (err) {
    renderLogger.rendererFailed({
      message: err instanceof Error ? err.message : String(err),
      rendererVersion: RENDERER_VERSION,
    });
    disposeNodeCanvas({ canvas });
    throw err;
  }
  metrics.drawMs = nowMs() - drawT0;

  const imageData = ctx.getImageData(0, 0, width, height);
  const rgba = new Uint8ClampedArray(imageData.data);

  metrics.totalFrameRenderMs = nowMs() - frameT0;
  metrics.memoryAfter = memorySnapshot();
  if (metrics.memoryBefore && metrics.memoryAfter) {
    metrics.memoryDeltaBytes = metrics.memoryAfter.heapUsed - metrics.memoryBefore.heapUsed;
  }

  renderLogger.rendererCompleted({
    sceneBuildMs: metrics.sceneBuildMs,
    drawMs: metrics.drawMs,
    assetLoadMs: metrics.assetLoadMs,
    canvasAllocationMs: metrics.canvasAllocationMs,
    totalFrameRenderMs: metrics.totalFrameRenderMs,
    rendererVersion: RENDERER_VERSION,
    memoryAfter: metrics.memoryAfter,
  });

  disposeNodeCanvas({ canvas });

  return { rgba, width, height, metrics };
}

/** @param {object} config */
function collectFontFamilies(config) {
  const families = new Set(['Arial']);
  for (const ov of config.overlays || []) {
    if (ov?.fontFamily) families.add(ov.fontFamily);
  }
  return [...families];
}

/**
 * Render same frame on node + browser ctx and return pixel diff stats.
 * @param {RenderFrameOptions} options
 * @param {CanvasRenderingContext2D} browserCtx
 */
export async function compareBrowserAndNodeFrame(options, browserCtx) {
  const nodeResult = await renderFrame({ ...options, platform: 'node' });

  const w = options.width;
  const h = options.height;
  browserCtx.clearRect(0, 0, w, h);

  const browserResult = await renderFrame({
    ...options,
    platform: 'browser',
    canvasCtx: browserCtx,
  });

  let diffPixels = 0;
  const totalPixels = w * h;
  for (let i = 0; i < nodeResult.rgba.length; i += 4) {
    if (
      nodeResult.rgba[i] !== browserResult.rgba[i]
      || nodeResult.rgba[i + 1] !== browserResult.rgba[i + 1]
      || nodeResult.rgba[i + 2] !== browserResult.rgba[i + 2]
      || nodeResult.rgba[i + 3] !== browserResult.rgba[i + 3]
    ) {
      diffPixels++;
    }
  }

  return {
    diffPixels,
    totalPixels,
    diffRatio: totalPixels > 0 ? diffPixels / totalPixels : 0,
    nodeMetrics: nodeResult.metrics,
    browserMetrics: browserResult.metrics,
  };
}

export { drawScene };
