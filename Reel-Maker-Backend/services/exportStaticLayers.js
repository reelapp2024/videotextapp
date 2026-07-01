/**
 * Server static layer cache — mirrors browser ExportStaticLayerCache (M9).
 */
class ServerStaticLayerCache {
  constructor() {
    this.background = null;
    this.logo = null;
    this.decorative = null;
  }

  /**
   * @param {import('@napi-rs/canvas').Canvas} canvas
   */
  setBackground(canvas) {
    this.background = canvas;
    return canvas;
  }

  bakeLogoLayer({ canvas, width, height, logoImage, logoSize, logoPosition, logoPadding, logoOpacity }) {
    if (!logoImage || !canvas) {
      this.logo = null;
      return null;
    }
    const { createCanvas } = require('@napi-rs/canvas');
    const layer = createCanvas(width, height);
    const ctx = layer.getContext('2d');

    const logoWidth = (width * (logoSize ?? 15)) / 100;
    const imgW = logoImage.width || logoImage.naturalWidth;
    const imgH = logoImage.height || logoImage.naturalHeight;
    const logoHeight = (imgH / imgW) * logoWidth;
    const padding = (width * (logoPadding ?? 2)) / 100;

    let x;
    let y;
    switch (logoPosition || 'bottom-right') {
      case 'top-left': x = padding; y = padding; break;
      case 'top-center': x = (width - logoWidth) / 2; y = padding; break;
      case 'top-right': x = width - logoWidth - padding; y = padding; break;
      case 'middle-left': x = padding; y = (height - logoHeight) / 2; break;
      case 'middle-center': x = (width - logoWidth) / 2; y = (height - logoHeight) / 2; break;
      case 'middle-right': x = width - logoWidth - padding; y = (height - logoHeight) / 2; break;
      case 'bottom-left': x = padding; y = height - logoHeight - padding; break;
      case 'bottom-center': x = (width - logoWidth) / 2; y = height - logoHeight - padding; break;
      default: x = width - logoWidth - padding; y = height - logoHeight - padding; break;
    }

    ctx.save();
    ctx.globalAlpha = logoOpacity ?? 1;
    ctx.drawImage(logoImage, x, y, logoWidth, logoHeight);
    ctx.restore();

    this.logo = layer;
    return layer;
  }

  bakeDecorativeLayer(width, height, drawFn) {
    if (!drawFn) {
      this.decorative = null;
      return null;
    }
    const { createCanvas } = require('@napi-rs/canvas');
    const layer = createCanvas(width, height);
    const ctx = layer.getContext('2d');
    drawFn(ctx, width, height);
    this.decorative = layer;
    return layer;
  }

  compositeBase(ctx, width, height) {
    if (this.background) {
      ctx.drawImage(this.background, 0, 0, width, height);
      return true;
    }
    return false;
  }

  compositeDecorative(ctx) {
    if (this.decorative) ctx.drawImage(this.decorative, 0, 0);
  }

  compositeLogo(ctx) {
    if (this.logo) ctx.drawImage(this.logo, 0, 0);
  }

  dispose() {
    for (const layer of [this.background, this.logo, this.decorative]) {
      if (layer) {
        try {
          layer.width = 0;
          layer.height = 0;
        } catch {
          // ignore
        }
      }
    }
    this.background = null;
    this.logo = null;
    this.decorative = null;
  }
}

module.exports = { ServerStaticLayerCache };
