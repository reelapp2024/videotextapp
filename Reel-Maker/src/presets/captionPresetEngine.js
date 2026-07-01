/** Word size / layout helpers for caption design presets (preview + export). */

export function getWordSizeScale(logic, wi, lineWordCount, gIdx = 0) {
  if (!logic) return 1
  const i = wi
  const n = Math.max(1, lineWordCount)
  const mid = Math.floor((n - 1) / 2)
  switch (logic) {
    case 'bigSmallBig':
      return [1.45, 0.72, 1.45][i % 3]
    case 'smallBigSmall':
      return [0.72, 1.45, 0.72][i % 3]
    case 'twoSmallOneGiant':
      return i % 3 === 2 ? 1.65 : 0.68
    case 'oneGiantTwoSmall':
      return i % 3 === 0 ? 1.65 : 0.68
    case 'staircase':
      return 0.75 + (i / Math.max(1, n - 1)) * 0.65
    case 'pyramid': {
      const dist = Math.abs(i - mid)
      return 1.55 - dist * 0.22
    }
    case 'growing':
      return 0.7 + (i / Math.max(1, n - 1)) * 0.85
    case 'shrinking':
      return 1.55 - (i / Math.max(1, n - 1)) * 0.85
    case 'wave':
      return 1 + Math.sin((gIdx + i) * 0.85) * 0.35
    case 'randomBurst': {
      const seed = Math.sin((gIdx + 1) * 12.9898 + (i + 1) * 78.233) * 43758.5453
      const r = seed - Math.floor(seed)
      return 0.65 + r * 0.95
    }
    case 'tinyRest':
      return 0.48
    case 'hugeActive':
      return 1
    default:
      return 1
  }
}

export function getWordLayoutOffset(logic, wi, lineWordCount, lineIdx, fontSize, gIdx = 0) {
  if (!logic) return { x: 0, y: 0 }
  const fs = fontSize || 24
  const n = Math.max(1, lineWordCount)
  switch (logic) {
    case 'zigzag':
      return { x: 0, y: (wi % 2 === 0 ? -1 : 1) * fs * 0.42 }
    case 'diagonal':
      return { x: (wi - n / 2) * fs * 0.14, y: -wi * fs * 0.1 }
    case 'cornerJump': {
      const corners = [
        { x: -fs * 0.55, y: -fs * 0.22 },
        { x: fs * 0.55, y: -fs * 0.22 },
        { x: -fs * 0.55, y: fs * 0.22 },
        { x: fs * 0.55, y: fs * 0.22 },
      ]
      return corners[wi % 4]
    }
    case 'floatingBlocks':
      return {
        x: Math.sin(gIdx * 1.7 + lineIdx) * fs * 0.1,
        y: Math.cos(gIdx * 2.1 + lineIdx * 0.5) * fs * 0.12,
      }
    case 'topBottom':
      return { x: 0, y: (wi % 2 === 0 ? -1 : 1) * fs * 0.32 }
    case 'leftRight':
      return { x: (wi % 2 === 0 ? -1 : 1) * fs * 0.42, y: 0 }
    case 'cross': {
      const mid = Math.floor(n / 2)
      if (wi === mid) return { x: 0, y: 0 }
      return {
        x: (wi < mid ? -1 : 1) * fs * 0.55,
        y: (wi % 2 === 0 ? -1 : 1) * fs * 0.32,
      }
    }
    case 'circular': {
      const angle = ((wi / n) * Math.PI * 1.35) - Math.PI * 0.675
      return { x: Math.sin(angle) * fs * 0.38, y: -Math.cos(angle) * fs * 0.22 }
    }
    default:
      return { x: 0, y: 0 }
  }
}
