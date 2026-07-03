/** Global field → per-line array for anim/reveal settings */
export const LINE_PART_ARRAY_FIELDS = {
  contentLineRevealMode: 'contentPartLineRevealMode',
  contentLineAnimType: 'contentPartLineAnimType',
  contentLineAnimSpeed: 'contentPartLineAnimSpeed',
};

const PART_ARRAY_KEYS = new Set(Object.values(LINE_PART_ARRAY_FIELDS));

/**
 * @param {object} overlay
 * @param {number|null} lineIndex null = global (all lines)
 * @param {string} key overlay field key
 * @param {*} fallback
 */
export function getLineScopedValue(overlay, lineIndex, key, fallback) {
  if (!overlay) return fallback;
  if (lineIndex == null) {
    if (key === 'contentPartDuration') {
      return resolveGlobalDuration(overlay, fallback);
    }
    if (key === 'contentPartHold') {
      return resolveGlobalHold(overlay, fallback);
    }
    if (key === 'contentPartLineAnimate') {
      return resolveGlobalAnimate(overlay, fallback);
    }
    return overlay[key] ?? fallback;
  }

  const partArrayKey = LINE_PART_ARRAY_FIELDS[key];
  if (partArrayKey) {
    const arr = overlay[partArrayKey] || [];
    if (arr[lineIndex] !== undefined && arr[lineIndex] !== null) return arr[lineIndex];
    return overlay[key] ?? fallback;
  }

  if (key === 'contentPartDuration') {
    const d = overlay.contentPartDurations?.[lineIndex];
    if (d != null && d >= 0.1) return d;
    return overlay.contentLineDisplayDuration ?? fallback;
  }
  if (key === 'contentPartHold') {
    const h = overlay.contentPartHoldAfter?.[lineIndex];
    if (h != null && h >= 0) return h;
    return overlay.contentLineHoldAfter ?? fallback;
  }
  if (key === 'contentPartLineAnimate') {
    const a = overlay.contentPartLineAnimate?.[lineIndex];
    if (a !== undefined) return a;
    return overlay.contentLineAnimate ?? fallback;
  }
  if (key === 'contentPartSameFrame') {
    return overlay.contentPartSameFrame?.[lineIndex] ?? false;
  }

  const lineStyle = overlay.contentPartLineStyleOverrides?.[lineIndex];
  if (lineStyle && lineStyle[key] !== undefined) return lineStyle[key];
  return overlay[key] ?? fallback;
}

function resolveGlobalDuration(overlay, fallback = 5) {
  const arr = overlay.contentPartDurations || [];
  if (arr.length === 0) return overlay.contentLineDisplayDuration ?? fallback;
  const first = arr[0];
  if (arr.every((d) => d === first)) return first ?? overlay.contentLineDisplayDuration ?? fallback;
  return overlay.contentLineDisplayDuration ?? first ?? fallback;
}

function resolveGlobalHold(overlay, fallback = 0) {
  const arr = overlay.contentPartHoldAfter || [];
  if (arr.length === 0) return overlay.contentLineHoldAfter ?? fallback;
  const first = arr[0];
  if (arr.every((h) => h === first)) return first ?? overlay.contentLineHoldAfter ?? fallback;
  return overlay.contentLineHoldAfter ?? first ?? fallback;
}

function resolveGlobalAnimate(overlay, fallback = false) {
  const arr = overlay.contentPartLineAnimate || [];
  if (arr.length === 0) return overlay.contentLineAnimate ?? fallback;
  const first = arr[0];
  if (arr.every((a) => a === first)) return first ?? overlay.contentLineAnimate ?? fallback;
  return overlay.contentLineAnimate ?? first ?? fallback;
}

function stripKeyFromStyleOverrides(overrides, key) {
  if (!overrides?.length) return [];
  return overrides.map((entry) => {
    if (!entry || typeof entry !== 'object') return undefined;
    const next = { ...entry };
    delete next[key];
    return Object.keys(next).length > 0 ? next : undefined;
  });
}

function fillArray(lineCount, value) {
  return Array.from({ length: Math.max(0, lineCount) }, () => value);
}

/**
 * Build overlay patch for a global (all lines) setting change.
 * Clears per-line overrides for that setting so global applies everywhere.
 */
export function buildGlobalLineSettingPatch(overlay, key, value, lineCount = 0) {
  const patch = {};

  const partArrayKey = LINE_PART_ARRAY_FIELDS[key];
  if (partArrayKey) {
    patch[key] = value;
    patch[partArrayKey] = [];
    return patch;
  }

  if (key === 'contentPartDuration') {
    patch.contentLineDisplayDuration = value;
    patch.contentPartDurations = fillArray(lineCount, value);
    return patch;
  }
  if (key === 'contentPartHold') {
    patch.contentLineHoldAfter = value;
    patch.contentPartHoldAfter = fillArray(lineCount, value);
    return patch;
  }
  if (key === 'contentPartLineAnimate') {
    patch.contentLineAnimate = value;
    patch.contentPartLineAnimate = fillArray(lineCount, value);
    return patch;
  }

  patch[key] = value;
  patch.contentPartLineStyleOverrides = stripKeyFromStyleOverrides(
    overlay.contentPartLineStyleOverrides,
    key,
  );
  return patch;
}

/**
 * Build overlay patch for a single-line setting change.
 */
export function buildLineSettingPatch(overlay, lineIndex, key, value, lineCount = 0) {
  const patch = {};
  const partArrayKey = LINE_PART_ARRAY_FIELDS[key];

  if (partArrayKey) {
    const arr = [...(overlay[partArrayKey] || [])];
    while (arr.length <= lineIndex) arr.push(undefined);
    arr[lineIndex] = value;
    patch[partArrayKey] = arr;
    return patch;
  }

  if (key === 'contentPartDuration') {
    const arr = [...(overlay.contentPartDurations || [])];
    while (arr.length <= lineIndex) arr.push(overlay.contentLineDisplayDuration ?? 5);
    arr[lineIndex] = value;
    patch.contentPartDurations = arr;
    return patch;
  }
  if (key === 'contentPartHold') {
    const arr = [...(overlay.contentPartHoldAfter || [])];
    while (arr.length <= lineIndex) arr.push(overlay.contentLineHoldAfter ?? 0);
    arr[lineIndex] = value;
    patch.contentPartHoldAfter = arr;
    return patch;
  }
  if (key === 'contentPartLineAnimate') {
    const arr = [...(overlay.contentPartLineAnimate || [])];
    while (arr.length <= lineIndex) arr.push(overlay.contentLineAnimate ?? false);
    arr[lineIndex] = value;
    patch.contentPartLineAnimate = arr;
    return patch;
  }
  if (key === 'contentPartSameFrame') {
    const arr = [...(overlay.contentPartSameFrame || [])];
    while (arr.length <= lineIndex) arr.push(false);
    arr[lineIndex] = value;
    patch.contentPartSameFrame = arr;
    return patch;
  }

  const overrides = [...(overlay.contentPartLineStyleOverrides || [])];
  while (overrides.length <= lineIndex) overrides.push(undefined);
  overrides[lineIndex] = { ...(overrides[lineIndex] || {}), [key]: value };
  patch.contentPartLineStyleOverrides = overrides;
  return patch;
}

/**
 * Apply multiple global line settings at once (clears per-line overrides per key).
 */
export function buildGlobalLineSettingsPatch(overlay, fields, lineCount = 0) {
  let merged = { ...overlay };
  let patch = {};
  for (const [key, value] of Object.entries(fields)) {
    const sub = buildGlobalLineSettingPatch(merged, key, value, lineCount);
    merged = { ...merged, ...patch, ...sub };
    patch = { ...patch, ...sub };
  }
  return patch;
}

/**
 * Merge per-line style overrides into overlay for preview/export (active line only).
 * @param {object} overlay
 * @param {number} lineIndex
 */
export function mergeLineStyleOverrides(overlay, lineIndex) {
  if (!overlay || lineIndex == null || lineIndex < 0) return overlay;
  const patch = overlay.contentPartLineStyleOverrides?.[lineIndex];
  if (!patch || typeof patch !== 'object') return overlay;
  return { ...overlay, ...patch };
}

/** Resolved overlay for UI binding (global or one line). */
export function resolveOverlayForLineEdit(overlay, lineIndex, lineCount = 0) {
  if (!overlay) return overlay;
  if (lineIndex == null) return overlay;

  const merged = mergeLineStyleOverrides(overlay, lineIndex);
  return {
    ...merged,
    contentLineRevealMode: getLineScopedValue(overlay, lineIndex, 'contentLineRevealMode', 'wordByWord'),
    contentLineAnimType: getLineScopedValue(overlay, lineIndex, 'contentLineAnimType', 'fadeIn'),
    contentLineAnimSpeed: getLineScopedValue(overlay, lineIndex, 'contentLineAnimSpeed', 2),
    contentLineDisplayDuration: getLineScopedValue(overlay, lineIndex, 'contentPartDuration', 5),
    contentLineHoldAfter: getLineScopedValue(overlay, lineIndex, 'contentPartHold', 0),
    contentLineAnimate: getLineScopedValue(overlay, lineIndex, 'contentPartLineAnimate', false),
  };
}
