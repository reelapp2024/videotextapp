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
      lineLabel: scope.lineLabel,
      isGlobal: scope.isGlobal,
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
    lineLabel: 'All lines',
    isGlobal: true,
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
  const { breakParts } = useContentBreakParts({
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
      ? storedLineSelection
      : 'all';

  const lineIndex = lineSelection === 'all' ? null : Math.max(0, Number(lineSelection) - 1);
  const isGlobal = lineIndex == null;

  const resolvedOverlay = useMemo(
    () => resolveOverlayForLineEdit(overlay, lineIndex, lineCount),
    [overlay, lineIndex, lineCount],
  );

  const setField = useCallback((key, value) => {
    if (!overlay) return;
    const patch = isGlobal
      ? buildGlobalLineSettingPatch(overlay, key, value, lineCount)
      : buildLineSettingPatch(overlay, lineIndex, key, value, lineCount);
    patchOverlayConfig(activeOverlayIndex, patch);
  }, [overlay, isGlobal, lineIndex, lineCount, patchOverlayConfig, activeOverlayIndex]);

  const patchFields = useCallback((patch) => {
    patchOverlayConfig(activeOverlayIndex, patch);
  }, [patchOverlayConfig, activeOverlayIndex]);

  const applyScopedPreset = useCallback((presetPatch) => {
    if (!overlay || !presetPatch || typeof presetPatch !== 'object') return;
    if (isGlobal) {
      patchOverlayConfig(
        activeOverlayIndex,
        buildGlobalLineSettingsPatch(overlay, presetPatch, lineCount),
      );
      return;
    }
    const overrides = [...(overlay.contentPartLineStyleOverrides || [])];
    while (overrides.length <= lineIndex) overrides.push(undefined);
    overrides[lineIndex] = { ...(overrides[lineIndex] || {}), ...presetPatch };
    patchOverlayConfig(activeOverlayIndex, { contentPartLineStyleOverrides: overrides });
  }, [overlay, isGlobal, lineIndex, lineCount, patchOverlayConfig, activeOverlayIndex]);

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
    hasBreakRules,
    lineSelection,
    lineLabel: isGlobal ? 'All lines' : `Line ${lineIndex + 1}`,
    setField,
    patchFields,
    getField,
    applyScopedPreset,
  }), [
    resolvedOverlay,
    overlay,
    lineIndex,
    isGlobal,
    lineCount,
    breakParts,
    hasBreakRules,
    lineSelection,
    setField,
    patchFields,
    getField,
    applyScopedPreset,
  ]);

  return (
    <OverlayLineEditContext.Provider value={value}>
      {children}
    </OverlayLineEditContext.Provider>
  );
}
