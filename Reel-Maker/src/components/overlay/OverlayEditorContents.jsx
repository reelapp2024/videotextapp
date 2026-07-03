import React from 'react';

import OverlayQuickPresets from './OverlayQuickPresets';
import OverlayExcelContentSource from './OverlayExcelContentSource';
import OverlayContentAutoBreak from './OverlayContentAutoBreak';
import { OverlayLineEditProvider } from './OverlayLineEditContext';
import OverlayLineScopedSettings from './OverlayLineScopedSettings';
import OverlayAutoPreset from './OverlayAutoPreset';
import OverlayWordHighlight from './OverlayWordHighlight';
import OverlayKineticEffects from './OverlayKineticEffects';
import OverlayAnimationFont from './OverlayAnimationFont';
import OverlayFontSettings from './OverlayFontSettings';
import OverlayColorGradient from './OverlayColorGradient';
import OverlayIconsElementsGraphics from './OverlayIconsElementsGraphics';
import OverlayTextBgDoodles from './OverlayTextBgDoodles';
import OverlayCaptionPresets from './OverlayCaptionPresets';
import OverlayLayout from './OverlayLayout';
import OverlayStyle from './OverlayStyle';
import OverlayShadow from './OverlayShadow';
import OverlayQuickStylePresets from './OverlayQuickStylePresets';

export default function OverlayEditorContents({
  activeOverlayIndex,
  config,
  updateOverlayConfig,
  applyOverlayPreset,
  updateGlobalConfig,
  excelData,
  excelFrameMode,
  setExcelFrameMode,
  excelRowsPerVideo,
  setExcelRowsPerVideo,
  LINE_ANIM_MODES,
  LINE_ANIM_EFFECTS,
  AUTO_PRESETS,
  AUTO_PRESET_CATEGORIES,
  videos,
  WORD_HIGHLIGHT_LINE_OPTIONS,
  KINETIC_EFFECTS,
  ANIMATION_PRESETS,
  ANIMATION_LOGIC_PRESETS,
  FONT_LOGIC_PRESETS,
  FONT_PRESETS,
  FONTS,
  COLOR_PRESETS,
  GRADIENT_PRESETS,
  COLOR_LOGIC_PRESETS,
  extractedPalette,
  extractPaletteFromMedia,
  ICON_LOGIC_PRESETS,
  ICON_CATEGORIES,
  ICON_LIBRARY,
  ELEMENT_LIBRARY,
  GRAPHIC_LIBRARY,
  ICON_POSITION_PRESETS,
  ICON_ANIMATION_PRESETS,
  TEXT_BG_LOGIC_PRESETS,
  TEXT_BG_PATTERN_CATEGORIES,
  TEXT_BG_PATTERNS,
  DOODLE_LOGIC_PRESETS,
  DOODLE_CATEGORIES,
  DOODLE_LIBRARY,
  DOODLE_ANIMATION_PRESETS,
  previewRowIndex,
  captionPreviewWords,
  voiceCaptionMap,
  voiceFiles,
  previewVoiceIndex,
  patchOverlayConfig,
}) {
  return (
    <>
      <OverlayLineEditProvider
        activeOverlayIndex={activeOverlayIndex}
        config={config}
        patchOverlayConfig={patchOverlayConfig}
        excelData={excelData}
        voiceCaptionMap={voiceCaptionMap}
        voiceFiles={voiceFiles}
        previewVoiceIndex={previewVoiceIndex}
      >
      <OverlayQuickPresets activeOverlayIndex={activeOverlayIndex} config={config} updateOverlayConfig={updateOverlayConfig} />

      <OverlayExcelContentSource
        config={config}
        updateGlobalConfig={updateGlobalConfig}
        excelData={excelData}
        excelFrameMode={excelFrameMode}
        setExcelFrameMode={setExcelFrameMode}
        excelRowsPerVideo={excelRowsPerVideo}
        setExcelRowsPerVideo={setExcelRowsPerVideo}
      />

      <OverlayContentAutoBreak
        activeOverlayIndex={activeOverlayIndex}
        config={config}
        updateOverlayConfig={updateOverlayConfig}
        excelData={excelData}
        voiceCaptionMap={voiceCaptionMap}
        voiceFiles={voiceFiles}
        previewVoiceIndex={previewVoiceIndex}
      />

      <OverlayLineScopedSettings
        LINE_ANIM_MODES={LINE_ANIM_MODES}
        LINE_ANIM_EFFECTS={LINE_ANIM_EFFECTS}
      />

      <OverlayAutoPreset
        activeOverlayIndex={activeOverlayIndex}
        config={config}
        updateOverlayConfig={updateOverlayConfig}
        AUTO_PRESETS={AUTO_PRESETS}
        AUTO_PRESET_CATEGORIES={AUTO_PRESET_CATEGORIES}
        videos={videos}
      />

      <OverlayWordHighlight
        activeOverlayIndex={activeOverlayIndex}
        config={config}
        updateOverlayConfig={updateOverlayConfig}
        WORD_HIGHLIGHT_LINE_OPTIONS={WORD_HIGHLIGHT_LINE_OPTIONS}
      />

      <OverlayKineticEffects
        activeOverlayIndex={activeOverlayIndex}
        config={config}
        updateOverlayConfig={updateOverlayConfig}
        KINETIC_EFFECTS={KINETIC_EFFECTS}
      />

      <OverlayAnimationFont
        activeOverlayIndex={activeOverlayIndex}
        config={config}
        updateOverlayConfig={updateOverlayConfig}
        ANIMATION_PRESETS={ANIMATION_PRESETS}
        ANIMATION_LOGIC_PRESETS={ANIMATION_LOGIC_PRESETS}
        FONT_LOGIC_PRESETS={FONT_LOGIC_PRESETS}
      />

      <OverlayFontSettings
        activeOverlayIndex={activeOverlayIndex}
        config={config}
        updateOverlayConfig={updateOverlayConfig}
        FONT_PRESETS={FONT_PRESETS}
        FONTS={FONTS}
      />

      <OverlayColorGradient
        activeOverlayIndex={activeOverlayIndex}
        config={config}
        updateOverlayConfig={updateOverlayConfig}
        COLOR_PRESETS={COLOR_PRESETS}
        GRADIENT_PRESETS={GRADIENT_PRESETS}
        COLOR_LOGIC_PRESETS={COLOR_LOGIC_PRESETS}
        extractedPalette={extractedPalette}
        extractPaletteFromMedia={extractPaletteFromMedia}
      />

      <OverlayIconsElementsGraphics
        activeOverlayIndex={activeOverlayIndex}
        config={config}
        updateOverlayConfig={updateOverlayConfig}
        ICON_LOGIC_PRESETS={ICON_LOGIC_PRESETS}
        ICON_CATEGORIES={ICON_CATEGORIES}
        ICON_LIBRARY={ICON_LIBRARY}
        ELEMENT_LIBRARY={ELEMENT_LIBRARY}
        GRAPHIC_LIBRARY={GRAPHIC_LIBRARY}
        ICON_POSITION_PRESETS={ICON_POSITION_PRESETS}
        ICON_ANIMATION_PRESETS={ICON_ANIMATION_PRESETS}
      />

      <OverlayTextBgDoodles
        activeOverlayIndex={activeOverlayIndex}
        config={config}
        updateOverlayConfig={updateOverlayConfig}
        TEXT_BG_LOGIC_PRESETS={TEXT_BG_LOGIC_PRESETS}
        TEXT_BG_PATTERN_CATEGORIES={TEXT_BG_PATTERN_CATEGORIES}
        TEXT_BG_PATTERNS={TEXT_BG_PATTERNS}
        DOODLE_LOGIC_PRESETS={DOODLE_LOGIC_PRESETS}
        DOODLE_CATEGORIES={DOODLE_CATEGORIES}
        DOODLE_LIBRARY={DOODLE_LIBRARY}
        DOODLE_ANIMATION_PRESETS={DOODLE_ANIMATION_PRESETS}
      />

      <OverlayCaptionPresets
        activeOverlayIndex={activeOverlayIndex}
        config={config}
        applyOverlayPreset={applyOverlayPreset}
        updateOverlayConfig={updateOverlayConfig}
      />

      <OverlayLayout
        activeOverlayIndex={activeOverlayIndex}
        config={config}
        updateOverlayConfig={updateOverlayConfig}
        excelData={excelData}
        previewRowIndex={previewRowIndex}
        captionPreviewWords={captionPreviewWords}
      />

      <OverlayStyle activeOverlayIndex={activeOverlayIndex} config={config} updateOverlayConfig={updateOverlayConfig} />

      <OverlayShadow activeOverlayIndex={activeOverlayIndex} config={config} updateOverlayConfig={updateOverlayConfig} />

      <OverlayQuickStylePresets activeOverlayIndex={activeOverlayIndex} config={config} updateOverlayConfig={updateOverlayConfig} />
      </OverlayLineEditProvider>
    </>
  );
}

