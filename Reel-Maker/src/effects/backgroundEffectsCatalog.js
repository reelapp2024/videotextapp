/** Background effects catalog (frontend; mirrors backend metadata). */

export const DEFAULT_BACKGROUND_EFFECTS = {
  enabled: true,
  effectId: 'none',
  intensity: 0.75,
  speed: 1,
  durationMode: 'auto',
  durationSec: 10,
}

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function inferEffectMeta(name) {
  const n = name.toLowerCase()
  if (/grain|film|vhs|noise/.test(n) && !/rain|matrix/.test(n)) {
    return { family: 'overlay', variant: /vhs|retro|tv/.test(n) ? 'retro' : 'grain' }
  }
  if (/thunder|flicker|strobe|flash/.test(n)) return { family: 'flash', variant: 'burst' }
  if (/fire|explosion|lava/.test(n)) return { family: 'particles', variant: 'spark' }
  if (/fog|mist|smoke|fantasy/.test(n)) return { family: 'blur', variant: 'gaussian' }
  if (/chromatic|drift|split/.test(n)) return { family: 'glitch', variant: 'rgb' }
  if (/lens|flare|bokeh|beam/.test(n)) return { family: 'glow', variant: /bokeh/.test(n) ? 'soft' : 'leak' }
  if (/spin|rotation|orbit|vinyl|tornado|spiral|whirl|swirl|twist|hypnotic/.test(n)) {
    return { family: 'rotate', variant: /orbit/.test(n) ? 'orbit' : /swirl|twist/.test(n) ? 'swirl' : 'spin' }
  }
  if (/zoom|ken|dolly|blockbuster|epic|scope|tunnel|trippy/.test(n)) {
    return { family: 'zoom', variant: /out/.test(n) ? 'out' : /pulse|bounce/.test(n) ? 'pulse' : 'in' }
  }
  if (/pan|drift|slide|cinematic|parallax|floating/.test(n)) {
    return { family: 'pan', variant: 'drift' }
  }
  if (/shake|impact|comic/.test(n)) return { family: 'shake', variant: 'medium' }
  if (/blur|focus|bokeh|smear|mirage|soft/.test(n)) {
    return { family: 'blur', variant: /radial/.test(n) ? 'radial' : /motion/.test(n) ? 'motion' : 'gaussian' }
  }
  if (/glitch|rgb|vhs|broken|cyber|matrix|scanline|flicker|signal|hologram|digital/.test(n)) {
    return { family: 'glitch', variant: /rgb/.test(n) ? 'rgb' : /scan|matrix|digital/.test(n) ? 'scan' : 'slice' }
  }
  if (/grain|noise|dust|particle|snow|rain|thunder|spark|ink|paint|explosion|fire|smoke|lava|ice|drop/.test(n)) {
    return {
      family: 'particles',
      variant: /rain|drop/.test(n) ? 'rain' : /snow/.test(n) ? 'snow' : /spark/.test(n) ? 'spark' : 'dust',
    }
  }
  if (/glow|neon|leak|flare|laser|light|disco|aura|ethereal|dream|crystal|electric/.test(n)) {
    return { family: 'glow', variant: /neon/.test(n) ? 'neon' : /leak/.test(n) ? 'leak' : 'soft' }
  }
  if (/wave|ripple|liquid|water|ocean|goo|jelly|fluid|melt|warp|distort|bend|illusion|psy|acid|heat|portal|mercury|chrome|mist|frost|silk|surreal|morph|wobble|rubber|elastic|gooey|bleed|flow|dimensional|liquify|hypnotic|fractal|plasma|vapor|rainbow|phantom|echo|fantasy|hallucination|trip|cosmic|magic|oil|watercolor|fluid/.test(n)) {
    return { family: 'warp', variant: /ripple/.test(n) ? 'ripple' : 'wave' }
  }
  if (/mirror|kaleidoscope|reflection/.test(n)) {
    return { family: 'mirror', variant: /kaleidoscope/.test(n) ? 'kaleido' : 'mirror' }
  }
  if (/stretch|vertical|horizontal|rubber/.test(n)) {
    return { family: 'stretch', variant: /vertical/.test(n) ? 'v' : /horizontal/.test(n) ? 'h' : 'both' }
  }
  if (/flash|burst|strobe/.test(n)) return { family: 'flash', variant: 'burst' }
  if (/exposure|ghost|shadow trail|trail/.test(n)) return { family: 'ghost', variant: 'trail' }
  if (/cartoon|comic|anime|pixel|sort/.test(n)) {
    return { family: 'stylize', variant: /pixel|sort/.test(n) ? 'pixel' : 'cartoon' }
  }
  if (/fisheye|tilt|3d|lens/.test(n)) {
    return { family: 'lens', variant: /fisheye/.test(n) ? 'fisheye' : 'tilt' }
  }
  if (/heart|beat/.test(n)) return { family: 'pulse', variant: 'heartbeat' }
  if (/crack|glass|tear|paper/.test(n)) return { family: 'texture', variant: 'crack' }
  if (/freeze|time warp|speed/.test(n)) return { family: 'pulse', variant: 'freeze' }
  if (/retro|tv/.test(n)) return { family: 'overlay', variant: 'retro' }
  if (/outline|stroke|border|edge|premium|titan|royal|diamond|supreme|infinity|frost outline|ghost stroke/.test(n)) {
    return { family: 'stylize', variant: 'edge' }
  }
  return { family: 'glow', variant: 'soft' }
}

const RAW = [
  { id: 'motion', label: 'Motion & Camera', names: ['Vinyl Spin', 'Stretch Warp', 'Zoom Pulse', 'Camera Shake', 'Slow Zoom In', 'Slow Zoom Out', 'Parallax Motion', 'Ken Burns', 'Floating Motion', 'Cinematic Drift', 'Orbit Rotation', 'Spiral Zoom', 'Dolly Zoom', 'Elastic Bounce', 'Cinematic Pan', 'Depth Push', 'Dynamic Crop', 'Speed Ramp', 'Slide Motion', 'Vertical Stretch', 'Horizontal Stretch', 'Rubber Effect', 'Bounce Zoom', 'Freeze Frame', 'Time Warp'] },
  { id: 'atmospheric', label: 'Weather & Atmosphere', names: ['Rain Drops', 'Water Ripple', 'Fire Overlay', 'Smoke Effect', 'Snow Fall', 'Thunder Flicker', 'Spark Particles', 'Dust Particles', 'Floating Dust', 'Fantasy Fog', 'Magic Mist', 'Heatwave Distortion', 'Ice Freeze', 'Explosion Burst', 'Tornado Spin'] },
  { id: 'cinematic', label: 'Cinematic & Film', names: ['Glitch', 'RGB Split', 'VHS Noise', 'Film Grain', 'Light Leak', 'Flash Burst', 'Blur Transition', 'Motion Blur', 'Radial Blur', 'Lens Flare', 'Bokeh Lights', 'Movie Title', 'Cinema Scope', 'Blockbuster', 'Epic Frame', 'Hollywood Glow', 'Trailer Text', 'Dark Cinema', 'Silver Screen', 'Action Title', 'Dramatic Caption', 'Retro TV', 'Broken Signal'] },
  { id: 'creative', label: 'Creative & Stylized', names: ['Neon Glow', 'Mirror Reflection', 'Kaleidoscope', 'Swirl Twist', 'Liquid Melt', 'Pixel Sort', 'Cartoon Pop', 'Comic Shake', '3D Tilt', 'Ink Spread', 'Paint Splash', 'Paper Tear', 'Cracked Glass', 'Double Exposure', 'Ghost Trail', 'Shadow Motion', 'Strobe Flash', 'Anime Impact', 'Dreamy Glow', 'Soft Focus', 'Disco Lights', 'Laser Sweep'] },
  { id: 'digital', label: 'Digital & Cyber', names: ['Cyberpunk Flicker', 'Matrix Rain', 'Hologram Effect', 'Digital Scanlines', 'Fisheye Lens', 'Cyber Light', 'RGB Shine', 'Aurora Text', 'Future Glow', 'Plasma Style', 'Light Beam', 'Neon Edge', 'Electric Glow', 'Neon Pulse', 'AI Face Morph', 'AI Morph', 'Shadow Liquify', 'Chromatic Drift', 'Motion Smear', 'Blur Mirage'] },
  { id: 'liquid', label: 'Liquid & Psychedelic', names: ['Liquid Wave', 'Water Distortion', 'Ripple Illusion', 'Jelly Warp', 'Gooey Flow', 'Ink Bleed', 'Dream Warp', 'Fluid Motion', 'Psychedelic Swirl', 'Neon Liquid', 'Lava Flow', 'Glass Ripple', 'Mirage Blur', 'Trippy Zoom', 'Hallucination Effect', 'Reality Bend', 'Smoke Illusion', 'Melting Face', 'Morph Flow', 'Wobble Distortion', 'Acid Drift', 'Oil Paint Flow', 'Watercolor Spread', 'Cosmic Tunnel', 'Portal Warp', 'Liquid Chrome', 'Mercury Flow', 'Dreamcore Blur', 'Ethereal Glow', 'Ghost Drift', 'Vaporwave Motion', 'Rainbow Refraction', 'Crystal Distortion', 'Fractal Motion', 'Hypnotic Spiral', 'Time Ripple', 'Space Warp', 'Floating Reality', 'Silk Motion', 'Liquid Lens', 'Echo Distortion', 'Glowing Aura', 'Phantom Stretch', 'Ocean Wave Warp', 'Dimensional Shift', 'Electric Fluid', 'Dream Pulse', 'Frosted Glass Warp', 'Surreal Flow'] },
  { id: 'outline', label: 'Outline & Premium', names: ['Bold Outline', 'Neon Stroke', 'Double Stroke', 'Shadow Stroke', 'Thick Border', 'Clean Outline', 'White Edge', 'Black Stroke', 'Premium Border', 'Ultra Outline', 'Frost Outline', 'Ghost Stroke', 'Titan Border', 'Supreme Outline', 'Diamond Stroke', 'Shadow Edge', 'Ultra Border', 'Royal Outline', 'Neon Border', 'Infinity Stroke'] },
  { id: 'combos', label: 'Trending Combos', names: ['Liquid Dream', 'Trippy Liquid', 'Psy Flow', 'Acid Illusion', 'Dream Warp', 'Neon Melt', 'Cosmic Liquify', 'Fluid Reality', 'Hallucination FX', 'Ethereal Motion'] },
]

export const BACKGROUND_EFFECT_CATEGORIES = RAW.map((c) => {
  const seen = new Set()
  const effects = []
  for (const name of c.names) {
    const id = slug(name)
    if (seen.has(id)) continue
    seen.add(id)
    const { family, variant } = inferEffectMeta(name)
    effects.push({ id, name, family, variant })
  }
  return { id: c.id, label: c.label, effects }
})

export const ALL_BACKGROUND_EFFECTS = BACKGROUND_EFFECT_CATEGORIES.flatMap((c) => c.effects)

export function getBackgroundEffectById(id) {
  return ALL_BACKGROUND_EFFECTS.find((e) => e.id === id) || null
}

export function shouldApplyBackgroundEffects(bg, fx, opts = {}) {
  if (!fx?.enabled || !fx.effectId || fx.effectId === 'none') return false
  const t = bg?.type || 'solid'
  if (t === 'image' || t === 'video') return true
  if (opts.fallbackUploadImage) return true
  return false
}

export function resolveEffectTimelineDuration(timelineDuration) {
  return Math.max(0.5, Number(timelineDuration) || 10)
}

/** One effect cycle length — auto = full voice/video; manual = repeat every N sec for whole video. */
export function resolveEffectCycleDuration(timelineDuration, fx) {
  if (fx?.durationMode === 'manual' && Number(fx.durationSec) > 0) {
    return Math.max(0.5, Number(fx.durationSec))
  }
  return resolveEffectTimelineDuration(timelineDuration)
}

export function resolveBackgroundEffectDuration(timelineDuration, fx) {
  return resolveEffectCycleDuration(timelineDuration, fx)
}
