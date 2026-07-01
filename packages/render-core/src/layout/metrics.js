/**
 * Layout metrics — mirrors Reel-Maker/src/utils/overlayStyleMetrics.js for shared renderer use.
 * Keep in sync until a single import path exists in a later milestone.
 */

export function resolveFontSizePx(overlay, canvasWidth) {
  const pct = Number(overlay?.fontSize) || 5;
  return Math.max(12, Math.floor(Number(canvasWidth) * (pct / 100)));
}

export function clampBlockStartY(startY, totalBlockHeight, canvasHeight, pad = 8) {
  const p = Math.max(8, pad);
  return Math.max(p, Math.min(canvasHeight - totalBlockHeight - p, startY));
}

export function clampTextAnchorX(baseX, textWidth, canvasWidth, textAlign, pad = 8) {
  const p = Math.max(8, pad);
  const align = textAlign || 'center';
  if (align === 'left') {
    return Math.max(p, Math.min(canvasWidth - p - textWidth, baseX));
  }
  if (align === 'right') {
    return Math.max(p + textWidth, Math.min(canvasWidth - p, baseX));
  }
  return Math.max(p + textWidth / 2, Math.min(canvasWidth - p - textWidth / 2, baseX));
}

export function resolveBoxPadding(overlay, fontSize) {
  const px = overlay?.boxPaddingPx;
  if (px != null && px !== '' && !Number.isNaN(Number(px))) {
    return Math.max(0, Number(px));
  }
  const pct = overlay?.boxPaddingPercent ?? 40;
  return Math.max(0, fontSize * (Number(pct) / 100));
}

export function resolveBoxCornerRadius(overlay, fontSize) {
  const px = overlay?.boxCornerRadiusPx;
  if (px != null && px !== '' && !Number.isNaN(Number(px))) {
    return Math.max(0, Number(px));
  }
  const pct = overlay?.boxCornerRadiusPercent ?? 20;
  return Math.max(0, fontSize * (Number(pct) / 100));
}

export function resolveStrokeWidth(overlay, fontSize) {
  const px = overlay?.strokeWidthPx;
  if (px != null && px !== '' && !Number.isNaN(Number(px))) {
    return Math.max(0.5, Number(px));
  }
  const pct = overlay?.strokeWidthPercent ?? 6;
  return Math.max(0.5, fontSize * (Number(pct) / 100));
}

export function resolveTextMaxWidth(canvasWidth, overlay, fontSize) {
  const pad = resolveBoxPadding(overlay, fontSize);
  const stroke =
    overlay?.styleType === 'stroke' ? resolveStrokeWidth(overlay, fontSize) * 2 : 0;
  const inset = pad * 2 + stroke + 20;
  return Math.max(canvasWidth * 0.55, canvasWidth * 0.92 - inset);
}

export function resolveBlockFontScale(lineCount, lineHeight, canvasHeight, pad = 8) {
  const p = Math.max(8, pad);
  const maxH = canvasHeight * 0.88 - p * 2;
  const blockH = lineCount * lineHeight;
  if (blockH <= maxH || blockH <= 0) return 1;
  return Math.max(0.55, maxH / blockH);
}
