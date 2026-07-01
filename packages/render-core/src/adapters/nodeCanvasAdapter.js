import { RendererAdapter } from './RendererAdapter.js';
import { drawScene } from './canvasSceneDrawer.js';
import { CanvasAllocationError } from '../errors/renderErrors.js';

/**
 * Node.js canvas adapter — uses @napi-rs/canvas (Canvas2D-compatible API).
 */
export class NodeCanvasAdapter extends RendererAdapter {
  /**
   * @param {import('@napi-rs/canvas').SKRSContext2D} ctx
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
 * @param {number} width
 * @param {number} height
 * @returns {Promise<{ canvas: import('@napi-rs/canvas').Canvas, ctx: import('@napi-rs/canvas').SKRSContext2D }>}
 */
export async function createNodeCanvas(width, height) {
  try {
    const { createCanvas } = await import('@napi-rs/canvas');
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new CanvasAllocationError({ width, height });
    return { canvas, ctx };
  } catch (err) {
    if (err instanceof CanvasAllocationError) throw err;
    throw new CanvasAllocationError({
      width,
      height,
      cause: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * @param {import('@napi-rs/canvas').SKRSContext2D} ctx
 * @param {import('../assets/assetTypes.js').AssetResolver | null} [assets]
 */
export function createNodeCanvasAdapter(ctx, assets = null) {
  return new NodeCanvasAdapter(ctx, assets);
}

/**
 * Release node canvas resources.
 * @param {{ canvas?: { width?: number, height?: number } | null }} target
 */
export function disposeNodeCanvas(target) {
  if (target?.canvas) {
    try {
      target.canvas.width = 0;
      target.canvas.height = 0;
    } catch {
      // ignore
    }
  }
}
