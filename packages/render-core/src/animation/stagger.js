/**
 * Stagger / timing helpers for overlay animation presets.
 */

/**
 * @param {string} logic
 * @param {number} gIdx
 * @param {number} lineIdx
 * @param {string[]} allWords
 * @param {string[]} lines
 */
export function getUnitStagger(logic, gIdx, lineIdx, allWords, lines) {
  const totalWords = allWords.length;
  const totalLines = lines.length;
  let totalChars = 0;
  let charStart = 0;
  allWords.forEach((w, i) => {
    if (i < gIdx) charStart += w.length;
    totalChars += w.length;
  });
  switch (logic) {
    case 'wordByWord': case 'oneWord': case 'sequential': case 'afterOneWord':
      return { unitIndex: gIdx, totalUnits: totalWords };
    case 'wordByWordReverse': case 'reverseSeq':
      return { unitIndex: totalWords - 1 - gIdx, totalUnits: totalWords };
    case 'twoWords': case 'afterTwoWords': case 'changeEveryTwo':
      return { unitIndex: Math.floor(gIdx / 2), totalUnits: Math.ceil(totalWords / 2) };
    case 'threeWords': case 'changeEveryThree':
      return { unitIndex: Math.floor(gIdx / 3), totalUnits: Math.ceil(totalWords / 3) };
    case 'changeEveryFour':
      return { unitIndex: Math.floor(gIdx / 4), totalUnits: Math.ceil(totalWords / 4) };
    case 'charByChar': case 'oneChar':
      return { unitIndex: charStart, totalUnits: totalChars };
    case 'charByCharReverse':
      return { unitIndex: totalChars - 1 - charStart, totalUnits: totalChars };
    case 'twoChars':
      return { unitIndex: Math.floor(charStart / 2), totalUnits: Math.ceil(totalChars / 2) };
    case 'lineByLine': case 'oneLine':
      return { unitIndex: lineIdx ?? 0, totalUnits: totalLines };
    case 'lineByLineReverse':
      return { unitIndex: totalLines - 1 - (lineIdx ?? 0), totalUnits: totalLines };
    case 'twoLines':
      return { unitIndex: Math.floor((lineIdx ?? 0) / 2), totalUnits: Math.ceil(totalLines / 2) };
    case 'wordRandom': case 'random': case 'randomWords': {
      const seed = (gIdx * 2654435761) >>> 0;
      return { unitIndex: seed % totalWords, totalUnits: totalWords };
    }
    case 'wordCenterOut': {
      const center = (totalWords - 1) / 2;
      return { unitIndex: Math.round(Math.abs(gIdx - center)), totalUnits: Math.ceil(totalWords / 2) };
    }
    case 'wordEdgesIn': {
      const center = (totalWords - 1) / 2;
      return { unitIndex: Math.round(Math.ceil(totalWords / 2) - 1 - Math.abs(gIdx - center)), totalUnits: Math.ceil(totalWords / 2) };
    }
    case 'oddEven':
      return {
        unitIndex: gIdx % 2 === 0 ? Math.floor(gIdx / 2) : Math.ceil(totalWords / 2) + Math.floor(gIdx / 2),
        totalUnits: totalWords,
      };
    case 'firstLast': {
      const mid = Math.floor(totalWords / 2);
      return { unitIndex: Math.min(gIdx, totalWords - 1 - gIdx), totalUnits: mid + 1 };
    }
    default:
      return null;
  }
}

/**
 * @param {object} ctx
 * @param {number | null | undefined} ctx.videoTime
 * @param {number | null | undefined} ctx.videoDuration
 * @param {string[]} ctx.allWords
 * @param {string[]} ctx.lines
 */
export function computeStaggerProgress(ctx, logic, startTime, dur, shouldLoop, gIdx, lineIdx) {
  const { videoTime, videoDuration, allWords, lines } = ctx;
  if (videoTime == null) return { active: false, p: 0 };
  const effDur = videoDuration != null && videoDuration > 0 ? videoDuration : Math.max(dur || 1, 1);
  let t = videoTime - startTime;
  if (t < 0) return { active: false, p: 0 };
  const stagger = getUnitStagger(logic, gIdx, lineIdx, allWords, lines);
  if (stagger) {
    const total = Math.max(1, stagger.totalUnits);
    const slotDur = dur / total;
    const unitStart = stagger.unitIndex * slotDur;
    let localT = t - unitStart;
    if (shouldLoop) localT = ((t % dur) - unitStart + dur) % dur;
    if (localT < 0) return { active: false, p: 0 };
    if (localT > slotDur && !shouldLoop) return { active: true, p: 1 };
    return { active: true, p: Math.max(0, Math.min(1, localT / Math.max(0.01, slotDur))) };
  }
  if (shouldLoop) t = t % dur;
  else if (t > effDur) return { active: true, p: 1 };
  return { active: true, p: Math.max(0, Math.min(1, t / Math.max(0.01, dur))) };
}

/**
 * @param {object} ctx
 * @param {object} ctx.baseOverlay
 * @param {Array<{ start?: number, end?: number }> | undefined} ctx.captionWordsFlat
 * @param {number | null | undefined} ctx.videoTime
 * @param {number | null | undefined} ctx.videoDuration
 * @param {string[]} ctx.allWords
 * @param {string[]} ctx.lines
 */
export function resolveEffectProgress(ctx, logic, startTime, dur, shouldLoop, gIdx, lineIdx, captionGlobalIdx) {
  const { baseOverlay, captionWordsFlat, videoTime } = ctx;
  if (
    baseOverlay?.captionPresetsEnabled &&
    captionWordsFlat?.length &&
    captionGlobalIdx >= 0 &&
    captionGlobalIdx < captionWordsFlat.length &&
    videoTime != null
  ) {
    const cw = captionWordsFlat[captionGlobalIdx];
    const wStart = cw.start ?? 0;
    const wEnd = Math.max(wStart + 0.04, cw.end ?? wStart + 0.12);
    if (videoTime < wStart) return { active: false, p: 0 };
    const slotDur = Math.max(0.06, Math.min(dur || 0.35, wEnd - wStart + 0.1));
    if (shouldLoop) {
      const loopT = (videoTime - wStart) % Math.max(0.01, dur || 0.85);
      return { active: true, p: Math.min(1, loopT / Math.max(0.01, dur || 0.85)) };
    }
    if (videoTime >= wEnd) return { active: true, p: 1 };
    return { active: true, p: Math.min(1, (videoTime - wStart) / slotDur) };
  }
  return computeStaggerProgress(ctx, logic, startTime, dur, shouldLoop, gIdx, lineIdx);
}
