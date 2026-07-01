import { RendererAdapter } from './RendererAdapter.js';
import { drawScene } from './canvasSceneDrawer.js';

/**
 * Draws a scene graph onto CanvasRenderingContext2D (browser preview + export).
 */
export class BrowserCanvasAdapter extends RendererAdapter {
  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {import('../assets/assetTypes.js').AssetResolver | null} [assets]
   */
  constructor(ctx, assets = null) {
    super();
    this.ctx = ctx;
    this.assets = assets;
  }

  /**
   * @param {import('../types/sceneGraph.js').SceneNode} sceneRoot
   * @param {{ width: number, height: number }} size
   */
  drawScene(sceneRoot, size) {
    drawScene(this.ctx, sceneRoot, size, this.assets);
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('../assets/assetTypes.js').AssetResolver | null} [assets]
 */
export function createBrowserCanvasAdapter(ctx, assets = null) {
  return new BrowserCanvasAdapter(ctx, assets);
}
