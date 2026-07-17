import { createGroup, createImage, createRect, createSceneRoot, createText, mergeTransform } from '../types/sceneGraph.js';
import { createAnimationEngine } from '../animation/animationEngine.js';
import { buildRowBasedTextScene, buildStaticLineScene } from './TextRenderer.js';
import { getFontRegistry } from '../assets/fontRegistry.js';
import {
  resolveBoxCornerRadius,
  resolveBoxPadding,
  resolveFontSizePx,
  resolveStrokeWidth,
  resolveTextMaxWidth,
  clampBlockStartY,
  clampTextAnchorX,
  resolveBlockFontScale,
  resolveSafeMarginX,
  resolveSafeMarginY,
} from '../layout/metrics.js';
import { applyTextTransform } from '../layout/applyTextTransform.js';
import { wrapText } from '../layout/wrapText.js';

/**
 * @param {object} bg
 * @param {number} width
 * @param {number} height
 */
export function buildBackgroundScene(bg, width, height) {
  const type = bg?.type || 'solid';
  const children = [];

  if (type === 'solid') {
    children.push(
      createRect({
        x: 0,
        y: 0,
        width,
        height,
        style: { fill: bg?.solidColor || '#000000' },
      }),
    );
  } else if (type === 'gradient') {
    children.push(
      createRect({
        x: 0,
        y: 0,
        width,
        height,
        style: {
          fill: (bg?.gradientColors || ['#1a1a2e', '#16213e'])[0],
        },
      }),
    );
    // Full gradient via overlay rect hack — use group with gradient text pattern on bg layer in future
    // M5: approximate with first color + optional second pass via scene gradient on full-screen text mask
    const colors = bg?.gradientColors || ['#1a1a2e', '#16213e'];
    if (colors.length > 1) {
      children.push(
        createRect({
          x: 0,
          y: height * 0.5,
          width,
          height: height * 0.5,
          style: { fill: colors[colors.length - 1], opacity: 0.85 },
        }),
      );
    }
  } else {
    children.push(
      createRect({ x: 0, y: 0, width, height, style: { fill: '#000000' } }),
    );
  }

  return createGroup({ children });
}

/**
 * Build scene from timeline-like config (M5 subset — rowBased + static overlays).
 * @param {object} params
 * @param {object} params.config
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} [params.videoTime]
 * @param {number} [params.duration]
 * @param {CanvasRenderingContext2D | { measureText: (s: string) => { width: number } }} params.measureCtx
 * @param {string[]} [params.data]
 */
export function buildFrameScene(params) {
  const { config, width, height, videoTime = 0, duration = 10, measureCtx, data } = params;
  const layers = [];

  if (config.background) {
    layers.push(buildBackgroundScene(config.background, width, height));
  } else {
    layers.push(buildBackgroundScene({ type: 'solid', solidColor: '#000000' }, width, height));
  }

  const contentMode = config.contentMode || 'multiColumn';
  const overlays = (config.overlays || []).filter((o) => o?.enabled !== false);
  const overlay = overlays[0];
  if (!overlay) {
    return createSceneRoot(layers);
  }

  if (contentMode === 'rowBased' && Array.isArray(data) && data.length) {
    const textScene = buildRowBasedTextScene({
      overlay,
      rawText: String(data[0] ?? ''),
      width,
      height,
      measureCtx,
    });
    layers.push(textScene);
    return createSceneRoot(layers);
  }

  // Static multi-column single overlay text (M5 parity path)
  const rowText = Array.isArray(data) ? String(data[0] ?? '') : String(config.frameText || 'Sample');
  const text = applyTextTransform(rowText, overlay.textTransform);
  let fontSize = resolveFontSizePx(overlay, width);
  const fontWeight = overlay.fontWeight || 'bold';
  const fontFamily = overlay.fontFamily || 'Arial';
  getFontRegistry().register(fontFamily);

  const letterSpacing = (overlay.letterSpacing || 0) * (fontSize / 20);
  let textMaxWidth = resolveTextMaxWidth(width, overlay, fontSize);
  let lines = wrapText(text, overlay.wordsPerLine, measureCtx, textMaxWidth);
  const lineHeightMultiplier = overlay.lineHeight || 1.4;
  let lineHeight = fontSize * lineHeightMultiplier;
  const boxPadding = resolveBoxPadding(overlay, fontSize);
  const boxRadius = resolveBoxCornerRadius(overlay, fontSize);
  const strokeW = resolveStrokeWidth(overlay, fontSize);
  const padX = Math.max(resolveSafeMarginX(width), boxPadding);
  const padY = Math.max(resolveSafeMarginY(height), boxPadding);

  const blockScale = resolveBlockFontScale(lines.length, lineHeight, height, padY);
  if (blockScale < 1) {
    fontSize = Math.round(fontSize * blockScale);
    textMaxWidth = resolveTextMaxWidth(width, overlay, fontSize);
    lines = wrapText(text, overlay.wordsPerLine, measureCtx, textMaxWidth);
    lineHeight = fontSize * lineHeightMultiplier;
  }

  const totalBlockHeight = lines.length * lineHeight;
  let startY = height * (overlay.positionY / 100) - totalBlockHeight / 2 + lineHeight / 2;
  startY = clampBlockStartY(startY, totalBlockHeight, height, padY);
  const baseX = width * ((overlay.positionX ?? 50) / 100);

  const allWords = lines.flatMap((l) => l.split(' ').filter(Boolean));
  const animEngine = createAnimationEngine({
    overlay,
    baseOverlay: overlay,
    videoTime,
    videoDuration: duration,
    captionWordsFlat: null,
    allWords,
    lines,
    lineAnimEnabled: false,
    revealMode: 'wordByWord',
    contentLineAnimSpeed: 2,
    partStartTime: 0,
    animEffect: 'fadeIn',
  });

  lines.forEach((line, idx) => {
    const yPos = startY + idx * lineHeight;
    const displayLine = line;
    const lineWidthForBox = measureCtx.measureText(displayLine).width;
    const lineAnchorX = clampTextAnchorX(baseX, lineWidthForBox, width, overlay.textAlign, padX);
    const wordStartIdx = lines.slice(0, idx).reduce((s, l) => s + l.split(' ').filter(Boolean).length, 0);

    if (overlay.styleType === 'box') {
      const textWidth = lineWidthForBox;
      let boxX = lineAnchorX - textWidth / 2 - boxPadding;
      if (overlay.textAlign === 'left') boxX = lineAnchorX - boxPadding;
      else if (overlay.textAlign === 'right') boxX = lineAnchorX - textWidth - boxPadding;
      const boxY = yPos - fontSize / 2 - boxPadding / 2;
      const lAnimS = animEngine.getAnimationStyle(wordStartIdx, idx);
      const lKinS = animEngine.getKineticStyle(wordStartIdx, idx);
      const boxAlpha = lAnimS.alpha * lKinS.alpha;
      layers.push(
        createSceneRoot([
          createRect({
            x: boxX + (overlay.boxOffsetX ?? 0) * (width / 100),
            y: boxY + (overlay.boxOffsetY ?? 0) * (height / 100),
            width: textWidth + boxPadding * 2,
            height: fontSize + boxPadding,
            style: {
              fill: overlay.bgColor,
              opacity: (overlay.bgOpacity ?? 1) * boxAlpha,
              radius: boxRadius,
            },
          }),
        ]),
      );
    }

    const lAnimS = animEngine.getAnimationStyle(wordStartIdx, idx);
    const lKinS = animEngine.getKineticStyle(wordStartIdx, idx);
    const lineScene = buildStaticLineScene({
      overlay,
      displayLine,
      lineAnchorX,
      yPos,
      lineWidthForBox,
      fontSize,
      fontWeight,
      fontFamily,
      fillColor: overlay.color || '#ffffff',
      lineAlpha: lAnimS.alpha * lKinS.alpha,
      lScale: lAnimS.scale * lKinS.scale,
      lX: lAnimS.x + lKinS.x,
      lY: lAnimS.y + lKinS.y,
      lR: lAnimS.rotate + lKinS.rotate,
      boxPadding,
      boxRadius,
      strokeW,
      width,
      height,
      letterSpacing,
    });
    layers.push(lineScene);
  });

  // Optional logo / image layer
  if (config.logo?.enabled && config.logo?.imageRef) {
    const logoSize = (config.logo.sizePercent ?? 15) / 100 * width;
    layers.push(
      createGroup({
        children: [
          createImage({
            imageRef: config.logo.imageRef,
            x: (config.logo.x ?? 50) / 100 * width - logoSize / 2,
            y: (config.logo.y ?? 10) / 100 * height,
            width: logoSize,
            height: logoSize,
          }),
        ],
      }),
    );
  }

  return createSceneRoot(layers);
}

/**
 * Pre-built parity scenarios for browser vs server tests.
 * @param {string} scenario
 * @param {{ width?: number, height?: number, videoTime?: number }} [opts]
 */
export function buildParityScenario(scenario, opts = {}) {
  const width = opts.width ?? 540;
  const height = opts.height ?? 960;
  const base = {
    contentMode: 'rowBased',
    background: { type: 'solid', solidColor: '#1a1a2e' },
    overlays: [{
      enabled: true,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: 5,
      color: '#ffffff',
      positionY: 50,
      positionX: 50,
      wordsPerLine: 6,
      textAlign: 'center',
    }],
  };

  const data = ['Hello World'];

  switch (scenario) {
    case 'stroke':
      base.overlays[0].styleType = 'stroke';
      base.overlays[0].strokeColor = '#ff3366';
      base.overlays[0].strokeOpacity = 1;
      data[0] = 'Stroke Text';
      break;
    case 'shadow':
      base.overlays[0].shadowEnabled = true;
      base.overlays[0].shadowColor = '#000000';
      base.overlays[0].shadowBlur = 8;
      base.overlays[0].shadowOffsetX = 4;
      base.overlays[0].shadowOffsetY = 4;
      data[0] = 'Shadow Text';
      break;
    case 'gradient':
      base.contentMode = 'multiColumn';
      base.overlays[0].gradientEnabled = true;
      base.overlays[0].gradientColors = ['#ff6b6b', '#4ecdc4', '#ffe66d'];
      data[0] = 'Gradient';
      break;
    case 'box':
      base.overlays[0].styleType = 'box';
      base.overlays[0].bgColor = '#333333';
      base.overlays[0].bgOpacity = 0.9;
      data[0] = 'Rounded Box';
      break;
    case 'animation':
      base.contentMode = 'multiColumn';
      base.overlays[0].animationPreset = 'fadeIn';
      base.overlays[0].animationStartTime = 0;
      base.overlays[0].animationDuration = 2;
      data[0] = 'Fade In';
      break;
    case 'scale':
      base.contentMode = 'multiColumn';
      base.overlays[0].kineticEffect = 'pulse';
      base.overlays[0].kineticStartTime = 0;
      base.overlays[0].kineticDuration = 2;
      base.overlays[0].kineticLoop = true;
      data[0] = 'Pulse';
      break;
    case 'opacity':
      base.overlays[0].color = 'rgba(255,255,255,0.55)';
      data[0] = 'Opacity';
      break;
    default:
      break;
  }

  return {
    config: base,
    data,
    width,
    height,
    videoTime: opts.videoTime ?? (scenario === 'animation' ? 0.5 : 0),
    duration: 5,
  };
}
