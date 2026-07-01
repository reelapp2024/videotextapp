/**
 * Pixel comparison utilities for visual regression tests.
 */

/**
 * @param {Uint8ClampedArray | Uint8Array} a
 * @param {Uint8ClampedArray | Uint8Array} b
 */
export function countPixelDiff(a, b) {
  if (a.length !== b.length) {
    return { diffPixels: Math.max(a.length, b.length), totalPixels: Math.max(a.length / 4, b.length / 4), mismatch: true };
  }
  let diffPixels = 0;
  const totalPixels = a.length / 4;
  for (let i = 0; i < a.length; i += 4) {
    if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2] || a[i + 3] !== b[i + 3]) {
      diffPixels++;
    }
  }
  return { diffPixels, totalPixels, mismatch: false };
}

/**
 * @param {Uint8ClampedArray | Uint8Array} a
 * @param {Uint8ClampedArray | Uint8Array} b
 * @param {number} [maxDiffRatio=0]
 */
export function assertPixelParity(a, b, maxDiffRatio = 0) {
  const { diffPixels, totalPixels, mismatch } = countPixelDiff(a, b);
  if (mismatch) {
    throw new Error(`Buffer length mismatch: ${a.length} vs ${b.length}`);
  }
  const ratio = totalPixels > 0 ? diffPixels / totalPixels : 0;
  if (ratio > maxDiffRatio) {
    throw new Error(`Pixel diff ratio ${ratio.toFixed(6)} exceeds max ${maxDiffRatio} (${diffPixels}/${totalPixels} pixels)`);
  }
  return { diffPixels, totalPixels, ratio };
}

/**
 * Simple FNV-1a hash of RGBA buffer for golden snapshots.
 * @param {Uint8ClampedArray | Uint8Array} data
 */
export function hashPixelBuffer(data) {
  let h = 2166136261;
  for (let i = 0; i < data.length; i++) {
    h ^= data[i];
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/**
 * Build RGBA diff image (magenta = different pixels).
 * @param {Uint8ClampedArray | Uint8Array} a
 * @param {Uint8ClampedArray | Uint8Array} b
 * @param {number} width
 * @param {number} height
 */
export function buildDiffImage(a, b, width, height) {
  const out = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < out.length; i += 4) {
    const same = a[i] === b[i] && a[i + 1] === b[i + 1] && a[i + 2] === b[i + 2] && a[i + 3] === b[i + 3];
    if (same) {
      const g = Math.round((a[i] + a[i + 1] + a[i + 2]) / 3 * 0.35);
      out[i] = g;
      out[i + 1] = g;
      out[i + 2] = g;
      out[i + 3] = 255;
    } else {
      out[i] = 255;
      out[i + 1] = 0;
      out[i + 2] = 255;
      out[i + 3] = 255;
    }
  }
  return out;
}
