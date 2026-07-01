import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRowBasedTextScene } from '../../src/renderers/TextRenderer.js';
import { createBrowserCanvasAdapter } from '../../src/adapters/browserCanvasAdapter.js';
import { hashPixelBuffer, assertPixelParity } from './pixelDiff.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GOLDEN_PATH = join(__dirname, '..', 'fixtures', 'rowBased-static.golden.hash');

const OVERLAY = {
  enabled: true,
  fontFamily: 'Arial',
  fontWeight: 'bold',
  fontSize: 5,
  color: '#ffffff',
  positionY: 50,
  positionX: 50,
  wordsPerLine: 4,
  textAlign: 'center',
  styleType: 'box',
  bgColor: '#000000',
  bgOpacity: 0.8,
};

async function loadCanvas() {
  try {
    const mod = await import('@napi-rs/canvas');
    return mod.createCanvas;
  } catch {
    return null;
  }
}

function measureCtxFromCanvas(ctx) {
  return {
    measureText(s) {
      return ctx.measureText(s);
    },
  };
}

describe('visual regression — render-core canvas output', () => {
  it('rowBased scene matches golden pixel hash', async (t) => {
    const createCanvas = await loadCanvas();
    if (!createCanvas) {
      t.skip('@napi-rs/canvas not installed — run npm i -D @napi-rs/canvas in packages/render-core');
      return;
    }

    const width = 540;
    const height = 960;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, width, height);

    const scene = buildRowBasedTextScene({
      overlay: OVERLAY,
      rawText: 'Hello render core',
      width,
      height,
      measureCtx: measureCtxFromCanvas(ctx),
    });

    const adapter = createBrowserCanvasAdapter(ctx);
    adapter.drawScene(scene, { width, height });

    const imageData = ctx.getImageData(0, 0, width, height);
    const hash = hashPixelBuffer(imageData.data);

    if (process.env.GENERATE_GOLDEN === '1' || !existsSync(GOLDEN_PATH)) {
      mkdirSync(dirname(GOLDEN_PATH), { recursive: true });
      writeFileSync(GOLDEN_PATH, hash, 'utf8');
    }

    const golden = readFileSync(GOLDEN_PATH, 'utf8').trim();
    assert.equal(hash, golden, 'Pixel hash differs from golden — run with GENERATE_GOLDEN=1 after intentional visual change');
  });

  it('two identical draws produce zero pixel diff', async (t) => {
    const createCanvas = await loadCanvas();
    if (!createCanvas) {
      t.skip('@napi-rs/canvas not installed');
      return;
    }

    const width = 320;
    const height = 180;
    const draw = () => {
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);
      const scene = buildRowBasedTextScene({
        overlay: { ...OVERLAY, styleType: 'stroke', strokeColor: '#ff0000', strokeOpacity: 1 },
        rawText: 'Parity',
        width,
        height,
        measureCtx: measureCtxFromCanvas(ctx),
      });
      createBrowserCanvasAdapter(ctx).drawScene(scene, { width, height });
      return ctx.getImageData(0, 0, width, height).data;
    };

    const a = draw();
    const b = draw();
    const { diffPixels, ratio } = assertPixelParity(a, b, 0);
    assert.equal(diffPixels, 0);
    assert.equal(ratio, 0);
  });
});
