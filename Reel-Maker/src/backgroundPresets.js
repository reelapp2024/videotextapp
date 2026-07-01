// Background design pattern presets (50+)
// Each returns a draw function: (ctx, width, height) => void

export const BACKGROUND_PATTERN_PRESETS = [
  { id: 'none', label: 'None (Black)' },
  { id: 'dots', label: 'Dots' },
  { id: 'dotsLarge', label: 'Large Dots' },
  { id: 'grid', label: 'Grid' },
  { id: 'gridThin', label: 'Thin Grid' },
  { id: 'crosshatch', label: 'Crosshatch' },
  { id: 'diagonalLines', label: 'Diagonal Lines' },
  { id: 'diagonalStripes', label: 'Diagonal Stripes' },
  { id: 'horizontalLines', label: 'Horizontal Lines' },
  { id: 'verticalLines', label: 'Vertical Lines' },
  { id: 'zigzag', label: 'Zigzag' },
  { id: 'chevron', label: 'Chevron' },
  { id: 'hexagons', label: 'Hexagons' },
  { id: 'triangles', label: 'Triangles' },
  { id: 'squares', label: 'Squares' },
  { id: 'circles', label: 'Concentric Circles' },
  { id: 'waves', label: 'Waves' },
  { id: 'bricks', label: 'Bricks' },
  { id: 'herringbone', label: 'Herringbone' },
  { id: 'noise', label: 'Noise/Grain' },
  { id: 'plus', label: 'Plus Signs' },
  { id: 'stars', label: 'Stars' },
  { id: 'diamonds', label: 'Diamonds' },
  { id: 'arrows', label: 'Arrows' },
  { id: 'circuit', label: 'Circuit Board' },
  { id: 'topography', label: 'Topography' },
  { id: 'isometric', label: 'Isometric Grid' },
  { id: 'radial', label: 'Radial Lines' },
  { id: 'spiral', label: 'Spiral' },
  { id: 'maze', label: 'Maze' },
  { id: 'honeycomb', label: 'Honeycomb' },
  { id: 'fishscale', label: 'Fish Scale' },
  { id: 'argyle', label: 'Argyle' },
  { id: 'plaid', label: 'Plaid' },
  { id: 'tartan', label: 'Tartan' },
  { id: 'polka', label: 'Polka Dot' },
  { id: 'stripes', label: 'Stripes' },
  { id: 'gradientMesh', label: 'Gradient Mesh' },
  { id: 'sunburst', label: 'Sunburst' },
  { id: 'rings', label: 'Rings' },
  { id: 'mesh', label: 'Mesh' },
  { id: 'organic', label: 'Organic Blobs' },
  { id: 'tech', label: 'Tech Lines' },
  { id: 'minimal', label: 'Minimal Dots' },
  { id: 'geometric', label: 'Geometric' },
  { id: 'tribal', label: 'Tribal' },
  { id: 'artDeco', label: 'Art Deco' },
  { id: 'retro', label: 'Retro' },
  { id: 'abstract', label: 'Abstract' },
  { id: 'watercolor', label: 'Watercolor' },
  { id: 'marble', label: 'Marble' },
  { id: 'wood', label: 'Wood Grain' },
  { id: 'carbon', label: 'Carbon Fiber' },
  { id: 'neural', label: 'Neural Network' },
];

// Pattern colors - used when drawing (user can customize)
const DEFAULT_PATTERN_COLOR = 'rgba(255,255,255,0.1)';
const DEFAULT_PATTERN_BG = '#0a0a0a';

export function drawBackgroundPattern(ctx, width, height, patternId, fgColor = DEFAULT_PATTERN_COLOR, bgColor = DEFAULT_PATTERN_BG) {
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);
  if (!patternId || patternId === 'none') return;

  ctx.strokeStyle = fgColor;
  ctx.fillStyle = fgColor;
  const size = Math.min(width, height) / 20;
  const tile = Math.max(20, size);

  switch (patternId) {
    case 'dots':
      for (let x = tile / 2; x < width; x += tile) {
        for (let y = tile / 2; y < height; y += tile) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    case 'dotsLarge':
      for (let x = tile; x < width; x += tile * 2) {
        for (let y = tile; y < height; y += tile * 2) {
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    case 'grid':
      ctx.lineWidth = 1;
      for (let x = 0; x <= width; x += tile) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += tile) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      break;
    case 'gridThin':
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= width; x += tile / 2) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += tile / 2) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      break;
    case 'diagonalLines':
      ctx.lineWidth = 1;
      for (let i = -height; i < width + height; i += tile) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height, height);
        ctx.stroke();
      }
      break;
    case 'horizontalLines':
      ctx.lineWidth = 1;
      for (let y = 0; y <= height; y += tile) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      break;
    case 'verticalLines':
      ctx.lineWidth = 1;
      for (let x = 0; x <= width; x += tile) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      break;
    case 'crosshatch':
      ctx.lineWidth = 0.5;
      for (let i = -height; i < width + height; i += tile) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height, height);
        ctx.stroke();
      }
      for (let i = -width; i < height + width; i += tile) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i + width);
        ctx.stroke();
      }
      break;
    case 'hexagons':
      ctx.lineWidth = 1;
      const r = tile / 2;
      for (let row = 0; row < height / (r * 1.732) + 2; row++) {
        for (let col = 0; col < width / (r * 3) + 2; col++) {
          const x = col * r * 3 + (row % 2) * r * 1.5;
          const y = row * r * 1.732;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = (i * 60 - 30) * Math.PI / 180;
            const px = x + r * Math.cos(a);
            const py = y + r * Math.sin(a);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      break;
    case 'squares':
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += tile) {
        for (let y = 0; y < height; y += tile) {
          ctx.strokeRect(x, y, tile - 2, tile - 2);
        }
      }
      break;
    case 'circles':
      ctx.lineWidth = 1;
      const cx = width / 2, cy = height / 2;
      for (let i = 1; i < 15; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, i * tile, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    case 'radial':
      ctx.lineWidth = 1;
      const rx = width / 2, ry = height / 2;
      for (let a = 0; a < 360; a += 10) {
        const rad = a * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + Math.cos(rad) * width, ry + Math.sin(rad) * height);
        ctx.stroke();
      }
      break;
    case 'sunburst':
      ctx.lineWidth = 1;
      const sx = width / 2, sy = height / 2;
      for (let i = 0; i < 8; i++) {
        for (let a = 0; a < 360; a += 5) {
          const rad = (a + i * 45) * Math.PI / 180;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + Math.cos(rad) * width, sy + Math.sin(rad) * height);
          ctx.stroke();
        }
      }
      break;
    case 'stripes':
      for (let x = 0; x < width; x += tile * 2) {
        ctx.fillStyle = fgColor;
        ctx.fillRect(x, 0, tile, height);
      }
      break;
    case 'plus':
      ctx.lineWidth = 2;
      const ps = tile / 4;
      for (let x = tile; x < width; x += tile) {
        for (let y = tile; y < height; y += tile) {
          ctx.beginPath();
          ctx.moveTo(x - ps, y);
          ctx.lineTo(x + ps, y);
          ctx.moveTo(x, y - ps);
          ctx.lineTo(x, y + ps);
          ctx.stroke();
        }
      }
      break;
    case 'stars':
      for (let x = tile; x < width; x += tile * 2) {
        for (let y = tile; y < height; y += tile * 2) {
          ctx.beginPath();
          ctx.moveTo(x, y - 3);
          ctx.lineTo(x + 1, y);
          ctx.lineTo(x, y + 3);
          ctx.lineTo(x - 1, y);
          ctx.closePath();
          ctx.fill();
        }
      }
      break;
    case 'bricks':
      ctx.lineWidth = 1;
      for (let row = 0; row < height / (tile / 2) + 2; row++) {
        const offset = (row % 2) * (tile / 2);
        for (let col = 0; col < width / tile + 2; col++) {
          ctx.strokeRect(col * tile - offset, row * (tile / 2), tile - 1, tile / 2 - 1);
        }
      }
      break;
    case 'diagonalStripes':
      ctx.lineWidth = tile / 2;
      for (let i = -height; i < width + height * 2; i += tile * 2) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height, height);
        ctx.stroke();
      }
      break;
    case 'waves':
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += tile / 2) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= width + 20; x += 20) {
          ctx.lineTo(x, y + Math.sin(x / 30) * 10);
        }
        ctx.stroke();
      }
      break;
    case 'triangles':
      ctx.lineWidth = 1;
      for (let row = 0; row < height / (tile * 0.866) + 2; row++) {
        for (let col = 0; col < width / tile + 2; col++) {
          const x = col * tile + (row % 2) * (tile / 2);
          const y = row * tile * 0.866;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + tile / 2, y + tile * 0.866);
          ctx.lineTo(x + tile, y);
          ctx.closePath();
          ctx.stroke();
        }
      }
      break;
    case 'diamonds':
      ctx.lineWidth = 1;
      const d = tile / 2;
      for (let row = 0; row < height / d + 2; row++) {
        for (let col = 0; col < width / d + 2; col++) {
          const x = col * d + (row % 2) * d;
          const y = row * d;
          ctx.beginPath();
          ctx.moveTo(x, y + d);
          ctx.lineTo(x + d, y);
          ctx.lineTo(x + 2 * d, y + d);
          ctx.lineTo(x + d, y + 2 * d);
          ctx.closePath();
          ctx.stroke();
        }
      }
      break;
    case 'mesh':
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= width; x += tile / 2) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += tile / 2) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      break;
    case 'noise':
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 25;
        data[i] = Math.min(255, (data[i] || 0) + v);
        data[i + 1] = Math.min(255, (data[i + 1] || 0) + v);
        data[i + 2] = Math.min(255, (data[i + 2] || 0) + v);
      }
      ctx.putImageData(imgData, 0, 0);
      break;
    case 'rings':
      ctx.lineWidth = 1;
      const rcx = width / 2, rcy = height / 2;
      const maxR = Math.max(width, height);
      for (let i = 1; i < maxR / tile; i++) {
        ctx.beginPath();
        ctx.arc(rcx, rcy, i * tile, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    case 'isometric':
      ctx.lineWidth = 1;
      const isoSize = tile;
      for (let row = -1; row < height / (isoSize * 0.866) + 2; row++) {
        for (let col = -1; col < width / isoSize + 2; col++) {
          const x = col * isoSize + row * (isoSize / 2);
          const y = row * isoSize * 0.866;
          ctx.beginPath();
          ctx.moveTo(x, y + isoSize * 0.866);
          ctx.lineTo(x + isoSize / 2, y);
          ctx.lineTo(x + isoSize, y + isoSize * 0.866);
          ctx.lineTo(x + isoSize / 2, y + isoSize * 1.732);
          ctx.closePath();
          ctx.stroke();
        }
      }
      break;
    case 'minimal':
      for (let x = tile; x < width; x += tile * 3) {
        for (let y = tile; y < height; y += tile * 3) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    case 'carbon':
      ctx.lineWidth = 1;
      for (let i = 0; i < width + height; i += 3) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < width + height; i += 4) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }
      break;
    case 'chevron':
      ctx.lineWidth = 2;
      for (let row = 0; row < height / tile + 2; row++) {
        for (let col = 0; col < width / tile + 2; col++) {
          const x = col * tile + (row % 2) * (tile / 2);
          const y = row * tile;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + tile / 2, y + tile / 2);
          ctx.lineTo(x, y + tile);
          ctx.lineTo(x - tile / 2, y + tile / 2);
          ctx.closePath();
          ctx.stroke();
        }
      }
      break;
    case 'zigzag':
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += tile) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= width + tile; x += tile) {
          ctx.lineTo(x, y);
          ctx.lineTo(x + tile / 2, y + tile / 2);
          ctx.lineTo(x + tile, y + tile / 2);
        }
        ctx.stroke();
      }
      break;
    case 'herringbone':
      ctx.lineWidth = 1;
      const hb = tile / 2;
      for (let row = 0; row < height / hb + 2; row++) {
        for (let col = 0; col < width / hb + 2; col++) {
          const x = col * hb + (row % 2) * hb;
          const y = row * hb;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + hb, y + hb);
          ctx.lineTo(x, y + 2 * hb);
          ctx.lineTo(x - hb, y + hb);
          ctx.closePath();
          ctx.stroke();
        }
      }
      break;
    case 'topography':
      ctx.lineWidth = 1;
      for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.ellipse(width / 2, height / 2, width / 2 - i * tile, height / 2 - i * tile, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    case 'argyle':
      ctx.lineWidth = 1;
      const aSize = tile;
      for (let row = 0; row < height / aSize + 2; row++) {
        for (let col = 0; col < width / aSize + 2; col++) {
          const x = col * aSize + (row % 2) * (aSize / 2);
          const y = row * aSize;
          ctx.beginPath();
          ctx.moveTo(x, y + aSize / 2);
          ctx.lineTo(x + aSize / 2, y);
          ctx.lineTo(x + aSize, y + aSize / 2);
          ctx.lineTo(x + aSize / 2, y + aSize);
          ctx.closePath();
          ctx.stroke();
        }
      }
      break;
    case 'polka':
      const polkaR = tile / 4;
      for (let x = tile; x < width; x += tile) {
        for (let y = tile; y < height; y += tile) {
          ctx.beginPath();
          ctx.arc(x, y, polkaR, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    case 'fishscale':
      ctx.lineWidth = 1;
      const fs = tile / 2;
      for (let row = 0; row < height / (fs * 1.732) + 2; row++) {
        for (let col = 0; col < width / fs + 2; col++) {
          const x = col * fs + (row % 2) * fs;
          const y = row * fs * 1.732;
          ctx.beginPath();
          ctx.arc(x, y + fs, fs, 0, Math.PI);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x + fs, y, fs, Math.PI, 2 * Math.PI);
          ctx.stroke();
        }
      }
      break;
    case 'honeycomb':
      ctx.lineWidth = 1;
      const hr = tile / 3;
      for (let row = 0; row < height / (hr * 1.732) + 2; row++) {
        for (let col = 0; col < width / (hr * 3) + 2; col++) {
          const hx = col * hr * 3 + (row % 2) * hr * 1.5;
          const hy = row * hr * 1.732;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = (i * 60) * Math.PI / 180;
            const px = hx + hr * Math.cos(a);
            const py = hy + hr * Math.sin(a);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      break;
    default:
      if (patternId !== 'none') {
        drawBackgroundPattern(ctx, width, height, 'dots', fgColor, bgColor);
      }
      break;
  }
}
