import React from 'react';

export default function OverlayAutoPreset({
  activeOverlayIndex,
  config,
  updateOverlayConfig,
  AUTO_PRESETS,
  AUTO_PRESET_CATEGORIES,
  videos,
}) {
  return (
    <div className="bg-indigo-500/[0.03] p-2.5 rounded-xl border border-indigo-500/[0.06]">
      <p className="text-[10px] text-gray-500 mb-2 font-medium">AUTO PRESET</p>
      <select
        value={config.overlays[activeOverlayIndex].autoPresetId || ''}
        onChange={(e) => {
          const pid = e.target.value;
          updateOverlayConfig(activeOverlayIndex, 'autoPresetId', pid || null);
          if (pid) {
            const p = AUTO_PRESETS.find((a) => a.id === pid);
            if (p) {
              updateOverlayConfig(activeOverlayIndex, 'kineticEffect', p.kinetic);
              updateOverlayConfig(activeOverlayIndex, 'animationPreset', p.animation);
              updateOverlayConfig(activeOverlayIndex, 'animationLogic', p.animationLogic || 'default');
              updateOverlayConfig(activeOverlayIndex, 'fontFamily', p.font);
              updateOverlayConfig(activeOverlayIndex, 'fontPreset', p.fontPreset);
              updateOverlayConfig(activeOverlayIndex, 'fontChangeLogic', p.fontLogic ?? 'none');
              updateOverlayConfig(activeOverlayIndex, 'color', p.color);
              updateOverlayConfig(activeOverlayIndex, 'colorPreset', p.colorPreset);
              updateOverlayConfig(activeOverlayIndex, 'colorLogic', p.colorLogic);
              if (p.styleType) updateOverlayConfig(activeOverlayIndex, 'styleType', p.styleType);
              if (p.strokeColor) updateOverlayConfig(activeOverlayIndex, 'strokeColor', p.strokeColor);
              if (p.bgColor) updateOverlayConfig(activeOverlayIndex, 'bgColor', p.bgColor);
            }
          }
        }}
        className="w-full bg-gray-700 rounded text-[10px] p-1.5 border-none"
      >
        <option value="">Custom (manual)</option>
        {AUTO_PRESET_CATEGORIES.map((cat) => {
          const items = AUTO_PRESETS.filter((a) => (a.category || 'other') === cat.id);
          if (items.length === 0) return null;
          const catLabel = (videos.length > 0 || (config.background?.type === 'video' && (config.background?.videos?.length || 0) > 0)) && cat.id === 'video'
            ? cat.label + ' (recommended)'
            : cat.label;
          return (
            <optgroup key={cat.id} label={catLabel}>
              {items.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </optgroup>
          );
        })}
      </select>
    </div>
  );
}

