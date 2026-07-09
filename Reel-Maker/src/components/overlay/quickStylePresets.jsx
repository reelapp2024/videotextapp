import React from 'react';

/** Top-level quick presets (font + kinetic + colors). */
export const OVERLAY_QUICK_PRESETS = [
  {
    id: 'clean',
    label: 'Clean',
    styleType: 'stroke',
    color: '#FFFFFF',
    bgColor: 'rgba(0,0,0,0)',
    strokeColor: '#000000',
    fontPreset: 'modern',
    kineticEffect: 'fadeIn',
    shadowEnabled: false,
  },
  {
    id: 'neon',
    label: 'Neon',
    styleType: 'stroke',
    color: '#39FF14',
    strokeColor: '#000000',
    fontPreset: 'impact',
    colorPreset: 'neon',
    shadowEnabled: true,
    shadowColor: '#39FF14',
  },
  {
    id: 'fire',
    label: 'Fire',
    styleType: 'box',
    color: '#FFFF00',
    bgColor: '#FF0000',
    fontPreset: 'bold',
    colorPreset: 'fire',
    shadowEnabled: true,
    shadowColor: '#FF4500',
  },
  {
    id: 'gold',
    label: 'Gold',
    styleType: 'box',
    color: '#FFD700',
    bgColor: 'rgba(0,0,0,0.75)',
    fontPreset: 'elegant',
    shadowEnabled: true,
    shadowColor: '#FF8C00',
  },
];

/** Line-scoped style quick presets. */
export const QUICK_STYLE_PRESETS = [
  { id: 'style-clean', name: 'Clean', bg: '#000000', color: '#FFFFFF', style: 'box', shadow: false },
  { id: 'style-neon', name: 'Neon', bg: '#000000', color: '#00FF00', style: 'stroke', shadow: true, shadowColor: '#00FF00' },
  { id: 'style-fire', name: 'Fire', bg: '#FF0000', color: '#FFFF00', style: 'box', shadow: true, shadowColor: '#FF0000' },
  { id: 'style-ice', name: 'Ice', bg: '#0066FF', color: '#FFFFFF', style: 'box', shadow: true, shadowColor: '#00CCFF' },
  { id: 'style-gold', name: 'Gold', bg: '#000000', color: '#FFD700', style: 'stroke', shadow: true, shadowColor: '#FF8C00' },
  { id: 'style-pink', name: 'Pink', bg: '#FF69B4', color: '#FFFFFF', style: 'box', shadow: false },
  { id: 'style-dark', name: 'Dark', bg: '#1a1a1a', color: '#CCCCCC', style: 'box', shadow: true, shadowColor: '#333333' },
  { id: 'style-glow', name: 'Glow', bg: '#000000', color: '#FFFFFF', style: 'stroke', shadow: true, shadowColor: '#FFFFFF' },
];

export function presetToPatch(preset) {
  if (preset.style != null) {
    const fields = {
      quickPresetId: preset.id,
      bgColor: preset.bg,
      color: preset.color,
      styleType: preset.style,
      shadowEnabled: preset.shadow,
    };
    if (preset.shadowColor) fields.shadowColor = preset.shadowColor;
    if (preset.style === 'stroke') fields.strokeColor = preset.bg;
    return fields;
  }
  const patch = {
    quickPresetId: preset.id,
    color: preset.color,
    styleType: preset.styleType,
    shadowEnabled: preset.shadowEnabled ?? false,
  };
  if (preset.bgColor != null) patch.bgColor = preset.bgColor;
  if (preset.strokeColor) patch.strokeColor = preset.strokeColor;
  if (preset.shadowColor) patch.shadowColor = preset.shadowColor;
  if (preset.fontPreset) patch.fontPreset = preset.fontPreset;
  if (preset.kineticEffect) patch.kineticEffect = preset.kineticEffect;
  if (preset.colorPreset) patch.colorPreset = preset.colorPreset;
  return patch;
}

export function getPresetVisual(preset) {
  const styleType = preset.styleType || preset.style || 'box';
  const isBox = styleType === 'box';
  return {
    isBox,
    color: preset.color,
    bg: preset.bgColor || preset.bg || '#000000',
    strokeColor: preset.strokeColor || (styleType === 'stroke' ? (preset.bg || '#000') : undefined),
    shadow: preset.shadowEnabled ?? preset.shadow ?? false,
    shadowColor: preset.shadowColor,
  };
}

export function QuickPresetPreview({ preset, className = '' }) {
  const v = getPresetVisual(preset);
  const canvasBg = '#0c0f1a';

  return (
    <div
      className={`relative h-11 w-full rounded-md overflow-hidden flex items-center justify-center border border-white/10 ${className}`}
      style={{ background: canvasBg }}
    >
      {v.isBox ? (
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded"
          style={{
            color: v.color,
            background: v.bg,
            boxShadow: v.shadow ? `0 0 10px ${v.shadowColor || v.color}` : undefined,
          }}
        >
          Aa
        </span>
      ) : (
        <span
          className="text-[11px] font-bold"
          style={{
            color: v.color,
            WebkitTextStroke: v.strokeColor ? `1.5px ${v.strokeColor}` : undefined,
            paintOrder: 'stroke fill',
            textShadow: v.shadow
              ? `0 0 8px ${v.shadowColor || v.color}, 0 0 2px ${v.shadowColor || v.color}`
              : undefined,
          }}
        >
          Aa
        </span>
      )}
    </div>
  );
}

export function QuickPresetButton({ preset, label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`flex flex-col gap-1 p-1.5 rounded-lg transition-all text-left ${
        selected
          ? 'ring-2 ring-indigo-400 ring-offset-1 ring-offset-[#0a0d18] bg-indigo-500/15 border border-indigo-400/50'
          : 'border border-transparent bg-gray-800/40 hover:bg-gray-700/50 hover:border-gray-600/50'
      }`}
    >
      <QuickPresetPreview preset={preset} />
      <span
        className={`text-[9px] font-medium text-center truncate w-full ${
          selected ? 'text-indigo-200' : 'text-gray-400'
        }`}
      >
        {label}
      </span>
    </button>
  );
}
