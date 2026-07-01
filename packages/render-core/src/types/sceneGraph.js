/**
 * Platform-independent scene graph nodes.
 * Renderers build trees; adapters draw them (no Canvas API in renderers).
 */

/** @typedef {'group' | 'text' | 'rect' | 'image' | 'path'} SceneNodeType */

/**
 * @typedef {Object} Transform
 * @property {number} [x]
 * @property {number} [y]
 * @property {number} [scaleX]
 * @property {number} [scaleY]
 * @property {number} [rotation]
 * @property {number} [opacity]
 */

/**
 * @typedef {Object} ShadowStyle
 * @property {string} color
 * @property {number} blur
 * @property {number} offsetX
 * @property {number} offsetY
 */

/**
 * @typedef {Object} TextStyle
 * @property {string} [font]
 * @property {string} [fill]
 * @property {string} [stroke]
 * @property {number} [strokeWidth]
 * @property {number} [strokeOpacity]
 * @property {string} [textAlign]
 * @property {string} [textBaseline]
 * @property {number} [letterSpacing]
 * @property {ShadowStyle} [shadow]
 * @property {{ type: 'linear', x0: number, y0: number, x1: number, y1: number, stops: { offset: number, color: string }[] }} [gradient]
 */

/**
 * @typedef {Object} RectStyle
 * @property {string} [fill]
 * @property {number} [opacity]
 * @property {number} [radius]
 */

/**
 * @typedef {Object} SceneNode
 * @property {SceneNodeType} type
 * @property {Transform} [transform]
 * @property {TextStyle | RectStyle} [style]
 * @property {SceneNode[]} [children]
 * @property {string} [text]
 * @property {number} [x]
 * @property {number} [y]
 * @property {number} [width]
 * @property {number} [height]
 * @property {string} [imageRef]
 * @property {'fillThenStroke' | 'strokeThenFill'} [textDrawOrder]
 */

/** @returns {Transform} */
export function identityTransform() {
  return { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1 };
}

/** @param {Partial<Transform>} t @returns {Transform} */
export function mergeTransform(t = {}) {
  return { ...identityTransform(), ...t };
}

/** @param {Partial<SceneNode>} props @returns {SceneNode} */
export function createGroup(props = {}) {
  return {
    type: 'group',
    transform: mergeTransform(props.transform),
    children: props.children || [],
  };
}

/** @param {Partial<SceneNode>} props @returns {SceneNode} */
export function createText(props) {
  return {
    type: 'text',
    text: props.text ?? '',
    x: props.x ?? 0,
    y: props.y ?? 0,
    transform: props.transform ? mergeTransform(props.transform) : undefined,
    style: props.style || {},
    textDrawOrder: props.textDrawOrder || 'strokeThenFill',
  };
}

/** @param {Partial<SceneNode>} props @returns {SceneNode} */
export function createRect(props) {
  return {
    type: 'rect',
    x: props.x ?? 0,
    y: props.y ?? 0,
    width: props.width ?? 0,
    height: props.height ?? 0,
    transform: props.transform ? mergeTransform(props.transform) : undefined,
    style: props.style || {},
  };
}

/** @param {Partial<SceneNode>} props @returns {SceneNode} */
export function createImage(props) {
  return {
    type: 'image',
    imageRef: props.imageRef ?? '',
    x: props.x ?? 0,
    y: props.y ?? 0,
    width: props.width,
    height: props.height,
    transform: props.transform ? mergeTransform(props.transform) : undefined,
  };
}

/** @returns {SceneNode} */
export function createSceneRoot(children = []) {
  return createGroup({ children });
}
