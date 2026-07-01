import {
  createGroup,
  createRect,
  createSceneRoot,
  createText,
  mergeTransform,
} from '../types/sceneGraph.js';
import { getFontRegistry } from '../assets/fontRegistry.js';
import {
  clampBlockStartY,
  clampTextAnchorX,
  resolveBlockFontScale,
  resolveBoxCornerRadius,
  resolveBoxPadding,
  resolveFontSizePx,
  resolveStrokeWidth,
  resolveTextMaxWidth,
} from '../layout/metrics.js';
import { applyTextTransform } from '../layout/applyTextTransform.js';
import { wrapText } from '../layout/wrapText.js';

/**
 * @typedef {Object} MeasureContext
 * @property {(s: string) => { width: number }} measureText
 */

/**
 * Builds scene graph for rowBased static text (matches App.jsx rowBased path).
 * Decorative text-bg / doodles remain outside render-core in M3.
 *
 * @param {object} params
 * @param {object} params.overlay
 * @param {string} params.rawText
 * @param {number} params.width
 * @param {number} params.height
 * @param {MeasureContext} params.measureCtx
 */
export function buildRowBasedTextScene(params) {
  const { overlay: ov, rawText, width, height, measureCtx } = params;
  const fontRegistry = getFontRegistry();
  fontRegistry.register(ov.fontFamily);

  let text = applyTextTransform(rawText, ov.textTransform);
  let fontSize = resolveFontSizePx(ov, width);
  const fontWeight = ov.fontWeight || 'bold';
  const fontFamily = ov.fontFamily || 'Arial';
  const letterSpacing = (ov.letterSpacing || 0) * (fontSize / 20);
  const lineHeightMultiplier = ov.lineHeight || 1.4;
  let textMaxWidth = resolveTextMaxWidth(width, ov, fontSize);
  let lines = wrapText(text, ov.wordsPerLine, measureCtx, textMaxWidth);
  let lineHeight = fontSize * lineHeightMultiplier;
  const boxPadding = resolveBoxPadding(ov, fontSize);
  const boxRadius = resolveBoxCornerRadius(ov, fontSize);
  const strokeW = resolveStrokeWidth(ov, fontSize);
  const pad = Math.max(boxPadding, 8);

  const blockScale = resolveBlockFontScale(lines.length, lineHeight, height, pad);
  if (blockScale < 1) {
    fontSize = Math.round(fontSize * blockScale);
    textMaxWidth = resolveTextMaxWidth(width, ov, fontSize);
    lines = wrapText(text, ov.wordsPerLine, measureCtx, textMaxWidth);
    lineHeight = fontSize * lineHeightMultiplier;
  }

  const totalBlockHeight = lines.length * lineHeight;
  let startY = height * (ov.positionY / 100) - totalBlockHeight / 2 + lineHeight / 2;
  startY = clampBlockStartY(startY, totalBlockHeight, height, pad);
  const posX = ov.positionX ?? 50;
  const baseX = width * (posX / 100);
  const fontCss = fontRegistry.buildFontCss(fontWeight, fontSize, fontFamily);

  const children = [];

  lines.forEach((line, lineIdx) => {
    const y = startY + lineIdx * lineHeight;
    const lineWidth = measureCtx.measureText(line).width + letterSpacing * line.length;
    const lineAnchorX = clampTextAnchorX(baseX, lineWidth, width, ov.textAlign, pad);

    if (ov.styleType === 'box') {
      let bx = lineAnchorX - lineWidth / 2 - boxPadding;
      if (ov.textAlign === 'left') bx = lineAnchorX - boxPadding;
      else if (ov.textAlign === 'right') bx = lineAnchorX - lineWidth - boxPadding;
      const boxOffsetX = (ov.boxOffsetX ?? 0) * (width / 100);
      const boxOffsetY = (ov.boxOffsetY ?? 0) * (height / 100);
      children.push(
        createRect({
          x: bx + boxOffsetX,
          y: y - lineHeight / 2 + boxOffsetY,
          width: lineWidth + boxPadding * 2,
          height: lineHeight,
          style: {
            fill: ov.bgColor || '#000',
            opacity: ov.bgOpacity ?? 0.8,
            radius: boxRadius,
          },
        }),
      );
    }

    const shadow = ov.shadowEnabled
      ? {
          color: ov.shadowColor || '#000',
          blur: ov.shadowBlur || 4,
          offsetX: ov.shadowOffsetX || 2,
          offsetY: ov.shadowOffsetY || 2,
        }
      : undefined;

    const textAlign = ov.textAlign || 'center';
    let textX = lineAnchorX;
    if (textAlign === 'center') textX = lineAnchorX;
    else if (textAlign === 'left') textX = lineAnchorX;
    else if (textAlign === 'right') textX = lineAnchorX;

    children.push(
      createText({
        text: line,
        x: textX,
        y,
        textDrawOrder: 'fillThenStroke',
        style: {
          font: fontCss,
          fill: ov.color || '#FFFFFF',
          textAlign,
          textBaseline: 'middle',
          letterSpacing: letterSpacing > 0.5 ? letterSpacing : 0,
          shadow,
          stroke: ov.styleType === 'stroke' && (ov.strokeOpacity ?? 1) > 0 ? ov.strokeColor || '#000' : undefined,
          strokeWidth: ov.styleType === 'stroke' ? strokeW : undefined,
          strokeOpacity: ov.strokeOpacity ?? 1,
        },
      }),
    );
  });

  return createSceneRoot(children);
}

/**
 * Builds scene graph for one static multi-column line (non word-by-word path).
 *
 * @param {object} params
 * @param {object} params.overlay
 * @param {string} params.displayLine
 * @param {number} params.lineAnchorX
 * @param {number} params.yPos
 * @param {number} params.lineWidthForBox
 * @param {number} params.fontSize
 * @param {string} params.fontWeight
 * @param {string} params.fontFamily
 * @param {string} params.fillColor
 * @param {number} params.lineAlpha
 * @param {number} params.lScale
 * @param {number} params.lX
 * @param {number} params.lY
 * @param {number} params.lR
 * @param {number} params.boxPadding
 * @param {number} params.boxRadius
 * @param {number} params.strokeW
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.letterSpacing
 */
export function buildStaticLineScene(params) {
  const {
    overlay: ov,
    displayLine,
    lineAnchorX,
    yPos,
    lineWidthForBox,
    fontSize,
    fontWeight,
    fontFamily,
    fillColor,
    lineAlpha,
    lScale,
    lX,
    lY,
    lR,
    boxPadding,
    boxRadius,
    strokeW,
    width,
    height,
    letterSpacing,
  } = params;

  const fontRegistry = getFontRegistry();
  const fontCss = fontRegistry.buildFontCss(fontWeight, fontSize, fontFamily);
  const children = [];

  const shadow = ov.shadowEnabled
    ? {
        color: ov.shadowColor || '#000000',
        blur: ov.shadowBlur || 4,
        offsetX: ov.shadowOffsetX || 2,
        offsetY: ov.shadowOffsetY || 2,
      }
    : undefined;

  /** @type {import('../types/sceneGraph.js').SceneNode['style']} */
  const textStyle = {
    font: fontCss,
    fill: fillColor,
    textAlign: ov.textAlign || 'center',
    textBaseline: 'middle',
    letterSpacing: 0,
    shadow,
    stroke: ov.styleType === 'stroke' ? ov.strokeColor : undefined,
    strokeWidth: ov.styleType === 'stroke' ? strokeW : undefined,
    strokeOpacity: ov.strokeOpacity !== undefined ? ov.strokeOpacity : 1,
  };

  if (ov.gradientEnabled && (ov.gradientColors?.length || 0) > 0) {
    const gc = ov.gradientColors || ['#FFFFFF', '#CCCCCC'];
    textStyle.gradient = {
      type: 'linear',
      x0: -lineWidthForBox / 2,
      y0: 0,
      x1: lineWidthForBox / 2,
      y1: 0,
      stops: gc.map((c, i) => ({
        offset: i / Math.max(1, gc.length - 1),
        color: c,
      })),
    };
  }

  children.push(
    createGroup({
      transform: mergeTransform({
        x: lineAnchorX + lX,
        y: yPos + lY,
        scaleX: lScale,
        scaleY: lScale,
        rotation: lR,
        opacity: lineAlpha,
      }),
      children: [
        createText({
          text: displayLine,
          x: 0,
          y: 0,
          textDrawOrder: 'strokeThenFill',
          style: textStyle,
        }),
      ],
    }),
  );

  return createSceneRoot(children);
}
