/** Resolve box padding, corner radius, stroke width from overlay style settings.
 * Keep in sync with packages/render-core/src/layout/metrics.js
 */

/** Minimum inset from each edge of the frame (10%). */
export const SAFE_MARGIN_RATIO = 0.1

export function resolveSafeMarginX(canvasWidth) {
  return Math.max(8, Number(canvasWidth) * SAFE_MARGIN_RATIO)
}

export function resolveSafeMarginY(canvasHeight) {
  return Math.max(8, Number(canvasHeight) * SAFE_MARGIN_RATIO)
}

export function resolveSafeContentWidth(canvasWidth) {
  const pad = resolveSafeMarginX(canvasWidth)
  return Math.max(40, Number(canvasWidth) - pad * 2)
}

export function resolveSafeContentHeight(canvasHeight) {
  const pad = resolveSafeMarginY(canvasHeight)
  return Math.max(40, Number(canvasHeight) - pad * 2)
}

/** Same formula for preview canvas and server ASS export (fontSize = % of frame width). */
export function resolveFontSizePx(overlay, canvasWidth) {
  const pct = Number(overlay?.fontSize) || 5
  const raw = Math.max(12, Math.floor(Number(canvasWidth) * (pct / 100)))
  const maxPx = Math.floor(resolveSafeContentWidth(canvasWidth) * 0.95)
  return Math.min(raw, Math.max(12, maxPx))
}

/** Keep text block vertically inside the 10% top/bottom safe area. */
export function clampBlockStartY(startY, totalBlockHeight, canvasHeight, pad = null) {
  const p = pad != null ? Math.max(8, pad) : resolveSafeMarginY(canvasHeight)
  const maxStart = canvasHeight - totalBlockHeight - p
  if (maxStart < p) return p
  return Math.max(p, Math.min(maxStart, startY))
}

/** Keep horizontal anchor inside the 10% left/right safe area. */
export function clampTextAnchorX(baseX, textWidth, canvasWidth, textAlign, pad = null) {
  const p = pad != null ? Math.max(8, pad) : resolveSafeMarginX(canvasWidth)
  const align = textAlign || 'center'
  if (align === 'left') {
    return Math.max(p, Math.min(canvasWidth - p - textWidth, baseX))
  }
  if (align === 'right') {
    return Math.max(p + textWidth, Math.min(canvasWidth - p, baseX))
  }
  return Math.max(p + textWidth / 2, Math.min(canvasWidth - p - textWidth / 2, baseX))
}

export function resolveBoxPadding(overlay, fontSize) {
  const px = overlay?.boxPaddingPx
  if (px != null && px !== '' && !Number.isNaN(Number(px))) {
    return Math.max(0, Number(px))
  }
  const pct = overlay?.boxPaddingPercent ?? 40
  return Math.max(0, fontSize * (Number(pct) / 100))
}

export function resolveBoxCornerRadius(overlay, fontSize) {
  const px = overlay?.boxCornerRadiusPx
  if (px != null && px !== '' && !Number.isNaN(Number(px))) {
    return Math.max(0, Number(px))
  }
  const pct = overlay?.boxCornerRadiusPercent ?? 20
  return Math.max(0, fontSize * (Number(pct) / 100))
}

export function resolveStrokeWidth(overlay, fontSize) {
  const px = overlay?.strokeWidthPx
  if (px != null && px !== '' && !Number.isNaN(Number(px))) {
    return Math.max(0.5, Number(px))
  }
  const pct = overlay?.strokeWidthPercent ?? 6
  return Math.max(0.5, fontSize * (Number(pct) / 100))
}

/** Max line width for wrap/fit — 10% margins + box/stroke insets. */
export function resolveTextMaxWidth(canvasWidth, overlay, fontSize) {
  const pad = resolveBoxPadding(overlay, fontSize)
  const stroke =
    overlay?.styleType === 'stroke' ? resolveStrokeWidth(overlay, fontSize) * 2 : 0
  const boxExtra = overlay?.styleType === 'box' ? pad * 2 : pad > 0 ? pad : 0
  const inset = boxExtra + stroke
  const safeW = resolveSafeContentWidth(canvasWidth)
  return Math.max(40, safeW - inset)
}

/** Shrink font when block is taller than the vertical safe area. */
export function resolveBlockFontScale(lineCount, lineHeight, canvasHeight, pad = null) {
  const p = pad != null ? Math.max(8, pad) : resolveSafeMarginY(canvasHeight)
  const maxH = resolveSafeContentHeight(canvasHeight)
  const blockH = lineCount * lineHeight
  if (blockH <= maxH || blockH <= 0) return 1
  return Math.max(0.45, maxH / blockH)
}
