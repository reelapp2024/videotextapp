/**
 * Platform-neutral scene graph drawing — shared by browser and Node adapters.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('../types/sceneGraph.js').SceneNode} node
 * @param {{ width: number, height: number }} _size
 * @param {import('../assets/assetTypes.js').AssetResolver | null} assets
 */
export function drawSceneNode(ctx, node, _size, assets = null) {
  if (!node) return;

  if (node.type === 'group') {
    const t = node.transform || {};
    ctx.save();
    if (t.opacity != null && t.opacity !== 1) ctx.globalAlpha *= t.opacity;
    if (t.x || t.y) ctx.translate(t.x || 0, t.y || 0);
    if (t.rotation) ctx.rotate(t.rotation);
    if (t.scaleX != null && t.scaleY != null && (t.scaleX !== 1 || t.scaleY !== 1)) {
      ctx.scale(t.scaleX, t.scaleY);
    }
    for (const child of node.children || []) {
      drawSceneNode(ctx, child, _size, assets);
    }
    ctx.restore();
    return;
  }

  if (node.type === 'rect') {
    drawRectNode(ctx, node);
    return;
  }

  if (node.type === 'text') {
    drawTextNode(ctx, node);
    return;
  }

  if (node.type === 'image') {
    drawImageNode(ctx, node, assets);
  }
}

/** @param {CanvasRenderingContext2D} ctx @param {import('../types/sceneGraph.js').SceneNode} node */
function drawRectNode(ctx, node) {
  const style = node.style || {};
  const t = node.transform || {};
  ctx.save();
  if (t.opacity != null) ctx.globalAlpha *= t.opacity;
  if (style.opacity != null) ctx.globalAlpha *= style.opacity;
  if (t.x || t.y) ctx.translate(t.x || 0, t.y || 0);
  if (t.rotation) ctx.rotate(t.rotation);
  if (t.scaleX != null && t.scaleY != null && (t.scaleX !== 1 || t.scaleY !== 1)) {
    ctx.scale(t.scaleX, t.scaleY);
  }
  ctx.fillStyle = style.fill || '#000';
  const r = style.radius ?? 0;
  const x = node.x ?? 0;
  const y = node.y ?? 0;
  const w = node.width ?? 0;
  const h = node.height ?? 0;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else if (r > 0) {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.fill();
  ctx.restore();
}

/** @param {CanvasRenderingContext2D} ctx @param {import('../types/sceneGraph.js').SceneNode} node */
function drawTextNode(ctx, node) {
  const style = node.style || {};
  const t = node.transform || {};
  const text = node.text ?? '';
  const x = node.x ?? 0;
  const y = node.y ?? 0;

  ctx.save();
  if (t.opacity != null) ctx.globalAlpha *= t.opacity;
  if (t.x || t.y) ctx.translate(t.x || 0, t.y || 0);
  if (t.rotation) ctx.rotate(t.rotation);
  if (t.scaleX != null && t.scaleY != null && (t.scaleX !== 1 || t.scaleY !== 1)) {
    ctx.scale(t.scaleX, t.scaleY);
  }

  if (style.font) ctx.font = style.font;
  ctx.textAlign = style.textAlign || 'left';
  ctx.textBaseline = style.textBaseline || 'alphabetic';

  if (style.shadow) {
    ctx.shadowColor = style.shadow.color;
    ctx.shadowBlur = style.shadow.blur;
    ctx.shadowOffsetX = style.shadow.offsetX;
    ctx.shadowOffsetY = style.shadow.offsetY;
  }

  const drawOrder = node.textDrawOrder || 'strokeThenFill';
  const hasStroke = style.stroke && style.strokeWidth;
  const strokeOpacity = style.strokeOpacity ?? 1;

  const drawFill = () => {
    if (style.gradient) {
      const g = style.gradient;
      const grad = ctx.createLinearGradient(g.x0, g.y0, g.x1, g.y1);
      for (const stop of g.stops) {
        grad.addColorStop(stop.offset, stop.color);
      }
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = style.fill || '#ffffff';
    }
    if (style.letterSpacing && style.letterSpacing > 0.5) {
      fillTextWithLetterSpacing(ctx, text, x, y, style.letterSpacing, style.textAlign);
    } else {
      ctx.fillText(text, x, y);
    }
  };

  const drawStroke = () => {
    if (!hasStroke) return;
    ctx.save();
    ctx.globalAlpha *= strokeOpacity;
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.strokeWidth;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    if (style.letterSpacing && style.letterSpacing > 0.5) {
      strokeTextWithLetterSpacing(ctx, text, x, y, style.letterSpacing, style.textAlign);
    } else {
      ctx.strokeText(text, x, y);
    }
    ctx.restore();
  };

  if (drawOrder === 'fillThenStroke') {
    drawFill();
    drawStroke();
  } else {
    drawStroke();
    drawFill();
  }

  ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('../types/sceneGraph.js').SceneNode} node
 * @param {import('../assets/assetTypes.js').AssetResolver | null} assets
 */
function drawImageNode(ctx, node, assets) {
  if (!assets || !node.imageRef) return;
  const handle = assets.resolveImage(node.imageRef);
  if (!handle) return;

  const t = node.transform || {};
  const x = node.x ?? 0;
  const y = node.y ?? 0;
  const w = node.width ?? handle.width ?? 0;
  const h = node.height ?? handle.height ?? 0;

  ctx.save();
  if (t.opacity != null) ctx.globalAlpha *= t.opacity;
  if (t.x || t.y) ctx.translate(t.x || 0, t.y || 0);
  if (t.rotation) ctx.rotate(t.rotation);
  if (t.scaleX != null && t.scaleY != null && (t.scaleX !== 1 || t.scaleY !== 1)) {
    ctx.scale(t.scaleX, t.scaleY);
  }
  try {
    ctx.drawImage(handle.source, x, y, w || undefined, h || undefined);
  } catch {
    // corrupt / unloaded image — skip draw
  }
  ctx.restore();
}

function fillTextWithLetterSpacing(ctx, text, anchorX, y, letterSpacing, textAlign) {
  const totalW = measureSpacedText(ctx, text, letterSpacing);
  let cx = anchorX;
  if (textAlign === 'center') cx = anchorX - totalW / 2;
  else if (textAlign === 'right') cx = anchorX - totalW;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + letterSpacing;
  }
}

function strokeTextWithLetterSpacing(ctx, text, anchorX, y, letterSpacing, textAlign) {
  const totalW = measureSpacedText(ctx, text, letterSpacing);
  let cx = anchorX;
  if (textAlign === 'center') cx = anchorX - totalW / 2;
  else if (textAlign === 'right') cx = anchorX - totalW;
  for (const ch of text) {
    ctx.strokeText(ch, cx, y);
    cx += ctx.measureText(ch).width + letterSpacing;
  }
}

function measureSpacedText(ctx, text, letterSpacing) {
  let w = 0;
  for (let i = 0; i < text.length; i++) {
    w += ctx.measureText(text[i]).width;
    if (i < text.length - 1) w += letterSpacing;
  }
  return w;
}

/** @param {CanvasRenderingContext2D} ctx @param {import('../types/sceneGraph.js').SceneNode} sceneRoot @param {{ width: number, height: number }} size @param {import('../assets/assetTypes.js').AssetResolver | null} assets */
export function drawScene(ctx, sceneRoot, size, assets = null) {
  if (!sceneRoot) return;
  ctx.save();
  drawSceneNode(ctx, sceneRoot, size, assets);
  ctx.restore();
}
