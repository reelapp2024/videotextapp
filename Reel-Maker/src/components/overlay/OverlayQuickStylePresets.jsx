import React from 'react';

const QUICK_STYLE_PRESETS = [
  { name: 'Clean', bg: '#000000', color: '#FFFFFF', style: 'box', shadow: false },
  { name: 'Neon', bg: '#000000', color: '#00FF00', style: 'stroke', shadow: true, shadowColor: '#00FF00' },
  { name: 'Fire', bg: '#FF0000', color: '#FFFF00', style: 'box', shadow: true, shadowColor: '#FF0000' },
  { name: 'Ice', bg: '#0066FF', color: '#FFFFFF', style: 'box', shadow: true, shadowColor: '#00CCFF' },
  { name: 'Gold', bg: '#000000', color: '#FFD700', style: 'stroke', shadow: true, shadowColor: '#FF8C00' },
  { name: 'Pink', bg: '#FF69B4', color: '#FFFFFF', style: 'box', shadow: false },
  { name: 'Dark', bg: '#1a1a1a', color: '#CCCCCC', style: 'box', shadow: true },
  { name: 'Glow', bg: '#000000', color: '#FFFFFF', style: 'stroke', shadow: true, shadowColor: '#FFFFFF' },
];

export default function OverlayQuickStylePresets({ activeOverlayIndex, updateOverlayConfig }) {
  return (
    <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-2 rounded border border-purple-700/30">
      <p className="text-[10px] text-gray-400 mb-2 font-medium">QUICK PRESETS</p>
      <div className="grid grid-cols-4 gap-1">
        {QUICK_STYLE_PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => {
              updateOverlayConfig(activeOverlayIndex, 'bgColor', preset.bg);
              updateOverlayConfig(activeOverlayIndex, 'color', preset.color);
              updateOverlayConfig(activeOverlayIndex, 'styleType', preset.style);
              updateOverlayConfig(activeOverlayIndex, 'shadowEnabled', preset.shadow);
              if (preset.shadowColor) updateOverlayConfig(activeOverlayIndex, 'shadowColor', preset.shadowColor);
              if (preset.style === 'stroke') updateOverlayConfig(activeOverlayIndex, 'strokeColor', preset.bg);
            }}
            className="p-1 rounded text-[9px] bg-gray-700 hover:bg-gray-600 text-gray-300 transition"
            style={{
              background: preset.bg === '#000000' ? '#333' : preset.bg,
              color: preset.color,
            }}
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
}
