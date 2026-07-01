/**
 * Parity test scenarios for drawOverlaysCore (M6).
 * Each scenario mirrors preview overlay capabilities.
 */

const BASE_OVERLAY = {
  enabled: true,
  fontFamily: 'Arial',
  fontWeight: 'bold',
  fontSize: 5,
  color: '#ffffff',
  positionY: 50,
  positionX: 50,
  wordsPerLine: 6,
  textAlign: 'center',
};

/**
 * @param {string} scenario
 * @param {{ width?: number, height?: number, videoTime?: number }} [opts]
 */
export function buildOverlayParityScenario(scenario, opts = {}) {
  const width = opts.width ?? 540;
  const height = opts.height ?? 960;
  const config = {
    contentMode: 'rowBased',
    background: { type: 'solid', solidColor: '#1a1a2e' },
    overlays: [{ ...BASE_OVERLAY }],
  };
  const data = ['Hello World'];
  let videoTime = opts.videoTime ?? 0;
  const duration = 5;

  const ov = config.overlays[0];

  switch (scenario) {
    case 'stroke':
      ov.styleType = 'stroke';
      ov.strokeColor = '#ff3366';
      ov.strokeOpacity = 1;
      data[0] = 'Stroke Text';
      break;
    case 'shadow':
      ov.shadowEnabled = true;
      ov.shadowColor = '#000000';
      ov.shadowBlur = 8;
      ov.shadowOffsetX = 4;
      ov.shadowOffsetY = 4;
      data[0] = 'Shadow Text';
      break;
    case 'glow':
      ov.glowEnabled = true;
      ov.glowColor = '#00ffcc';
      ov.glowBlur = 12;
      data[0] = 'Glow Text';
      break;
    case 'gradient':
      config.contentMode = 'multiColumn';
      ov.gradientEnabled = true;
      ov.gradientColors = ['#ff6b6b', '#4ecdc4', '#ffe66d'];
      data[0] = 'Gradient';
      break;
    case 'box':
      ov.styleType = 'box';
      ov.bgColor = '#333333';
      ov.bgOpacity = 0.9;
      data[0] = 'Rounded Box';
      break;
    case 'text-bg-pattern':
      ov.textBgEnabled = true;
      ov.textBgPattern = 'dots';
      ov.textBgColor = '#ff6b6b';
      data[0] = 'Pattern BG';
      break;
    case 'opacity':
      ov.color = 'rgba(255,255,255,0.55)';
      data[0] = 'Opacity';
      break;
    case 'rotation':
      config.contentMode = 'multiColumn';
      ov.rotation = 12;
      data[0] = 'Rotated';
      break;
    case 'scale':
      config.contentMode = 'multiColumn';
      ov.scale = 1.35;
      data[0] = 'Scaled';
      break;
    case 'letter-spacing':
      config.contentMode = 'multiColumn';
      ov.letterSpacing = 8;
      data[0] = 'Spaced';
      break;
    case 'line-height':
      config.contentMode = 'multiColumn';
      ov.lineHeight = 1.8;
      data[0] = 'Line One\nLine Two';
      break;
    case 'animation-fade':
      config.contentMode = 'multiColumn';
      ov.animationPreset = 'fadeIn';
      ov.animationStartTime = 0;
      ov.animationDuration = 2;
      data[0] = 'Fade In';
      videoTime = 0.5;
      break;
    case 'kinetic-pulse':
      config.contentMode = 'multiColumn';
      ov.kineticEffect = 'pulse';
      ov.kineticStartTime = 0;
      ov.kineticDuration = 2;
      ov.kineticLoop = true;
      data[0] = 'Pulse';
      videoTime = 0.5;
      break;
    case 'word-by-word':
      config.contentMode = 'multiColumn';
      ov.useWordByWord = true;
      ov.wordRevealMode = 'fade';
      data[0] = 'One Two Three Four';
      videoTime = 1.2;
      break;
    case 'captions':
      config.contentMode = 'rowBased';
      config.captionSync = {
        enabled: true,
        granularity: 'word',
        segments: [
          { start: 0, end: 1, text: 'Hello' },
          { start: 1, end: 2, text: 'World' },
          { start: 2, end: 3, text: 'Captions' },
        ],
      };
      ov.wordsPerLine = 2;
      data[0] = 'Hello World Captions';
      videoTime = 1.5;
      break;
    case 'icon-corner':
      ov.iconSectionEnabled = true;
      ov.iconLogic = 'intent';
      ov.iconPosition = 'topRight';
      ov.iconIntent = 'celebration';
      data[0] = 'Party Time';
      break;
    case 'uppercase':
      ov.textTransform = 'uppercase';
      data[0] = 'transform me';
      break;
    default:
      break;
  }

  return { config, data, width, height, videoTime, duration };
}

export const OVERLAY_PARITY_SCENARIOS = [
  'default',
  'stroke',
  'shadow',
  'glow',
  'gradient',
  'box',
  'text-bg-pattern',
  'opacity',
  'rotation',
  'scale',
  'letter-spacing',
  'line-height',
  'animation-fade',
  'kinetic-pulse',
  'word-by-word',
  'captions',
  'icon-corner',
  'uppercase',
];
