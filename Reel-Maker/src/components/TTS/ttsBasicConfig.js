/**
 * Basic tab = real Microsoft Azure / Edge Neural voices (same engine as before).
 * No fake pitch-warping — each card is a unique Neural ShortName, natural prosody.
 */

export const VOICE_TYPES = [
  { id: 'male', label: 'Male', desc: 'Microsoft Neural male voices' },
  { id: 'female', label: 'Female', desc: 'Microsoft Neural female voices' },
  { id: 'young', label: 'Young Voice', desc: 'Youthful Neural voices' },
  { id: 'old', label: 'Old Age', desc: 'Mature / deeper Neural voices' },
];

/** Mild style — keep pitch near natural so Neural timbre stays unique */
export const STYLE_PRESETS = [
  { id: 'natural', label: 'Natural', desc: 'True Neural voice, no style warp', rate: 1.0, pitch: 1.0, mood: 'normal' },
  { id: 'professional', label: 'Professional', desc: 'Slightly steadier delivery', rate: 0.96, pitch: 1.0, mood: 'confident' },
  { id: 'newscaster', label: 'Newscaster', desc: 'Broadcast pace', rate: 1.06, pitch: 1.0, mood: 'news' },
  { id: 'promo', label: 'Promo / Energetic', desc: 'Faster energy', rate: 1.12, pitch: 1.0, mood: 'excited' },
  { id: 'calm', label: 'Calm', desc: 'Slower, relaxed', rate: 0.88, pitch: 1.0, mood: 'calm' },
  { id: 'storytelling', label: 'Storytelling', desc: 'Narrative pace', rate: 0.92, pitch: 1.0, mood: 'story' },
];

export const PACE_OPTIONS = [
  { id: 'slow', label: 'Slow', desc: 'Relaxed tempo', rateMult: 0.88 },
  { id: 'natural', label: 'Natural', desc: 'Default Neural pace', rateMult: 1.0 },
  { id: 'fast', label: 'Fast', desc: 'Quicker delivery', rateMult: 1.12 },
];

export const ACCENT_OPTIONS = [
  { id: 'american', label: 'American', categories: ['English USA'], langs: ['en-US'] },
  { id: 'british', label: 'British', categories: ['English UK'], langs: ['en-GB'] },
  { id: 'australian', label: 'Australian', categories: ['English AU'], langs: ['en-AU'] },
  { id: 'indian', label: 'Indian English', categories: ['English IN'], langs: ['en-IN'] },
];

/**
 * Curated Microsoft Neural IDs — one unique engine each.
 * These are the same voices from the old "Azure Neural AI" picker.
 * Order = most distinct first within each group.
 */
export const NEURAL_VOICE_CURATION = {
  male: {
    american: [
      { id: 'en_roger', role: 'Bass', vibe: 'Deepest US Neural bass' },
      { id: 'en_brian', role: 'Deep', vibe: 'Warm deep narrator' },
      { id: 'en_christopher', role: 'Low', vibe: 'Rich low baritone' },
      { id: 'en_guy', role: 'Host', vibe: 'Classic US male Neural' },
      { id: 'en_eric', role: 'Clear', vibe: 'Crisp presenter Neural' },
      { id: 'en_andrew', role: 'Warm Male', vibe: 'Warm confident US male' },
      { id: 'en_steffan', role: 'Deep Clear', vibe: 'Deep rational US Neural' },
    ],
    british: [
      { id: 'en_gb_ryan', role: 'UK Deep', vibe: 'Deep British Neural' },
      { id: 'en_gb_thomas', role: 'UK Narrator', vibe: 'Polished UK Neural' },
    ],
    australian: [
      { id: 'en_au_william', role: 'AU Deep', vibe: 'Australian male Neural' },
    ],
    indian: [
      { id: 'en_in_prabhat', role: 'IN Male', vibe: 'Indian English male Neural' },
    ],
  },
  female: {
    american: [
      { id: 'en_jenny', role: 'Signature', vibe: 'Classic US female Neural' },
      { id: 'en_aria', role: 'Bright', vibe: 'Bright expressive Neural' },
      { id: 'en_michelle', role: 'Warm', vibe: 'Warm friendly Neural' },
      { id: 'en_ava', role: 'Modern', vibe: 'Modern US Neural' },
      { id: 'en_emma', role: 'Soft', vibe: 'Soft conversational Neural' },
    ],
    british: [
      { id: 'en_gb_sonia', role: 'UK Host', vibe: 'British female Neural' },
      { id: 'en_gb_libby', role: 'UK Bright', vibe: 'Bright UK Neural' },
    ],
    australian: [
      { id: 'en_au_natasha', role: 'AU Host', vibe: 'Australian female Neural' },
    ],
    indian: [
      { id: 'en_in_neerja', role: 'IN Female', vibe: 'Indian English female Neural' },
    ],
  },
  young: {
    american: [
      { id: 'en_ana', role: 'Child', vibe: 'Soft child Neural (Ana)' },
      { id: 'en_emma', role: 'Youth Soft', vibe: 'Youthful soft Neural' },
      { id: 'en_aria', role: 'Youth Bright', vibe: 'Bright youthful Neural' },
    ],
    british: [
      { id: 'en_gb_maisie', role: 'UK Youth', vibe: 'Young British Neural' },
    ],
    australian: [
      { id: 'en_nz_molly', role: 'Oceanic Youth', vibe: 'Young Oceanic Neural' },
    ],
    indian: [
      { id: 'en_in_neerja_exp', role: 'Expressive', vibe: 'Expressive IN Neural' },
    ],
  },
  /**
   * Old Age — Edge has no true elderly models.
   * We use the deepest / most mature Neural engines (working ShortNames only).
   */
  old: {
    american: [
      { id: 'en_roger', role: 'Elder Bass', vibe: 'Deepest mature US male Neural' },
      { id: 'en_steffan', role: 'Elder Deep', vibe: 'Mature deep US male Neural' },
      { id: 'en_christopher', role: 'Elder Low', vibe: 'Rich mature low Neural' },
    ],
    british: [
      { id: 'en_gb_ryan', role: 'UK Elder', vibe: 'Deep mature British male Neural' },
      { id: 'en_gb_thomas', role: 'UK Senior', vibe: 'Polished mature UK male Neural' },
      { id: 'en_gb_sonia', role: 'UK Mature', vibe: 'Composed mature UK female Neural' },
    ],
    australian: [
      { id: 'en_au_william', role: 'AU Elder', vibe: 'Deep mature Australian male Neural' },
      { id: 'en_au_natasha', role: 'AU Mature', vibe: 'Mature Australian female Neural' },
    ],
    indian: [
      { id: 'en_in_prabhat', role: 'IN Elder', vibe: 'Mature Indian English male Neural' },
      { id: 'en_in_neerja', role: 'IN Mature', vibe: 'Mature Indian English female Neural' },
    ],
  },
};

const ACCENT_LABEL = {
  american: 'American',
  british: 'British',
  australian: 'Australian',
  indian: 'Indian English',
};

const COLOR_BY_ACCENT = {
  american: '#7c3aed',
  british: '#2563eb',
  australian: '#b45309',
  indian: '#c2410c',
};

export function accentLabelForCharacter(voice) {
  if (!voice) return '—';
  if (voice.accent && ACCENT_LABEL[voice.accent]) return ACCENT_LABEL[voice.accent];
  return accentLabelForVoice(voice);
}

export function accentLabelForVoice(voice) {
  if (!voice) return '—';
  const cat = voice.category || '';
  if (cat.includes('USA') || voice.lang === 'en-US') return 'American';
  if (cat.includes('UK') || voice.lang === 'en-GB') return 'British';
  if (cat.includes('AU') || voice.lang === 'en-AU') return 'Australian';
  if (cat.includes('IN') || voice.lang === 'en-IN') return 'Indian English';
  if (cat.includes('NZ') || voice.lang === 'en-NZ') return 'New Zealand';
  return cat.replace(/^English\s+/i, '') || voice.lang || '—';
}

/** Real Microsoft Neural display name, e.g. "Jenny" */
export function shortVoiceName(voice) {
  if (!voice) return 'Voice';
  if (voice.neuralName) return voice.neuralName;
  const raw = voice.label || voice.name || voice.id || 'Voice';
  return String(raw).split(/[—–|(]/)[0].trim() || String(raw);
}

function neuralNameFromLabel(label, id) {
  if (!label) return id || 'Voice';
  return String(label).split(/[—–|(]/)[0].trim() || label;
}

/**
 * Build Basic-tab list from live Microsoft Neural library + curation.
 * Never invents voices — only real backend/offline Neural IDs.
 */
export function filterBasicVoices(voices = [], { voiceType, accent }) {
  const curation = NEURAL_VOICE_CURATION[voiceType]?.[accent] || [];
  if (!curation.length) return [];

  const byId = new Map((voices || []).map((v) => [v.id, v]));
  const usedEngines = new Set(); // unique Edge ShortName
  const result = [];

  for (const entry of curation) {
    const engine = byId.get(entry.id);
    if (!engine) continue;
    // Skip multilingual / duplicate engines of the same person
    const short = engine.voice || engine.id;
    if (usedEngines.has(short)) continue;
    if (/Multilingual/i.test(short)) continue;
    usedEngines.add(short);

    result.push({
      ...engine,
      id: engine.id,
      speakerId: engine.id,
      accent,
      type: voiceType,
      neuralName: neuralNameFromLabel(engine.label, engine.id),
      role: entry.role,
      vibe: entry.vibe,
      timbre: entry.role,
      color: COLOR_BY_ACCENT[accent] || '#7c3aed',
      provider: 'Microsoft Azure Neural AI',
    });
  }

  return result;
}

export function findCharacterBySpeakerId(speakerId, voices = [], voiceType, accent) {
  if (voiceType && accent) {
    return filterBasicVoices(voices, { voiceType, accent }).find(
      (v) => v.id === speakerId || v.speakerId === speakerId
    ) || null;
  }
  // Search all curated groups
  for (const type of Object.keys(NEURAL_VOICE_CURATION)) {
    for (const acc of Object.keys(NEURAL_VOICE_CURATION[type])) {
      const hit = filterBasicVoices(voices, { voiceType: type, accent: acc }).find(
        (v) => v.id === speakerId || v.speakerId === speakerId
      );
      if (hit) return hit;
    }
  }
  return (voices || []).find((v) => v.id === speakerId) || null;
}

/** Natural Neural prosody — pitch stays 1.0 so each voice keeps its unique timbre */
export function computeBasicRatePitch(styleId, paceId) {
  const style = STYLE_PRESETS.find((s) => s.id === styleId) || STYLE_PRESETS[0];
  const pace = PACE_OPTIONS.find((p) => p.id === paceId) || PACE_OPTIONS[1];
  const rate = Math.min(1.35, Math.max(0.75, style.rate * pace.rateMult));
  // Never pitch-shift Neural voices — that's what made them sound fake/similar
  const pitch = 1.0;
  return { rate, pitch, mood: style.mood, style, pace };
}
