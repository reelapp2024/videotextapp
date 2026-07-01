/**
 * Minimal background fill for overlay-frame rendering (solid + gradient only).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width
 * @param {number} height
 * @param {object} [bg]
 */
export function drawBackgroundCore(ctx, width, height, bg) {
  if (!bg) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    return;
  }

  const type = bg.type || 'solid';
  if (type === 'solid') {
    ctx.fillStyle = bg.solidColor || '#000000';
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (type === 'gradient') {
    const colors = bg.gradientColors || ['#1a1a2e', '#16213e'];
    const g = ctx.createLinearGradient(0, 0, width, height);
    colors.forEach((c, i) => g.addColorStop(i / Math.max(1, colors.length - 1), c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
}
