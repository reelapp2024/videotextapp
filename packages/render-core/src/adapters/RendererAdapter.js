/**
 * Renderer adapter interface — concrete backends implement drawScene.
 */
export class RendererAdapter {
  /**
   * @param {import('../types/sceneGraph.js').SceneNode} _sceneRoot
   * @param {{ width: number, height: number }} _size
   */
  drawScene(_sceneRoot, _size) {
    throw new Error('RendererAdapter.drawScene must be implemented by subclass');
  }
}
