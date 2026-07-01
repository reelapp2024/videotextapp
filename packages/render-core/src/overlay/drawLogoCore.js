/**
 * Shared logo overlay drawing (browser preview + server renderer).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @param {object} logo
 * @param {boolean} logo.enabled
 * @param {CanvasImageSource | null} logo.image
 * @param {number} [logo.sizePercent]
 * @param {string} [logo.position]
 * @param {number} [logo.opacity]
 * @param {number} [logo.paddingPercent]
 */
export function drawLogoCore(ctx, canvasWidth, canvasHeight, logo) {
  if (!logo?.enabled || !logo.image) return;

  const img = logo.image;
  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;
  if (!imgW || !imgH) return;

  const sizePercent = logo.sizePercent ?? 15;
  const paddingPercent = logo.paddingPercent ?? 2;
  const opacity = logo.opacity ?? 1;
  const position = logo.position || 'bottom-right';

  const logoWidth = (canvasWidth * sizePercent) / 100;
  const logoHeight = (imgH / imgW) * logoWidth;
  const padding = (canvasWidth * paddingPercent) / 100;

  let x;
  let y;

  switch (position) {
    case 'top-left':
      x = padding;
      y = padding;
      break;
    case 'top-center':
      x = (canvasWidth - logoWidth) / 2;
      y = padding;
      break;
    case 'top-right':
      x = canvasWidth - logoWidth - padding;
      y = padding;
      break;
    case 'middle-left':
      x = padding;
      y = (canvasHeight - logoHeight) / 2;
      break;
    case 'middle-center':
      x = (canvasWidth - logoWidth) / 2;
      y = (canvasHeight - logoHeight) / 2;
      break;
    case 'middle-right':
      x = canvasWidth - logoWidth - padding;
      y = (canvasHeight - logoHeight) / 2;
      break;
    case 'bottom-left':
      x = padding;
      y = canvasHeight - logoHeight - padding;
      break;
    case 'bottom-center':
      x = (canvasWidth - logoWidth) / 2;
      y = canvasHeight - logoHeight - padding;
      break;
    case 'bottom-right':
    default:
      x = canvasWidth - logoWidth - padding;
      y = canvasHeight - logoHeight - padding;
      break;
  }

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.drawImage(img, x, y, logoWidth, logoHeight);
  ctx.restore();
}
