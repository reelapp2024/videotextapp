import { getFontRegistry } from '../assets/fontRegistry.js';

const VALID_TYPES = new Set(['group', 'text', 'rect', 'image', 'path']);

/**
 * @param {unknown} n
 * @param {string} label
 * @param {string[]} errors
 */
function checkFinite(n, label, errors) {
  if (n == null) return;
  if (typeof n !== 'number' || Number.isNaN(n) || !Number.isFinite(n)) {
    errors.push(`${label} is not a finite number (${n})`);
  }
}

/**
 * @param {import('../types/sceneGraph.js').SceneNode} node
 * @param {string} path
 * @param {string[]} errors
 * @param {string[]} warnings
 * @param {{ registeredFonts?: Set<string> }} ctx
 */
function validateNode(node, path, errors, warnings, ctx) {
  if (!node || typeof node !== 'object') {
    errors.push(`${path}: node is missing or invalid`);
    return;
  }
  if (!VALID_TYPES.has(node.type)) {
    errors.push(`${path}: unknown node type "${node.type}"`);
    return;
  }

  const t = node.transform;
  if (t) {
    checkFinite(t.x, `${path}.transform.x`, errors);
    checkFinite(t.y, `${path}.transform.y`, errors);
    checkFinite(t.scaleX, `${path}.transform.scaleX`, errors);
    checkFinite(t.scaleY, `${path}.transform.scaleY`, errors);
    checkFinite(t.rotation, `${path}.transform.rotation`, errors);
    checkFinite(t.opacity, `${path}.transform.opacity`, errors);
    if (t.opacity != null && (t.opacity < 0 || t.opacity > 1)) {
      warnings.push(`${path}.transform.opacity out of range (${t.opacity})`);
    }
  }

  if (node.type === 'rect') {
    checkFinite(node.x, `${path}.x`, errors);
    checkFinite(node.y, `${path}.y`, errors);
    checkFinite(node.width, `${path}.width`, errors);
    checkFinite(node.height, `${path}.height`, errors);
    if (node.width != null && node.width < 0) errors.push(`${path}.width is negative`);
    if (node.height != null && node.height < 0) errors.push(`${path}.height is negative`);
    if (node.imageRef && !ctx.assetKeys?.has(node.imageRef)) {
      warnings.push(`${path}: imageRef "${node.imageRef}" not found in asset manager`);
    }
  }

  if (node.type === 'text') {
    checkFinite(node.x, `${path}.x`, errors);
    checkFinite(node.y, `${path}.y`, errors);
    if (node.text == null || node.text === '') {
      warnings.push(`${path}: empty text node`);
    }
    const style = node.style || {};
    if (style.font) {
      const familyMatch = style.font.match(/px\s+(.+)$/);
      const family = familyMatch?.[1]?.trim();
      if (family && ctx.checkFonts && !getFontRegistry().isRegistered(family)) {
        warnings.push(`${path}: font family "${family}" not registered in FontRegistry`);
      }
    } else {
      warnings.push(`${path}: text node missing font style`);
    }
    if (style.strokeWidth != null) checkFinite(style.strokeWidth, `${path}.strokeWidth`, errors);
  }

  if (node.type === 'group') {
    for (let i = 0; i < (node.children || []).length; i++) {
      validateNode(node.children[i], `${path}.children[${i}]`, errors, warnings, ctx);
    }
  }
}

/**
 * @param {import('../types/sceneGraph.js').SceneNode} sceneRoot
 * @param {{ width?: number, height?: number, assetKeys?: Set<string>, checkFonts?: boolean }} [options]
 */
export function validateScene(sceneRoot, options = {}) {
  const errors = [];
  const warnings = [];
  const { width, height } = options;

  if (!sceneRoot) {
    return { valid: false, errors: ['scene root is null'], warnings };
  }

  checkFinite(width, 'context.width', errors);
  checkFinite(height, 'context.height', errors);
  if (width != null && width <= 0) errors.push('context.width must be positive');
  if (height != null && height <= 0) errors.push('context.height must be positive');

  validateNode(sceneRoot, 'root', errors, warnings, {
    assetKeys: options.assetKeys,
    checkFonts: options.checkFonts ?? true,
  });

  return { valid: errors.length === 0, errors, warnings };
}
