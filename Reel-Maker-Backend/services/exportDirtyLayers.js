/**
 * Dirty-layer analysis for server export (M9) — skip redundant redraws when safe.
 */

function hasAnimatedOverlays(config) {
  const overlays = config?.overlays || [];
  return overlays.some((o) => {
    if (!o || o.enabled === false) return false;
    if (o.animationPreset && o.animationPreset !== 'none') return true;
    if (o.kineticEffect && o.kineticEffect !== 'none') return true;
    if (o.useWordByWord) return true;
    if (o.doodleEnabled && o.doodleAnimation && o.doodleAnimation !== 'none') return true;
    return false;
  });
}

/**
 * @param {object} params
 * @param {object} params.config
 * @param {boolean} params.hasBgVideo
 * @param {boolean} params.hasMainVideo
 * @param {boolean} params.bgEffectsActive
 */
function analyzeDirtyLayers(params) {
  const { config, hasBgVideo, hasMainVideo, bgEffectsActive } = params;
  const bg = config?.background || {};
  const bgType = bg.type || 'solid';

  const captionActive =
    config?.captionSync?.enabled && (config?.captionSync?.segments?.length > 0);

  const overlaysDirty =
    captionActive || hasAnimatedOverlays(config) || (config?.overlays || []).length > 0;

  const canBakeStaticBackground =
    !bgEffectsActive
    && !hasBgVideo
    && (bgType === 'solid' || bgType === 'gradient' || bgType === 'pattern');

  const canBakeLogo = Boolean(config?.logoEnabled);

  const canBakeDecorative =
    !captionActive
    && !hasAnimatedOverlays(config)
    && (config?.overlays || []).some(
      (o) => o?.enabled && (o.textBgEnabled || o.doodleEnabled)
        && (!o.doodleEnabled || !o.doodleAnimation || o.doodleAnimation === 'none'),
    );

  return {
    canBakeStaticBackground,
    canBakeLogo,
    canBakeDecorative,
    overlaysDirtyEveryFrame: overlaysDirty,
    videoLayersDirtyEveryFrame: hasMainVideo || hasBgVideo,
    bgEffectsActive,
  };
}

module.exports = {
  analyzeDirtyLayers,
  hasAnimatedOverlays,
};
