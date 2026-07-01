import React from 'react';

export default function OverlayQuickPresets({ activeOverlayIndex, config, updateOverlayConfig }) {
  return (
    <div className="bg-indigo-500/[0.03] p-2.5 rounded-xl border border-indigo-500/[0.06]">
      <p className="text-[10px] text-gray-500 mb-2 font-medium">QUICK PRESETS</p>
      <div className="flex flex-wrap gap-1">
        {[
          { id: 'clean', label: 'Clean', color: '#ffffff', fontPreset: 'modern', styleType: 'stroke', kineticEffect: 'fadeIn' },
          { id: 'neon', label: 'Neon', color: '#39FF14', fontPreset: 'impact', styleType: 'stroke', colorPreset: 'neon' },
          { id: 'fire', label: 'Fire', color: '#f5af19', fontPreset: 'bold', styleType: 'box', colorPreset: 'fire' },
          { id: 'gold', label: 'Gold', color: '#FFD700', fontPreset: 'elegant', styleType: 'box' },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => {
              updateOverlayConfig(activeOverlayIndex, 'color', p.color);
              if (p.fontPreset) updateOverlayConfig(activeOverlayIndex, 'fontPreset', p.fontPreset);
              if (p.styleType) updateOverlayConfig(activeOverlayIndex, 'styleType', p.styleType);
              if (p.kineticEffect) updateOverlayConfig(activeOverlayIndex, 'kineticEffect', p.kineticEffect);
              if (p.colorPreset) updateOverlayConfig(activeOverlayIndex, 'colorPreset', p.colorPreset);
            }}
            className="text-[9px] px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

