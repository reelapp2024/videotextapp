import React from 'react';
import OutputSettingsPanel from './OutputSettingsPanel';
import OverlayEditorPanel from './overlay/OverlayEditorPanel';
import OverlayEditorContents from './overlay/OverlayEditorContents';

export default function SettingsOverlayGrid({
  activeTab,
  config,
  updateGlobalConfig,
  detectedVideoDims,
  detectedSourceFps,
  getAutoExportSettings,
  exportFileEstimate,
  estimatedExportDurationSec,
  setConfig,
  BACKGROUND_PATTERN_PRESETS,

  activeOverlayIndex,
  setActiveOverlayIndex,
  updateOverlayConfig,
  patchOverlayConfig,
  applyOverlayPreset,

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
}) {
  if (!(activeTab === 'settings' || activeTab === 'overlay')) return null;

  return (
    <div className="space-y-3 w-full min-w-0">
      {activeTab === 'settings' && (
        <OutputSettingsPanel
          config={config}
          updateGlobalConfig={updateGlobalConfig}
          detectedVideoDims={detectedVideoDims}
          detectedSourceFps={detectedSourceFps}
          getAutoExportSettings={getAutoExportSettings}
          exportFileEstimate={exportFileEstimate}
          estimatedExportDurationSec={estimatedExportDurationSec}
          setConfig={setConfig}
          BACKGROUND_PATTERN_PRESETS={BACKGROUND_PATTERN_PRESETS}
        />
      )}

      {activeTab === 'overlay' && (
        <OverlayEditorPanel
          config={config}
          activeOverlayIndex={activeOverlayIndex}
          setActiveOverlayIndex={setActiveOverlayIndex}
          updateOverlayConfig={updateOverlayConfig}
        >
          <OverlayEditorContents
            activeOverlayIndex={activeOverlayIndex}
            config={config}
            updateOverlayConfig={updateOverlayConfig}
            patchOverlayConfig={patchOverlayConfig}
            applyOverlayPreset={applyOverlayPreset}
            updateGlobalConfig={updateGlobalConfig}
            excelData={excelData}
            excelFrameMode={excelFrameMode}
            setExcelFrameMode={setExcelFrameMode}
            excelRowsPerVideo={excelRowsPerVideo}
            setExcelRowsPerVideo={setExcelRowsPerVideo}
            LINE_ANIM_MODES={LINE_ANIM_MODES}
            LINE_ANIM_EFFECTS={LINE_ANIM_EFFECTS}
            AUTO_PRESETS={AUTO_PRESETS}
            AUTO_PRESET_CATEGORIES={AUTO_PRESET_CATEGORIES}
            videos={videos}
            WORD_HIGHLIGHT_LINE_OPTIONS={WORD_HIGHLIGHT_LINE_OPTIONS}
            KINETIC_EFFECTS={KINETIC_EFFECTS}
            ANIMATION_PRESETS={ANIMATION_PRESETS}
            ANIMATION_LOGIC_PRESETS={ANIMATION_LOGIC_PRESETS}
            FONT_LOGIC_PRESETS={FONT_LOGIC_PRESETS}
            FONT_PRESETS={FONT_PRESETS}
            FONTS={FONTS}
            COLOR_PRESETS={COLOR_PRESETS}
            GRADIENT_PRESETS={GRADIENT_PRESETS}
            COLOR_LOGIC_PRESETS={COLOR_LOGIC_PRESETS}
            extractedPalette={extractedPalette}
            extractPaletteFromMedia={extractPaletteFromMedia}
            ICON_LOGIC_PRESETS={ICON_LOGIC_PRESETS}
            ICON_CATEGORIES={ICON_CATEGORIES}
            ICON_LIBRARY={ICON_LIBRARY}
            ELEMENT_LIBRARY={ELEMENT_LIBRARY}
            GRAPHIC_LIBRARY={GRAPHIC_LIBRARY}
            ICON_POSITION_PRESETS={ICON_POSITION_PRESETS}
            ICON_ANIMATION_PRESETS={ICON_ANIMATION_PRESETS}
            TEXT_BG_LOGIC_PRESETS={TEXT_BG_LOGIC_PRESETS}
            TEXT_BG_PATTERN_CATEGORIES={TEXT_BG_PATTERN_CATEGORIES}
            TEXT_BG_PATTERNS={TEXT_BG_PATTERNS}
            DOODLE_LOGIC_PRESETS={DOODLE_LOGIC_PRESETS}
            DOODLE_CATEGORIES={DOODLE_CATEGORIES}
            DOODLE_LIBRARY={DOODLE_LIBRARY}
            DOODLE_ANIMATION_PRESETS={DOODLE_ANIMATION_PRESETS}
            previewRowIndex={previewRowIndex}
            captionPreviewWords={captionPreviewWords}
            voiceCaptionMap={voiceCaptionMap}
            voiceFiles={voiceFiles}
            previewVoiceIndex={previewVoiceIndex}
          />
        </OverlayEditorPanel>
      )}
    </div>
  );
}

