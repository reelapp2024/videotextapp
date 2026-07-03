/**
 * Shared overlay drawing — browser preview + server renderer (M6).
 */
import { createAnimationEngine } from '../animation/animationEngine.js';
import {
  resolveFontSizePx,
  resolveBoxPadding,
  resolveBoxCornerRadius,
  resolveStrokeWidth,
  resolveTextMaxWidth,
  resolveBlockFontScale,
  clampBlockStartY,
  clampTextAnchorX,
} from '../layout/metrics.js';

/** @param {CanvasRenderingContext2D} ctx @param {number} width @param {number} height @param {unknown} rowData @param {number|null} videoTime @param {number|null} videoDuration @param {object} cfg @param {object} deps */
export function drawOverlaysCore(ctx, width, height, rowData, videoTime = null, videoDuration = null, cfg, deps) {
    const captionTimelineActive =
      cfg.captionSync?.enabled && cfg.captionSync?.segments?.length && videoTime != null;
    let data = rowData;
    let contentMode = cfg.contentMode || 'multiColumn';

    if (contentMode === 'rowBased' && Array.isArray(data) && captionTimelineActive) {
      const capOv =
        cfg.overlays.find((o) => o.enabled && deps.overlayUsesCaptions(o, cfg)) ||
        cfg.overlays.find((o) => o.enabled) ||
        cfg.overlays[0];
      let frameText = '';
      if (cfg._captionFrameCache && videoTime != null) {
        frameText = cfg._captionFrameCache.getCaptionTextAtTime(videoTime);
      } else {
        frameText = capOv
          ? deps.getCaptionLayoutText(cfg.captionSync.segments, videoTime, {
              wordsPerLine: capOv.wordsPerLine ?? 4,
              linesPerFrame: capOv.linesPerFrame ?? 0,
              granularity: cfg.captionSync.granularity || 'line',
            })
          : '';
      }
      data = frameText?.trim() ? [frameText] : [''];
      contentMode = 'multiColumn';
    }

    const textCache = cfg._textLayoutCache;
    const doWrap = (t, wpl, c, mw) => deps.wrapText(t, wpl, c, mw, textCache);

    if (contentMode === 'rowBased' && Array.isArray(data)) {
      const overlay = cfg.overlays.find(o => o.enabled) || cfg.overlays[0];
      if (!overlay) return;

      const parts = data.map(c => String(c ?? '')).filter(t => t.trim());
      if (parts.length === 0) return;

      let frameText = parts[0];
      if (parts.length > 1 && videoTime != null && videoDuration != null && videoDuration > 0) {
        const idx = deps.pickEqualTimePartIndex(parts, videoTime, videoDuration, 'equal');
        frameText = parts[idx];
      }

      if (!frameText || !frameText.trim()) return;

      const fakeRowData = [frameText];
      const savedMode = cfg.contentMode;
      cfg.overlays.forEach((ov, oi) => {
        if (!ov.enabled) return;
        if (oi > 0) return;
        const colIdx = 0;
        const rowText = fakeRowData[colIdx] || '';
        // fall through to normal rendering below with this text
      });
      const ov = overlay;
      const colIdx = 0;
      const rowTextVal = frameText;

      let text = rowTextVal;
      if (ov.textTransform === 'uppercase') text = text.toUpperCase();
      else if (ov.textTransform === 'lowercase') text = text.toLowerCase();
      else if (ov.textTransform === 'capitalize') {
        text = text.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }

      let fontSize = resolveFontSizePx(ov, width);
      const fontWeight = ov.fontWeight || 'bold';
      ctx.font = `${fontWeight} ${fontSize}px ${ov.fontFamily}`;
      ctx.textAlign = ov.textAlign || 'center';
      ctx.textBaseline = 'middle';
      const letterSpacing = (ov.letterSpacing || 0) * (fontSize / 20);
      let textMaxWidth = resolveTextMaxWidth(width, ov, fontSize);
      let lines = doWrap(text, ov.wordsPerLine, ctx, textMaxWidth);
      const lineHeightMultiplier = ov.lineHeight || 1.4;
      let lineHeight = fontSize * lineHeightMultiplier;
      const boxPadding = resolveBoxPadding(ov, fontSize);
      const boxRadius = resolveBoxCornerRadius(ov, fontSize);
      const strokeW = resolveStrokeWidth(ov, fontSize);
      const pad = Math.max(boxPadding, 8);
      const blockScale = resolveBlockFontScale(lines.length, lineHeight, height, pad);
      if (blockScale < 1) {
        fontSize = Math.round(fontSize * blockScale);
        ctx.font = `${fontWeight} ${fontSize}px ${ov.fontFamily}`;
        textMaxWidth = resolveTextMaxWidth(width, ov, fontSize);
        lines = doWrap(text, ov.wordsPerLine, ctx, textMaxWidth);
        lineHeight = fontSize * lineHeightMultiplier;
      }
      const totalBlockHeight = lines.length * lineHeight;
      let startY = (height * (ov.positionY / 100)) - (totalBlockHeight / 2) + (lineHeight / 2);
      startY = clampBlockStartY(startY, totalBlockHeight, height, pad);
      const posX = ov.positionX ?? 50;
      let baseX = width * (posX / 100);

      if (ov.textBgEnabled && !cfg._staticLayers?.decorative) {
        try {
          const tbgCategory = ov.textBgCategory || 'gradient';
          const tbgPatternId = ov.textBgPatternId || '';
          let patternObj = null;
          if (tbgPatternId && deps.TEXT_BG_PATTERNS[tbgCategory]) {
            patternObj = deps.TEXT_BG_PATTERNS[tbgCategory].find(p => p.id === tbgPatternId);
          }
          if (!patternObj && deps.TEXT_BG_PATTERNS[tbgCategory] && deps.TEXT_BG_PATTERNS[tbgCategory].length > 0) {
            patternObj = deps.TEXT_BG_PATTERNS[tbgCategory][0];
          }
          if (patternObj) {
            ctx.save();
            ctx.globalAlpha = ov.textBgOpacity ?? 0.85;
            deps.drawTextBgPattern(ctx, 0, 0, width, height, patternObj, 0);
            ctx.restore();
            if (ov.doodleEnabled) {
              const doodleCat = ov.doodleCategory || 'star_sparkle';
              const doodleItems = deps.DOODLE_LIBRARY[doodleCat] || deps.DOODLE_LIBRARY.star_sparkle;
              const dSize = ov.doodleSize ?? Math.round(fontSize * 0.8);
              const dOpacity = ov.doodleOpacity ?? 0.7;
              const dAnim = ov.doodleAnimation || 'none';
              deps.drawDoodlesOnArea(ctx, 0, 0, width, height, doodleItems, ov.doodleLogic || 'scatter', videoTime ?? 0, dAnim, dSize, dOpacity);
            }
          }
        } catch (_) {}
      }


      lines.forEach((line, lineIdx) => {
        const y = startY + lineIdx * lineHeight;
        if (ov.shadowEnabled) {
          ctx.shadowColor = ov.shadowColor || '#000';
          ctx.shadowBlur = ov.shadowBlur || 4;
          ctx.shadowOffsetX = ov.shadowOffsetX || 2;
          ctx.shadowOffsetY = ov.shadowOffsetY || 2;
        } else {
          ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
        }
        ctx.font = `${fontWeight} ${fontSize}px ${ov.fontFamily}`;
        const lineAnchorX = clampTextAnchorX(
          baseX,
          ctx.measureText(line).width + letterSpacing * line.length,
          width,
          ov.textAlign,
          pad,
        );
        if (ov.styleType === 'box') {
          const tw = ctx.measureText(line).width + letterSpacing * line.length;
          let bx = lineAnchorX - tw / 2 - boxPadding;
          if (ov.textAlign === 'left') bx = lineAnchorX - boxPadding;
          else if (ov.textAlign === 'right') bx = lineAnchorX - tw - boxPadding;
          ctx.save();
          ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
          ctx.fillStyle = ov.bgColor || '#000';
          ctx.globalAlpha = ov.bgOpacity ?? 0.8;
          ctx.beginPath();
          const r = boxRadius;
          const bw = tw + boxPadding * 2, bh = lineHeight;
          const by = y - lineHeight / 2;
          const boxOffsetX = (ov.boxOffsetX ?? 0) * (width / 100);
          const boxOffsetY = (ov.boxOffsetY ?? 0) * (height / 100);
          const bxf = bx + boxOffsetX;
          const byf = by + boxOffsetY;
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(bxf, byf, bw, bh, r);
          } else {
            ctx.moveTo(bxf + r, byf); ctx.arcTo(bxf + bw, byf, bxf + bw, byf + bh, r);
            ctx.arcTo(bxf + bw, byf + bh, bxf, byf + bh, r); ctx.arcTo(bxf, byf + bh, bxf, byf, r);
            ctx.arcTo(bxf, byf, bxf + bw, byf, r);
          }
          ctx.fill();
          ctx.restore();
        }
        ctx.fillStyle = ov.color || '#FFFFFF';
        ctx.globalAlpha = 1;
        if (letterSpacing > 0.5) {
          let cx = ov.textAlign === 'left' ? lineAnchorX : ov.textAlign === 'right' ? lineAnchorX - ctx.measureText(line).width - letterSpacing * line.length : lineAnchorX - (ctx.measureText(line).width + letterSpacing * line.length) / 2;
          for (const ch of line) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + letterSpacing; }
        } else {
          ctx.fillText(line, lineAnchorX, y);
        }
        if (ov.styleType === 'stroke' && ov.strokeOpacity > 0) {
          ctx.strokeStyle = ov.strokeColor || '#000';
          ctx.lineWidth = strokeW;
          ctx.lineJoin = 'round';
          ctx.globalAlpha = ov.strokeOpacity ?? 1;
          ctx.strokeText(line, lineAnchorX, y);
          ctx.globalAlpha = 1;
        }
      });
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
      return;
    }

    (cfg.overlays || []).forEach((baseOverlay) => {
      if (!baseOverlay.enabled) return;
      let overlay = deps.resolveOverlayWithCaptionPreset(baseOverlay);
      const overlayCfg = deps.resolveConfigForCaptionPreset(cfg, baseOverlay);
      if (overlayCfg.contentMode === 'singleColumn' && overlay.id !== (overlayCfg.singleColumnIndex ?? 0)) return;

      const colIdx = overlay.excelColumnIndex ?? overlay.id;
      let rowText = data[colIdx] != null ? String(data[colIdx]) : '';
      const overlayCaptionActive =
        overlayCfg.captionSync?.enabled && overlayCfg.captionSync?.segments?.length && videoTime != null;
      const useContentAutoBreak = overlay.contentTextSectionEnabled ?? false;
      if (overlayCaptionActive && deps.overlayUsesCaptions(baseOverlay, overlayCfg)) {
        if (useContentAutoBreak) {
          rowText = deps.buildFullCaptionScript(overlayCfg.captionSync.segments);
        } else if (overlayCfg._captionFrameCache && videoTime != null) {
          rowText = overlayCfg._captionFrameCache.getCaptionTextAtTime(videoTime);
        } else {
          rowText = deps.getCaptionLayoutText(overlayCfg.captionSync.segments, videoTime, {
            wordsPerLine: overlay.wordsPerLine ?? 4,
            linesPerFrame: overlay.linesPerFrame ?? 0,
            granularity: overlayCfg.captionSync.granularity || 'line',
          });
        }
      } else if (overlayCaptionActive && overlayCfg.textSource === 'captions') {
        rowText = '';
      }
      let text = null;
      let fullTextForSync = null;
      let partIndex = 0;
      let partStartTime = 0;
      let contentParts = [];

      const getPartIndexFromCaptionTiming = (parts, segments, time, holdAfterOverride) => {
        if (time == null || !parts?.length || !segments?.length) return null;
        const holdAfter = holdAfterOverride || overlay.contentPartHoldAfter || [];
        const firstStart = Number(segments[0].start ?? 0);
        if (time < firstStart) return { partIndex: -1, partStartTime: null };

        if (parts.length === segments.length) {
          for (let i = 0; i < segments.length; i++) {
            const start = Number(segments[i].start ?? 0);
            const end = Number(segments[i].end ?? start);
            const hold = Number(holdAfter[i] ?? 0);
            if (time >= start && time < end + hold) {
              return { partIndex: i, partStartTime: start };
            }
            if (i < segments.length - 1) {
              const nextStart = Number(segments[i + 1].start ?? end);
              if (time >= end + hold && time < nextStart) {
                return { partIndex: -1, partStartTime: null };
              }
            }
          }
          const last = segments.length - 1;
          return { partIndex: last, partStartTime: Number(segments[last].start ?? 0) };
        }

        const totalStart = Number(segments[0].start ?? 0);
        const totalEnd = Number(segments[segments.length - 1].end ?? totalStart);
        const span = Math.max(0.05, totalEnd - totalStart);
        const weights = parts.map((p) => Math.max(1, String(p).trim().length));
        const sum = weights.reduce((a, b) => a + b, 0);
        let cursor = totalStart;
        for (let i = 0; i < parts.length; i++) {
          const slice = (weights[i] / sum) * span;
          const end = cursor + slice;
          const hold = Number(holdAfter[i] ?? 0);
          if (time < end + hold) return { partIndex: i, partStartTime: cursor };
          cursor = end + hold;
        }
        return { partIndex: parts.length - 1, partStartTime: cursor };
      };

      const getPartIndexFromDurations = (parts, durations, time, totDuration, overrides) => {
        const dur = durations || overlay.contentPartDurations || [];
        const holdAfter = overrides?.holdAfterOverride || overlay.contentPartHoldAfter || [];
        const lineAnim = overrides?.lineAnimOverride || overlay.contentPartLineAnimate || [];
        const revealModeOverride = overrides?.revealModeOverride || null;
        const animSpeedOverride = overrides?.animSpeedOverride || null;
        if (dur.length > 0 && time != null && time >= 0 && parts.length > 0) {
          let cumul = 0;
          const defaultSec = 5;
          const defaultHold = 0;
          for (let i = 0; i < parts.length; i++) {
            const animSpeed = Math.max(0.1, animSpeedOverride?.[i] ?? overlay.contentPartLineAnimSpeed?.[i] ?? overlay.contentLineAnimSpeed ?? 2);
            let d = (dur[i] != null && dur[i] >= 0.1 && dur[i] <= 20) ? Number(dur[i]) : defaultSec;
            if (lineAnim[i]) {
              const mode = revealModeOverride?.[i] || overlay.contentPartLineRevealMode?.[i] || overlay.contentLineRevealMode || 'wordByWord';
              const isCharAnim = mode === 'characterByChar';
              const isLineByLine = mode === 'lineByLine';
              const isFrameByFrame = mode === 'frameByFrame';
              const wordCount = parts[i].split(/\s+/).filter(Boolean).length;
              const lineCount = Math.max(1, Math.ceil(wordCount / (overlay.wordsPerLine || 4)));
              const minTimeForAnim = isCharAnim ? (parts[i].length / animSpeed) : isLineByLine ? (lineCount / animSpeed) : isFrameByFrame ? (1 / animSpeed) : (wordCount / animSpeed);
              d = Math.max(d, minTimeForAnim);
            }
            const h = (holdAfter[i] != null && holdAfter[i] >= 0 && holdAfter[i] <= 30) ? Number(holdAfter[i]) : defaultHold;
            if (time < cumul + d) return { partIndex: i, partStartTime: cumul };
            if (time < cumul + d + h) return { partIndex: -1, partStartTime: null };
            cumul += d + h;
          }
          const lastIdx = Math.max(0, parts.length - 1);
          const lastAnimSpeed = Math.max(0.1, animSpeedOverride?.[lastIdx] ?? overlay.contentPartLineAnimSpeed?.[lastIdx] ?? overlay.contentLineAnimSpeed ?? 2);
          let lastD = (dur[lastIdx] != null && dur[lastIdx] >= 0.1 && dur[lastIdx] <= 20) ? Number(dur[lastIdx]) : defaultSec;
          if (lineAnim[lastIdx]) {
            const mode = revealModeOverride?.[lastIdx] || overlay.contentPartLineRevealMode?.[lastIdx] || overlay.contentLineRevealMode || 'wordByWord';
            const isCharAnim = mode === 'characterByChar';
            const isLineByLine = mode === 'lineByLine';
            const isFrameByFrame = mode === 'frameByFrame';
            const wordCount = parts[lastIdx].split(/\s+/).filter(Boolean).length;
            const lineCount = Math.max(1, Math.ceil(wordCount / (overlay.wordsPerLine || 4)));
            const minT = isCharAnim ? (parts[lastIdx].length / lastAnimSpeed) : isLineByLine ? (lineCount / lastAnimSpeed) : isFrameByFrame ? (1 / lastAnimSpeed) : (wordCount / lastAnimSpeed);
            lastD = Math.max(lastD, minT);
          }
          const lastH = (holdAfter[lastIdx] != null && holdAfter[lastIdx] >= 0 && holdAfter[lastIdx] <= 30) ? Number(holdAfter[lastIdx]) : defaultHold;
          return { partIndex: lastIdx, partStartTime: cumul - lastD - lastH };
        }
        if (parts.length > 1 && time != null && totDuration != null && totDuration > 0) {
          const idx = Math.max(0, Math.min(Math.floor((time / totDuration) * parts.length), parts.length - 1));
          const tPerPart = totDuration / parts.length;
          return { partIndex: idx, partStartTime: idx * tPerPart };
        }
        return { partIndex: 0, partStartTime: 0 };
      };

      let resolvedLineAnimate = overlay.contentPartLineAnimate || [];
      let resolvedRevealModes = overlay.contentPartLineRevealMode || [];
      let resolvedAnimTypes = overlay.contentPartLineAnimType || [];
      let resolvedAnimSpeeds = overlay.contentPartLineAnimSpeed || [];

      const skipContentPartsForCaptions =
        overlayCaptionActive && deps.overlayUsesCaptions(baseOverlay, overlayCfg) && !useContentAutoBreak;
      if (useContentAutoBreak && rowText && !skipContentPartsForCaptions) {
        try {
          const marks = (overlay.punctuationBreakMarks || []).filter(m => m && String(m).trim());
          const customBreak = (overlay.customBreakText || '').trim();
          const allBreaks = [...marks];
          if (customBreak) {
            customBreak.split(/\s+/).forEach(b => { if (b && !allBreaks.includes(b)) allBreaks.push(b); });
          }
          let rawParts = [];
          const segLines = (overlayCfg.captionSync?.segments || [])
            .map((s) => String(s.text ?? '').trim())
            .filter(Boolean);
          if (allBreaks.length > 0) {
            const pattern = allBreaks.map(m => String(m).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
            const regex = new RegExp(`(${pattern})`, 'g');
            rawParts = rowText.replace(regex, '$1\n').split('\n').map(p => p.trim()).filter(p => p);
          } else if (segLines.length > 0 && overlayCaptionActive && deps.overlayUsesCaptions(baseOverlay, overlayCfg)) {
            rawParts = segLines;
            if (!overlay.contentPartDurations?.length || overlay.contentPartDurations.length !== segLines.length) {
              overlay = {
                ...overlay,
                contentPartDurations: segLines.map((_, i) => {
                  const seg = overlayCfg.captionSync.segments[i];
                  return Math.max(0.08, (seg?.end ?? 0) - (seg?.start ?? 0));
                }),
              };
            }
          } else {
            rawParts = [rowText];
          }

          const sameFrameArr = overlay.contentPartSameFrame || [];
          const groups = [];
          rawParts.forEach((p, i) => {
            if (i > 0 && sameFrameArr[i]) {
              groups[groups.length - 1].parts.push(p);
              groups[groups.length - 1].indices.push(i);
            } else {
              groups.push({ parts: [p], indices: [i] });
            }
          });

          contentParts = groups.map(g => g.parts.join('\n'));
          const groupDurations = groups.map(g => {
            const fi = g.indices[0];
            return overlay.contentPartDurations?.[fi];
          });
          const groupHoldAfter = groups.map(g => {
            const li = g.indices[g.indices.length - 1];
            return overlay.contentPartHoldAfter?.[li];
          });
          const groupLineAnimate = groups.map(g => {
            return g.indices.some(i => overlay.contentPartLineAnimate?.[i]);
          });
          const groupRevealModes = groups.map(g => {
            const fi = g.indices[0];
            return overlay.contentPartLineRevealMode?.[fi] || overlay.contentLineRevealMode || 'wordByWord';
          });
          const groupAnimTypes = groups.map(g => {
            const fi = g.indices[0];
            return overlay.contentPartLineAnimType?.[fi] || overlay.contentLineAnimType || 'fadeIn';
          });
          const groupAnimSpeeds = groups.map(g => {
            const fi = g.indices[0];
            return overlay.contentPartLineAnimSpeed?.[fi] ?? overlay.contentLineAnimSpeed ?? 2;
          });
          resolvedLineAnimate = groupLineAnimate;
          resolvedRevealModes = groupRevealModes;
          resolvedAnimTypes = groupAnimTypes;
          resolvedAnimSpeeds = groupAnimSpeeds;

            fullTextForSync = overlayCaptionActive && deps.overlayUsesCaptions(baseOverlay, overlayCfg)
              ? deps.buildFullCaptionScript(overlayCfg.captionSync.segments)
              : contentParts.join(' ');
          if (contentParts.length > 0 && videoTime != null) {
            const captionSegments = overlayCaptionActive && deps.overlayUsesCaptions(baseOverlay, overlayCfg)
              ? overlayCfg.captionSync.segments
              : null;
            const captionRes = captionSegments?.length
              ? getPartIndexFromCaptionTiming(contentParts, captionSegments, videoTime, groupHoldAfter)
              : null;
            const res = captionRes || getPartIndexFromDurations(contentParts, groupDurations, videoTime, videoDuration,
              {
                holdAfterOverride: groupHoldAfter,
                lineAnimOverride: groupLineAnimate,
                revealModeOverride: groupRevealModes,
                animSpeedOverride: groupAnimSpeeds,
              });
            partIndex = res.partIndex;
            partStartTime = res.partStartTime ?? 0;
            if (partIndex === -1) {
              text = '';
            } else if (
              captionSegments?.length
              && contentParts.length === captionSegments.length
              && partIndex >= 0
              && partIndex < captionSegments.length
            ) {
              const seg = captionSegments[partIndex];
              const segStart = Number(seg?.start ?? 0);
              if (videoTime < segStart) {
                text = '';
              } else {
                const segSynced = deps.getCaptionLayoutText([seg], videoTime, {
                  wordsPerLine: overlay.wordsPerLine ?? 4,
                  linesPerFrame: overlay.linesPerFrame ?? 0,
                  granularity: overlayCfg.captionSync.granularity || 'line',
                });
                text = segSynced || contentParts[partIndex];
              }
            } else {
              text = contentParts[partIndex];
            }
            } else if (contentParts.length > 0) {
              text = contentParts[0];
          } else {
            text = rowText;
            contentParts = [rowText];
            fullTextForSync = rowText;
          }
        } catch (e) {
          text = rowText;
          contentParts = [rowText];
          fullTextForSync = rowText;
        }
      } else {
        text = rowText;
        contentParts = rowText ? [rowText] : [];
        fullTextForSync = overlayCaptionActive && deps.overlayUsesCaptions(baseOverlay, overlayCfg)
          ? deps.buildFullCaptionScript(overlayCfg.captionSync.segments)
          : rowText;
      }

      if (!text || String(text).trim() === '') return;

      if (partIndex >= 0 && overlay.contentPartLineStyleOverrides?.[partIndex]) {
        overlay = {
          ...overlay,
          ...overlay.contentPartLineStyleOverrides[partIndex],
        };
      }
      
      // Apply text transform
      text = text.toString();
      if (overlay.textTransform === 'uppercase') text = text.toUpperCase();
      else if (overlay.textTransform === 'lowercase') text = text.toLowerCase();
      else if (overlay.textTransform === 'capitalize') {
        text = text.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }
      if (fullTextForSync) {
        fullTextForSync = fullTextForSync.toString();
        if (overlay.textTransform === 'uppercase') fullTextForSync = fullTextForSync.toUpperCase();
        else if (overlay.textTransform === 'lowercase') fullTextForSync = fullTextForSync.toLowerCase();
        else if (overlay.textTransform === 'capitalize') {
          fullTextForSync = fullTextForSync.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        }
      }

      let fontSize = resolveFontSizePx(overlay, width);
      const fontWeight = overlay.fontWeight || 'bold';
      ctx.font = `${fontWeight} ${fontSize}px ${overlay.fontFamily}`;
      ctx.textAlign = overlay.textAlign || 'center';
      ctx.textBaseline = 'middle';
      
      // Apply letter spacing (approximate with character-by-character rendering for large spacing)
      const letterSpacing = (overlay.letterSpacing || 0) * (fontSize / 20);

      let textMaxWidth = resolveTextMaxWidth(width, overlay, fontSize);
      let lines = doWrap(text, overlay.wordsPerLine, ctx, textMaxWidth);
      const linesPerFrame = overlay.linesPerFrame ?? 0;
      if (linesPerFrame > 0 && lines.length > linesPerFrame) {
        if (captionTimelineActive && deps.overlayUsesCaptions(overlay, cfg)) {
          lines = lines.slice(-linesPerFrame);
        } else if (videoTime != null && videoDuration != null && videoDuration > 0) {
          const totalChunks = Math.ceil(lines.length / linesPerFrame);
          const chunkIndex = Math.min(
            Math.floor((videoTime / videoDuration) * totalChunks),
            totalChunks - 1
          );
          const startIdx = chunkIndex * linesPerFrame;
          lines = lines.slice(startIdx, startIdx + linesPerFrame);
        } else {
          lines = lines.slice(0, linesPerFrame);
        }
      }
      const lineHeightMultiplier = overlay.lineHeight || 1.4;
      let lineHeight = fontSize * lineHeightMultiplier;
      const boxPadding = resolveBoxPadding(overlay, fontSize);
      const boxRadius = resolveBoxCornerRadius(overlay, fontSize);
      const strokeW = resolveStrokeWidth(overlay, fontSize);
      const pad = Math.max(boxPadding, 8);
      const blockScale = resolveBlockFontScale(lines.length, lineHeight, height, pad);
      if (blockScale < 1) {
        fontSize = Math.round(fontSize * blockScale);
        ctx.font = `${fontWeight} ${fontSize}px ${overlay.fontFamily}`;
        textMaxWidth = resolveTextMaxWidth(width, overlay, fontSize);
        lines = doWrap(text, overlay.wordsPerLine, ctx, textMaxWidth);
        lineHeight = fontSize * lineHeightMultiplier;
      }

      const totalBlockHeight = lines.length * lineHeight;
      let startY = (height * (overlay.positionY / 100)) - (totalBlockHeight / 2) + (lineHeight / 2);
      startY = clampBlockStartY(startY, totalBlockHeight, height, pad);

      const posX = overlay.positionX ?? 50;
      let baseX = width * (posX / 100);

      const allWords = lines.flatMap(l => l.split(' ').filter(Boolean));
      const overlayOnCaptions = overlayCaptionActive && deps.overlayUsesCaptions(baseOverlay, overlayCfg);
      const captionWordsFlat =
        overlayOnCaptions && overlayCfg.captionSync?.segments?.length
          ? deps.flattenCaptionWords(overlayCfg.captionSync.segments)
          : null;

      // Full-canvas background pattern + doodles (drawn before text)
      if (overlay.textBgEnabled && !cfg._staticLayers?.decorative) {
        try {
          const tbgLogic = overlay.textBgLogic || 'perFrame';
          let patternObj = null;
          const tbgCategory = overlay.textBgCategory || 'gradient';
          const tbgPatternId = overlay.textBgPatternId || '';
          if (tbgPatternId && deps.TEXT_BG_PATTERNS[tbgCategory]) {
            patternObj = deps.TEXT_BG_PATTERNS[tbgCategory].find(p => p.id === tbgPatternId);
          }
          if (!patternObj && tbgLogic === 'intentBased') {
            const detectedIntent = deps.getIntentFromText(rowText || '');
            if (detectedIntent) {
              const bgKey = deps.getTextBgForIntent(detectedIntent);
              const [cat, pid] = bgKey.split(':');
              if (deps.TEXT_BG_PATTERNS[cat]) patternObj = deps.TEXT_BG_PATTERNS[cat].find(p => p.id === pid);
            }
          }
          if (!patternObj && deps.TEXT_BG_PATTERNS[tbgCategory] && deps.TEXT_BG_PATTERNS[tbgCategory].length > 0) {
            const overlayIdx = overlay.id ?? 0;
            if (tbgLogic === 'perLine') patternObj = deps.TEXT_BG_PATTERNS[tbgCategory][overlayIdx % deps.TEXT_BG_PATTERNS[tbgCategory].length];
            else if (tbgLogic === 'random') patternObj = deps.TEXT_BG_PATTERNS[tbgCategory][((overlayIdx * 7919 + 31) >>> 0) % deps.TEXT_BG_PATTERNS[tbgCategory].length];
            else if (tbgLogic === 'cycle') patternObj = deps.TEXT_BG_PATTERNS[tbgCategory][overlayIdx % deps.TEXT_BG_PATTERNS[tbgCategory].length];
            else patternObj = deps.TEXT_BG_PATTERNS[tbgCategory][0];
          }
          if (patternObj) {
            ctx.save();
            ctx.globalAlpha = overlay.textBgOpacity ?? 0.85;
            deps.drawTextBgPattern(ctx, 0, 0, width, height, patternObj, 0);
            ctx.restore();

            if (overlay.doodleEnabled) {
              const doodleCat = overlay.doodleCategory || 'star_sparkle';
              let doodleItems = deps.DOODLE_LIBRARY[doodleCat] || deps.DOODLE_LIBRARY.star_sparkle;
              const dLogic = overlay.doodleLogic || 'scatter';
              if (dLogic === 'intentBased') {
                const di = deps.getIntentFromText(rowText || '');
                if (di) {
                  const dc = deps.getDoodleCategoryForIntent(di);
                  doodleItems = deps.DOODLE_LIBRARY[dc] || doodleItems;
                }
              }
              const dSize = overlay.doodleSize ?? Math.round(fontSize * 0.8);
              const dOpacity = overlay.doodleOpacity ?? 0.7;
              const dAnim = overlay.doodleAnimation || 'none';
              const vt = videoTime ?? 0;
              deps.drawDoodlesOnArea(ctx, 0, 0, width, height, doodleItems, dLogic, vt, dAnim, dSize, dOpacity);
            }
          }
        } catch (_) {}
      }

      const getWordStyle = (gIdx, baseStyle) => {
        const overrides = overlay.wordOverrides || {};
        const wordOverride = overrides[gIdx] || {};
        return { ...baseStyle, ...wordOverride };
      };

      const getLineStyle = (idx, baseStyle) => {
        const overrides = overlay.lineOverrides || {};
        const lineOverride = overrides[idx] || {};
        return { ...baseStyle, ...lineOverride };
      };

      const wordHighlightEnabled = overlay.wordHighlightEnabled;
      const wordHighlightMode = overlay.wordHighlightMode || 'voiceSync'; // 'voiceSync' | 'fixedPerLine'
      const wordHighlightScale = Math.max(1, Math.min(2.5, overlay.wordHighlightScale ?? 1.3));
      const wordHighlightSpeed = Math.max(0.5, Math.min(2, overlay.wordHighlightSpeed ?? 1));
      const wordHighlightLineOpt = overlay.wordHighlightLineOpt ?? '2'; // '1','2',..'8','last','random','everyTwo',etc
      let activeWordIndexGlobal = -1; // index in FULL script (for voice sync)
      let partStartWordIdx = 0;       // word index where current displayed part starts in full script
      const hasVideoTime = videoTime != null && videoDuration != null && videoDuration > 0;
      if (wordHighlightEnabled && allWords.length > 0) {
        if (wordHighlightMode === 'voiceSync' && hasVideoTime) {
          if (overlayCfg.captionSync?.enabled && overlayCfg.captionSync?.segments?.length) {
            activeWordIndexGlobal = deps.getActiveCaptionWordGlobalIndex(overlayCfg.captionSync.segments, videoTime)
            partStartWordIdx = 0
          } else if (fullTextForSync) {
            const fullWordsForSync = fullTextForSync.split(/\s+/).filter(Boolean);
            if (fullWordsForSync.length > 0) {
              const totalChars = fullWordsForSync.reduce((s, w) => s + w.length, 0);
              const progress = Math.min(1, (videoTime / videoDuration) * wordHighlightSpeed);
              if (totalChars > 0) {
                let cumul = 0;
                for (let i = 0; i < fullWordsForSync.length; i++) {
                  cumul += fullWordsForSync[i].length;
                  if (cumul / totalChars >= progress) { activeWordIndexGlobal = i; break; }
                  if (i === fullWordsForSync.length - 1) activeWordIndexGlobal = i;
                }
              } else {
                activeWordIndexGlobal = Math.min(Math.floor(progress * fullWordsForSync.length), fullWordsForSync.length - 1);
              }
              for (let p = 0; p < partIndex && p < contentParts.length; p++) {
                partStartWordIdx += contentParts[p].split(/\s+/).filter(Boolean).length;
              }
            }
          }
        }
      }
      const activePartIdx = partIndex >= 0 ? partIndex : 0;
      const activeRevealMode = resolvedRevealModes?.[activePartIdx] || overlay.contentLineRevealMode;
      const activeAnimType = resolvedAnimTypes?.[activePartIdx] || overlay.contentLineAnimType;
      const contentLineAnimSpeed = Math.max(0.1, resolvedAnimSpeeds?.[activePartIdx] ?? overlay.contentLineAnimSpeed ?? 2);
      const revealMode = activeRevealMode || (['characterByChar','wordByWord','lineByLine','frameByFrame'].includes(activeAnimType) ? (activeAnimType === 'typewriter' || activeAnimType === 'charByChar' ? 'characterByChar' : activeAnimType) : 'wordByWord');
      const animEffect = deps.LINE_ANIM_EFFECTS.some(e => e.id === activeAnimType) ? activeAnimType : 'fadeIn';
      const lineAnimEnabled = (overlay.contentTextSectionEnabled ?? false) && partIndex >= 0 && (resolvedLineAnimate[partIndex] ?? false);

      const {
        getAnimationStyle,
        getKineticStyle,
        getLineAnimStyleForWord,
        DEF_STYLE,
        HIDDEN_STYLE,
      } = createAnimationEngine({
        overlay,
        baseOverlay,
        videoTime,
        videoDuration,
        captionWordsFlat,
        allWords,
        lines,
        lineAnimEnabled,
        revealMode,
        contentLineAnimSpeed,
        partStartTime,
        animEffect,
      });

      const useWordByWord = (overlay.colorLogic && overlay.colorLogic !== 'none') || ((overlay.iconSectionEnabled ?? false) && overlay.iconLogic && overlay.iconLogic !== 'none') || (overlay.fontChangeLogic && overlay.fontChangeLogic !== 'none') || (overlay.animationLogic && overlay.animationLogic !== 'default') || wordHighlightEnabled || lineAnimEnabled || overlay.wordSizeLogic || overlay.wordLayoutLogic || overlay.wordDimInactive;
      const shouldShowIconForWord = (globalIdx, wordIdxInLine, lineIdx, totalWords) => {
        if (!(overlay.iconSectionEnabled ?? false)) return false;
        const logic = overlay.iconLogic || 'none';
        if (!logic || logic === 'none') return false;
        if (logic === 'perWord') return true;
        if (logic === 'firstWord') return globalIdx === 0;
        if (logic === 'lastWord') return globalIdx === totalWords - 1;
        if (logic === 'perLine') return wordIdxInLine === 0;
        if (logic === 'everyTwo') return globalIdx % 2 === 0;
        if (logic === 'everyThree') return globalIdx % 3 === 0;
        if (logic === 'oddEven') return globalIdx % 2 === 0;
        if (logic === 'segment') return globalIdx % 4 === 0;
        if (logic === 'random') return ((globalIdx * 7919 + lineIdx * 131) % 100) < 40;
        if (logic === 'emphasis') return globalIdx === Math.floor(totalWords / 2);
        if (logic === 'phrase') return wordIdxInLine === 0;
        if (logic === 'sentence') return globalIdx === 0 || globalIdx === totalWords - 1;
        if (logic === 'center') {
          const wordsInLine = lines[lineIdx]?.split(' ').filter(Boolean).length || 1;
          return wordIdxInLine === Math.floor((wordsInLine - 1) / 2);
        }
        if (logic === 'alternate') return globalIdx % 2 === 1;
        if (logic === 'stagger') return (lineIdx % 2 === 0) ? wordIdxInLine === 0 : wordIdxInLine === (lines[lineIdx]?.split(' ').filter(Boolean).length || 1) - 1;
        if (logic === 'cascade') return wordIdxInLine <= lineIdx;
        if (logic === 'syncVoice') return true;
        if (logic === 'syncBeat') return globalIdx % 2 === 0;
        if (logic === 'timeBased') return globalIdx % 3 === 0;
        if (logic === 'mixed') return ((globalIdx * 2654435761) >>> 0) % 3 === 0;
        return false;
      };

      const presetSizeForWord = (wi, lineWordCount, gIdx, isActiveWord) => {
        if (!overlay.wordSizeLogic) return 1;
        if (overlay.wordSizeLogic === 'tinyRest') return isActiveWord ? 1 : 0.48;
        return deps.getWordSizeScale(overlay.wordSizeLogic, wi, lineWordCount, gIdx);
      };

      let charOffsetAcc = 0;
      lines.forEach((line, idx) => {
        const yPos = startY + (idx * lineHeight);
        const words = line.split(' ').filter(Boolean);
        const wordStartIdx = lines.slice(0, idx).reduce((s, l) => s + l.split(' ').filter(Boolean).length, 0);
        const globalWordIdxFor = (wi) => {
          const gIdx = wordStartIdx + wi;
          if (overlayOnCaptions && overlayCfg.captionSync?.segments?.length) {
            return deps.getDisplayedWordGlobalIndex(
              overlayCfg.captionSync.segments,
              videoTime,
              idx,
              wi,
              lines,
              overlay.wordsPerLine ?? 4,
              overlay.linesPerFrame ?? 0,
              overlayCfg.captionSync.granularity || 'line'
            );
          }
          return partStartWordIdx + gIdx;
        };
        
        // Apply letter spacing to line
        let displayLine = line;
        if (letterSpacing > 0) {
          displayLine = line.split('').join(String.fromCharCode(8202).repeat(Math.ceil(letterSpacing)));
        }

        const wordGap = useWordByWord && words.length > 0 ? 1 : 0;
        let lineWidthForBox = ctx.measureText(displayLine).width;
        if (useWordByWord && words.length > 0) {
          lineWidthForBox = 0;
          words.forEach((w, wi) => {
            const gIdx = wordStartIdx + wi;
            const fontForWord = deps.getFontForIndex(overlay.fontFamily || 'Arial', overlay.fontChangeLogic || 'none', gIdx, allWords.length);
            ctx.font = `${fontWeight} ${fontSize}px ${fontForWord}`;
            const iconRaw = shouldShowIconForWord(gIdx, wi, idx, allWords.length) ? deps.resolveIcon(w, overlay, rowText) : null;
            const iconPos = overlay.iconPosition || 'beforeWord';
            const isInlinePos = iconPos === 'beforeWord' || iconPos === 'afterWord';
            const icon = (iconRaw && isInlinePos) ? iconRaw : null;
            const seg = (icon && iconPos === 'beforeWord' ? icon + ' ' : '') + w + (icon && iconPos === 'afterWord' ? ' ' + icon : '') + (wi < words.length - 1 ? ' ' : '');
            let segW = ctx.measureText(seg).width;
            const isLineActive = wordHighlightMode === 'fixedPerLine'
              ? (() => {
                  const opt = wordHighlightLineOpt;
                  if (typeof opt === 'number') {
                    if (opt === 0) return wi === words.length - 1;
                    return wi === Math.min(opt - 1, words.length - 1);
                  }
                  if (opt === 'last') return wi === words.length - 1;
                  if (opt === 'random') return wi === ((idx * 7919 + 7) % Math.max(1, words.length));
                  if (opt === 'everyTwo') return wi % 2 === 1;
                  if (opt === 'everyThree') return wi % 3 === 2;
                  if (opt === 'odd') return wi % 2 === 0;
                  if (opt === 'even') return wi % 2 === 1;
                  if (opt === 'firstTwo') return wi <= 1;
                  if (opt === 'lastTwo') return wi >= words.length - 2;
                  if (opt === 'center') return wi === Math.floor((words.length - 1) / 2);
                  if (opt === 'firstLast') return wi === 0 || wi === words.length - 1;
                  if (opt === 'alternate') return wi % 2 === 0;
                  if (opt === 'longest') { const lens = words.map((w,i)=>[w.length,i]); const max = lens.reduce((a,b)=>b[0]>a[0]?b:a,[0,0]); return wi === max[1]; }
                  const n = parseInt(opt, 10);
                  return (n >= 1 && wi === Math.min(n - 1, words.length - 1)) || (opt === 'last' && wi === words.length - 1);
                })()
              : (globalWordIdxFor(wi) === activeWordIndexGlobal);
            if (wordHighlightEnabled && isLineActive) segW = segW * wordHighlightScale;
            segW *= presetSizeForWord(wi, words.length, gIdx, isLineActive);
            lineWidthForBox += segW;
          });
          ctx.font = `${fontWeight} ${fontSize}px ${overlay.fontFamily}`;
          lineWidthForBox += (words.length - 1) * wordGap;
        }

        const lineDisplayW =
          useWordByWord && words.length > 0
            ? lineWidthForBox
            : ctx.measureText(displayLine).width;
        const lineAnchorX = clampTextAnchorX(baseX, lineDisplayW, width, overlay.textAlign, pad);

        // Background box
        if (overlay.styleType === 'box') {
          const textWidth = lineWidthForBox;
          ctx.save();
          // Use line-level alpha if not word-by-word, otherwise per-word alpha will handle text
          const boxAnimS = useWordByWord ? DEF_STYLE : getAnimationStyle(wordStartIdx, idx);
          const boxKinS = useWordByWord ? DEF_STYLE : getKineticStyle(wordStartIdx, idx);
          const boxAlpha = boxAnimS.alpha * boxKinS.alpha;
          ctx.globalAlpha = (overlay.bgOpacity !== undefined ? overlay.bgOpacity : 1) * boxAlpha;
          ctx.fillStyle = overlay.bgColor;
          
          let boxX = lineAnchorX - (textWidth / 2) - boxPadding;
          if (overlay.textAlign === 'left') boxX = lineAnchorX - boxPadding;
          else if (overlay.textAlign === 'right') boxX = lineAnchorX - textWidth - boxPadding;
          const boxY = yPos - (fontSize / 2) - (boxPadding / 2);
          const boxWidth = textWidth + (boxPadding * 2);
          const boxHeight = fontSize + boxPadding;
          const boxOffsetX = (overlay.boxOffsetX ?? 0) * (width / 100);
          const boxOffsetY = (overlay.boxOffsetY ?? 0) * (height / 100);
          
          ctx.beginPath();
          ctx.roundRect(boxX + boxOffsetX, boxY + boxOffsetY, boxWidth, boxHeight, boxRadius);
          ctx.fill();
          ctx.restore();
        }
        
        // Stroke text & Main text (word-by-word when color/icon logic active)
        if (useWordByWord && words.length > 0) {
          const align = overlay.textAlign || 'center';
          const totalWordWidth = lineWidthForBox;
          let xOff = align === 'center' ? -totalWordWidth / 2 : align === 'right' ? -totalWordWidth : 0;
          const segmentWidths = [];
          words.forEach((w, wi) => {
            const gIdx = wordStartIdx + wi;
            const fontForWord = deps.getFontForIndex(overlay.fontFamily || 'Arial', overlay.fontChangeLogic || 'none', gIdx, allWords.length);
            ctx.font = `${fontWeight} ${fontSize}px ${fontForWord}`;
            const iconRaw2 = shouldShowIconForWord(gIdx, wi, idx, allWords.length) ? deps.resolveIcon(w, overlay, rowText) : null;
            const iconPos2 = overlay.iconPosition || 'beforeWord';
            const isInlinePos2 = iconPos2 === 'beforeWord' || iconPos2 === 'afterWord';
            const icon = (iconRaw2 && isInlinePos2) ? iconRaw2 : null;
            const seg = (icon && iconPos2 === 'beforeWord' ? icon + ' ' : '') + w + (icon && iconPos2 === 'afterWord' ? ' ' + icon : '') + (wi < words.length - 1 ? ' ' : '');
            let segW = ctx.measureText(seg).width;
            const isLineActiveSeg = wordHighlightMode === 'fixedPerLine'
              ? (() => {
                  const opt = wordHighlightLineOpt;
                  if (opt === 'last' || opt === 0) return wi === words.length - 1;
                  if (opt === 'random') return wi === ((idx * 7919 + 7) % Math.max(1, words.length));
                  if (opt === 'everyTwo') return wi % 2 === 1;
                  if (opt === 'everyThree') return wi % 3 === 2;
                  if (opt === 'odd') return wi % 2 === 0;
                  if (opt === 'even') return wi % 2 === 1;
                  if (opt === 'firstTwo') return wi <= 1;
                  if (opt === 'lastTwo') return wi >= words.length - 2;
                  if (opt === 'center') return wi === Math.floor((words.length - 1) / 2);
                  if (opt === 'firstLast') return wi === 0 || wi === words.length - 1;
                  if (opt === 'alternate') return wi % 2 === 0;
                  if (opt === 'longest') { const lens = words.map((w,i)=>[w.length,i]); const max = lens.reduce((a,b)=>b[0]>a[0]?b:a,[0,0]); return wi === max[1]; }
                  const n = parseInt(opt, 10);
                  return n >= 1 && wi === Math.min(n - 1, words.length - 1);
                })()
              : (globalWordIdxFor(wi) === activeWordIndexGlobal);
            if (wordHighlightEnabled && isLineActiveSeg) segW = segW * wordHighlightScale;
            segW *= presetSizeForWord(wi, words.length, gIdx, isLineActiveSeg);
            segmentWidths.push({ seg, segW, gIdx, fontForWord });
          });
          const textMaxLineW = resolveTextMaxWidth(width, overlay, fontSize);
          let lineFitScale = totalWordWidth > textMaxLineW ? textMaxLineW / totalWordWidth : 1;
          if (overlay.wordLayoutLogic) {
            let maxSpan = totalWordWidth;
            let xCursor = 0;
            segmentWidths.forEach(({ segW, gIdx }, wi) => {
              const lo = deps.getWordLayoutOffset(overlay.wordLayoutLogic, wi, words.length, idx, fontSize, gIdx);
              maxSpan = Math.max(maxSpan, xCursor + segW + Math.abs(lo.x) * 2);
              xCursor += segW + wordGap;
            });
            if (maxSpan > textMaxLineW) {
              lineFitScale = Math.min(lineFitScale, textMaxLineW / maxSpan);
            }
          }
          if (lineFitScale < 1) {
            segmentWidths.forEach((s) => { s.segW *= lineFitScale; });
          }
          const fittedTotalWidth = lineFitScale < 1 ? totalWordWidth * lineFitScale : totalWordWidth;
          xOff = align === 'center' ? -fittedTotalWidth / 2 : align === 'right' ? -fittedTotalWidth : 0;
          words.forEach((w, wi) => {
            const { seg, segW, gIdx, fontForWord } = segmentWidths[wi];
            const wordStyle = getWordStyle(gIdx, {
              color: overlay.color || '#ffffff',
              fontFamily: fontForWord,
              fontWeight: fontWeight,
              fontSize: fontSize
            });

            const isLineActiveFixed = wordHighlightMode === 'fixedPerLine' && (() => {
              const opt = wordHighlightLineOpt;
              if (opt === 'last' || opt === 0) return wi === words.length - 1;
              if (opt === 'random') return wi === ((idx * 7919 + 7) % Math.max(1, words.length));
              if (opt === 'everyTwo') return wi % 2 === 1;
              if (opt === 'everyThree') return wi % 3 === 2;
              if (opt === 'odd') return wi % 2 === 0;
              if (opt === 'even') return wi % 2 === 1;
              if (opt === 'firstTwo') return wi <= 1;
              if (opt === 'lastTwo') return wi >= words.length - 2;
              if (opt === 'center') return wi === Math.floor((words.length - 1) / 2);
              if (opt === 'firstLast') return wi === 0 || wi === words.length - 1;
              if (opt === 'alternate') return wi % 2 === 0;
              if (opt === 'longest') { const lens = words.map((w,i)=>[w.length,i]); const max = lens.reduce((a,b)=>b[0]>a[0]?b:a,[0,0]); return wi === max[1]; }
              const n = parseInt(opt, 10);
              return n >= 1 && wi === Math.min(n - 1, words.length - 1);
            })();
            const isActive = wordHighlightEnabled && (wordHighlightMode === 'voiceSync' ? (globalWordIdxFor(wi) === activeWordIndexGlobal) : isLineActiveFixed);
            const sizeMult = presetSizeForWord(wi, words.length, gIdx, isActive);
            let drawSize = wordStyle.fontSize * (isActive ? wordHighlightScale : 1) * sizeMult * lineFitScale;
            if (overlay.wordDimInactive && wordHighlightEnabled && !isActive) {
              drawSize *= overlay.wordDimScale ?? 0.55;
            }
            
            ctx.font = `${wordStyle.fontWeight} ${drawSize}px ${wordStyle.fontFamily}`;
            const captionGlobalIdx = globalWordIdxFor(wi);
            const layoutOff = deps.getWordLayoutOffset(overlay.wordLayoutLogic, wi, words.length, idx, drawSize, gIdx);
            const scaledLayoutX = layoutOff.x * lineFitScale;
            const scaledLayoutY = layoutOff.y * lineFitScale;
            const segCenterX = lineAnchorX + xOff + segmentWidths[wi].segW / 2;
            const gradColors = overlay.gradientEnabled && (overlay.gradientColors?.length || 0) > 0 ? (overlay.gradientColors || ['#FFFFFF', '#CCCCCC']) : null;
            const wordOverride = (overlay.wordOverrides || {})[gIdx];
            const wordColor = gradColors ? null : (wordOverride?.color ?? deps.getColorForIndex(overlay.color || '#ffffff', overlay.colorLogic || 'none', overlay.colorLogic === 'perLine' ? idx : gIdx, overlay.colorLogic === 'perLine' ? lines.length : allWords.length));
            
            // Apply per-word kinetic alpha & transform
            const charStart = charOffsetAcc;
            charOffsetAcc += seg.length;
            const lineAnimStyle = getLineAnimStyleForWord(gIdx, seg.length, charStart, idx);
            const animS = getAnimationStyle(gIdx, idx, captionGlobalIdx);
            const kinS = getKineticStyle(gIdx, idx, captionGlobalIdx);
            const wordAlpha = animS.alpha * kinS.alpha * lineAnimStyle.alpha * (overlay.wordDimInactive && wordHighlightEnabled && !isActive ? (overlay.wordDimAlpha ?? 0.32) : 1);
            const cScale = animS.scale * kinS.scale * lineAnimStyle.scale;
            const cX = animS.x + kinS.x + lineAnimStyle.offsetX + scaledLayoutX;
            const cY = animS.y + kinS.y + lineAnimStyle.offsetY + scaledLayoutY;
            const cR = animS.rotate + kinS.rotate;
            const drawSeg = lineAnimStyle.visibleChars >= 0 ? seg.slice(0, lineAnimStyle.visibleChars) : seg;
            
            ctx.save();
            ctx.globalAlpha = (ctx.globalAlpha ?? 1) * wordAlpha;
            ctx.translate(segCenterX + cX, yPos + cY);
            ctx.scale(cScale, cScale);
            ctx.rotate(cR);

            if (overlay.shadowEnabled) {
              ctx.shadowColor = overlay.shadowColor || '#000000';
              ctx.shadowBlur = overlay.shadowBlur || 4;
              ctx.shadowOffsetX = overlay.shadowOffsetX || 2;
              ctx.shadowOffsetY = overlay.shadowOffsetY || 2;
            }

            if (overlay.styleType === 'stroke') {
              ctx.save();
              ctx.globalAlpha = (overlay.strokeOpacity !== undefined ? overlay.strokeOpacity : 1) * wordAlpha;
              ctx.strokeStyle = overlay.strokeColor;
              ctx.lineWidth = resolveStrokeWidth(overlay, drawSize);
              ctx.lineJoin = 'round';
              ctx.miterLimit = 2;
              ctx.strokeText(drawSeg, 0, 0); // Drawn at translated origin
              ctx.restore();
            }
            if (gradColors && gradColors.length > 0) {
              const g = ctx.createLinearGradient(-segW/2, 0, segW/2, 0);
              gradColors.forEach((c, i) => g.addColorStop(i / Math.max(1, gradColors.length - 1), c));
              ctx.fillStyle = g;
            } else {
              ctx.fillStyle = wordColor;
            }
            ctx.fillText(drawSeg, 0, 0);

            // Draw icon above/below word
            try {
              const abIconPos = overlay.iconPosition || 'beforeWord';
              if (abIconPos === 'aboveWord' || abIconPos === 'belowWord') {
                const iconAB = shouldShowIconForWord(gIdx, wi, idx, allWords.length) ? deps.resolveIcon(w, overlay, rowText) : null;
                if (iconAB) {
                  const iScale = overlay.iconSizeScale ?? 1;
                  const iSize = drawSize * iScale;
                  const iOffX = (overlay.iconOffsetX ?? 0) * (width / 100);
                  const iOffY = (overlay.iconOffsetY ?? 0) * (height / 100);
                  ctx.save();
                  ctx.font = `${Math.round(iSize)}px sans-serif`;
                  ctx.textAlign = 'center';
                  ctx.fillStyle = overlay.color || '#ffffff';
                  const yShift = abIconPos === 'aboveWord' ? -(drawSize * 0.8 + iOffY) : (drawSize * 0.8 + iOffY);
                  ctx.fillText(String(iconAB).slice(0, 5), iOffX, yShift);
                  ctx.restore();
                }
              }
            } catch (_) {}

            ctx.restore();
            xOff += segmentWidths[wi].segW + wordGap;
          });
        } else {
          const lineStyle = getLineStyle(idx, {
            color: overlay.color,
            fontSize: fontSize,
            fontWeight: fontWeight,
            fontFamily: overlay.fontFamily
          });
          
          const lAnimS = getAnimationStyle(wordStartIdx, idx);
          const lKinS = getKineticStyle(wordStartIdx, idx);
          const lineAlpha = lAnimS.alpha * lKinS.alpha;
          const lScale = lAnimS.scale * lKinS.scale;
          const lX = lAnimS.x + lKinS.x;
          const lY = lAnimS.y + lKinS.y;
          const lR = lAnimS.rotate + lKinS.rotate;

          {
          ctx.save();
          ctx.globalAlpha = (ctx.globalAlpha ?? 1) * lineAlpha;
          ctx.translate(lineAnchorX + lX, yPos + lY);
          ctx.scale(lScale, lScale);
          ctx.rotate(lR);

          if (overlay.shadowEnabled) {
            ctx.shadowColor = overlay.shadowColor || '#000000';
            ctx.shadowBlur = overlay.shadowBlur || 4;
            ctx.shadowOffsetX = overlay.shadowOffsetX || 2;
            ctx.shadowOffsetY = overlay.shadowOffsetY || 2;
          }

          ctx.font = `${lineStyle.fontWeight} ${lineStyle.fontSize}px ${lineStyle.fontFamily}`;

          if (overlay.styleType === 'stroke') {
            ctx.save();
            ctx.globalAlpha = (overlay.strokeOpacity !== undefined ? overlay.strokeOpacity : 1) * lineAlpha;
            ctx.strokeStyle = overlay.strokeColor;
            ctx.lineWidth = resolveStrokeWidth(overlay, lineStyle.fontSize);
            ctx.lineJoin = 'round';
            ctx.miterLimit = 2;
            ctx.strokeText(displayLine, 0, 0);
            ctx.restore();
          }
          if (overlay.gradientEnabled && (overlay.gradientColors?.length || 0) > 0) {
            const gc = overlay.gradientColors || ['#FFFFFF', '#CCCCCC'];
            const g = ctx.createLinearGradient(-lineWidthForBox/2, 0, lineWidthForBox/2, 0);
            gc.forEach((c, i) => g.addColorStop(i / Math.max(1, gc.length - 1), c));
            ctx.fillStyle = g;
          } else {
            ctx.fillStyle = lineStyle.color;
          }
          ctx.fillText(displayLine, 0, 0);
          ctx.restore();
          }
        }
      });

      // Corner-position icons (drawn once per overlay, not per word)
      try {
        const cornerPos = overlay.iconPosition;
        if ((overlay.iconSectionEnabled ?? false) && overlay.iconLogic && overlay.iconLogic !== 'none' &&
            ['topLeft','topRight','bottomLeft','bottomRight','center'].includes(cornerPos)) {
          let cornerIcon = null;
          try {
            const custom = overlay.iconCustomChar;
            if (custom) {
              cornerIcon = String(custom).slice(0, 5);
            } else {
              const intent = overlay.iconIntent || 'auto';
              const detected = intent === 'auto' ? deps.getIntentFromText(rowText || '') : intent;
              cornerIcon = detected ? (deps.getIconForIntent(detected, 0) || '✦') : '✦';
            }
          } catch (_) { cornerIcon = '✦'; }
          if (cornerIcon) {
            const iScale = overlay.iconSizeScale ?? 1;
            const iSize = Math.round(fontSize * iScale * 1.5);
            const pad = iSize * 0.5;
            ctx.save();
            ctx.font = `${iSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = overlay.color || '#ffffff';
            ctx.globalAlpha = 0.9;
            let cx, cy;
            if (cornerPos === 'topLeft') { cx = pad + iSize/2; cy = pad + iSize/2; }
            else if (cornerPos === 'topRight') { cx = width - pad - iSize/2; cy = pad + iSize/2; }
            else if (cornerPos === 'bottomLeft') { cx = pad + iSize/2; cy = height - pad - iSize/2; }
            else if (cornerPos === 'bottomRight') { cx = width - pad - iSize/2; cy = height - pad - iSize/2; }
            else { cx = width / 2; cy = height / 2; }
            ctx.fillText(cornerIcon, cx, cy);
            ctx.restore();
          }
        }
      } catch (_) {}
    });

}
