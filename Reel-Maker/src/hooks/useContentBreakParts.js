import { useMemo } from 'react';
import { computeContentBreakParts, getContentSampleText } from '../utils/contentBreakParts.js';
import { getCaptionEntry } from '../utils/captionIntegration.js';

export function useContentBreakParts({
  overlay,
  excelData,
  voiceCaptionMap,
  voiceFiles,
  previewVoiceIndex = 0,
}) {
  return useMemo(() => {
    if (!overlay) return { breakParts: [], captionSegments: [], usingCaptions: false };
    const voiceFile = voiceFiles?.[Math.min(previewVoiceIndex, Math.max((voiceFiles?.length || 1) - 1, 0))];
    const captionEntry = getCaptionEntry(voiceCaptionMap, voiceFile, previewVoiceIndex);
    const captionSegments = captionEntry?.segments || [];
    const sampleText = getContentSampleText({ excelData, overlay, captionSegments });
    const breakParts = computeContentBreakParts(overlay, sampleText, { captionSegments });
    const usingCaptions = captionSegments.length > 0 && !excelData?.length;
    return { breakParts, captionSegments, usingCaptions, sampleText };
  }, [overlay, excelData, voiceCaptionMap, voiceFiles, previewVoiceIndex]);
}
