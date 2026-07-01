// Browser-safe entry — no @napi-rs/canvas / Node-only APIs.

export {
  createGroup,
  createRect,
  createImage,
  createSceneRoot,
  createText,
  identityTransform,
  mergeTransform,
} from './types/sceneGraph.js';

export { createRenderContext, RENDERER_VERSION } from './types/renderContext.js';

export {
  isRenderCoreTextEnabled,
  isRenderCoreAnimationEnabled,
  isRenderCoreActive,
} from './config/featureFlags.js';

export {
  resolveFontSizePx,
  clampBlockStartY,
  clampTextAnchorX,
  resolveBoxPadding,
  resolveBoxCornerRadius,
  resolveStrokeWidth,
  resolveTextMaxWidth,
  resolveBlockFontScale,
} from './layout/metrics.js';
export { wrapText } from './layout/wrapText.js';
export { applyTextTransform } from './layout/applyTextTransform.js';

export { createAnimationEngine } from './animation/animationEngine.js';
export {
  registerPresetEffect,
  registerLineRevealEffect,
  computePresetEffect,
  computeLineRevealEffect,
} from './animation/effectRegistry.js';
export { DEF_STYLE, HIDDEN_STYLE, ENTRANCE_EFFECTS, LINE_ANIM_FULL } from './animation/constants.js';

export { RendererAdapter } from './adapters/RendererAdapter.js';
export {
  BrowserCanvasAdapter,
  createBrowserCanvasAdapter,
} from './adapters/browserCanvasAdapter.js';
export { drawScene, drawSceneNode } from './adapters/canvasSceneDrawer.js';

export { drawOverlaysCore } from './overlay/drawOverlaysCore.js';
export { drawLogoCore } from './overlay/drawLogoCore.js';
export { drawBackgroundCore } from './overlay/drawBackgroundCore.js';
export { buildOverlayParityScenario, OVERLAY_PARITY_SCENARIOS } from './overlay/overlayParityScenarios.js';

export { buildRowBasedTextScene, buildStaticLineScene } from './renderers/TextRenderer.js';
export { buildFrameScene, buildBackgroundScene, buildParityScenario } from './renderers/frameBuilder.js';
export {
  canUseRenderCoreRowBased,
  canUseRenderCoreStaticLine,
} from './renderers/canUseRenderCoreText.js';
export { RenderOrchestrator, getRenderOrchestrator } from './renderers/RenderOrchestrator.js';

export { validateScene } from './validation/sceneValidator.js';
export { reportRendererFallback, resetRendererFallbackTelemetry } from './telemetry/rendererTelemetry.js';
export { scheduleFrame, scheduleLayers } from './schedule/frameScheduler.js';

export { LoadedAssets, loadAssetBundle } from './assets/assetLoader.js';
export { AssetManager, getAssetManager, resetAssetManager } from './assets/assetManager.js';
export { FontRegistry, getFontRegistry, resetFontRegistry } from './assets/fontRegistry.js';

export {
  RenderError,
  FontLoadError,
  ImageLoadError,
  SvgLoadError,
  CanvasAllocationError,
  SceneValidationRenderError,
} from './errors/renderErrors.js';

export { logRenderEvent, renderLogger, setLogSink } from './logging/logger.js';
