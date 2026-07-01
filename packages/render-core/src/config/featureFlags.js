/** @returns {boolean} */
export function isRenderCoreTextEnabled() {
  const v = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_RENDER_CORE_TEXT : undefined;
  return v === '1' || v === 'true' || v === true;
}

/** @returns {boolean} */
export function isRenderCoreAnimationEnabled() {
  const v = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_RENDER_CORE_ANIMATION : undefined;
  if (v === '0' || v === 'false') return false;
  return true;
}

export function isRenderCoreActive() {
  return isRenderCoreTextEnabled() || isRenderCoreAnimationEnabled();
}
