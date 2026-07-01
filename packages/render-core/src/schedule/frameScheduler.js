/**
 * M3 pass-through scheduler — every layer is dirty (correctness first).
 * Optimizations land in M6.
 */

/**
 * @param {import('../types/sceneGraph.js').SceneNode[]} layers
 * @returns {import('../types/sceneGraph.js').SceneNode[]}
 */
export function scheduleLayers(layers) {
  return layers;
}

/**
 * @param {import('../types/sceneGraph.js').SceneNode} root
 * @returns {import('../types/sceneGraph.js').SceneNode}
 */
export function scheduleFrame(root) {
  return root;
}
