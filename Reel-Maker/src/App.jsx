import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Upload, FileSpreadsheet, Play, Download, Loader2, Video, Eye, Pause, Sliders, Music, Zap, Clock, FolderArchive, ToggleLeft, ToggleRight, List, FolderInput, Square, PlayCircle, Film, FileAudio, Shuffle, ListOrdered, Mic, Volume2, Image, Move, Trash2, Sparkles, Plus, Check, X, Edit2 } from 'lucide-react';
import api from './api';
import { AUTO_PRESETS, AUTO_PRESET_CATEGORIES, KINETIC_EFFECTS, FONTS, FONT_PRESETS, FONT_LOGIC_PRESETS, ANIMATION_PRESETS, ANIMATION_LOGIC_PRESETS, COLOR_PRESETS, GRADIENT_PRESETS, COLOR_LOGIC_PRESETS, ICON_LOGIC_PRESETS, WORD_HIGHLIGHT_LINE_OPTIONS, getIconForWord, getColorForIndex, getFontForIndex, DEFAULT_TEXT_STYLE, ICON_CATEGORIES, ICON_LIBRARY, ELEMENT_LIBRARY, GRAPHIC_LIBRARY, ICON_ANIMATION_PRESETS, ICON_POSITION_PRESETS, getIntentFromText, getIconForIntent, TEXT_BG_PATTERN_CATEGORIES, TEXT_BG_PATTERNS, DOODLE_CATEGORIES, DOODLE_LIBRARY, TEXT_BG_LOGIC_PRESETS, DOODLE_LOGIC_PRESETS, DOODLE_ANIMATION_PRESETS, getTextBgForIntent, getDoodleCategoryForIntent, drawTextBgPattern, drawDoodlesOnArea } from './textStylePresets';
import { BACKGROUND_PATTERN_PRESETS, drawBackgroundPattern } from './backgroundPresets';
import {
  pickEqualTimePartIndex,
  getActiveCaptionWordGlobalIndex,
  getCaptionLayoutText,
  buildFullCaptionScript,
  overlayUsesCaptions,
  flattenCaptionWords,
  getDisplayedWordGlobalIndex,
  resolveOverlayWithCaptionPreset,
  resolveConfigForCaptionPreset,
} from './overlayRenderer';
import { getWordSizeScale, getWordLayoutOffset } from './presets/captionPresetEngine.js';
import { applyCaptionPresetToOverlay } from './presets/captionPresetMerge.js';
import { getCaptionPreviewWords } from './utils/captionIntegration';
import {
  resolveBoxPadding,
  resolveBoxCornerRadius,
  resolveStrokeWidth,
  resolveFontSizePx,
  clampBlockStartY,
  clampTextAnchorX,
  resolveTextMaxWidth,
  resolveBlockFontScale,
} from './utils/overlayStyleMetrics';
import { ensureOverlayFontsReady } from './utils/fontReady';
import {
  shouldApplyBackgroundEffects,
  resolveBackgroundEffectDuration,
  DEFAULT_BACKGROUND_EFFECTS,
} from './effects/backgroundEffectsCatalog';
import { renderBackgroundWithEffects } from './effects/backgroundEffectsEngine';
import { LINE_ANIM_MODES, LINE_ANIM_EFFECTS, VIDEO_MERGE_TRANSITIONS } from './constants';
import { loadScript, getAspectRatioDimensions } from './appUtils';
import { useVideoPipeline } from './hooks/useVideoPipeline';
import { useServerJobPolling } from './hooks/useServerJobPolling';
import { useTTS } from './hooks/useTTS';
import { useCaptions } from './hooks/useCaptions';
import CaptionStudio from './components/captions/CaptionStudio';
import {
  buildDrawConfig,
  buildPreviewRowData,
  hasAnyCaptions,
  captionsReadyForVoice,
  applyCaptionTimingToConfig,
  getCaptionDurationSec,
  getCaptionEntry,
} from './utils/captionIntegration';
import { resolveTextTabPreviewPin } from './utils/contentLineSettings.js';
import {
  resolveExportBitrates,
  resolveExportFps,
  applyResolvedExportFps,
  estimateExportFileSizeMb,
  applyExportPresetToVideo,
} from './utils/exportSettings';
import {
  extractAudioFallback,
  handleBatchExtractAudioImpl,
  downloadExtractedAudioImpl,
  downloadAllExtractedAudiosImpl,
  clearExtractedAudiosImpl,
} from './pipeline/audioExtraction';
import { mergeVideosInBatchesImpl } from './pipeline/videoMergeImpl';
import { ExportTextLayoutCache } from './utils/exportTextLayoutCache.js';
import { buildExportVideoSlots } from './utils/exportVideoSlots.js';
import { resolvePreviewCanvasSize } from './utils/previewCanvasSize.js';
import { applyPreviewVideoLayerStyle } from './utils/previewVideoLayer.js';
import {
  resolvePreviewVideoIndex,
  resolvePreviewImageIndex,
  getPreviewVideoNavState,
  getPreviewImageNavState,
} from './utils/previewBulkNav.js';
import {
  drawOverlaysCore,
  drawLogoCore,
} from '@reel-maker/render-core';
import { createOverlayDrawDeps } from './overlay/overlayDrawDeps.js';
import { resolveIcon } from './overlay/resolveIcon.js';
import LoginScreen from './components/LoginScreen';
import GeneratedAudiosPanel from './components/GeneratedAudiosPanel';
import AppHeader from './components/AppHeader';
import AdminPanelContainer from './components/AdminPanelContainer';
import ExcelTTSPanel from './components/TTS/ExcelTTSPanel';
import TTSLayout from './components/TTS/TTSLayout';
import UploadTab from './components/UploadTab';
import SettingsPanel from './components/SettingsPanel';
import ProjectsPanel from './components/ProjectsPanel';
import MoreFeaturesPanel from './components/MoreFeaturesPanel';
import ExportTab from './components/ExportTab';
import PreviewAndResultsPanel from './components/PreviewAndResultsPanel';
import SettingsOverlayGrid from './components/SettingsOverlayGrid';

/** If backend /voices is unreachable, keep a minimal UI list. */
const OFFLINE_NEURAL_VOICES = [
  { id: 'en_jenny', voice: 'en-US-JennyNeural', lang: 'en-US', gender: 'female', label: 'Jenny — USA', category: 'English USA', pitchTier: 'mid' },
  { id: 'en_aria', voice: 'en-US-AriaNeural', lang: 'en-US', gender: 'female', label: 'Aria — USA (bright)', category: 'English USA', pitchTier: 'high' },
  { id: 'en_michelle', voice: 'en-US-MichelleNeural', lang: 'en-US', gender: 'female', label: 'Michelle — USA', category: 'English USA', pitchTier: 'mid' },
  { id: 'en_elizabeth', voice: 'en-US-ElizabethNeural', lang: 'en-US', gender: 'female', label: 'Elizabeth — USA', category: 'English USA', pitchTier: 'mid' },
  { id: 'en_ava', voice: 'en-US-AvaNeural', lang: 'en-US', gender: 'female', label: 'Ava — USA', category: 'English USA', pitchTier: 'mid' },
  { id: 'en_emma', voice: 'en-US-EmmaNeural', lang: 'en-US', gender: 'female', label: 'Emma — USA', category: 'English USA', pitchTier: 'mid' },
  { id: 'en_amber', voice: 'en-US-AmberNeural', lang: 'en-US', gender: 'female', label: 'Amber — USA', category: 'English USA', pitchTier: 'mid' },
  { id: 'en_sara', voice: 'en-US-SaraNeural', lang: 'en-US', gender: 'female', label: 'Sara — USA', category: 'English USA', pitchTier: 'high' },
  { id: 'en_ana', voice: 'en-US-AnaNeural', lang: 'en-US', gender: 'female', label: 'Ana — USA (soft)', category: 'English USA', pitchTier: 'high' },
  { id: 'en_ashley', voice: 'en-US-AshleyNeural', lang: 'en-US', gender: 'female', label: 'Ashley — USA', category: 'English USA', pitchTier: 'high' },
  { id: 'en_nancy', voice: 'en-US-NancyNeural', lang: 'en-US', gender: 'female', label: 'Nancy — USA', category: 'English USA', pitchTier: 'high' },
  { id: 'en_roger', voice: 'en-US-RogerNeural', lang: 'en-US', gender: 'male', label: 'Roger — USA (bass)', category: 'English USA', pitchTier: 'low' },
  { id: 'en_brian', voice: 'en-US-BrianNeural', lang: 'en-US', gender: 'male', label: 'Brian — USA (deep)', category: 'English USA', pitchTier: 'low' },
  { id: 'en_christopher', voice: 'en-US-ChristopherNeural', lang: 'en-US', gender: 'male', label: 'Christopher — USA (bass)', category: 'English USA', pitchTier: 'low' },
  { id: 'en_guy', voice: 'en-US-GuyNeural', lang: 'en-US', gender: 'male', label: 'Guy — USA', category: 'English USA', pitchTier: 'mid' },
  { id: 'en_davis', voice: 'en-US-DavisNeural', lang: 'en-US', gender: 'male', label: 'Davis — USA', category: 'English USA', pitchTier: 'low' },
  { id: 'en_eric', voice: 'en-US-EricNeural', lang: 'en-US', gender: 'male', label: 'Eric — USA', category: 'English USA', pitchTier: 'mid' },
  { id: 'en_tony', voice: 'en-US-TonyNeural', lang: 'en-US', gender: 'male', label: 'Tony — USA', category: 'English USA', pitchTier: 'low' },
  { id: 'en_jason', voice: 'en-US-JasonNeural', lang: 'en-US', gender: 'male', label: 'Jason — USA', category: 'English USA', pitchTier: 'mid' },
  { id: 'en_steffan', voice: 'en-US-SteffanNeural', lang: 'en-US', gender: 'male', label: 'Steffan — USA (deep)', category: 'English USA', pitchTier: 'low' },
  { id: 'en_jacob', voice: 'en-US-JacobNeural', lang: 'en-US', gender: 'male', label: 'Jacob — USA', category: 'English USA', pitchTier: 'low' },
  { id: 'en_elizabeth', voice: 'en-US-ElizabethNeural', lang: 'en-US', gender: 'female', label: 'Elizabeth — USA', category: 'English USA', pitchTier: 'mid' },
  { id: 'en_monica', voice: 'en-US-MonicaNeural', lang: 'en-US', gender: 'female', label: 'Monica — USA', category: 'English USA', pitchTier: 'mid' },
  { id: 'en_jane', voice: 'en-US-JaneNeural', lang: 'en-US', gender: 'female', label: 'Jane — USA', category: 'English USA', pitchTier: 'mid' },
  { id: 'en_cora', voice: 'en-US-CoraNeural', lang: 'en-US', gender: 'female', label: 'Cora — USA', category: 'English USA', pitchTier: 'mid' },
  { id: 'en_gb_libby', voice: 'en-GB-LibbyNeural', lang: 'en-GB', gender: 'female', label: 'Libby — UK', category: 'English UK', pitchTier: 'high' },
  { id: 'en_gb_sonia', voice: 'en-GB-SoniaNeural', lang: 'en-GB', gender: 'female', label: 'Sonia — UK', category: 'English UK', pitchTier: 'mid' },
  { id: 'en_gb_maisie', voice: 'en-GB-MaisieNeural', lang: 'en-GB', gender: 'female', label: 'Maisie — UK (youth)', category: 'English UK', pitchTier: 'high' },
  { id: 'en_gb_ryan', voice: 'en-GB-RyanNeural', lang: 'en-GB', gender: 'male', label: 'Ryan — UK', category: 'English UK', pitchTier: 'low' },
  { id: 'en_gb_thomas', voice: 'en-GB-ThomasNeural', lang: 'en-GB', gender: 'male', label: 'Thomas — UK', category: 'English UK', pitchTier: 'low' },
  { id: 'en_au_natasha', voice: 'en-AU-NatashaNeural', lang: 'en-AU', gender: 'female', label: 'Natasha — Australia', category: 'English AU', pitchTier: 'mid' },
  { id: 'en_au_william', voice: 'en-AU-WilliamMultilingualNeural', lang: 'en-AU', gender: 'male', label: 'William — Australia', category: 'English AU', pitchTier: 'low' },
  { id: 'en_in_neerja', voice: 'en-IN-NeerjaNeural', lang: 'en-IN', gender: 'female', label: 'Neerja (India English)', category: 'English IN', pitchTier: 'mid' },
  { id: 'en_in_prabhat', voice: 'en-IN-PrabhatNeural', lang: 'en-IN', gender: 'male', label: 'Prabhat (India English)', category: 'English IN', pitchTier: 'low' },
  { id: 'en_in_neerja_exp', voice: 'en-IN-NeerjaExpressiveNeural', lang: 'en-IN', gender: 'female', label: 'Neerja expressive (India)', category: 'English IN', pitchTier: 'high' },
  { id: 'en_nz_molly', voice: 'en-NZ-MollyNeural', lang: 'en-NZ', gender: 'female', label: 'Molly — New Zealand', category: 'English NZ', pitchTier: 'high' },
]

const TTS_CATEGORY_ORDER = [
  'Punjabi',
  'English USA',
  'English UK',
  'English AU',
  'English Canada',
  'English Ireland',
  'English NZ',
  'Hindi',
  'English IN',
  'Indian Regional',
  'International',
  'Premium',
  'Other',
]

function categoriesForNeuralVoices(voices) {
  const cats = [...new Set(voices.map((v) => v.category).filter(Boolean))]
  return cats.sort((a, b) => {
    const ia = TTS_CATEGORY_ORDER.indexOf(a)
    const ib = TTS_CATEGORY_ORDER.indexOf(b)
    if (ia >= 0 && ib >= 0) return ia - ib
    if (ia >= 0) return -1
    if (ib >= 0) return 1
    return a.localeCompare(b)
  })
}

const App = () => {
  const [videos, setVideos] = useState([]);
  const [voiceFiles, setVoiceFiles] = useState([]);
  const [musicFiles, setMusicFiles] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [previewRowIndex, setPreviewRowIndex] = useState(0); // which Excel row to show in preview (default: row with most columns that have text)
  const [previewVoiceIndex, setPreviewVoiceIndex] = useState(0);
  const [previewVideoIndex, setPreviewVideoIndex] = useState(0);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [voiceCaptionMap, setVoiceCaptionMap] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentVideoProgress, setCurrentVideoProgress] = useState(0);
  const [parallelProgress, setParallelProgress] = useState({});
  const [logs, setLogs] = useState("Ready to start...");
  const [finished, setFinished] = useState(false);
  const [libsLoaded, setLibsLoaded] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [activeOverlayIndex, setActiveOverlayIndex] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [zipFolderName, setZipFolderName] = useState("my_videos");
  const [processedVideos, setProcessedVideos] = useState([]);
  const [batchExtracting, setBatchExtracting] = useState(false);
  const [audioExtractionQuality, setAudioExtractionQuality] = useState(128000);
  const [extractedAudios, setExtractedAudios] = useState([]); // Store extracted audio files
  const [videoMerging, setVideoMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [mergeTimeElapsed, setMergeTimeElapsed] = useState(0);
  const [mergeTimeTotal, setMergeTimeTotal] = useState(0);
  const [mergedResults, setMergedResults] = useState([]);
  const [mergeStartTime, setMergeStartTime] = useState(null);
  const [thumbnailExtracting, setThumbnailExtracting] = useState(false);
  const [thumbnailProgress, setThumbnailProgress] = useState(0);
  const [extractedThumbnails, setExtractedThumbnails] = useState([]);
  const [thumbnailFormat, setThumbnailFormat] = useState('png');
  const [thumbnailQuality, setThumbnailQuality] = useState(0.95);
  const [thumbnailFolderName, setThumbnailFolderName] = useState('video_thumbnails');
  const [imageFiles, setImageFiles] = useState([]);
  const [previewImageReady, setPreviewImageReady] = useState(false); // Triggers redraw when image loads
  const [imageCombineMode, setImageCombineMode] = useState(false);
  const [imageSlideDurationSec, setImageSlideDurationSec] = useState(2);
  const [imageBatchSize, setImageBatchSize] = useState('');
  const [videoBatchSize, setVideoBatchSize] = useState('');
  const [voiceBatchSize, setVoiceBatchSize] = useState('');
  const [musicBatchSize, setMusicBatchSize] = useState('');
  const [excelRowsPerVideo, setExcelRowsPerVideo] = useState('');
  const [excelFrameMode, setExcelFrameMode] = useState('colPerFrame');
  const [estimatedContentDuration, setEstimatedContentDuration] = useState(null);
  const [previewVoiceDurationSec, setPreviewVoiceDurationSec] = useState(null); // seconds, from preview video or image slideshow

  // Selection Mode: separate for video, audio, and images
  const [videoMode, setVideoMode] = useState('sequence');
  const [audioMode, setAudioMode] = useState('sequence');
  const [imageMode, setImageMode] = useState('sequence');
  
  // Advanced Shuffle System - maintains state for perfect distribution
  const shuffleStateRef = useRef({
    videoIndices: [],
    audioIndices: [],
    imageIndices: [],
    videoPtr: 0,
    audioPtr: 0,
    imagePtr: 0,
    seed: Date.now()
  });

  // Fisher-Yates shuffle with seed
  const seededShuffle = (array, seed) => {
    const result = [...array];
    let s = seed;
    const random = () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  // Initialize shuffle indices (imageCount optional - for image-only processing)
  const initShuffleState = useCallback((videoCount, audioCount, imageCount) => {
    const seed = Date.now();
    const imgCount = imageCount ?? videoCount;
    shuffleStateRef.current = {
      videoIndices: seededShuffle([...Array(videoCount).keys()], seed),
      audioIndices: seededShuffle([...Array(audioCount).keys()], seed + 1),
      imageIndices: seededShuffle([...Array(imgCount).keys()], seed + 2),
      videoPtr: 0,
      audioPtr: 0,
      imagePtr: 0,
      seed
    };
  }, []);

  // Get next video index based on mode
  const getNextVideoIndex = useCallback((mode, totalVideos, currentRow) => {
    if (mode === 'sequence') {
      return currentRow % totalVideos;
    }
    // Shuffle mode with perfect distribution
    const state = shuffleStateRef.current;
    if (state.videoPtr >= state.videoIndices.length) {
      // Reshuffle when exhausted
      state.videoIndices = seededShuffle([...Array(totalVideos).keys()], Date.now());
      state.videoPtr = 0;
    }
    return state.videoIndices[state.videoPtr++];
  }, []);

  // Get next audio index based on mode
  const getNextAudioIndex = useCallback((mode, totalAudios, currentRow) => {
    if (mode === 'sequence') {
      return currentRow % totalAudios;
    }
    // Shuffle mode with perfect distribution
    const state = shuffleStateRef.current;
    if (state.audioPtr >= state.audioIndices.length) {
      // Reshuffle when exhausted
      state.audioIndices = seededShuffle([...Array(totalAudios).keys()], Date.now());
      state.audioPtr = 0;
    }
    return state.audioIndices[state.audioPtr++];
  }, []);

  // Get next image index based on mode (sequence or shuffle)
  const getNextImageIndex = useCallback((mode, totalImages, currentRow) => {
    if (mode === 'sequence') {
      return currentRow % totalImages;
    }
    const state = shuffleStateRef.current;
    if (state.imagePtr >= state.imageIndices.length || state.imageIndices.length !== totalImages) {
      state.imageIndices = seededShuffle([...Array(totalImages).keys()], Date.now());
      state.imagePtr = 0;
    }
    return state.imageIndices[state.imagePtr++];
  }, []);

  // Logo/Watermark States
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoEnabled, setLogoEnabled] = useState(true);
  const [logoSize, setLogoSize] = useState(15); // percentage of video width
  const [logoPosition, setLogoPosition] = useState('bottom-right'); // position
  const [logoOpacity, setLogoOpacity] = useState(1);
  const [logoPadding, setLogoPadding] = useState(3); // percentage padding from edges
  const logoImageRef = useRef(null);

  // UI Tab Navigation
  const [activeTab, setActiveTab] = useState('upload'); // upload, tts, captions, overlay, settings, moreFeatures, backend
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  // User Presets (auto-save current settings to "Current" preset when user changes any option)
  const AUTO_SAVE_PRESET_NAME = 'Current';
  const [userPresets, setUserPresets] = useState([]);
  const [presetName, setPresetName] = useState('');
  const [presetSaving, setPresetSaving] = useState(false);
  const [presetLoading, setPresetLoading] = useState(false);
  const autoSavePresetTimerRef = useRef(null);
  const autoSavePresetSkipFirstRef = useRef(true);

  // Admin panel
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [adminNewEmail, setAdminNewEmail] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminNewName, setAdminNewName] = useState('');
  const [adminNewRole, setAdminNewRole] = useState('user');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminEditId, setAdminEditId] = useState(null);
  const [adminEditData, setAdminEditData] = useState({});
  const [serverProcessing, setServerProcessing] = useState(false);
  const [serverJobId, setServerJobId] = useState(null);
  const [serverProgress, setServerProgress] = useState(0);
  const [serverJobMeta, setServerJobMeta] = useState({ total: 0, completed: 0, slots: [] });
  const [serverJobType, setServerJobType] = useState('video');
  const [backendCapabilities, setBackendCapabilities] = useState(null);
  useEffect(() => {
    api.getCapabilities().then(cap => { setBackendCapabilities(cap); }).catch(() => {});
    if (api.isLoggedIn()) {
      setUser(api.getUser());
      api.getUserPresets().then(list => setUserPresets(Array.isArray(list) ? list : [])).catch(() => {});
    }
  }, []);

  // TTS (Text-to-Speech) States
  const [ttsColumn, setTtsColumn] = useState(0);
  const [ttsMode, setTtsMode] = useState('column'); // 'column' or 'row'
  const [ttsSelectedRows, setTtsSelectedRows] = useState([]); // for row mode
  const [ttsSpeaker, setTtsSpeaker] = useState('en_jenny');
  const [ttsMood, setTtsMood] = useState('normal');
  const [ttsRate, setTtsRate] = useState(1.0);
  const [ttsPitch, setTtsPitch] = useState(1.0);
  const [ttsQuality, setTtsQuality] = useState(128000);
  const [ttsGenerating, setTtsGenerating] = useState(false);
  const [ttsProgress, setTtsProgress] = useState(0);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [backendVoices, setBackendVoices] = useState([]);
  const [generatedAudios, setGeneratedAudios] = useState([]);
  const [ttsPreviewText, setTtsPreviewText] = useState('');
  const [excelFileName, setExcelFileName] = useState('');
  const [ttsSampleLoading, setTtsSampleLoading] = useState(false);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(-1);
  const [ttsMuted, setTtsMuted] = useState(true);

  // ==================== ADVANCED TTS ENGINE ====================

  const getNeuralVoicesForUI = () => (backendVoices.length > 0 ? backendVoices : OFFLINE_NEURAL_VOICES)
  const getNeuralVoiceCategoriesForUI = () => categoriesForNeuralVoices(getNeuralVoicesForUI())

  // Speaker gender for Voice Mood & Voice Effects (works with neural voices)
  const [ttsSpeakerGender, setTtsSpeakerGender] = useState('female');
  const speakerGenderOptions = [
    { id: 'female', label: 'Female', icon: 'â™€' },
    { id: 'male', label: 'Male', icon: 'â™‚' },
    { id: 'neutral', label: 'Neutral', icon: 'â—Ž' },
  ];
  const genderModifiers = {
    female: { pitchMod: 1.08, rateMod: 1.02, volumeMod: 1.0 },
    male: { pitchMod: 0.92, rateMod: 0.98, volumeMod: 1.0 },
    neutral: { pitchMod: 1.0, rateMod: 1.0, volumeMod: 1.0 },
  };

  // Professional Mood/Emotion Presets (scientifically calibrated)
  const moodPresets = {
    normal: { rate: 1.0, pitch: 1.0, label: 'Normal', icon: 'ðŸ˜', desc: 'Natural speech', intensity: 1.0 },
    sad: { rate: 0.68, pitch: 0.82, label: 'Sad', icon: 'ðŸ˜¢', desc: 'Emotional, slow', intensity: 0.8 },
    crying: { rate: 0.55, pitch: 0.75, label: 'Crying', icon: 'ðŸ˜­', desc: 'Very emotional', intensity: 0.6 },
    scary: { rate: 0.58, pitch: 0.45, label: 'Scary', icon: 'ðŸ‘»', desc: 'Horror effect', intensity: 0.7 },
    horror: { rate: 0.48, pitch: 0.35, label: 'Horror', icon: 'ðŸ’€', desc: 'Deep horror', intensity: 0.5 },
    romantic: { rate: 0.78, pitch: 1.08, label: 'Romantic', icon: 'ðŸ’•', desc: 'Soft, loving', intensity: 0.85 },
    flirty: { rate: 0.85, pitch: 1.18, label: 'Flirty', icon: 'ðŸ˜˜', desc: 'Playful love', intensity: 0.9 },
    motivational: { rate: 1.12, pitch: 1.18, label: 'Motivational', icon: 'ðŸ’ª', desc: 'Inspiring', intensity: 1.2 },
    inspiring: { rate: 1.05, pitch: 1.25, label: 'Inspiring', icon: 'âœ¨', desc: 'Uplifting', intensity: 1.15 },
    serious: { rate: 0.82, pitch: 0.78, label: 'Serious', icon: 'ðŸ˜', desc: 'Firm, stern', intensity: 0.9 },
    happy: { rate: 1.18, pitch: 1.28, label: 'Happy', icon: 'ðŸ˜„', desc: 'Joyful', intensity: 1.2 },
    excited: { rate: 1.35, pitch: 1.42, label: 'Excited', icon: 'ðŸ¤©', desc: 'High energy', intensity: 1.4 },
    angry: { rate: 1.25, pitch: 0.62, label: 'Angry', icon: 'ðŸ˜¡', desc: 'Intense anger', intensity: 1.3 },
    furious: { rate: 1.4, pitch: 0.52, label: 'Furious', icon: 'ðŸ¤¬', desc: 'Extreme anger', intensity: 1.5 },
    whisper: { rate: 0.72, pitch: 1.32, label: 'Whisper', icon: 'ðŸ¤«', desc: 'Soft secret', intensity: 0.5 },
    calm: { rate: 0.72, pitch: 0.92, label: 'Calm', icon: 'ðŸ˜Œ', desc: 'Peaceful', intensity: 0.75 },
    meditation: { rate: 0.58, pitch: 0.88, label: 'Meditation', icon: 'ðŸ§˜', desc: 'Deep calm', intensity: 0.6 },
    dramatic: { rate: 0.62, pitch: 0.52, label: 'Dramatic', icon: 'ðŸŽ­', desc: 'Theatrical', intensity: 0.9 },
    news: { rate: 1.08, pitch: 1.02, label: 'News', icon: 'ðŸ“º', desc: 'Professional', intensity: 1.0 },
    documentary: { rate: 0.92, pitch: 0.95, label: 'Documentary', icon: 'ðŸŽ¬', desc: 'Narrator', intensity: 0.95 },
    story: { rate: 0.82, pitch: 1.02, label: 'Storytelling', icon: 'ðŸ“–', desc: 'Narrative', intensity: 0.9 },
    prayer: { rate: 0.62, pitch: 0.88, label: 'Prayer', icon: 'ðŸ¤²', desc: 'Devotional', intensity: 0.7 },
    comedy: { rate: 1.22, pitch: 1.38, label: 'Comedy', icon: 'ðŸ˜‚', desc: 'Funny', intensity: 1.25 },
    sarcastic: { rate: 1.15, pitch: 0.88, label: 'Sarcastic', icon: 'ðŸ™„', desc: 'Witty', intensity: 1.1 },
    questioning: { rate: 0.95, pitch: 1.22, label: 'Questioning', icon: 'ðŸ¤”', desc: 'Curious', intensity: 1.0 },
    surprised: { rate: 1.28, pitch: 1.48, label: 'Surprised', icon: 'ðŸ˜²', desc: 'Shocked', intensity: 1.3 },
    confident: { rate: 0.95, pitch: 0.88, label: 'Confident', icon: 'ðŸ˜Ž', desc: 'Bold, sure', intensity: 1.05 },
    shy: { rate: 0.78, pitch: 1.15, label: 'Shy', icon: 'ðŸ˜³', desc: 'Hesitant', intensity: 0.7 },
    tired: { rate: 0.62, pitch: 0.82, label: 'Tired', icon: 'ðŸ˜´', desc: 'Exhausted', intensity: 0.6 },
    sick: { rate: 0.58, pitch: 0.78, label: 'Sick', icon: 'ðŸ¤’', desc: 'Weak voice', intensity: 0.5 },
    whisper_deep: { rate: 0.65, pitch: 0.45, label: 'Deep Whisper', icon: 'ðŸ•µï¸', desc: 'Secretive, deep', intensity: 0.7 },
    shouting: { rate: 1.25, pitch: 1.15, label: 'Shouting', icon: 'ðŸ“¢', desc: 'Loud energy', intensity: 1.4 },
    robot_monotone: { rate: 0.95, pitch: 1.0, label: 'Monotone', icon: 'ðŸ¤–', desc: 'Flat robot', intensity: 1.0 },
    fast_news: { rate: 1.35, pitch: 1.05, label: 'Fast News', icon: 'ðŸƒ', desc: 'Breaking news', intensity: 1.3 },
  };

  // Advanced Voice Style Effects (Real-time modifiers)
  const [ttsEffect, setTtsEffect] = useState('none');
  const audioEffects = {
    none: { label: 'Natural', icon: 'ðŸŽ™ï¸', desc: 'Original quality', pitchMod: 1.0, rateMod: 1.0, category: 'basic' },
    clear: { label: 'Crystal Clear', icon: 'ðŸ’Ž', desc: 'HD clarity', pitchMod: 1.02, rateMod: 0.95, category: 'quality' },
    warm: { label: 'Warm', icon: 'â˜€ï¸', desc: 'Soft warm tone', pitchMod: 0.92, rateMod: 0.95, category: 'quality' },
    bright: { label: 'Bright', icon: 'âœ¨', desc: 'Crisp bright', pitchMod: 1.15, rateMod: 1.02, category: 'quality' },
    deep: { label: 'Deep Bass', icon: 'ðŸ”‰', desc: 'Very deep', pitchMod: 0.48, rateMod: 0.82, category: 'effect' },
    deeper: { label: 'Ultra Deep', icon: 'ðŸŽ¸', desc: 'Extreme bass', pitchMod: 0.35, rateMod: 0.72, category: 'effect' },
    high: { label: 'High Tone', icon: 'ðŸŽµ', desc: 'High pitch', pitchMod: 1.75, rateMod: 1.0, category: 'effect' },
    higher: { label: 'Very High', icon: 'ðŸŽ¶', desc: 'Extreme high', pitchMod: 1.95, rateMod: 1.05, category: 'effect' },
    slow: { label: 'Slow Motion', icon: 'ðŸ¢', desc: 'Very slow', pitchMod: 0.88, rateMod: 0.55, category: 'speed' },
    slower: { label: 'Ultra Slow', icon: 'ðŸ¦¥', desc: 'Extreme slow', pitchMod: 0.82, rateMod: 0.42, category: 'speed' },
    fast: { label: 'Fast', icon: 'âš¡', desc: 'Quick pace', pitchMod: 1.08, rateMod: 1.45, category: 'speed' },
    faster: { label: 'Rapid', icon: 'ðŸš€', desc: 'Very fast', pitchMod: 1.12, rateMod: 1.72, category: 'speed' },
    robot: { label: 'Robot', icon: 'ðŸ¤–', desc: 'Mechanical', pitchMod: 0.68, rateMod: 1.18, category: 'character' },
    ai: { label: 'AI Voice', icon: 'ðŸ§ ', desc: 'Digital AI', pitchMod: 0.78, rateMod: 1.08, category: 'character' },
    alien: { label: 'Alien', icon: 'ðŸ‘½', desc: 'Space being', pitchMod: 1.58, rateMod: 0.88, category: 'character' },
    demon: { label: 'Demon', icon: 'ðŸ˜ˆ', desc: 'Dark evil', pitchMod: 0.28, rateMod: 0.65, category: 'character' },
    angel: { label: 'Angel', icon: 'ðŸ‘¼', desc: 'Heavenly', pitchMod: 1.45, rateMod: 0.85, category: 'character' },
    ghost: { label: 'Ghost', icon: 'ðŸ‘»', desc: 'Ethereal', pitchMod: 1.35, rateMod: 0.72, category: 'character' },
    monster: { label: 'Monster', icon: 'ðŸ‘¹', desc: 'Beast voice', pitchMod: 0.32, rateMod: 0.68, category: 'character' },
    giant: { label: 'Giant', icon: 'ðŸ¦', desc: 'Huge being', pitchMod: 0.38, rateMod: 0.72, category: 'character' },
    fairy: { label: 'Fairy', icon: 'ðŸ§š', desc: 'Magical tiny', pitchMod: 1.85, rateMod: 1.15, category: 'character' },
    chipmunk: { label: 'Chipmunk', icon: 'ðŸ¿ï¸', desc: 'Cartoon cute', pitchMod: 1.95, rateMod: 1.28, category: 'character' },
    mouse: { label: 'Mouse', icon: 'ðŸ­', desc: 'Tiny squeaky', pitchMod: 1.88, rateMod: 1.22, category: 'character' },
    bear: { label: 'Bear', icon: 'ðŸ»', desc: 'Big growly', pitchMod: 0.42, rateMod: 0.78, category: 'character' },
    dragon: { label: 'Dragon', icon: 'ðŸ‰', desc: 'Powerful', pitchMod: 0.35, rateMod: 0.75, category: 'character' },
    underwater: { label: 'Underwater', icon: 'ðŸŒŠ', desc: 'Submerged', pitchMod: 0.72, rateMod: 0.68, category: 'environment' },
    echo: { label: 'Echo Hall', icon: 'ðŸ›ï¸', desc: 'Reverb effect', pitchMod: 0.95, rateMod: 0.82, category: 'environment' },
    telephone: { label: 'Phone', icon: 'ðŸ“ž', desc: 'Phone quality', pitchMod: 1.12, rateMod: 1.15, category: 'environment' },
    radio: { label: 'Radio', icon: 'ðŸ“»', desc: 'AM radio', pitchMod: 0.88, rateMod: 1.08, category: 'environment' },
    stadium: { label: 'Stadium', icon: 'ðŸŸï¸', desc: 'Announcement', pitchMod: 0.82, rateMod: 0.88, category: 'environment' },
    megaphone: { label: 'Megaphone', icon: 'ðŸ“¢', desc: 'Loud speaker', pitchMod: 0.92, rateMod: 1.18, category: 'environment' },
    cave: { label: 'Cave', icon: 'ðŸ•³ï¸', desc: 'Large echo', pitchMod: 0.85, rateMod: 0.85, category: 'environment' },
    outer_space: { label: 'Space', icon: 'ðŸš€', desc: 'Vacuum effect', pitchMod: 1.25, rateMod: 0.75, category: 'environment' },
    vintage_radio: { label: 'Old Radio', icon: 'ðŸ“»', desc: '1940s style', pitchMod: 1.15, rateMod: 1.05, category: 'environment' },
  };

  // Voice Quality Enhancement Settings
  const [voiceQualityMode, setVoiceQualityMode] = useState('balanced');
  const voiceQualityModes = {
    natural: { label: 'Natural', desc: 'Most realistic', pitchVariation: 0.02, rateVariation: 0.03 },
    balanced: { label: 'Balanced', desc: 'Best overall', pitchVariation: 0.01, rateVariation: 0.02 },
    clear: { label: 'Clear', desc: 'Maximum clarity', pitchVariation: 0, rateVariation: 0 },
    expressive: { label: 'Expressive', desc: 'More emotion', pitchVariation: 0.05, rateVariation: 0.05 }
  };

  // Control Refs
  const stopProcessingRef = useRef(false);
  const pauseProcessingRef = useRef(false);

  // Configuration State
  const [config, setConfig] = useState({
    autoDownload: true,
    // Server FFmpeg export is always preferred when the project can use it.
    serverProcessingEnabled: true,
    parallelJobs: 2,
    video: applyExportPresetToVideo({
      opacity: 1,
      zoomScale: 1,
      volume: 1,
      volumeEnabled: true,
      aspectRatio: '1080x1920',
      exportResolution: '1080p',
      useVideoAspectRatio: false,
      audioChannels: 'auto',
      audioChannelsCustom: 2,
      audioSampleRateMode: 'auto',
      audioSampleRateCustom: 48000,
      exportSpeed: 1,
    }, 'whatsapp'),
    imageFormat: "png",
    imageAspectRatio: "1080x1920",
    audio: {
      volume: 0.5,
      volumeEnabled: true,
      musicVolume: 0.3
    },
    contentMode: 'multiColumn',
    singleColumnIndex: 0,
    textSource: 'excel',
    captionSync: {
      enabled: false,
      granularity: 'line',
      columnIndex: 0,
    },
    previewVideoAudio: true,
    previewVoiceMusic: true,
    background: {
      type: 'solid',
      solidColor: '#000000',
      gradientColors: ['#1a1a2e', '#16213e'],
      patternId: 'none',
      patternColor: 'rgba(255,255,255,0.12)',
      images: [],
      videos: [],
      selectedImageIndex: 0,
      selectedVideoIndex: 0,
      imageVideoMode: 'first'
    },
    backgroundEffects: { ...DEFAULT_BACKGROUND_EFFECTS },
    overlays: [
      {
        id: 0,
        name: "Column 1",
        enabled: true,
        fontFamily: 'Arial',
        fontSize: 5,
        fontWeight: 'bold',
        color: '#FFFFFF',
        bgColor: '#000000',
        bgOpacity: 1,
        strokeColor: '#000000',
        strokeOpacity: 1,
        strokeWidthPercent: 6,
        strokeWidthPx: null,
        boxPaddingPercent: 40,
        boxPaddingPx: null,
        boxCornerRadiusPercent: 20,
        boxCornerRadiusPx: null,
        boxOffsetX: 0,
        boxOffsetY: 0,
        styleType: 'box',
        positionX: 50,
        positionY: 10,
        wordsPerLine: 4,
        textAlign: 'center',
        letterSpacing: 0,
        lineHeight: 1.4,
        shadowEnabled: false,
        shadowColor: '#000000',
        shadowBlur: 4,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        textTransform: 'none',
        animation: 'none',
        customText: '',
        punctuationBreakMarks: [],
        customBreakText: '',
        contentBreakLineSelection: 'all',
        contentTextSectionEnabled: false,
        contentPartDurations: [],
        contentPartHoldAfter: [],
        contentPartLineAnimate: [],
        contentPartLineRevealMode: [],
        contentPartLineAnimType: [],
        contentPartLineAnimSpeed: [],
        contentPartSameFrame: [],
        contentPartLineStyleOverrides: [],
        contentLineDisplayDuration: 5,
        contentLineHoldAfter: 0,
        contentLineAnimate: false,
        contentLineAnimSpeed: 2,
        contentLineRevealMode: 'wordByWord',
        contentLineAnimType: 'fadeIn',
        ...DEFAULT_TEXT_STYLE
      },
      {
        id: 1,
        name: "Column 2",
        enabled: true,
        fontFamily: 'Arial',
        fontSize: 5,
        fontWeight: 'bold',
        color: '#FFFFFF',
        bgColor: '#000000',
        bgOpacity: 0,
        strokeColor: '#000000',
        strokeOpacity: 1,
        strokeWidthPercent: 6,
        strokeWidthPx: null,
        boxPaddingPercent: 40,
        boxPaddingPx: null,
        boxCornerRadiusPercent: 20,
        boxCornerRadiusPx: null,
        boxOffsetX: 0,
        boxOffsetY: 0,
        styleType: 'stroke',
        positionX: 50,
        positionY: 50,
        wordsPerLine: 4,
        textAlign: 'center',
        letterSpacing: 0,
        lineHeight: 1.4,
        shadowEnabled: true,
        shadowColor: '#000000',
        shadowBlur: 4,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        textTransform: 'none',
        animation: 'none',
        customText: '',
        punctuationBreakMarks: [],
        customBreakText: '',
        contentBreakLineSelection: 'all',
        contentTextSectionEnabled: false,
        contentPartDurations: [],
        contentPartHoldAfter: [],
        contentPartLineAnimate: [],
        contentPartLineRevealMode: [],
        contentPartLineAnimType: [],
        contentPartLineAnimSpeed: [],
        contentPartSameFrame: [],
        contentPartLineStyleOverrides: [],
        contentLineDisplayDuration: 5,
        contentLineHoldAfter: 0,
        contentLineAnimate: false,
        contentLineAnimSpeed: 2,
        contentLineRevealMode: 'wordByWord',
        contentLineAnimType: 'fadeIn',
        ...DEFAULT_TEXT_STYLE
      }
    ]
  });

  // Refs
  const previewCanvasRef = useRef(null);
  const previewBgCanvasRef = useRef(null);
  const previewStageRef = useRef(null);
  const previewCanvasSizeRef = useRef({ width: 0, height: 0 });
  const previewBgCanvasSizeRef = useRef({ width: 0, height: 0 });
  const previewBgCacheRef = useRef({ key: '', static: false });
  const previewCtxRef = useRef(null);
  const previewTextLayoutCacheRef = useRef(null);
  const previewDrawCfgCacheRef = useRef({ key: '', cfg: null });
  const previewRowDataCacheRef = useRef({ key: '', row: null });
  const previewConfigRef = useRef(null);
  const previewCaptionMapRef = useRef(null);
  const previewVideoRef = useRef(null);
  const requestRef = useRef();
  const zipRef = useRef(null);
  const extractionVideoRef = useRef(null);
  const backgroundImageRef = useRef(null);
  const backgroundVideoRef = useRef(null);
  const previewAudioRef = useRef(null);
  const ttsSampleAudioRef = useRef(null);
  const ttsSampleUrlRef = useRef(null);
  const previewImageRef = useRef(null); // For image-only preview (uploaded images)
  const imageFolderInputRef = useRef(null);
  const videoFolderInputRef = useRef(null);
  const voiceFolderInputRef = useRef(null);
  const musicFolderInputRef = useRef(null);
  const previewSimTimeRef = useRef(0);  // Cycling time for animation/kinetic preview when not playing
  const previewTextPinRef = useRef({ time: null, lineIdx: 0 });
  const previewContainerSizeRef = useRef({ w: 0, h: 0 });
  const [previewLayoutTick, setPreviewLayoutTick] = useState(0);
  const [bgPreviewMediaTick, setBgPreviewMediaTick] = useState(0);

  const [extractedPalette, setExtractedPalette] = useState([]);

  const extractPaletteFromMedia = useCallback(async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let source = null;

    if (videos.length > 0 && backgroundVideoRef.current) {
      source = backgroundVideoRef.current;
    } else if (imageFiles.length > 0 && backgroundImageRef.current) {
      source = backgroundImageRef.current;
    }

    if (!source) return;

    try {
      // For videos, check readyState
      if (source.tagName === 'VIDEO' && source.readyState < 2) return;
      
      const w = source.videoWidth || source.naturalWidth || 100;
      const h = source.videoHeight || source.naturalHeight || 100;
      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(source, 0, 0, 100, 100);
      const data = ctx.getImageData(0, 0, 100, 100).data;
      const colors = {};
      for (let i = 0; i < data.length; i += 40) { // Sample
        const r = data[i], g = data[i+1], b = data[i+2];
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`.toUpperCase();
        colors[hex] = (colors[hex] || 0) + 1;
      }
      const sorted = Object.entries(colors).sort((a, b) => b[1] - a[1]);
      setExtractedPalette(sorted.slice(0, 12).map(e => e[0]));
    } catch (e) {
      console.error("Palette extraction failed", e);
    }
  }, [videos.length, imageFiles.length]);

  useEffect(() => {
    if (videos.length > 0 || imageFiles.length > 0 || config.background?.patternId !== 'none') {
      const timer = setTimeout(extractPaletteFromMedia, 1500); // Wait for load
      return () => clearTimeout(timer);
    }
  }, [videos.length, imageFiles.length, config.background?.patternId, extractPaletteFromMedia]);

  // Preload background image/video for preview
  useEffect(() => {
    const bg = config.background;
    if (bg?.type === 'image' && bg.images?.length > 0) {
      const url = bg.images[0]?.url;
      if (url) {
        const img = document.createElement('img');
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          backgroundImageRef.current = img;
          setBgPreviewMediaTick((n) => n + 1);
        };
        img.src = url;
        return () => { backgroundImageRef.current = null; };
      }
    }
    if (bg?.type === 'video' && bg.videos?.length > 0) {
      const url = bg.videos[0]?.url;
      if (url) {
        const vid = document.createElement('video');
        vid.muted = true;
        vid.playsInline = true;
        vid.loop = true;
        vid.oncanplaythrough = () => {
          backgroundVideoRef.current = vid;
          setBgPreviewMediaTick((n) => n + 1);
          vid.play().catch(() => {});
        };
        vid.src = url;
        vid.load();
        return () => {
          vid.pause();
          vid.src = '';
          backgroundVideoRef.current = null;
        };
      }
    }
    backgroundImageRef.current = null;
    backgroundVideoRef.current = null;
  }, [config.background?.type, config.background?.images, config.background?.videos]);

  // Load external libraries
  useEffect(() => {
    const loadLibraries = async () => {
      try {
        await Promise.all([
          loadScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"),
          loadScript("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"),
          loadScript("https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js")
        ]);
        setLibsLoaded(true);
        setLogs("Libraries loaded. Ready!");
      } catch (error) {
        setLogs("Error: Libraries failed to load. Please refresh the page.");
        console.error("Library load error:", error);
      }
    };
    loadLibraries();
  }, []);

  // Browser voices for TTS preview only
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        setLogs(`Loaded ${voices.length} voices from system.`);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    const retryTimer = setTimeout(loadVoices, 1000);

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      clearTimeout(retryTimer);
    };
  }, []);

  // Fetch backend neural voices
  useEffect(() => {
    api.fetchTTSVoices().then(data => {
      if (data?.voices?.length > 0) setBackendVoices(data.voices);
      else setBackendVoices([]);
    }).catch(() => setBackendVoices([]));
  }, []);

  // Ensure selected neural speaker id stays valid when backend voice list loads or changes
  useEffect(() => {
    const voices = getNeuralVoicesForUI();
    if (ttsSpeaker && voices.some((v) => v.id === ttsSpeaker)) return;
    if (voices.length > 0) setTtsSpeaker(voices[0].id);
  }, [backendVoices, ttsSpeaker]);

  // Preview video setup - supports bulk upload navigation
  useEffect(() => {
    const videoIdx = resolvePreviewVideoIndex({
      videos,
      previewRowIndex,
      previewVideoIndex,
      excelData,
      videoMode,
    });
    if (videos.length > 0 && previewVideoRef.current) {
      const vid = previewVideoRef.current;
      const file = videos[videoIdx];
      if (!file) return undefined;
      const url = URL.createObjectURL(file);
      vid.src = url;
      vid.loop = true;
      vid.muted = true;
      vid.playsInline = true;
      
      vid.onloadedmetadata = () => {
        if (vid.videoWidth && vid.videoHeight) {
          setDetectedVideoDims({ width: vid.videoWidth, height: vid.videoHeight });
        }
        if (vid.duration != null && isFinite(vid.duration)) {
          setEstimatedContentDuration(vid.duration);
        }
        setDetectedSourceFps(30);
      };
      
      vid.onloadeddata = () => {
        try {
          vid.currentTime = 0;
        } catch {
          /* ignore */
        }
        vid.pause();
        setIsPreviewPlaying(false);
        setBgPreviewMediaTick((n) => n + 1);
      };
      
      vid.load();
      
      return () => {
        vid.pause();
        vid.removeAttribute('src');
        vid.load();
        URL.revokeObjectURL(url);
        setEstimatedContentDuration(null);
      };
    } else {
      setDetectedVideoDims(null);
      if (imageFiles.length === 0) setEstimatedContentDuration(null);
    }
  }, [videos, previewVideoIndex, previewRowIndex, excelData, videoMode, imageFiles.length]);

  // Preload voice/music duration for preview timeline (audio drives length when longer than video).
  useEffect(() => {
    const list = voiceFiles?.length ? voiceFiles : musicFiles;
    if (!list?.length) {
      setPreviewVoiceDurationSec(null);
      return undefined;
    }
    const idx = Math.min(previewVoiceIndex, list.length - 1);
    const file = list[idx];
    const audioEl = previewAudioRef.current;
    if (!file || !audioEl) return undefined;
    const url = URL.createObjectURL(file);
    const onMeta = () => {
      if (audioEl.duration && isFinite(audioEl.duration)) {
        setPreviewVoiceDurationSec(audioEl.duration);
      }
    };
    audioEl.addEventListener('loadedmetadata', onMeta);
    audioEl.src = url;
    audioEl.load();
    return () => {
      audioEl.removeEventListener('loadedmetadata', onMeta);
      if (audioEl.src === url) {
        audioEl.removeAttribute('src');
        audioEl.load();
      }
      URL.revokeObjectURL(url);
    };
  }, [voiceFiles, musicFiles, previewVoiceIndex]);

  // Keep preview video looping while audio/captions are still playing.
  useEffect(() => {
    const video = previewVideoRef.current;
    if (!video || videos.length === 0) return undefined;
    const onEnded = () => {
      const audioEl = previewAudioRef.current;
      const audioStillPlaying =
        audioEl
        && !audioEl.paused
        && !audioEl.ended
        && audioEl.duration
        && isFinite(audioEl.duration)
        && audioEl.currentTime < audioEl.duration - 0.05;
      if (audioStillPlaying) {
        try {
          video.currentTime = 0;
          video.play().catch(() => {});
        } catch {
          /* ignore */
        }
        return;
      }
      if (isPreviewPlaying) setIsPreviewPlaying(false);
    };
    video.addEventListener('ended', onEnded);
    return () => video.removeEventListener('ended', onEnded);
  }, [videos.length, isPreviewPlaying]);

  // Preview image for upload-tab images (no main video)
  useEffect(() => {
    const useUploadImages = imageFiles.length > 0 && videos.length === 0;
    const imageIdx = resolvePreviewImageIndex({
      imageFiles,
      previewRowIndex,
      previewImageIndex,
      excelData,
      imageMode,
    });
    if (useUploadImages && imageFiles[imageIdx]) {
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      const url = URL.createObjectURL(imageFiles[imageIdx]);
      img.onload = () => {
        previewImageRef.current = img;
        setBgPreviewMediaTick((n) => n + 1);
      };
      img.src = url;
      return () => {
        URL.revokeObjectURL(url);
        previewImageRef.current = null;
      };
    }
    previewImageRef.current = null;
  }, [imageFiles, videos.length, previewImageIndex, previewRowIndex, excelData, imageMode]);

  const previewVideoNav = getPreviewVideoNavState({
    videos,
    excelData,
    videoMode,
    previewRowIndex,
    previewVideoIndex,
  });

  const previewImageNav = getPreviewImageNavState({
    imageFiles,
    excelData,
    imageMode,
    previewRowIndex,
    previewImageIndex,
  });

  const goPreviewVideoPrev = useCallback(() => {
    if (videos.length <= 1) return;
    if (excelData.length > 0 && videoMode === 'sequence') {
      setPreviewRowIndex((i) => Math.max(0, i - 1));
      return;
    }
    setPreviewVideoIndex((i) => Math.max(0, i - 1));
  }, [videos.length, excelData.length, videoMode]);

  const goPreviewVideoNext = useCallback(() => {
    if (videos.length <= 1) return;
    if (excelData.length > 0 && videoMode === 'sequence') {
      setPreviewRowIndex((i) => Math.min(excelData.length - 1, i + 1));
      return;
    }
    setPreviewVideoIndex((i) => Math.min(videos.length - 1, i + 1));
  }, [videos.length, excelData.length, videoMode]);

  const goPreviewImagePrev = useCallback(() => {
    if (imageFiles.length <= 1) return;
    if (excelData.length > 0 && imageMode === 'sequence') {
      setPreviewRowIndex((i) => Math.max(0, i - 1));
      return;
    }
    setPreviewImageIndex((i) => Math.max(0, i - 1));
  }, [imageFiles.length, excelData.length, imageMode]);

  const goPreviewImageNext = useCallback(() => {
    if (imageFiles.length <= 1) return;
    if (excelData.length > 0 && imageMode === 'sequence') {
      setPreviewRowIndex((i) => Math.min(excelData.length - 1, i + 1));
      return;
    }
    setPreviewImageIndex((i) => Math.min(imageFiles.length - 1, i + 1));
  }, [imageFiles.length, excelData.length, imageMode]);

  useEffect(() => {
    setPreviewVideoIndex((i) => Math.min(i, Math.max(0, videos.length - 1)));
  }, [videos.length]);

  useEffect(() => {
    setPreviewImageIndex((i) => Math.min(i, Math.max(0, imageFiles.length - 1)));
  }, [imageFiles.length]);

  const formatTime = (ms) => {
    if (!ms || ms < 0) return "--:--";
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    return `${minutes}m ${seconds}s`;
  };

  // Estimated export duration (content duration / export speed) for preview label
  const estimatedExportDurationSec = (() => {
    const speed = Math.max(0.25, Math.min(4, Number(config.video?.exportSpeed) || 1));
    const pvIdx = voiceFiles.length > 0 ? Math.min(previewVoiceIndex, voiceFiles.length - 1) : 0;
    const previewVoice = voiceFiles[pvIdx] || null;
    const captionDur = getCaptionDurationSec(voiceCaptionMap, previewVoice, pvIdx);
    let contentSec = null;
    if (imageFiles.length > 0 && videos.length === 0) contentSec = imageFiles.length * imageSlideDurationSec;
    else {
      const mediaDur = Math.max(
        estimatedContentDuration || 0,
        previewVoiceDurationSec || 0,
        captionDur || 0,
      );
      if (mediaDur > 0) contentSec = mediaDur;
    }
    if (contentSec == null) return null;
    return { content: contentSec, final: contentSec / speed };
  })();

  const [detectedVideoDims, setDetectedVideoDims] = useState(null);
  const [detectedSourceFps, setDetectedSourceFps] = useState(30);

  const getEffectiveDimensions = useCallback((ratioOverride) => {
    const makeEven = (n) => Math.max(2, Math.round(n / 2) * 2);
    const hasExplicitOverride = ratioOverride !== undefined && ratioOverride !== null;
    const ratio = ratioOverride || config.video?.aspectRatio || "1080x1920";
    // If the caller explicitly provided a ratio, we must respect it for export stability.
    // Otherwise, optionally allow detected video dimensions to drive preview/layout.
    if (!hasExplicitOverride && config.video?.useVideoAspectRatio && detectedVideoDims) {
      return {
        width: makeEven(detectedVideoDims.width),
        height: makeEven(detectedVideoDims.height),
      };
    }
    const dims = getAspectRatioDimensions(ratio);
    return {
      width: makeEven(dims.width),
      height: makeEven(dims.height)
    };
  }, [config.video?.aspectRatio, config.video?.useVideoAspectRatio, detectedVideoDims]);

  const getResolvedExportBitrates = useCallback(() => {
    const dims = getEffectiveDimensions();
    return resolveExportBitrates(config.video, dims);
  }, [config.video, getEffectiveDimensions]);

  const getAutoExportSettings = useCallback(() => {
    const b = getResolvedExportBitrates();
    return {
      vBitrate: b.vMbps,
      aBitrate: b.aKbps,
      aChannels: b.aChannels,
      aSampleRate: b.aSampleRate,
    };
  }, [getResolvedExportBitrates]);

  const getExportVideoBitrate = useCallback(() => {
    return getResolvedExportBitrates().vBps;
  }, [getResolvedExportBitrates]);

  const getExportAudioBitrate = useCallback(() => {
    return getResolvedExportBitrates().aBps;
  }, [getResolvedExportBitrates]);

  const getExportAudioChannels = useCallback(() => {
    return getResolvedExportBitrates().aChannels;
  }, [getResolvedExportBitrates]);

  const getExportAudioSampleRate = useCallback(() => {
    return getResolvedExportBitrates().aSampleRate;
  }, [getResolvedExportBitrates]);

  const getExportFpsForConfig = useCallback(
    (videoCfg, sourceFpsOverride = null) => {
      const src =
        sourceFpsOverride != null
          ? sourceFpsOverride
          : videoCfg?.frameRateMode === 'match' || videoCfg?.useSourceFps !== false
            ? detectedSourceFps
            : null;
      return resolveExportFps(videoCfg, src);
    },
    [detectedSourceFps]
  );

  const exportFileEstimate = useMemo(() => {
    if (!estimatedExportDurationSec) return null;
    const b = getResolvedExportBitrates();
    const mb = estimateExportFileSizeMb(b.vMbps, b.aKbps, estimatedExportDurationSec.final);
    const fps = getExportFpsForConfig(config.video);
    return { mb, fps, vMbps: b.vMbps, aKbps: b.aKbps };
  }, [estimatedExportDurationSec, getResolvedExportBitrates, getExportFpsForConfig, config.video]);

  const wrapTextImpl = (text, wordsPerLine, ctx, maxWidth) => {
    if (!text) return [];
    const s = text.toString().trim();
    if (!s) return [];
    const blocks = s.split(/\r?\n/).map(b => b.trim()).filter(Boolean);
    const lines = [];
    const wp = Math.max(1, wordsPerLine || 4);
    const useWidth = ctx && maxWidth != null && maxWidth > 0;
    const pushCharChunks = (word) => {
      if (!useWidth) {
        lines.push(word);
        return;
      }
      let chunk = '';
      for (const ch of Array.from(word)) {
        const test = chunk + ch;
        if (chunk && ctx.measureText(test).width > maxWidth) {
          lines.push(chunk);
          chunk = ch;
        } else {
          chunk = test;
        }
      }
      if (chunk) lines.push(chunk);
    };
    for (const block of blocks) {
      const words = block.split(/\s+/).filter(Boolean);
      let i = 0;
      while (i < words.length) {
        let take = Math.min(wp, words.length - i);
        if (useWidth) {
          let lineStr = words.slice(i, i + take).join(' ');
          while (take > 0 && ctx.measureText(lineStr).width > maxWidth) {
            take--;
            lineStr = take > 0 ? words.slice(i, i + take).join(' ') : '';
          }
          if (take === 0) {
            pushCharChunks(words[i]);
            i += 1;
            continue;
          }
          lines.push(words.slice(i, i + take).join(' '));
          i += take;
        } else {
          lines.push(words.slice(i, i + wp).join(' '));
          i += wp;
        }
      }
    }
    return lines;
  };

  const wrapText = (text, wordsPerLine, ctx, maxWidth, textCache) => {
    if (textCache) return textCache.wrapText(text, wordsPerLine, ctx, maxWidth, wrapTextImpl);
    return wrapTextImpl(text, wordsPerLine, ctx, maxWidth);
  };

  const drawBackgroundBase = useCallback((ctx, width, height, bg, extras = {}) => {
    if (!bg) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      return;
    }
    const type = bg.type || 'solid';
    if (type === 'solid') {
      ctx.fillStyle = bg.solidColor || '#000000';
      ctx.fillRect(0, 0, width, height);
    } else if (type === 'gradient') {
      const colors = bg.gradientColors || ['#1a1a2e', '#16213e'];
      const g = ctx.createLinearGradient(0, 0, width, height);
      colors.forEach((c, i) => g.addColorStop(i / Math.max(1, colors.length - 1), c));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    } else if (type === 'pattern') {
      const patternId = bg.patternId || 'none';
      const fg = bg.patternColor || 'rgba(255,255,255,0.12)';
      const bgCol = bg.solidColor || '#0a0a0a';
      drawBackgroundPattern(ctx, width, height, patternId, fg, bgCol);
    } else if (type === 'image' && extras.image && extras.image.complete && extras.image.naturalWidth) {
      const img = extras.image;
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      if (iw && ih) {
        const scale = Math.max(width / iw, height / ih);
        const sw = iw * scale;
        const sh = ih * scale;
        ctx.drawImage(img, (width - sw) / 2, (height - sh) / 2, sw, sh);
      } else {
        ctx.drawImage(img, 0, 0, width, height);
      }
    } else if (type === 'video' && extras.videoFrame) {
      const vf = extras.videoFrame;
      const vw = vf.displayWidth || vf.codedWidth || width;
      const vh = vf.displayHeight || vf.codedHeight || height;
      if (vw && vh) {
        const scale = Math.max(width / vw, height / vh);
        const sw = vw * scale;
        const sh = vh * scale;
        const sx = (width - sw) / 2;
        const sy = (height - sh) / 2;
        ctx.drawImage(vf, sx, sy, sw, sh);
      } else {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
      }
    } else if (type === 'video' && extras.video && extras.video.readyState >= 2) {
      const v = extras.video;
      const vw = v.videoWidth;
      const vh = v.videoHeight;
      if (vw && vh) {
        const scale = Math.max(width / vw, height / vh);
        const sw = vw * scale;
        const sh = vh * scale;
        const sx = (width - sw) / 2;
        const sy = (height - sh) / 2;
        ctx.drawImage(v, sx, sy, sw, sh);
      } else {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
      }
    } else {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
    }
  }, []);

  /** Background layer with optional animated effects (image/video backgrounds). */
  const drawBackground = useCallback((ctx, width, height, bg, extras = {}, videoTime = null, videoDuration = null, fxOverride = null, fxOpts = null) => {
    const fx = fxOverride || config.backgroundEffects || DEFAULT_BACKGROUND_EFFECTS;
    const bgForDraw =
      fxOpts?.fallbackUploadImage && extras.image?.complete
        ? { ...bg, type: 'image' }
        : bg;
    if (!shouldApplyBackgroundEffects(bg, fx, fxOpts)) {
      drawBackgroundBase(ctx, width, height, bgForDraw, extras);
      return;
    }
    const t = videoTime != null ? videoTime : 0;
    const dur = resolveBackgroundEffectDuration(videoDuration, fx);
    renderBackgroundWithEffects(
      ctx,
      width,
      height,
      (bctx, w, h) => drawBackgroundBase(bctx, w, h, bgForDraw, extras),
      t,
      dur,
      fx
    );
  }, [config.backgroundEffects, drawBackgroundBase]);

  const drawPreviewUploadImage = useCallback((ctx, img, width, height) => {
    if (!img?.complete) return;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    const scale = Math.max(width / iw, height / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    ctx.drawImage(img, (width - sw) / 2, (height - sh) / 2, sw, sh);
  }, []);

  // Draw video frame with cover fit (zoomScale: 1 = full, <1 = zoom out, ratio same)
  const drawVideoCover = useCallback((ctx, video, width, height, zoomScale = 1) => {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;
    const z = Math.max(0.5, Math.min(2, zoomScale));

    const scale = Math.max(width / vw, height / vh);
    let sw = vw * scale * z;
    let sh = vh * scale * z;
    const sx = (width - sw) / 2;
    const sy = (height - sh) / 2;

    ctx.drawImage(video, sx, sy, sw, sh);
  }, []);

  // Draw video frame with contain fit (prevents crop/WhatsApp "zoom" when aspect differs).
  const drawVideoContain = useCallback((ctx, video, width, height, zoomScale = 1) => {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;
    const z = Math.max(0.5, Math.min(2, zoomScale));

    const scale = Math.min(width / vw, height / vh);
    const sw = vw * scale * z;
    const sh = vh * scale * z;
    const sx = (width - sw) / 2;
    const sy = (height - sh) / 2;

    ctx.drawImage(video, sx, sy, sw, sh);
  }, []);


  const overlayDrawDeps = useMemo(
    () => createOverlayDrawDeps({ wrapText, resolveIcon }),
    [wrapText],
  );

  // Draw overlays on canvas (shared render-core â€” M6)
  const drawOverlays = useCallback((ctx, width, height, rowData, videoTime = null, videoDuration = null, cfg = config) => {
    drawOverlaysCore(ctx, width, height, rowData, videoTime, videoDuration, cfg, overlayDrawDeps);
  }, [config, overlayDrawDeps]);

  // Redraw preview on config change (works with or without video - background + text + logo)
  // Image-only mode: show uploaded image + overlays (no video/audio)
  const redrawPreview = useCallback(() => {
    const canvas = previewCanvasRef.current;
    const video = previewVideoRef.current;
    const audioEl = previewAudioRef.current;
    const previewImg = previewImageRef.current;
    if (!canvas) return;

    let previewEditLineIdx = null;

    if (previewConfigRef.current !== config) {
      previewConfigRef.current = config;
      previewDrawCfgCacheRef.current = { key: '', cfg: null };
      previewBgCacheRef.current = { key: '', static: false };
    }
    if (previewCaptionMapRef.current !== voiceCaptionMap) {
      previewCaptionMapRef.current = voiceCaptionMap;
      previewDrawCfgCacheRef.current = { key: '', cfg: null };
      previewRowDataCacheRef.current = { key: '', row: null };
      previewBgCacheRef.current = { key: '', static: false };
    }

    const showUploadImages = imageFiles.length > 0 && videos.length === 0;
    const settingsBgImg = backgroundImageRef.current;
    const settingsBgReady = settingsBgImg?.complete && settingsBgImg.naturalWidth;
    const uploadImgReady = previewImg?.complete && previewImg.naturalWidth;
    const bg = config.background;
    const bgType = bg?.type || 'solid';
    const fx = config.backgroundEffects || DEFAULT_BACKGROUND_EFFECTS;
    const useUploadAsBgTexture =
      showUploadImages &&
      uploadImgReady &&
      !settingsBgReady &&
      (bgType === 'image' || shouldApplyBackgroundEffects(bg, fx, { fallbackUploadImage: true }));

    const layeredPlayback =
      videos.length > 0
      && isPreviewPlaying
      && video
      && video.readyState >= 2
      && !showUploadImages;

    const stageEl = previewStageRef.current || canvas.parentElement;
    const exportDims = showUploadImages
      ? getAspectRatioDimensions(config.imageAspectRatio || config.video?.aspectRatio || '1080x1920')
      : getEffectiveDimensions();
    const { width, height } = resolvePreviewCanvasSize(exportDims, stageEl, {
      playing: layeredPlayback,
    });

    const ensureCanvasCtx = (targetCanvas, sizeRef) => {
      if (!targetCanvas) return null;
      if (sizeRef.current.width !== width || sizeRef.current.height !== height) {
        targetCanvas.width = width;
        targetCanvas.height = height;
        sizeRef.current = { width, height };
        return targetCanvas.getContext('2d');
      }
      return targetCanvas.getContext('2d');
    };

    let vTime = 0;
    let vDur = 1;
    const pvIdxEarly = voiceFiles.length > 0 ? Math.min(previewVoiceIndex, voiceFiles.length - 1) : previewRowIndex;
    const previewVoiceEarly = voiceFiles[pvIdxEarly] || null;
    const captionDurSec = getCaptionDurationSec(voiceCaptionMap, previewVoiceEarly, pvIdxEarly);
    const audioPlaying = audioEl && !audioEl.paused && !audioEl.ended && audioEl.duration && isFinite(audioEl.duration);
    const videoPlaying = video && !video.paused && !video.ended && video.readyState >= 2 && video.duration && isFinite(video.duration);
    const voiceDurHint = Math.max(
      previewVoiceDurationSec || 0,
      captionDurSec || 0,
      audioEl?.duration && isFinite(audioEl.duration) ? audioEl.duration : 0,
    );

    if (audioPlaying) {
      vTime = audioEl.currentTime;
      vDur = Math.max(audioEl.duration, voiceDurHint, video?.duration || 0, 1);
      if (video && video.readyState >= 2 && video.duration > 0) {
        const loopT = vTime % video.duration;
        if (Math.abs(video.currentTime - loopT) > 0.12) {
          try { video.currentTime = loopT; } catch { /* ignore seek errors */ }
        }
        if (video.paused && isPreviewPlaying) video.play().catch(() => {});
      }
    } else if (videoPlaying) {
      vTime = video.currentTime;
      vDur = Math.max(video.duration, voiceDurHint, 1);
    } else if (video && video.duration && isFinite(video.duration)) {
      vDur = Math.max(video.duration, voiceDurHint, 1);
      vTime = video.currentTime || 0;
    } else if (voiceFiles.length > 0 && (previewVoiceDurationSec || previewAudioRef.current?.duration)) {
      vDur = Math.max(previewVoiceDurationSec || previewAudioRef.current?.duration || captionDurSec || 0, 1);
      vTime = previewSimTimeRef.current % vDur;
      if (isPreviewPlaying) previewSimTimeRef.current = (previewSimTimeRef.current + 1 / 60) % vDur;
    } else if (musicFiles.length > 0 && previewAudioRef.current?.duration) {
      vDur = Math.max(previewAudioRef.current.duration, 1);
      vTime = previewSimTimeRef.current % vDur;
      if (isPreviewPlaying) previewSimTimeRef.current = (previewSimTimeRef.current + 1 / 60) % vDur;
    } else if (captionDurSec > 0) {
      vDur = Math.max(captionDurSec, 1);
      vTime = isPreviewPlaying ? previewSimTimeRef.current % vDur : 0;
      if (isPreviewPlaying) previewSimTimeRef.current = (previewSimTimeRef.current + 1 / 60) % vDur;
    } else {
      const estContent = estimatedExportDurationSec?.content;
      if (estContent > 0) {
        vDur = estContent;
        if (isPreviewPlaying) previewSimTimeRef.current = (previewSimTimeRef.current + 1 / 60) % vDur;
        vTime = previewSimTimeRef.current;
      } else {
        if (isPreviewPlaying) previewSimTimeRef.current = (previewSimTimeRef.current + 1 / 60) % 2.5;
        vTime = previewSimTimeRef.current;
        vDur = 2.5;
      }
    }

    if (!isPreviewPlaying) {
      const onTextTab = activeTab === 'overlay';
      const pin = previewTextPinRef.current;
      if (onTextTab && pin.time != null && Number.isFinite(pin.time)) {
        vTime = pin.time;
        vDur = Math.max(vDur, pin.time + 0.5, 1);
        previewEditLineIdx = pin.lineIdx;
      }
    }

    const bgExtras = {
      image: useUploadAsBgTexture ? previewImg : settingsBgReady ? settingsBgImg : null,
      video: bgType === 'video' ? backgroundVideoRef.current : null,
    };
    const fxOpts = useUploadAsBgTexture ? { fallbackUploadImage: true } : null;
    const drawSeparateUploadLayer =
      showUploadImages && uploadImgReady && settingsBgReady && previewImg !== settingsBgImg;

    const textTabPinned =
      !isPreviewPlaying
      && activeTab === 'overlay'
      && previewTextPinRef.current.time != null
      && Number.isFinite(previewTextPinRef.current.time);

    if (bgExtras.video?.duration && isFinite(bgExtras.video.duration) && (audioPlaying || videoPlaying || textTabPinned)) {
      const syncTime = textTabPinned ? previewTextPinRef.current.time : vTime;
      const target = syncTime % bgExtras.video.duration;
      if (Math.abs(bgExtras.video.currentTime - target) > 0.25) {
        try {
          bgExtras.video.currentTime = target;
        } catch {
          /* ignore seek errors */
        }
      }
    }

    const pvIdx = voiceFiles.length > 0 ? Math.min(previewVoiceIndex, voiceFiles.length - 1) : previewRowIndex;
    const previewVoice = voiceFiles[pvIdx] || null;
    const rowIdx = excelData.length > 0 ? Math.min(previewRowIndex, excelData.length - 1) : pvIdx;
    const rowCacheKey = `${rowIdx}:${pvIdx}:${excelData.length}`;
    let currentRow;
    if (previewRowDataCacheRef.current.key === rowCacheKey && previewRowDataCacheRef.current.row) {
      currentRow = previewRowDataCacheRef.current.row;
    } else {
      currentRow = buildPreviewRowData({
        excelData,
        previewRowIndex: rowIdx,
        config,
        voiceFiles,
        voiceCaptionMap,
        previewVoiceIndex: pvIdx,
        excelFrameMode,
        excelRowsPerVideo,
      });
      previewRowDataCacheRef.current = { key: rowCacheKey, row: currentRow };
    }
    const drawCacheKey = `${rowCacheKey}:${previewVoice?.name || ''}:${config.overlays?.length ?? 0}`;
    let drawCfg;
    if (previewDrawCfgCacheRef.current.key === drawCacheKey && previewDrawCfgCacheRef.current.cfg) {
      drawCfg = previewDrawCfgCacheRef.current.cfg;
    } else {
      drawCfg = buildDrawConfig(config, previewVoice, voiceCaptionMap, pvIdx);
      previewDrawCfgCacheRef.current = { key: drawCacheKey, cfg: drawCfg };
    }
    drawCfg = {
      ...drawCfg,
      _textLayoutCache: previewTextLayoutCacheRef.current,
      overlays: (drawCfg.overlays || []).map((ov, i) => {
        const { _previewEditLineIndex, ...rest } = ov;
        if (previewEditLineIdx != null && i === activeOverlayIndex) {
          return { ...rest, _previewEditLineIndex: previewEditLineIdx };
        }
        return rest;
      }),
    };

    if (layeredPlayback) {
      const bgCanvas = previewBgCanvasRef.current;
      const bgCtx = ensureCanvasCtx(bgCanvas, previewBgCanvasSizeRef);
      const bgCacheKey = `${width}x${height}:${bgType}:${drawSeparateUploadLayer}`;
      const bgVideoActive = bgType === 'video' && bgExtras.video;
      const bgNeedsRedraw =
        !bgCtx
        || bgVideoActive
        || !previewBgCacheRef.current.static
        || previewBgCacheRef.current.key !== bgCacheKey;

      if (bgCtx && bgNeedsRedraw) {
        bgCtx.fillStyle = '#000000';
        bgCtx.fillRect(0, 0, width, height);
        const bgForDraw =
          fxOpts?.fallbackUploadImage && bgExtras.image?.complete
            ? { ...bg, type: 'image' }
            : bg;
        drawBackgroundBase(bgCtx, width, height, bgForDraw, bgExtras);
        if (drawSeparateUploadLayer) {
          drawPreviewUploadImage(bgCtx, previewImg, width, height);
        } else if (showUploadImages && uploadImgReady && !useUploadAsBgTexture && !settingsBgReady) {
          drawPreviewUploadImage(bgCtx, previewImg, width, height);
        }
        previewBgCacheRef.current = { key: bgCacheKey, static: !bgVideoActive };
      }

      applyPreviewVideoLayerStyle(
        video,
        stageEl,
        config.video?.zoomScale ?? 1,
        config.video?.opacity ?? 1,
      );

      const overlayCtx = ensureCanvasCtx(canvas, previewCanvasSizeRef);
      if (!overlayCtx) return;
      previewCtxRef.current = overlayCtx;
      if (!previewTextLayoutCacheRef.current) {
        previewTextLayoutCacheRef.current = new ExportTextLayoutCache();
      }
      previewTextLayoutCacheRef.current.installOnContext(overlayCtx);
      overlayCtx.clearRect(0, 0, width, height);
      overlayCtx.imageSmoothingEnabled = true;
      overlayCtx.imageSmoothingQuality = 'medium';
      drawOverlays(overlayCtx, width, height, currentRow, vTime, vDur, drawCfg);
      drawLogo(overlayCtx, width, height);
      return;
    }

    previewBgCacheRef.current = { key: '', static: false };
    const ctx = ensureCanvasCtx(canvas, previewCanvasSizeRef);
    if (!ctx) return;
    previewCtxRef.current = ctx;
    if (!previewTextLayoutCacheRef.current) {
      previewTextLayoutCacheRef.current = new ExportTextLayoutCache();
    }
    previewTextLayoutCacheRef.current.installOnContext(ctx);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    drawBackground(ctx, width, height, bg, bgExtras, vTime, vDur, null, fxOpts);

    if (drawSeparateUploadLayer) {
      drawPreviewUploadImage(ctx, previewImg, width, height);
    } else if (showUploadImages && uploadImgReady && !useUploadAsBgTexture && !settingsBgReady) {
      drawPreviewUploadImage(ctx, previewImg, width, height);
    }

    if (!showUploadImages || !uploadImgReady) {
      ctx.save();
      ctx.globalAlpha = config.video?.opacity ?? 1;
      if (video && video.readyState >= 2 && !video.seeking) {
        drawVideoContain(
          ctx,
          video,
          width,
          height,
          config.video?.zoomScale ?? 1,
        );
      }
      ctx.restore();
    }

    drawOverlays(ctx, width, height, currentRow, vTime, vDur, drawCfg);
    drawLogo(ctx, width, height);
  }, [config, config.background, config.backgroundEffects, bgPreviewMediaTick, previewLayoutTick, excelData, previewRowIndex, previewVoiceIndex, previewVideoIndex, previewImageIndex, voiceCaptionMap, voiceFiles, imageFiles.length, videos.length, musicFiles.length, drawOverlays, drawBackground, drawBackgroundBase, drawPreviewUploadImage, logoEnabled, logoSize, logoPosition, logoOpacity, logoPadding, excelFrameMode, excelRowsPerVideo, isPreviewPlaying, getEffectiveDimensions, estimatedExportDurationSec, previewVoiceDurationSec, activeOverlayIndex, activeTab]);

  // Re-measure preview panel when layout changes (window resize, tab switch).
  useEffect(() => {
    if (!user && !api.isLoggedIn()) return undefined;

    let cancelled = false;
    let ro = null;

    const attach = () => {
      if (cancelled) return;
      const canvas = previewCanvasRef.current;
      const container = canvas?.parentElement;
      if (!container) {
        requestAnimationFrame(attach);
        return;
      }

      const measure = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        const prev = previewContainerSizeRef.current;
        if (Math.abs(w - prev.w) > 2 || Math.abs(h - prev.h) > 2) {
          previewContainerSizeRef.current = { w, h };
          setPreviewLayoutTick((n) => n + 1);
        }
      };

      measure();
      ro = new ResizeObserver(measure);
      ro.observe(container);
    };

    attach();
    return () => {
      cancelled = true;
      ro?.disconnect();
    };
  }, [user]);

  // Live preview: sync overlay redraw to video frames when possible.
  useEffect(() => {
    if (!isPreviewPlaying) {
      previewBgCacheRef.current = { key: '', static: false };
      redrawPreview();
      return undefined;
    }

    let active = true;
    const video = previewVideoRef.current;
    const useVideoFrameCallback =
      videos.length > 0
      && video
      && typeof video.requestVideoFrameCallback === 'function';

    const tick = () => {
      if (!active) return;
      redrawPreview();
      if (useVideoFrameCallback) {
        video.requestVideoFrameCallback(tick);
      } else {
        requestAnimationFrame(tick);
      }
    };

    if (useVideoFrameCallback) {
      video.requestVideoFrameCallback(tick);
    } else {
      requestAnimationFrame(tick);
    }

    return () => {
      active = false;
    };
  }, [videos.length, imageFiles.length, isPreviewPlaying, previewLayoutTick, config.overlays, config.logoEnabled, voiceCaptionMap, redrawPreview, activeOverlayIndex]);

  useEffect(() => {
    if (voiceFiles.length > 0 && previewRowIndex < voiceFiles.length) {
      setPreviewVoiceIndex(previewRowIndex);
    }
  }, [previewRowIndex, voiceFiles.length, setPreviewVoiceIndex]);

  const togglePreviewPlay = () => {
    const video = previewVideoRef.current;
    const hasVideo = videos.length > 0 && video?.readyState >= 2;

    if (hasVideo) {
      if (video.paused) {
        const pv = voiceFiles.length > 0 ? Math.min(previewVoiceIndex, voiceFiles.length - 1) : 0;
        const file = voiceFiles[pv] || voiceFiles[0] || musicFiles[0];
        const audioEl = previewAudioRef.current;
        previewSimTimeRef.current = 0;
        try { video.currentTime = 0; } catch (_) {}
        if (file && audioEl) {
          if (audioEl.src) try { URL.revokeObjectURL(audioEl.src); } catch (_) {}
          audioEl.src = URL.createObjectURL(file);
          audioEl.volume = config.audio?.volume ?? 0.5;
          audioEl.currentTime = 0;
          audioEl.onended = () => {
            try { video.pause(); } catch (_) {}
            setIsPreviewPlaying(false);
          };
        }
        video.loop = true;
        video.muted = true;
        const startAudio = file && audioEl
          ? audioEl.play().catch(() => {})
          : Promise.resolve();
        Promise.all([startAudio, video.play()])
          .then(() => setIsPreviewPlaying(true))
          .catch(() => setIsPreviewPlaying(false));
      } else {
        video.pause();
        // Stop preview audio if playing
        const audioEl = previewAudioRef.current;
        if (audioEl && !audioEl.paused) {
          audioEl.pause();
          audioEl.currentTime = 0;
          if (audioEl.src) try { URL.revokeObjectURL(audioEl.src); } catch (_) {}
          audioEl.src = '';
        }
        setIsPreviewPlaying(false);
        cancelAnimationFrame(requestRef.current);
      }
    } else if (voiceFiles.length > 0 || musicFiles.length > 0) {
      const pv = voiceFiles.length > 0 ? Math.min(previewVoiceIndex, voiceFiles.length - 1) : 0;
      const file = voiceFiles[pv] || voiceFiles[0] || musicFiles[0];
      const audioEl = previewAudioRef.current;
      if (file && audioEl) {
        if (isPreviewPlaying) {
          audioEl.pause();
          audioEl.currentTime = 0;
          if (audioEl.src) try { URL.revokeObjectURL(audioEl.src); } catch(_) {}
          audioEl.src = '';
          setIsPreviewPlaying(false);
        } else {
          previewSimTimeRef.current = 0;
          if (audioEl.src) try { URL.revokeObjectURL(audioEl.src); } catch(_) {}
          audioEl.src = URL.createObjectURL(file);
          audioEl.volume = config.audio?.volume ?? 0.5;
          audioEl.currentTime = 0;
          audioEl.onended = () => setIsPreviewPlaying(false);
          audioEl.play().then(() => {
            setIsPreviewPlaying(true);
          });
        }
      }
    } else {
      setIsPreviewPlaying((playing) => !playing);
    }
  };

  // Logo upload handler
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      
      // Preload logo image
      const img = new window.Image();
      img.onload = () => {
        logoImageRef.current = img;
      };
      img.src = url;
      
      setLogs("Logo uploaded successfully.");
    }
  };

  // Remove logo
  const removeLogo = () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(null);
    setLogoPreview(null);
    logoImageRef.current = null;
    setLogs("Logo removed.");
  };

  // Draw logo on canvas (shared render-core â€” M6)
  const drawLogo = (ctx, canvasWidth, canvasHeight) => {
    drawLogoCore(ctx, canvasWidth, canvasHeight, {
      enabled: logoEnabled,
      image: logoImageRef.current,
      sizePercent: logoSize,
      position: logoPosition,
      opacity: logoOpacity,
      paddingPercent: logoPadding,
    });
  };

  // File handlers - Upload (append) and Remove
  const sortFilesNumerically = (files) => {
    return [...files].sort((a, b) => {
      const numA = (a.name.match(/(\d+)/) || [0, '0'])[1];
      const numB = (b.name.match(/(\d+)/) || [0, '0'])[1];
      const diff = parseInt(numA) - parseInt(numB);
      return diff !== 0 ? diff : a.name.localeCompare(b.name, undefined, { numeric: true });
    });
  };

  const handleVideoUpload = (e) => {
    const files = sortFilesNumerically(Array.from(e.target.files || []).filter(f => f.type.startsWith('video/')));
    if (files.length > 0) {
      setVideos(prev => [...prev, ...files]);
      setLogs(`${files.length} video(s) added.`);
    }
    e.target.value = '';
  };
  const handleVideoFolderUpload = (e) => {
    const files = sortFilesNumerically(Array.from(e.target.files || []).filter(f => f.type.startsWith('video/')));
    if (files.length > 0) {
      setVideos(prev => [...prev, ...files]);
      setLogs(`${files.length} video(s) added from folder.`);
    } else { setLogs('No valid videos found in folder.'); }
    e.target.value = '';
  };

  const handleVoiceUpload = (e) => {
    const files = sortFilesNumerically(Array.from(e.target.files || []).filter(f => f.type.startsWith('audio/')));
    if (files.length > 0) {
      setVoiceFiles(prev => [...prev, ...files]);
      setLogs(`${files.length} voice file(s) added.`);
    }
    e.target.value = '';
  };
  const handleVoiceFolderUpload = (e) => {
    const files = sortFilesNumerically(Array.from(e.target.files || []).filter(f => f.type.startsWith('audio/')));
    if (files.length > 0) {
      setVoiceFiles(prev => [...prev, ...files]);
      setLogs(`${files.length} voice file(s) added from folder.`);
    } else { setLogs('No valid audio found in folder.'); }
    e.target.value = '';
  };

  const handleMusicUpload = (e) => {
    const files = sortFilesNumerically(Array.from(e.target.files || []).filter(f => f.type.startsWith('audio/')));
    if (files.length > 0) {
      setMusicFiles(prev => [...prev, ...files]);
      setLogs(`${files.length} music file(s) added.`);
    }
    e.target.value = '';
  };
  const handleMusicFolderUpload = (e) => {
    const files = sortFilesNumerically(Array.from(e.target.files || []).filter(f => f.type.startsWith('audio/')));
    if (files.length > 0) {
      setMusicFiles(prev => [...prev, ...files]);
      setLogs(`${files.length} music file(s) added from folder.`);
    } else { setLogs('No valid audio found in folder.'); }
    e.target.value = '';
  };

  const removeVideo = (index) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
    setLogs('Video removed.');
  };

  const removeVoiceFile = (index) => {
    setVoiceFiles(prev => prev.filter((_, i) => i !== index));
    setLogs('Voice file removed.');
  };

  const removeMusicFile = (index) => {
    setMusicFiles(prev => prev.filter((_, i) => i !== index));
    setLogs('Music file removed.');
  };

  const clearVideos = () => { setVideos([]); setLogs('All videos cleared.'); };
  const handleImageUpload = (e) => {
    const files = sortFilesNumerically(Array.from(e.target.files || []).filter(f => f.type.startsWith('image/')));
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
      setLogs(`${files.length} image(s) added (numerical order).`);
    }
    e.target.value = '';
  };
  const handleImageFolderUpload = (e) => {
    const files = sortFilesNumerically(Array.from(e.target.files || []).filter(f => f.type.startsWith('image/')));
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
      setLogs(`${files.length} image(s) added from folder.`);
    } else {
      setLogs('No valid images found in folder.');
    }
    e.target.value = '';
  };
  const removeImageFile = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setLogs('Image removed.');
  };
  const clearImages = () => { setImageFiles([]); setLogs('All images cleared.'); };
  const clearVoiceFiles = () => { setVoiceFiles([]); setLogs('All voice files cleared.'); };
  const clearMusicFiles = () => { setMusicFiles([]); setLogs('All music files cleared.'); };

  const addExtractedToVoice = (audio) => {
    if (!audio?.blob) { setLogs('Audio blob not found.'); return; }
    const file = new File([audio.blob], audio.name, { type: 'audio/wav' });
    setVoiceFiles(prev => [...prev, file]);
    setLogs(`"${audio.name}" added to Voice library.`);
  };
  const addExtractedToMusic = (audio) => {
    if (!audio?.blob) { setLogs('Audio blob not found.'); return; }
    const file = new File([audio.blob], audio.name, { type: 'audio/wav' });
    setMusicFiles(prev => [...prev, file]);
    setLogs(`"${audio.name}" added to Music library.`);
  };
  const addAllExtractedToVoice = () => {
    extractedAudios.forEach(a => addExtractedToVoice(a));
    setLogs(`${extractedAudios.length} audio(s) added to Voice library.`);
  };
  const addAllExtractedToMusic = () => {
    extractedAudios.forEach(a => addExtractedToMusic(a));
    setLogs(`${extractedAudios.length} audio(s) added to Music library.`);
  };

  const applyExcelData = (cleanData) => {
    const numCols = cleanData[0].length;
    const newOverlays = [];
    for (let i = 0; i < numCols; i++) {
      newOverlays.push({
        id: i, excelColumnIndex: i, name: `Column ${i + 1}`, enabled: true,
        fontFamily: 'Arial', fontSize: 5, fontWeight: 'bold', color: '#FFFFFF', bgColor: '#000000',
        bgOpacity: i === 0 ? 0.8 : 0, strokeColor: '#000000', strokeOpacity: 1,
        strokeWidthPercent: 6, strokeWidthPx: null,
        boxPaddingPercent: 40, boxPaddingPx: null,
        boxCornerRadiusPercent: 20, boxCornerRadiusPx: null,
        boxOffsetX: 0, boxOffsetY: 0,
        styleType: i === 0 ? 'box' : 'stroke', positionY: 20 + (i * 20), wordsPerLine: 4,
        textAlign: 'center', letterSpacing: 0, lineHeight: 1.4, shadowEnabled: i !== 0,
        shadowColor: '#000000', shadowBlur: 4, shadowOffsetX: 2, shadowOffsetY: 2,
        textTransform: 'none', animation: 'none', customText: '', punctuationBreakMarks: [],
        customBreakText: '', contentBreakLineSelection: 'all', contentTextSectionEnabled: false, contentPartDurations: [],
        contentPartHoldAfter: [], contentPartLineAnimate: [], contentPartLineRevealMode: [], contentPartLineAnimType: [], contentPartLineAnimSpeed: [], contentPartSameFrame: [],
        contentPartLineStyleOverrides: [],
        contentLineDisplayDuration: 5,
        contentLineHoldAfter: 0,
        contentLineAnimate: false,
        contentLineAnimSpeed: 2, contentLineRevealMode: 'wordByWord', contentLineAnimType: 'fadeIn'
      });
    }
    setConfig(prev => ({ ...prev, overlays: newOverlays }));
    setActiveOverlayIndex(0);
    setExcelData(cleanData);
    // Default preview to the row that has the most columns that actually have text (ignore empty cells)
    const countCellsWithText = (row) => (row || []).filter(c => c != null && c !== undefined && String(c).trim() !== '').length;
    const maxColRowIdx = cleanData.reduce((best, row, i) => countCellsWithText(row) > countCellsWithText(cleanData[best] || []) ? i : best, 0);
    setPreviewRowIndex(maxColRowIdx);
    setLogs(`Excel loaded: ${cleanData.length} rows.`);
    api.track('excel_load', { rows: cleanData.length });
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setExcelFileName(file.name || '');
    try {
      try {
        const { rows } = await api.parseExcel(file);
        const cleanData = rows.filter(row => Array.isArray(row) && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''));
        if (cleanData.length === 0) throw new Error("Excel empty");
        applyExcelData(cleanData);
        return;
      } catch (_) {}
      if (!libsLoaded) { alert("Libraries are still loading. Please refresh the page."); return; }
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target.result;
          if (!window.XLSX) throw new Error("XLSX lib not loaded");
          const wb = window.XLSX.read(bstr, { type: 'binary' });
          if (!wb.SheetNames?.length) throw new Error("Invalid Excel");
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data = window.XLSX.utils.sheet_to_json(ws, { header: 1 });
          const cleanData = data.filter(row => Array.isArray(row) && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''));
          if (!cleanData.length) throw new Error("Excel empty");
          applyExcelData(cleanData);
        } catch (err) {
          setLogs(`Excel Error: ${err.message}`);
          alert("There is a problem with the Excel file.");
        }
      };
      reader.onerror = () => setLogs("File read failed.");
      reader.readAsBinaryString(file);
    } catch (err) {
      setLogs(`Excel Error: ${err.message}`);
    }
  };

  const updateOverlayConfig = (index, key, value) => {
    setConfig(prev => {
      const newOverlays = [...prev.overlays];
      newOverlays[index] = { ...newOverlays[index], [key]: value };
      return { ...prev, overlays: newOverlays };
    });
  };

  const patchOverlayConfig = (index, patchOrFn) => {
    setConfig((prev) => {
      const newOverlays = [...prev.overlays];
      const current = newOverlays[index] || {};
      const patch = typeof patchOrFn === 'function' ? patchOrFn(current) : patchOrFn;
      if (!patch || typeof patch !== 'object') return prev;
      newOverlays[index] = { ...current, ...patch };
      return { ...prev, overlays: newOverlays };
    });
  };

  const applyOverlayPreset = useCallback((index, patch) => {
    if (!patch || typeof patch !== 'object') return;
    setConfig((prev) => {
      const newOverlays = [...prev.overlays];
      newOverlays[index] = applyCaptionPresetToOverlay(newOverlays[index] || {}, patch);
      return { ...prev, overlays: newOverlays };
    });
  }, []);

  const updateGlobalConfig = (section, key, value) => {
    if (section === 'autoDownload') {
      setConfig(prev => ({ ...prev, autoDownload: value }));
    } else if (section === 'parallelJobs') {
      setConfig(prev => ({ ...prev, parallelJobs: value }));
    } else if (section === 'root' && key) {
      setConfig(prev => ({ ...prev, [key]: value }));
    } else {
      setConfig(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      }));
    }
  };

  const downloadSingleVideo = async (url, filename) => {
    const safeName = /\.(mp4|webm|zip)$/i.test(filename || '') ? filename : `${filename || 'video'}.mp4`;
    try {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = objectUrl;
      a.download = safeName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
    } catch (err) {
      console.warn('Blob download failed, using direct link:', err);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = safeName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const downloadAllZip = async () => {
    if (!zipRef.current) return;
    setLogs("Generating ZIP...");
    const content = await zipRef.current.generateAsync({ type: "blob" });
    const safeName = zipFolderName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || "processed_videos";
    window.saveAs(content, `${safeName}.zip`);
    setLogs("ZIP Downloaded!");
  };

  // Categorize voices
  const categorizeVoices = () => {
    const categorized = {
      hindi: [],
      english: [],
      other: []
    };
    
    availableVoices.forEach((voice, index) => {
      const voiceData = { ...voice, originalIndex: index };
      if (voice.lang.includes('hi') || voice.lang.includes('IN')) {
        categorized.hindi.push(voiceData);
      } else if (voice.lang.includes('en')) {
        categorized.english.push(voiceData);
      } else {
        categorized.other.push(voiceData);
      }
    });
    
    return categorized;
  };

  // Ultra-Advanced Voice Selection Engine with AI-like matching
  const getVoiceForSpeaker = (speakerType) => {
    const voices = availableVoices;
    if (voices.length === 0) return null;

    // If user selected a specific voice, use that
    if (selectedVoiceIndex >= 0 && selectedVoiceIndex < voices.length) {
      return voices[selectedVoiceIndex];
    }

    // For neural voice IDs, get gender from neural voice list (backend or fallback)
    let voiceTypeNeeded = 'female';
    const neuralInfo = getNeuralVoicesForUI().find(v => v.id === speakerType);
    if (neuralInfo) {
      voiceTypeNeeded = neuralInfo.gender;
      const langPrefix = neuralInfo.lang?.split('-')[0] || 'en';
      const langMatch = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix) && 
        v.name.toLowerCase().includes(neuralInfo.gender === 'male' ? 'guy' : 'jenny'));
      if (langMatch) return langMatch;
    } else {
      voiceTypeNeeded = ttsSpeakerGender || 'female';
    }
    const ageRange = '25-45';

    // Comprehensive voice database (largest and most accurate)
    const voiceDB = {
      female: [
        // Microsoft voices
        'zira', 'heera', 'hazel', 'susan', 'catherine', 'helena', 'anna', 'maria',
        'jenny', 'aria', 'sara', 'cortana', 'eva',
        // Google voices (achhi achhi)
        'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'female',
        'hi-in-wavenet-a', 'hi-in-wavenet-b', 'hi-in-wavenet-c', 'hi-in-wavenet-d',
        'en-in-wavenet-a', 'en-in-wavenet-b', 'en-in-wavenet-c', 'en-in-wavenet-d',
        'en-us-wavenet-a', 'en-us-wavenet-b', 'en-us-wavenet-c', 'en-us-wavenet-d',
        'en-gb-wavenet-a', 'en-gb-wavenet-b', 'en-gb-wavenet-c',
        'hi-in-standard-a', 'hi-in-standard-b', 'en-in-standard-a', 'en-in-standard-b',
        // Amazon Polly style
        'joanna', 'salli', 'kimberly', 'kendra', 'ivy', 'nicole', 'emma', 'amy',
        // Indian voices
        'priya', 'aditi', 'raveena', 'veena', 'lekha', 'neerja', 'swara', 'shreya',
        'kavya', 'divya', 'ananya', 'meera', 'pooja', 'neha', 'anjali',
        // Generic
        'woman', 'girl', 'lady', 'princess', 'belle', 'alice', 'sarah', 'emily',
        'chloe', 'sophie', 'olivia', 'mia', 'natasha', 'ava', 'allison', 'lisa',
        'jessica', 'rachel', 'monica', 'heather', 'kate', 'vicki', 'agnes', 'kathy'
      ],
      male: [
        // Microsoft voices
        'david', 'mark', 'james', 'daniel', 'george', 'richard', 'ryan', 'guy',
        'sean', 'christopher', 'ravi',
        // Google voices (achhi achhi)
        'alex', 'fred', 'tom', 'matthew', 'brian', 'male',
        'hi-in-wavenet-a', 'en-in-wavenet-a', 'en-us-wavenet-a', 'en-gb-wavenet-a',
        // Amazon Polly style
        'joey', 'justin', 'kevin', 'matthew', 'russell', 'brian',
        // Indian voices
        'rishi', 'hemant', 'raj', 'amit', 'vijay', 'suresh', 'arun', 'vikram',
        'arjun', 'karan', 'rohit', 'sanjay', 'deepak',
        // Generic
        'man', 'boy', 'thomas', 'william', 'michael', 'john', 'robert', 'charles',
        'andrew', 'paul', 'bruce', 'eric', 'greg', 'stephen', 'peter', 'roger',
        'ralph', 'albert', 'junior', 'carlos', 'diego', 'yannick', 'liam', 'noah'
      ],
      premium: [
        'neural', 'natural', 'premium', 'enhanced', 'hd', 'online', 'cloud',
        'wavenet', 'studio', 'news', 'assistant', 'journey', 'multilingual'
      ],
      kid: ['ivy', 'junior', 'child', 'kid', 'young', 'teen'],
      old: ['senior', 'elderly', 'grandpa', 'grandma', 'old', 'mature']
    };

    // Score each voice with advanced algorithm
    const scoredVoices = voices.map(voice => {
      let score = 0;
      const nameLower = voice.name.toLowerCase();
      const langLower = voice.lang.toLowerCase();
      
      // 1. Premium/Neural voice bonus (highest priority)
      if (voiceDB.premium.some(k => nameLower.includes(k))) {
        score += 200;
      }
      
      // 2. Microsoft/Google brand bonus (Google achhi voices)
      if (nameLower.includes('google')) score += 85;
      else if (nameLower.includes('microsoft')) score += 75;
      
      // 3. Gender matching (critical)
      const isFemaleVoice = voiceDB.female.some(k => nameLower.includes(k));
      const isMaleVoice = voiceDB.male.some(k => nameLower.includes(k));
      
      if (voiceTypeNeeded === 'male') {
        if (isMaleVoice) score += 150;
        if (isFemaleVoice) score -= 200; // Strong penalty
      } else if (voiceTypeNeeded === 'female') {
        if (isFemaleVoice) score += 150;
        if (isMaleVoice) score -= 200; // Strong penalty
      } else if (voiceTypeNeeded === 'neutral') {
        // Kids/babies - prefer female voices with pitch adjustment
        if (isFemaleVoice) score += 50;
        if (voiceDB.kid.some(k => nameLower.includes(k))) score += 100;
      }
      
      // 4. Age matching
      if (ageRange && ageRange.includes('60+')) {
        if (voiceDB.old.some(k => nameLower.includes(k))) score += 50;
      } else if (ageRange && (ageRange.includes('5-10') || ageRange.includes('2-5'))) {
        if (voiceDB.kid.some(k => nameLower.includes(k))) score += 100;
      }
      
      // 5. Language preference (Indian voices preferred)
      if (langLower.includes('hi-in') || langLower.includes('hi_in')) {
        score += 100; // Hindi highest
      } else if (langLower.includes('en-in') || langLower.includes('en_in')) {
        score += 80; // Indian English
      } else if (langLower.includes('en-us')) {
        score += 40;
      } else if (langLower.includes('en-gb')) {
        score += 35;
      } else if (langLower.includes('en')) {
        score += 20;
      }
      
      return { voice, score, isMale: isMaleVoice, isFemale: isFemaleVoice };
    });

    // Sort by score (highest first)
    scoredVoices.sort((a, b) => b.score - a.score);
    
    // Return best matching voice
    if (scoredVoices.length > 0) {
      const best = scoredVoices[0];
      console.log(`Voice matched for ${speakerType}: ${best.voice.name} (score: ${best.score})`);
      return best.voice;
    }

    // Ultimate fallback
    return voices[0];
  };

  // Apply mood preset
  const applyMood = (moodId) => {
    setTtsMood(moodId);
    const preset = moodPresets[moodId];
    if (preset) {
      setTtsRate(preset.rate);
      setTtsPitch(preset.pitch);
    }
  };

  // Advanced Voice Engine - Get final voice settings (gender + mood + effect)
  const getFinalVoiceSettings = useCallback(() => {
    const effect = audioEffects[ttsEffect] || audioEffects.none;
    const quality = voiceQualityModes[voiceQualityMode] || voiceQualityModes.balanced;
    const gender = genderModifiers[ttsSpeakerGender] || genderModifiers.female;
    const sel = getNeuralVoicesForUI().find(v => v.id === ttsSpeaker);
    
    // Base: mood (ttsRate/ttsPitch set by applyMood), then gender, then effect
    let pitch = ttsPitch * gender.pitchMod * effect.pitchMod;
    let rate = ttsRate * gender.rateMod * effect.rateMod;
    
    // Apply quality variations if any (Natural/Balanced/Expressive)
    if (quality.pitchVariation) pitch *= (1 + quality.pitchVariation);
    if (quality.rateVariation) rate *= (1 + quality.rateVariation);
    
    /* Keep multipliers in a range that maps safely to Edge SSML after backend clamp (-50%..+100% rate, Â±50% pitch). */
    pitch = Math.min(2, Math.max(0.35, pitch));
    rate = Math.min(2.6, Math.max(0.35, rate));
    
    const moodLabel = (moodPresets[ttsMood] || moodPresets.normal).label;
    
    // Volume: gender base + effect impact (if any) + quality boost for 'clear'
    let volume = gender.volumeMod || 1.0;
    if (voiceQualityMode === 'clear') volume *= 1.2; // 20% boost for clarity
    
    return { 
      rate, 
      pitch, 
      volume,
      speaker: sel?.label || ttsSpeaker,
      mood: moodLabel,
      effect: effect.label,
      quality: quality.label
    };
  }, [ttsEffect, voiceQualityMode, ttsSpeakerGender, ttsSpeaker, ttsPitch, ttsRate, ttsMood]);


  // Real Edge Neural sample (same engine as Generate) — NOT browser speechSynthesis
  const previewTTS = async (speakerOverride, overrides = {}) => {
    const textToSpeak =
      ttsPreviewText ||
      (excelData.length > 0 && excelData[0] && excelData[0][ttsColumn]) ||
      'Hello, this is a sample of my unique neural voice. Each character sounds different.';
    if (!textToSpeak || !String(textToSpeak).trim()) {
      alert('Please enter preview text or upload Excel data.');
      return;
    }

    const speakerId =
      typeof speakerOverride === 'string' && speakerOverride ? speakerOverride : ttsSpeaker;
    const settings = getFinalVoiceSettings();
    const neural = getNeuralVoicesForUI().find((v) => v.id === speakerId);
    const rate = overrides.rate ?? settings.rate;
    const pitch = overrides.pitch ?? settings.pitch;
    const volume = overrides.volume ?? settings.volume;

    try {
      setTtsSampleLoading(true);
      setLogs(`Generating Edge Neural sample: ${neural?.label || speakerId}…`);

      // Stop previous sample
      try {
        window.speechSynthesis?.cancel?.();
      } catch (_) {}
      if (ttsSampleAudioRef.current) {
        ttsSampleAudioRef.current.pause();
        ttsSampleAudioRef.current = null;
      }
      if (ttsSampleUrlRef.current) {
        URL.revokeObjectURL(ttsSampleUrlRef.current);
        ttsSampleUrlRef.current = null;
      }

      const blob = await api.previewTTSSample({
        text: String(textToSpeak).slice(0, 180),
        speaker: speakerId,
        rate,
        pitch,
        volume,
        quality: 'clear',
      });

      const url = URL.createObjectURL(blob);
      ttsSampleUrlRef.current = url;
      const audio = new Audio(url);
      ttsSampleAudioRef.current = audio;
      audio.onended = () => {
        setLogs(`Sample complete: ${neural?.label || speakerId}`);
      };
      audio.onerror = () => {
        setLogs('Sample playback failed.');
        setTtsSampleLoading(false);
      };
      await audio.play();
      setTtsSampleLoading(false);
      setLogs(`Playing Edge Neural: ${neural?.label || speakerId}`);
    } catch (e) {
      console.error('Edge TTS preview failed:', e);
      setTtsSampleLoading(false);
      const msg = e?.message || String(e);
      setLogs(`Sample error: ${msg}`);
      alert(
        `Could not play real Edge Neural sample.\n\n${msg}\n\nMake sure the backend is running (Reel-Maker-Backend). No API key is required.`
      );
    }
  };

  const {
    generateAllTTS,
    generateAdvancedTTS,
    addGeneratedAudioToVoiceLibrary,
    addAllGeneratedToVoiceLibrary,
    downloadSingleAudio,
    downloadAllTTSAudios,
  } = useTTS({
    api,
    excelData,
    ttsMode,
    ttsSelectedRows,
    ttsColumn,
    ttsSpeaker,
    getFinalVoiceSettings,
    generatedAudios,
    setTtsGenerating,
    setTtsProgress,
    setGeneratedAudios,
    setLogs,
    setServerJobId,
    setServerProcessing,
    setServerProgress,
    setServerJobType,
    setVoiceFiles,
    voiceQualityMode,
  });

  /** Routes Excel "Generate All" to Basic or Advanced based on active studio tab + live selections */
  const studioApiRef = useRef(null);
  const generateAllFromStudio = useCallback(async () => {
    if (studioApiRef.current?.generate) {
      await studioApiRef.current.generate();
      return;
    }
    await generateAllTTS();
  }, [generateAllTTS]);

  const captionStudioProps = useCaptions({
    setConfig,
    setLogs,
    setActiveTab,
    voiceFiles,
    voiceCaptionMap,
    setVoiceCaptionMap,
  });
  const { captionsReadyCount } = captionStudioProps;

  const captionPreviewWords = useMemo(() => {
    if (!voiceCaptionMap || !voiceFiles?.length) return []
    const pvIdx = Math.min(previewVoiceIndex, voiceFiles.length - 1)
    return getCaptionPreviewWords(voiceCaptionMap, voiceFiles[pvIdx], pvIdx)
  }, [voiceCaptionMap, voiceFiles, previewVoiceIndex])

  /** Seek paused preview once when Text tab pin time/line changes (not on every style tweak). */
  const syncTextTabPreviewPin = useCallback(() => {
    if (isPreviewPlaying) return;

    if (activeTab !== 'overlay') {
      previewTextPinRef.current = { time: null, lineIdx: 0 };
      return;
    }

    const editOv = config.overlays?.[activeOverlayIndex];
    if (!editOv || editOv.enabled === false) {
      previewTextPinRef.current = { time: null, lineIdx: 0 };
      return;
    }

    const pvIdx = voiceFiles.length > 0
      ? Math.min(previewVoiceIndex, voiceFiles.length - 1)
      : previewRowIndex;
    const previewVoice = voiceFiles[pvIdx] || null;
    const capEntry = getCaptionEntry(voiceCaptionMap, previewVoice, pvIdx);
    const captionSegments = capEntry?.segments || [];
    const pin = resolveTextTabPreviewPin({
      overlay: editOv,
      excelData,
      captionSegments,
    });
    if (!pin) return;

    const prev = previewTextPinRef.current;
    const needsSeek =
      prev.time == null
      || prev.lineIdx !== pin.lineIdx
      || Math.abs(prev.time - pin.pinnedTime) > 0.02;

    previewTextPinRef.current = { time: pin.pinnedTime, lineIdx: pin.lineIdx };
    previewSimTimeRef.current = pin.pinnedTime;

    if (!needsSeek) return;

    const video = previewVideoRef.current;
    const audioEl = previewAudioRef.current;
    const bgVideo = backgroundVideoRef.current;

    const bumpAfterSeek = () => setPreviewLayoutTick((t) => t + 1);

    if (video?.readyState >= 2 && video.duration > 0) {
      const loopT = pin.pinnedTime % video.duration;
      if (Math.abs(video.currentTime - loopT) > 0.05) {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          bumpAfterSeek();
        };
        video.addEventListener('seeked', onSeeked);
        try { video.currentTime = loopT; } catch { /* ignore */ }
      }
    }

    if (audioEl?.duration && Number.isFinite(audioEl.duration) && audioEl.paused) {
      const audioT = Math.min(pin.pinnedTime, Math.max(0, audioEl.duration - 0.02));
      if (Math.abs(audioEl.currentTime - audioT) > 0.05) {
        try { audioEl.currentTime = audioT; } catch { /* ignore */ }
      }
    }

    if (bgVideo?.duration && Number.isFinite(bgVideo.duration)) {
      const bgT = pin.pinnedTime % bgVideo.duration;
      if (Math.abs(bgVideo.currentTime - bgT) > 0.05) {
        try { bgVideo.currentTime = bgT; } catch { /* ignore */ }
      }
    }

    bumpAfterSeek();
  }, [
    activeTab,
    isPreviewPlaying,
    activeOverlayIndex,
    config.overlays,
    excelData,
    previewRowIndex,
    previewVoiceIndex,
    voiceFiles,
    voiceCaptionMap,
  ]);

  useEffect(() => {
    syncTextTabPreviewPin();
  }, [syncTextTabPreviewPin, bgPreviewMediaTick]);

  useEffect(() => {
    if (!config.captionSync?.enabled || config.textSource !== 'captions') return
    const ov = config.overlays?.[activeOverlayIndex]
    if (!ov) return
    const col = ov.excelColumnIndex ?? ov.id ?? 0
    if (config.captionSync.columnIndex === col) return
    setConfig((c) => ({
      ...c,
      captionSync: { ...(c.captionSync || {}), columnIndex: col },
    }))
  }, [activeOverlayIndex, config.captionSync?.enabled, config.textSource, config.overlays, config.captionSync?.columnIndex, setConfig])

  const {
    startProcessing,
    startImageProcessing,
    handleStopProcessing,
    handlePauseProcessing,
  } = useVideoPipeline({
    libsLoaded,
    excelData,
    videos,
    voiceFiles,
    musicFiles,
    imageFiles,
    config,
    voiceCaptionMap,
    detectedSourceFps,
    imageCombineMode,
    imageSlideDurationSec,
    excelRowsPerVideo,
    excelFrameMode,
    previewRowIndex,
    previewVoiceIndex,
    videoMode,
    audioMode,
    imageMode,
    api,
    tryBackendProcessing,
    setLogs,
    setServerJobMeta,
  });

  useServerJobPolling({
    api,
    serverJobId,
    serverJobType,
    setServerProgress,
    setServerProcessing,
    setServerJobId,
    setGeneratedAudios,
    setProcessedVideos,
    setFinished,
    setLogs,
    setEstimatedTime,
    setServerJobMeta,
  });

  const handleStopAllProcessing = useCallback(async () => {
    if (serverProcessing && serverJobId) {
      try {
        await api.cancelVideoJob(serverJobId);
      } catch (e) {
        console.warn('Cancel server job:', e);
      }
      setServerProcessing(false);
      setServerJobId(null);
      setServerProgress(0);
      setEstimatedTime(null);
      setServerJobMeta({ total: 0, completed: 0, slots: [] });
      setLogs('Video generation stopped.');
      return;
    }
    handleStopProcessing();
  }, [
    serverProcessing,
    serverJobId,
    handleStopProcessing,
    setEstimatedTime,
    setLogs,
    setServerJobMeta,
    setServerJobId,
    setServerProcessing,
    setServerProgress,
  ]);

  const handleResetRun = useCallback(async () => {
    if (serverJobId) {
      try {
        await api.cancelVideoJob(serverJobId);
      } catch (_) {}
    }
    stopProcessingRef.current = true;
    pauseProcessingRef.current = false;
    setProcessing(false);
    setIsPaused(false);
    setFinished(false);
    setProgress(0);
    setCurrentVideoProgress(0);
    setEstimatedTime(null);
    setParallelProgress({});
    setServerProcessing(false);
    setServerJobId(null);
    setServerProgress(0);
    setServerJobMeta({ total: 0, completed: 0, slots: [] });
    setLogs('Reset â€” nayi video generate kar sakte ho.');
  }, [
    serverJobId,
    setCurrentVideoProgress,
    setEstimatedTime,
    setFinished,
    setIsPaused,
    setLogs,
    setParallelProgress,
    setProcessing,
    setProgress,
    setServerJobMeta,
    setServerJobId,
    setServerProcessing,
    setServerProgress,
  ]);

  async function tryBackendProcessing(type, buildFormData, plannedTotal = 0) {
    const featureMap = { video: 'video', slideshow: 'video', image: 'image_generate', audio_extract: 'audio_extract', thumbnail: 'thumbnails', merge: 'video_merge' };
    const featureKey = featureMap[type];

    if (backendCapabilities) {
      const supported = backendCapabilities.features?.[featureKey];
      if (!supported) {
        setLogs(`Server does not support "${type}" on this deployment.`);
        return false;
      }
    }

    try {
      const fd = buildFormData();
      let apiCall;
      if (type === 'video') apiCall = api.processVideoOnServer(fd);
      else if (type === 'slideshow') apiCall = api.processSlideshowOnServer(fd);
      else if (type === 'image') apiCall = api.generateImagesOnServer(fd);
      else if (type === 'audio_extract') apiCall = api.extractAudioOnServer(fd);
      else if (type === 'thumbnail') apiCall = api.extractThumbnailsOnServer(fd);
      else if (type === 'merge') apiCall = api.mergeVideosOnServer(fd);
      else return false;
      const { jobId } = await apiCall;
      setProcessedVideos([]);
      setFinished(false);
      setServerJobId(jobId);
      setServerProcessing(true);
      setServerProgress(0);
      setServerJobMeta({
        total: plannedTotal || 0,
        completed: 0,
        exportStartedAt: Date.now(),
        exportDurationMs: null,
        elapsedMs: 0,
        slots:
          plannedTotal > 0
            ? buildExportVideoSlots({
                total: plannedTotal,
                completed: 0,
              })
            : [],
      });
      setEstimatedTime(null);
      setServerJobType(type);
      setLogs(
        plannedTotal > 1
          ? `Export queued — ${plannedTotal} videos…`
          : plannedTotal === 1
            ? 'Export queued — 1 video…'
            : 'Export queued on server...',
      );
      return true;
    } catch (e) {
      const msg = e?.message || String(e);
      if (/401|unauthorized/i.test(msg)) {
        setLogs('Server export requires login (More -> login).');
      } else {
        setLogs(`Server export failed: ${msg}`);
      }
      console.error(`Backend ${type} failed:`, msg);
      return false;
    }
  }

  // `startProcessing` is provided by `useVideoPipeline`

  // Audio extraction helpers + batch handlers are provided by `pipeline/audioExtraction`

  // Video Merging - merge videos in batches with transitions (sequence order)
  const mergeVideosInBatches = async (batchSize, transitionId) => {
    return mergeVideosInBatchesImpl({
      videos,
      tryBackendProcessing,
      batchSize,
      transitionId,
      setVideoMerging,
      setMergeProgress,
      setMergedResults,
      setMergeStartTime,
      setLogs,
      setMergeTimeTotal,
      setMergeTimeElapsed,
    });
  };

  // Batch audio extraction with progress tracking
  const handleBatchExtractAudio = async () => {
    return handleBatchExtractAudioImpl({
      videos,
      tryBackendProcessing,
      setBatchExtracting,
      setProgress,
      setExtractedAudios,
      setLogs,
      audioExtractionQuality,
    });
  };

  const downloadExtractedAudio = (url, filename) => downloadExtractedAudioImpl(url, filename);

  const downloadAllExtractedAudios = async () => {
    return downloadAllExtractedAudiosImpl({ extractedAudios, setLogs });
  };

  const clearExtractedAudios = () => {
    return clearExtractedAudiosImpl({ extractedAudios, setExtractedAudios, setLogs });
  };

  // Extract thumbnail from video (full resolution, same ratio as video)
  const extractThumbnailFromVideo = (videoFile, format, quality) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.preload = 'metadata';
      const url = URL.createObjectURL(videoFile);
      video.src = url;

      video.onloadeddata = () => {
        video.currentTime = 0.5;
      };
      video.onseeked = () => {
        try {
          const w = video.videoWidth;
          const h = video.videoHeight;
          if (!w || !h) {
            URL.revokeObjectURL(url);
            reject(new Error('Video dimensions not available'));
            return;
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, w, h);
          const mime = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
          const q = format === 'png' ? undefined : quality;
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(url);
              video.remove();
              if (blob) resolve(blob);
              else reject(new Error('Failed to create blob'));
            },
            mime,
            q
          );
        } catch (e) {
          URL.revokeObjectURL(url);
          video.remove();
          reject(e);
        }
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        video.remove();
        reject(new Error('Video load failed'));
      };
    });
  };

  const handleBatchExtractThumbnails = async () => {
    if (videos.length === 0) {
      alert("Please add videos from the Upload tab first.");
      return;
    }

    const ok = await tryBackendProcessing('thumbnail', () => {
      const fd = new FormData();
      videos.forEach(v => fd.append('videos', v instanceof File ? v : (v.file || v)));
      fd.append('format', thumbnailFormat || 'png');
      return fd;
    });
    if (ok) return;

    setThumbnailExtracting(true);
    setThumbnailProgress(0);
    setExtractedThumbnails([]);
    const newThumbnails = [];
    const ext = thumbnailFormat === 'png' ? 'png' : thumbnailFormat === 'webp' ? 'webp' : 'jpg';
    try {
      for (let i = 0; i < videos.length; i++) {
        const file = videos[i];
        const imageName = `${i + 1}.${ext}`; // Numeric sequence: 1.png, 2.png, ...
        setLogs(`Extracting thumbnail ${i + 1}/${videos.length}: ${file.name}`);
        try {
          const blob = await extractThumbnailFromVideo(file, thumbnailFormat, thumbnailQuality);
          const url = URL.createObjectURL(blob);
          newThumbnails.push({
            id: Date.now() + i,
            name: imageName,
            url,
            blob,
            videoName: file.name
          });
          setExtractedThumbnails([...newThumbnails]);
        } catch (err) {
          console.error(`Thumbnail failed ${file.name}:`, err);
          setLogs(`Failed: ${file.name}`);
        }
        setThumbnailProgress(Math.round(((i + 1) / videos.length) * 100));
      }
      setLogs(`Done! ${newThumbnails.length} thumbnails extracted.`);
    } catch (e) {
      setLogs("Error: " + (e.message || e));
    } finally {
      setThumbnailExtracting(false);
    }
  };

  const downloadThumbnail = (url, name) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllThumbnailsAsZip = async () => {
    if (extractedThumbnails.length === 0) return;
    setLogs("Creating ZIP...");
    try {
      const zip = new window.JSZip();
      const folderName = (thumbnailFolderName || 'video_thumbnails').trim().replace(/[/\\?*:|"]/g, '_') || 'video_thumbnails';
      const folder = zip.folder(folderName);
      for (const t of extractedThumbnails) {
        folder.file(t.name, t.blob);
      }
      const content = await zip.generateAsync({ type: "blob" });
      window.saveAs(content, `${folderName}.zip`);
      setLogs("ZIP downloaded!");
    } catch (e) {
      setLogs("ZIP error: " + (e.message || e));
    }
  };

  const clearThumbnails = () => {
    extractedThumbnails.forEach(t => URL.revokeObjectURL(t.url));
    setExtractedThumbnails([]);
    setLogs("Thumbnails cleared.");
  };

  // `startImageProcessing`, `handleStopProcessing`, `handlePauseProcessing` are provided by `useVideoPipeline`

  const fonts = [
    'Arial', 'Arial Black', 'Verdana', 'Tahoma', 'Trebuchet MS',
    'Times New Roman', 'Georgia', 'Garamond', 'Palatino',
    'Courier New', 'Lucida Console', 'Monaco',
    'Impact', 'Comic Sans MS', 'Brush Script MT',
    'Segoe UI', 'Roboto', 'Open Sans', 'Helvetica'
  ];

  const isLoggedIn = !!(user || api.isLoggedIn());
  const isAdmin = user?.role === 'admin';

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!authEmail || !authPassword) { setLoginError('Email and password are required'); return; }
    setLoginLoading(true);
    setLoginError('');
    try {
      const d = await api.login(authEmail, authPassword);
      setUser(d.user);
      autoSavePresetSkipFirstRef.current = true; // so auto-save does not run immediately after login
      setActiveTab('upload');
      setAuthPassword('');
      setLoginError('');
      setTimeout(() => loadUserPresets(), 500);
    } catch (e) {
      setLoginError(e?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const loadUserPresets = async () => {
    if (!user) return;
    setPresetLoading(true);
    try {
      const list = await api.getUserPresets();
      setUserPresets(Array.isArray(list) ? list : []);
    } catch (e) {
      console.warn('Failed to load presets:', e);
    } finally {
      setPresetLoading(false);
    }
  };

  const collectCurrentSettings = () => ({
    config: JSON.parse(JSON.stringify(config)),
    videoMode,
    audioMode,
    imageMode,
    imageBatchSize,
    videoBatchSize,
    voiceBatchSize,
    musicBatchSize,
    excelRowsPerVideo,
    excelFrameMode,
    imageCombineMode,
    imageSlideDurationSec,
  });

  const applyPresetSettings = (settings) => {
    if (!settings) return;
    if (settings.config) {
      setConfig(prev => {
        const merged = { ...prev };
        if (settings.config.video) merged.video = { ...prev.video, ...settings.config.video };
        if (settings.config.audio) merged.audio = { ...prev.audio, ...settings.config.audio };
        if (settings.config.background) merged.background = { ...prev.background, ...settings.config.background };
        if (settings.config.overlays) merged.overlays = settings.config.overlays;
        if (settings.config.contentMode) merged.contentMode = settings.config.contentMode;
        if (settings.config.captionSync) {
          merged.captionSync = {
            ...(prev.captionSync || {
              enabled: false,
              granularity: 'line',
              columnIndex: 0,
            }),
            ...settings.config.captionSync,
          };
        }
        if (settings.config.imageAspectRatio) merged.imageAspectRatio = settings.config.imageAspectRatio;
        if (settings.config.imageFormat) merged.imageFormat = settings.config.imageFormat;
        if (settings.config.parallelJobs != null) merged.parallelJobs = settings.config.parallelJobs;
        if (settings.config.autoDownload != null) merged.autoDownload = settings.config.autoDownload;
        return merged;
      });
    }
    if (settings.videoMode) setVideoMode(settings.videoMode);
    if (settings.audioMode) setAudioMode(settings.audioMode);
    if (settings.imageMode) setImageMode(settings.imageMode);
    if (settings.imageBatchSize != null) setImageBatchSize(String(settings.imageBatchSize));
    if (settings.videoBatchSize != null) setVideoBatchSize(String(settings.videoBatchSize));
    if (settings.voiceBatchSize != null) setVoiceBatchSize(String(settings.voiceBatchSize));
    if (settings.musicBatchSize != null) setMusicBatchSize(String(settings.musicBatchSize));
    if (settings.excelRowsPerVideo != null) setExcelRowsPerVideo(String(settings.excelRowsPerVideo));
    if (settings.excelFrameMode) setExcelFrameMode(settings.excelFrameMode);
    if (settings.imageCombineMode != null) setImageCombineMode(settings.imageCombineMode);
    if (settings.imageSlideDurationSec != null) setImageSlideDurationSec(settings.imageSlideDurationSec);
  };

  const saveCurrentPreset = async () => {
    if (!presetName.trim()) { setLogs('Please enter a preset name.'); return; }
    setPresetSaving(true);
    try {
      const settings = collectCurrentSettings();
      await api.saveUserPreset(presetName.trim(), settings);
      setLogs(`Preset "${presetName.trim()}" saved successfully.`);
      setPresetName('');
      await loadUserPresets();
    } catch (e) {
      setLogs('Error saving preset: ' + (e?.message || e));
    } finally {
      setPresetSaving(false);
    }
  };

  const deleteUserPreset = async (id, name) => {
    try {
      await api.deleteUserPreset(id);
      setUserPresets(prev => prev.filter(p => p._id !== id));
      setLogs(`Preset "${name}" deleted.`);
    } catch (e) {
      setLogs('Error deleting preset: ' + (e?.message || e));
    }
  };

  // Auto-save current settings to "Current" preset whenever user changes any option (Text tab, Settings, etc.)
  useEffect(() => {
    if (!user) return;
    if (autoSavePresetSkipFirstRef.current) {
      autoSavePresetSkipFirstRef.current = false;
      return;
    }
    if (autoSavePresetTimerRef.current) clearTimeout(autoSavePresetTimerRef.current);
    autoSavePresetTimerRef.current = setTimeout(async () => {
      autoSavePresetTimerRef.current = null;
      try {
        const settings = collectCurrentSettings();
        const list = await api.getUserPresets().catch(() => []);
        const existing = (Array.isArray(list) ? list : []).find(p => p.name === AUTO_SAVE_PRESET_NAME);
        if (existing) {
          await api.updateUserPreset(existing._id, { settings });
        } else {
          await api.saveUserPreset(AUTO_SAVE_PRESET_NAME, settings);
        }
        await loadUserPresets();
      } catch (e) {
        console.warn('Auto-save preset failed:', e);
      }
    }, 1500);
    return () => {
      if (autoSavePresetTimerRef.current) clearTimeout(autoSavePresetTimerRef.current);
    };
  }, [
    user,
    config,
    videoMode,
    audioMode,
    imageMode,
    imageBatchSize,
    videoBatchSize,
    voiceBatchSize,
    musicBatchSize,
    excelRowsPerVideo,
    excelFrameMode,
    imageCombineMode,
    imageSlideDurationSec,
  ]);

  const loadAdminData = async () => {
    setAdminLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([api.adminGetUsers(), api.adminGetStats()]);
      setAdminUsers(usersData.users || []);
      setAdminStats(statsData);
    } catch (e) {
      setLogs('Admin error: ' + (e?.message || e));
    } finally {
      setAdminLoading(false);
    }
  };

  const adminCreateUser = async () => {
    if (!adminNewEmail || !adminNewPassword) { setLogs('Email and password required'); return; }
    setAdminLoading(true);
    try {
      await api.adminCreateUser(adminNewEmail, adminNewPassword, adminNewName, adminNewRole);
      setAdminNewEmail(''); setAdminNewPassword(''); setAdminNewName(''); setAdminNewRole('user');
      await loadAdminData();
      setLogs('User created successfully');
    } catch (e) {
      setLogs('Create error: ' + (e?.message || e));
    } finally {
      setAdminLoading(false);
    }
  };

  const adminToggleActive = async (userId, currentActive) => {
    try {
      await api.adminUpdateUser(userId, { active: !currentActive });
      await loadAdminData();
    } catch (e) { setLogs('Update error: ' + (e?.message || e)); }
  };

  const adminSaveEdit = async (userId) => {
    try {
      await api.adminUpdateUser(userId, adminEditData);
      setAdminEditId(null); setAdminEditData({});
      await loadAdminData();
      setLogs('User updated');
    } catch (e) { setLogs('Update error: ' + (e?.message || e)); }
  };

  const adminDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.adminDeleteUser(userId);
      await loadAdminData();
      setLogs('User deleted');
    } catch (e) { setLogs('Delete error: ' + (e?.message || e)); }
  };

  if (!isLoggedIn) {
    return (
      <LoginScreen
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        handleLogin={handleLogin}
        loginError={loginError}
        loginLoading={loginLoading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#06080f] text-white font-sans antialiased relative overflow-x-hidden">
      {/* Background ambience - richer with multiple layers */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 right-[10%] w-[700px] h-[700px] bg-indigo-600/[0.035] rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] -left-40 w-[500px] h-[500px] bg-violet-600/[0.03] rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-cyan-500/[0.02] rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto">

        <AppHeader
          videosCount={videos.length}
          excelRowsCount={excelData.length}
          processedCount={processedVideos.length}
          voiceFilesCount={voiceFiles.length}
          musicFilesCount={musicFiles.length}
          processing={processing}
          finished={finished}
          libsLoaded={libsLoaded}
          startProcessing={startProcessing}
          isAdmin={isAdmin}
          onOpenAdmin={() => { setShowAdminPanel(true); loadAdminData(); }}
          userLabel={user?.name || user?.email || api.getUser()?.email || 'User'}
          userInitial={(user?.name || user?.email || 'U')[0].toUpperCase()}
          onLogout={() => { api.logout(); setUser(null); setProjects([]); setUserPresets([]); setActiveTab('upload'); setShowAdminPanel(false); }}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <div className="p-2 sm:p-4 md:p-5 grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-5">

          {/* LEFT: Controls - Tabbed */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-3 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto lg:pr-2 pb-8 custom-scrollbar">
            
            {/* Status Bar */}
            <div className="bg-gradient-to-r from-emerald-500/[0.06] to-cyan-500/[0.04] border border-emerald-500/10 p-2 sm:p-2.5 rounded-xl text-[10px] text-emerald-300/80 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0 shadow-sm shadow-emerald-400/50"></div>
              <span className="font-medium">{libsLoaded ? 'All systems ready' : 'Loading...'}</span>
            </div>

            <ExcelTTSPanel
              activeTab={activeTab}
              ttsMode={ttsMode}
              setTtsMode={setTtsMode}
              ttsColumn={ttsColumn}
              setTtsColumn={setTtsColumn}
              excelData={excelData}
              ttsSelectedRows={ttsSelectedRows}
              setTtsSelectedRows={setTtsSelectedRows}
              handleExcelUpload={handleExcelUpload}
              excelFileName={excelFileName}
              ttsGenerating={ttsGenerating}
              generateAllTTS={generateAllFromStudio}
              serverProcessing={serverProcessing}
              serverJobType={serverJobType}
              serverProgress={serverProgress}
              ttsProgress={ttsProgress}
            />

            <CaptionStudio
              activeTab={activeTab}
              voiceFiles={voiceFiles}
              previewVoiceIndex={previewVoiceIndex}
              setPreviewVoiceIndex={setPreviewVoiceIndex}
              captionsReadyCount={captionsReadyCount}
              {...captionStudioProps}
            />

            <MoreFeaturesPanel
              activeTab={activeTab}
              videos={videos}
              VIDEO_MERGE_TRANSITIONS={VIDEO_MERGE_TRANSITIONS}
              mergedResults={mergedResults}
              videoMerging={videoMerging}
              mergeProgress={mergeProgress}
              mergeStartTime={mergeStartTime}
              mergeTimeTotal={mergeTimeTotal}
              formatTime={formatTime}
              mergeVideosInBatches={mergeVideosInBatches}
              audioExtractionQuality={audioExtractionQuality}
              setAudioExtractionQuality={setAudioExtractionQuality}
              handleBatchExtractAudio={handleBatchExtractAudio}
              batchExtracting={batchExtracting}
              progress={progress}
              extractedAudios={extractedAudios}
              addAllExtractedToVoice={addAllExtractedToVoice}
              addAllExtractedToMusic={addAllExtractedToMusic}
              downloadAllExtractedAudios={downloadAllExtractedAudios}
              clearExtractedAudios={clearExtractedAudios}
              downloadExtractedAudio={downloadExtractedAudio}
              thumbnailFolderName={thumbnailFolderName}
              setThumbnailFolderName={setThumbnailFolderName}
              thumbnailFormat={thumbnailFormat}
              setThumbnailFormat={setThumbnailFormat}
              thumbnailQuality={thumbnailQuality}
              setThumbnailQuality={setThumbnailQuality}
              thumbnailExtracting={thumbnailExtracting}
              thumbnailProgress={thumbnailProgress}
              handleBatchExtractThumbnails={handleBatchExtractThumbnails}
              extractedThumbnails={extractedThumbnails}
              downloadAllThumbnailsAsZip={downloadAllThumbnailsAsZip}
              clearThumbnails={clearThumbnails}
              downloadThumbnail={downloadThumbnail}
            />

            <UploadTab
              activeTab={activeTab}
              videos={videos}
              handleVideoUpload={handleVideoUpload}
              handleVideoFolderUpload={handleVideoFolderUpload}
              videoFolderInputRef={videoFolderInputRef}
              clearVideos={clearVideos}
              removeVideo={removeVideo}
              videoMode={videoMode}
              setVideoMode={setVideoMode}
              videoBatchSize={videoBatchSize}
              setVideoBatchSize={setVideoBatchSize}

              imageFiles={imageFiles}
              handleImageUpload={handleImageUpload}
              handleImageFolderUpload={handleImageFolderUpload}
              imageFolderInputRef={imageFolderInputRef}
              clearImages={clearImages}
              removeImageFile={removeImageFile}
              imageMode={imageMode}
              setImageMode={setImageMode}
              imageBatchSize={imageBatchSize}
              setImageBatchSize={setImageBatchSize}
              imageCombineMode={imageCombineMode}
              setImageCombineMode={setImageCombineMode}
              imageSlideDurationSec={imageSlideDurationSec}
              setImageSlideDurationSec={setImageSlideDurationSec}

              voiceFiles={voiceFiles}
              handleVoiceUpload={handleVoiceUpload}
              handleVoiceFolderUpload={handleVoiceFolderUpload}
              voiceFolderInputRef={voiceFolderInputRef}
              clearVoiceFiles={clearVoiceFiles}
              removeVoiceFile={removeVoiceFile}
              audioMode={audioMode}
              setAudioMode={setAudioMode}
              voiceBatchSize={voiceBatchSize}
              setVoiceBatchSize={setVoiceBatchSize}
              onStartVoiceCaptions={async () => {
                await captionStudioProps.uploadFromVoiceFiles(voiceFiles, []);
                setActiveTab('captions');
              }}
              captionsUploading={captionStudioProps.uploading}

              musicFiles={musicFiles}
              handleMusicUpload={handleMusicUpload}
              handleMusicFolderUpload={handleMusicFolderUpload}
              musicFolderInputRef={musicFolderInputRef}
              clearMusicFiles={clearMusicFiles}
              removeMusicFile={removeMusicFile}
              musicBatchSize={musicBatchSize}
              setMusicBatchSize={setMusicBatchSize}

              excelData={excelData}
              handleExcelUpload={handleExcelUpload}
              previewRowIndex={previewRowIndex}
              setPreviewRowIndex={setPreviewRowIndex}
            />

            <ExportTab
              activeTab={activeTab}
              libsLoaded={libsLoaded}
              config={config}
              setConfig={setConfig}
              updateGlobalConfig={updateGlobalConfig}
              detectedVideoDims={detectedVideoDims}
              detectedSourceFps={detectedSourceFps}
              exportFileEstimate={exportFileEstimate}
              estimatedExportDurationSec={estimatedExportDurationSec}
              getAutoExportSettings={getAutoExportSettings}
              voiceCaptionMap={voiceCaptionMap}
              videos={videos}
              imageFiles={imageFiles}
              excelData={excelData}
              voiceFiles={voiceFiles}
              imageSlideDurationSec={imageSlideDurationSec}
              videoMode={videoMode}
              audioMode={audioMode}
              imageMode={imageMode}
              processing={processing}
              finished={finished}
              logs={logs}
              progress={progress}
              estimatedTime={estimatedTime}
              zipFolderName={zipFolderName}
              setZipFolderName={setZipFolderName}
              serverProcessing={serverProcessing}
              serverProgress={serverProgress}
              serverJobType={serverJobType}
              serverJobMeta={serverJobMeta}
              startProcessing={startProcessing}
              startImageProcessing={startImageProcessing}
              handlePauseProcessing={handlePauseProcessing}
              handleStopProcessing={handleStopAllProcessing}
              handleResetRun={handleResetRun}
              isPaused={isPaused}
              processedVideos={processedVideos}
            />

            <ProjectsPanel
              activeTab={activeTab}
              api={api}
              config={config}
              excelData={excelData}
              setExcelData={setExcelData}
              setPreviewRowIndex={setPreviewRowIndex}
              setConfig={setConfig}
              setLogs={setLogs}
              projects={projects}
              setProjects={setProjects}
              projectName={projectName}
              setProjectName={setProjectName}
              videos={videos}
              voiceFiles={voiceFiles}
              musicFiles={musicFiles}
            />

            <SettingsPanel
              activeTab={activeTab}
              isLoggedIn={isLoggedIn}
              userPresets={userPresets}
              presetName={presetName}
              setPresetName={setPresetName}
              saveCurrentPreset={saveCurrentPreset}
              presetSaving={presetSaving}
              presetLoading={presetLoading}
              applyPresetSettings={applyPresetSettings}
              setLogs={setLogs}
              collectCurrentSettings={collectCurrentSettings}
              api={api}
              loadUserPresets={loadUserPresets}
              deleteUserPreset={deleteUserPreset}

              logoFile={logoFile}
              logoEnabled={logoEnabled}
              setLogoEnabled={setLogoEnabled}
              handleLogoUpload={handleLogoUpload}
              logoPreview={logoPreview}
              removeLogo={removeLogo}
              logoPosition={logoPosition}
              setLogoPosition={setLogoPosition}
              logoSize={logoSize}
              setLogoSize={setLogoSize}
              logoOpacity={logoOpacity}
              setLogoOpacity={setLogoOpacity}
              logoPadding={logoPadding}
              setLogoPadding={setLogoPadding}

              videoMode={videoMode}
              setVideoMode={setVideoMode}
              audioMode={audioMode}
              setAudioMode={setAudioMode}
              imageMode={imageMode}
              setImageMode={setImageMode}
            />

            <SettingsOverlayGrid
              activeTab={activeTab}
              config={config}
              updateGlobalConfig={updateGlobalConfig}
              detectedVideoDims={detectedVideoDims}
              detectedSourceFps={detectedSourceFps}
              getAutoExportSettings={getAutoExportSettings}
              exportFileEstimate={exportFileEstimate}
              estimatedExportDurationSec={estimatedExportDurationSec}
              setConfig={setConfig}
              BACKGROUND_PATTERN_PRESETS={BACKGROUND_PATTERN_PRESETS}
              activeOverlayIndex={activeOverlayIndex}
              setActiveOverlayIndex={setActiveOverlayIndex}
              updateOverlayConfig={updateOverlayConfig}
              patchOverlayConfig={patchOverlayConfig}
              applyOverlayPreset={applyOverlayPreset}
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

          </div>

          {/* CENTER/RIGHT: Preview & Results */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-3">
          <TTSLayout
            activeTab={activeTab}
            voices={getNeuralVoicesForUI()}
            ttsSpeaker={ttsSpeaker}
            setTtsSpeaker={setTtsSpeaker}
            setTtsRate={setTtsRate}
            setTtsPitch={setTtsPitch}
            setTtsMood={setTtsMood}
            setTtsEffect={setTtsEffect}
            setTtsSpeakerGender={setTtsSpeakerGender}
            setVoiceQualityMode={setVoiceQualityMode}
            ttsPreviewText={ttsPreviewText}
            setTtsPreviewText={setTtsPreviewText}
            previewTTS={previewTTS}
            ttsSampleLoading={ttsSampleLoading}
            excelData={excelData}
            ttsColumn={ttsColumn}
            ttsMode={ttsMode}
            ttsSelectedRows={ttsSelectedRows}
            onAdvancedGenerate={generateAdvancedTTS}
            onBasicGenerate={generateAllTTS}
            advancedGenerating={ttsGenerating}
            studioApiRef={studioApiRef}
          />

          {activeTab !== 'tts' && (
          <PreviewAndResultsPanel
            excelData={excelData}
            previewRowIndex={previewRowIndex}
            setPreviewRowIndex={setPreviewRowIndex}
            previewVideoNav={previewVideoNav}
            onPreviewVideoPrev={goPreviewVideoPrev}
            onPreviewVideoNext={goPreviewVideoNext}
            previewImageNav={previewImageNav}
            onPreviewImagePrev={goPreviewImagePrev}
            onPreviewImageNext={goPreviewImageNext}
            effectivePreviewVideoIndex={resolvePreviewVideoIndex({
              videos,
              previewRowIndex,
              previewVideoIndex,
              excelData,
              videoMode,
            })}
            previewStageRef={previewStageRef}
            previewBgCanvasRef={previewBgCanvasRef}
            previewCanvasRef={previewCanvasRef}
            previewVideoRef={previewVideoRef}
            useLayeredPreview={videos.length > 0 && isPreviewPlaying}
            estimatedExportDurationSec={estimatedExportDurationSec}
            exportFileEstimate={exportFileEstimate}
            config={config}
            imageFiles={imageFiles}
            videos={videos}
            voiceFiles={voiceFiles}
            musicFiles={musicFiles}
            togglePreviewPlay={togglePreviewPlay}
            isPreviewPlaying={isPreviewPlaying}
            getAspectRatioDimensions={getAspectRatioDimensions}
            getEffectiveDimensions={getEffectiveDimensions}
            processedVideos={processedVideos}
            finished={finished}
            serverProcessing={serverProcessing}
            serverJobMeta={serverJobMeta}
            downloadAllZip={downloadAllZip}
            downloadSingleVideo={downloadSingleVideo}
          />
          )}

            <GeneratedAudiosPanel
              generatedAudios={generatedAudios}
              isGenerating={serverProcessing && serverJobType === 'tts'}
              addAllGeneratedToVoiceLibrary={addAllGeneratedToVoiceLibrary}
              downloadAllTTSAudios={downloadAllTTSAudios}
              addGeneratedAudioToVoiceLibrary={addGeneratedAudioToVoiceLibrary}
              downloadSingleAudio={downloadSingleAudio}
            />

          </div>
        </div>

        <AdminPanelContainer
          show={showAdminPanel}
          isAdmin={isAdmin}
          onClose={() => setShowAdminPanel(false)}
          adminStats={adminStats}
          adminUsers={adminUsers}
          adminNewEmail={adminNewEmail}
          setAdminNewEmail={setAdminNewEmail}
          adminNewPassword={adminNewPassword}
          setAdminNewPassword={setAdminNewPassword}
          adminNewName={adminNewName}
          setAdminNewName={setAdminNewName}
          adminNewRole={adminNewRole}
          setAdminNewRole={setAdminNewRole}
          adminCreateUser={adminCreateUser}
          adminLoading={adminLoading}
          loadAdminData={loadAdminData}
          adminEditId={adminEditId}
          setAdminEditId={setAdminEditId}
          adminEditData={adminEditData}
          setAdminEditData={setAdminEditData}
          adminSaveEdit={adminSaveEdit}
          adminToggleActive={adminToggleActive}
          adminDeleteUser={adminDeleteUser}
        />

        {/* Hidden elements */}
        <div className="hidden">
          <video ref={extractionVideoRef} playsInline crossOrigin="anonymous" />
          <audio ref={previewAudioRef} />
        </div>
      </div>
    </div>
  );
};

export default App;
