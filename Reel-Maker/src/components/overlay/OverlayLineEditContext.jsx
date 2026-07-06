import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { hasContentBreakRules } from '../../utils/contentBreakParts.js';
import { useContentBreakParts } from '../../hooks/useContentBreakParts.js';
import {
  resolveOverlayForLineEdit,
  buildGlobalLineSettingPatch,
  buildGlobalLineSettingsPatch,
  buildLineSettingPatch,
  getLineScopedValue,
} from '../../utils/contentLineSettings.js';

const OverlayLineEditContext = createContext(null);

export function useOverlayLineScope() {
  return useContext(OverlayLineEditContext);
}

export function useScopedOverlay(activeOverlayIndex, config, updateOverlayConfig) {
  const scope = useOverlayLineScope();
  if (scope) {
    return {
      ov: scope.overlay,
      setField: scope.setField,
      patchFields: scope.patchFields,
      applyScopedPreset: scope.applyScopedPreset,
      getField: scope.getField,
      lineLabel: scope.lineLabel,
      lineIndex: scope.lineIndex,
      isGlobal: scope.isGlobal,
      lineSelection: scope.lineSelection,
      setLineSelection: scope.setLineSelection,
    };
  }
  return {
    ov: config.overlays[activeOverlayIndex],
    setField: (key, value) => updateOverlayConfig(activeOverlayIndex, key, value),
    patchFields: (patch) => {
      Object.entries(patch || {}).forEach(([key, value]) => {
        updateOverlayConfig(activeOverlayIndex, key, value);
      });
    },
    applyScopedPreset: (patch) => {
      Object.entries(patch || {}).forEach(([key, value]) => {
        updateOverlayConfig(activeOverlayIndex, key, value);
      });
    },
    getField: (key, fallback) => config.overlays[activeOverlayIndex]?.[key] ?? fallback,
    lineLabel: 'All lines',
    isGlobal: true,
    lineIndex: null,
    lineSelection: 'all',
    setLineSelection: () => {},
  };
}

export function OverlayLineEditProvider({
  activeOverlayIndex,
  config,
  patchOverlayConfig,
  excelData,
  voiceCaptionMap,
  voiceFiles,
  previewVoiceIndex = 0,
  children,
}) {
  const overlay = config?.overlays?.[activeOverlayIndex];
  const { breakParts, captionSegments, usingCaptions } = useContentBreakParts({
    overlay,
    excelData,
    voiceCaptionMap,
    voiceFiles,
    previewVoiceIndex,
  });

  const hasBreakRules = hasContentBreakRules(overlay);
  const storedLineSelection = overlay?.contentBreakLineSelection || 'all';
  const lineCount = breakParts.length;

  const lineSelection = lineCount === 0
    ? 'all'
    : storedLineSelection === 'all'
      || (Number(storedLineSelection) >= 1 && Number(storedLineSelection) <= lineCount)
      ? String(storedLineSelection)
      : 'all';

  const lineIndex = lineSelection === 'all' ? null : Math.max(0, Number(lineSelection) - 1);
  const isGlobal = lineIndex == null;

  const resolvedOverlay = useMemo(
    () => resolveOverlayForLineEdit(overlay, lineIndex, lineCount),
    [overlay, lineIndex, lineCount],
  );

  const setLineSelection = useCallback((value) => {
    patchOverlayConfig(activeOverlayIndex, { contentBreakLineSelection: String(value) });
  }, [patchOverlayConfig, activeOverlayIndex]);

  const setField = useCallback((key, value) => {
    patchOverlayConfig(activeOverlayIndex, (current) => {
      if (!current) return {};
      return isGlobal
        ? buildGlobalLineSettingPatch(current, key, value, lineCount)
        : buildLineSettingPatch(current, lineIndex, key, value, lineCount);
    });
  }, [isGlobal, lineIndex, lineCount, patchOverlayConfig, activeOverlayIndex]);

  const patchFields = useCallback((patch) => {
    if (!patch || typeof patch !== 'object') return;
    patchOverlayConfig(activeOverlayIndex, patch);
  }, [patchOverlayConfig, activeOverlayIndex]);

  const applyScopedPreset = useCallback((presetPatch) => {
    if (!presetPatch || typeof presetPatch !== 'object') return;
    patchOverlayConfig(activeOverlayIndex, (current) => {
      if (!current) return {};
      if (isGlobal) {
        return buildGlobalLineSettingsPatch(current, presetPatch, lineCount);
      }
      const overrides = [...(current.contentPartLineStyleOverrides || [])];
      while (overrides.length <= lineIndex) overrides.push(undefined);
      overrides[lineIndex] = { ...(overrides[lineIndex] || {}), ...presetPatch };
      return { contentPartLineStyleOverrides: overrides };
    });
  }, [isGlobal, lineIndex, lineCount, patchOverlayConfig, activeOverlayIndex]);

  const getField = useCallback((key, fallback) => {
    return getLineScopedValue(overlay, lineIndex, key, fallback);
  }, [overlay, lineIndex]);

  const value = useMemo(() => ({
    overlay: resolvedOverlay,
    baseOverlay: overlay,
    lineIndex,
    isGlobal,
    lineCount,
    breakParts,
    captionSegments,
    usingCaptions,
    hasBreakRules,
    lineSelection,
    lineLabel: isGlobal ? 'All lines' : `Line ${lineIndex + 1}`,
    setField,
    patchFields,
    getField,
    applyScopedPreset,
    setLineSelection,
  }), [
    resolvedOverlay,
    overlay,
    lineIndex,
    isGlobal,
    lineCount,
    breakParts,
    captionSegments,
    usingCaptions,
    hasBreakRules,
    lineSelection,
    setField,
    patchFields,
    getField,
    applyScopedPreset,
    setLineSelection,
  ]);

  return (
    <OverlayLineEditContext.Provider value={value}>
      {children}
    </OverlayLineEditContext.Provider>
  );
}
