import { getBackgroundEffectById, resolveEffectCycleDuration } from './backgroundEffectsCatalog.js'

const TAU = Math.PI * 2

function effectSeed(id) {
  let h = 0
  const s = String(id || 'fx')
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return (Math.abs(h) % 1000) / 1000
}

function resolveVariant(meta, seed) {
  if (meta?.variant && meta.variant !== 'default') return meta.variant
  const pool = ['soft', 'neon', 'leak']
  return pool[Math.floor(seed * pool.length) % pool.length]
}
let bufferCanvas = null
let bufferW = 0
let bufferH = 0

function getBuffer(w, h) {
  if (!bufferCanvas || bufferW !== w || bufferH !== h) {
    bufferCanvas = document.createElement('canvas')
    bufferW = w
    bufferH = h
    bufferCanvas.width = w
    bufferCanvas.height = h
  }
  const ctx = bufferCanvas.getContext('2d')
  ctx.clearRect(0, 0, w, h)
  return { canvas: bufferCanvas, ctx }
}

function drawSource(destCtx, src, w, h, transform) {
  destCtx.save()
  destCtx.setTransform(
    transform?.a ?? 1,
    transform?.b ?? 0,
    transform?.c ?? 0,
    transform?.d ?? 1,
    transform?.e ?? 0,
    transform?.f ?? 0
  )
  destCtx.drawImage(src, 0, 0, w, h)
  destCtx.restore()
}

function overlayGrain(ctx, w, h, amount, seed) {
  const n = Math.floor(w * h * 0.002 * amount)
  ctx.save()
  ctx.globalAlpha = 0.08 * amount
  for (let i = 0; i < n; i++) {
    const x = ((seed * 9301 + i * 49297) % 233280) / 233280 * w
    const y = ((seed * 233 + i * 12347) % 233280) / 233280 * h
    ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000'
    ctx.fillRect(x, y, 1, 1)
  }
  ctx.restore()
}

function overlayScanlines(ctx, w, h, t, intensity) {
  ctx.save()
  ctx.globalAlpha = 0.12 * intensity
  const offset = Math.floor((t * 40) % 4)
  for (let y = offset; y < h; y += 4) {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, y, w, 2)
  }
  ctx.restore()
}

function overlayVignette(ctx, w, h, strength) {
  const g = ctx.createRadialGradient(w / 2, h / 2, w * 0.15, w / 2, h / 2, w * 0.72)
  g.addColorStop(0, 'rgba(0,0,0,0)')
  g.addColorStop(1, `rgba(0,0,0,${0.55 * strength})`)
  ctx.save()
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

function drawParticles(ctx, w, h, t, variant, intensity) {
  const count = Math.floor(80 * intensity)
  ctx.save()
  for (let i = 0; i < count; i++) {
    const px = ((i * 127.1 + 311.7) % 1000) / 1000
    const speed = 0.03 + (i % 7) * 0.01
    let x = (px * w + t * speed * w * 0.2) % w
    let y
    if (variant === 'rain') {
      y = ((t * (120 + i * 3) + i * 50) % (h + 40)) - 20
      ctx.strokeStyle = `rgba(174,214,241,${0.35 * intensity})`
      ctx.lineWidth = 1 + (i % 2)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - 2, y + 12)
      ctx.stroke()
      continue
    }
    if (variant === 'snow') {
      y = ((t * (25 + i) + i * 80) % (h + 20)) - 10
      ctx.fillStyle = `rgba(255,255,255,${0.5 * intensity})`
      ctx.beginPath()
      ctx.arc(x, y, 1 + (i % 3), 0, TAU)
      ctx.fill()
      continue
    }
    if (variant === 'spark') {
      y = h * (0.2 + ((i * 0.13) % 0.7))
      const flick = 0.5 + 0.5 * Math.sin(t * 8 + i)
      ctx.fillStyle = `rgba(255,220,100,${flick * intensity})`
      ctx.fillRect(x, y, 2, 2)
      continue
    }
    y = ((t * (15 + i * 2) + i * 90) % h)
    ctx.fillStyle = `rgba(255,255,255,${0.15 * intensity})`
    ctx.fillRect(x, y, 1, 1)
  }
  ctx.restore()
}

function applyWarpSlice(destCtx, src, w, h, t, intensity, amp) {
  const sliceH = 4
  const a = amp * intensity * 8
  for (let y = 0; y < h; y += sliceH) {
    const sh = Math.min(sliceH, h - y)
    const dx = Math.sin(y * 0.04 + t * 3) * a
    destCtx.drawImage(src, 0, y, w, sh, dx, y, w, sh)
  }
}

const FAMILIES = {
  none(ctx, src, w, h) {
    ctx.drawImage(src, 0, 0, w, h)
  },

  rotate(ctx, src, w, h, t, _cycleDur, progress, intensity, variant) {
    const angle = t * (variant === 'orbit' ? 0.15 : variant === 'swirl' ? 0.8 : 0.4) * intensity
    const scale = 1.15 + Math.sin(progress * TAU) * 0.05 * intensity
    ctx.save()
    ctx.translate(w / 2, h / 2)
    ctx.rotate(angle)
    ctx.scale(scale, scale)
    ctx.translate(-w / 2, -h / 2)
    ctx.drawImage(src, 0, 0, w, h)
    ctx.restore()
  },

  zoom(ctx, src, w, h, t, cycleDur, progress, intensity, variant) {
    let scale = 1
    if (variant === 'out') {
      scale = 1.25 - Math.sin(progress * TAU) * 0.11 * intensity
    } else if (variant === 'pulse') {
      scale = 1 + Math.sin(t * 2.5) * 0.06 * intensity
    } else {
      scale = 1 + (0.5 - 0.5 * Math.cos(progress * TAU)) * 0.28 * intensity
    }
    ctx.save()
    ctx.translate(w / 2, h / 2)
    ctx.scale(scale, scale)
    ctx.translate(-w / 2, -h / 2)
    ctx.drawImage(src, 0, 0, w, h)
    ctx.restore()
  },

  pan(ctx, src, w, h, t, _cycleDur, progress, intensity) {
    const dx = Math.sin(progress * TAU) * w * 0.08 * intensity
    const dy = Math.cos(progress * TAU * 0.5) * h * 0.06 * intensity
    const scale = 1.12
    ctx.save()
    ctx.translate(w / 2 + dx, h / 2 + dy)
    ctx.scale(scale, scale)
    ctx.translate(-w / 2, -h / 2)
    ctx.drawImage(src, 0, 0, w, h)
    ctx.restore()
  },

  shake(ctx, src, w, h, t, _dur, _p, intensity) {
    const dx = Math.sin(t * 24) * 6 * intensity
    const dy = Math.cos(t * 31) * 5 * intensity
    ctx.save()
    ctx.translate(dx, dy)
    ctx.drawImage(src, 0, 0, w, h)
    ctx.restore()
  },

  blur(ctx, src, w, h, t, _dur, _p, intensity, variant) {
    const px = (2 + intensity * (variant === 'radial' ? 6 : variant === 'motion' ? 10 : 4)).toFixed(1)
    ctx.save()
    ctx.filter = `blur(${px}px)`
    if (variant === 'motion') {
      for (let i = -2; i <= 2; i++) {
        ctx.globalAlpha = 0.15
        ctx.drawImage(src, i * 3 * intensity, 0, w, h)
      }
      ctx.globalAlpha = 1
    } else {
      ctx.drawImage(src, 0, 0, w, h)
    }
    ctx.filter = 'none'
    ctx.restore()
  },

  glitch(ctx, src, w, h, t, _dur, _p, intensity, variant) {
    ctx.drawImage(src, 0, 0, w, h)
    if (variant === 'rgb') {
      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      ctx.globalAlpha = 0.35 * intensity
      ctx.drawImage(src, 4 * intensity, 0, w, h)
      ctx.globalCompositeOperation = 'multiply'
      ctx.drawImage(src, -4 * intensity, 0, w, h)
      ctx.restore()
    } else if (variant === 'scan') {
      overlayScanlines(ctx, w, h, t, intensity)
      overlayGrain(ctx, w, h, intensity, t)
    } else {
      const slices = 8
      for (let i = 0; i < slices; i++) {
        const sh = Math.ceil(h / slices)
        const sy = i * sh
        const off = Math.sin(t * 20 + i) * 12 * intensity
        ctx.drawImage(src, 0, sy, w, sh, off, sy, w, sh)
      }
    }
  },

  particles(ctx, src, w, h, t, _dur, _p, intensity, variant) {
    ctx.drawImage(src, 0, 0, w, h)
    drawParticles(ctx, w, h, t, variant, intensity)
    if (variant === 'dust' || variant === 'spark') overlayGrain(ctx, w, h, intensity * 0.6, t)
  },

  glow(ctx, src, w, h, t, _dur, _p, intensity, variant) {
    ctx.save()
    ctx.shadowColor = variant === 'neon' ? '#39ff14' : variant === 'leak' ? '#ff6b35' : '#ffffff'
    ctx.shadowBlur = 18 * intensity
    ctx.drawImage(src, 0, 0, w, h)
    ctx.restore()
    if (variant === 'leak') {
      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      ctx.globalAlpha = 0.2 * intensity
      const g = ctx.createLinearGradient(0, 0, w, h)
      g.addColorStop(0, 'rgba(255,100,50,0)')
      g.addColorStop(0.5, 'rgba(255,200,80,0.8)')
      g.addColorStop(1, 'rgba(255,50,150,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
      ctx.restore()
    }
  },

  warp(ctx, src, w, h, t, _dur, _p, intensity, variant) {
    if (variant === 'ripple') {
      const { canvas: tmp, ctx: tctx } = getBuffer(w, h)
      applyWarpSlice(tctx, src, w, h, t, intensity, 2)
      ctx.drawImage(tmp, 0, 0)
    } else {
      applyWarpSlice(ctx, src, w, h, t, intensity, 4)
    }
  },

  mirror(ctx, src, w, h, t, _dur, _p, intensity, variant) {
    if (variant === 'kaleido') {
      const seg = 4
      const cw = w / 2
      const ch = h / 2
      for (let i = 0; i < seg; i++) {
        ctx.save()
        ctx.translate(w / 2, h / 2)
        ctx.rotate((TAU / seg) * i + t * 0.1 * intensity)
        ctx.scale(1, -1)
        ctx.drawImage(src, -cw / 2, -ch / 2, cw, ch)
        ctx.restore()
      }
    } else {
      ctx.save()
      ctx.translate(w, 0)
      ctx.scale(-1, 1)
      ctx.globalAlpha = 0.45 * intensity
      ctx.drawImage(src, 0, 0, w, h)
      ctx.restore()
      ctx.globalAlpha = 1
      ctx.drawImage(src, 0, 0, w, h)
    }
  },

  stretch(ctx, src, w, h, t, _dur, _p, intensity, variant) {
    const pulse = 1 + Math.sin(t * 2) * 0.08 * intensity
    ctx.save()
    ctx.translate(w / 2, h / 2)
    if (variant === 'v') ctx.scale(1, pulse * 1.1)
    else if (variant === 'h') ctx.scale(pulse * 1.1, 1)
    else ctx.scale(pulse, 1 / pulse)
    ctx.translate(-w / 2, -h / 2)
    ctx.drawImage(src, 0, 0, w, h)
    ctx.restore()
  },

  flash(ctx, src, w, h, t, _dur, _p, intensity) {
    ctx.drawImage(src, 0, 0, w, h)
    const flash = Math.max(0, Math.sin(t * 6) ** 8) * intensity
    if (flash > 0.02) {
      ctx.save()
      ctx.fillStyle = `rgba(255,255,255,${flash * 0.45})`
      ctx.fillRect(0, 0, w, h)
      ctx.restore()
    }
  },

  ghost(ctx, src, w, h, t, _dur, _p, intensity) {
    ctx.save()
    ctx.globalAlpha = 0.35 * intensity
    ctx.drawImage(src, Math.sin(t) * 8, 0, w, h)
    ctx.restore()
    ctx.drawImage(src, 0, 0, w, h)
  },

  stylize(ctx, src, w, h, t, _dur, _p, intensity, variant) {
    ctx.save()
    if (variant === 'pixel') {
      const ps = Math.max(4, Math.floor(16 - intensity * 10))
      const sw = Math.ceil(w / ps)
      const sh = Math.ceil(h / ps)
      const { canvas: tmp, ctx: tctx } = getBuffer(sw, sh)
      tctx.drawImage(src, 0, 0, sw, sh)
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(tmp, 0, 0, sw, sh, 0, 0, w, h)
      ctx.imageSmoothingEnabled = true
    } else if (variant === 'edge') {
      ctx.filter = `contrast(${1.2 + intensity * 0.5}) saturate(${1 + intensity * 0.4})`
      ctx.drawImage(src, 0, 0, w, h)
      ctx.filter = 'none'
      ctx.globalCompositeOperation = 'difference'
      ctx.drawImage(src, 1, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'
    } else {
      ctx.filter = `saturate(${1 + intensity * 0.8}) contrast(${1 + intensity * 0.3})`
      ctx.drawImage(src, 0, 0, w, h)
      ctx.filter = 'none'
    }
    ctx.restore()
  },

  lens(ctx, src, w, h, t, _dur, _p, intensity, variant) {
    const scale = variant === 'fisheye' ? 1.2 + Math.sin(t) * 0.05 : 1.1
    ctx.save()
    ctx.translate(w / 2, h / 2)
    ctx.rotate(Math.sin(t * 0.5) * 0.08 * intensity)
    ctx.scale(scale, scale * (variant === 'fisheye' ? 0.92 : 1))
    ctx.translate(-w / 2, -h / 2)
    ctx.drawImage(src, 0, 0, w, h)
    ctx.restore()
    overlayVignette(ctx, w, h, 0.4 + intensity * 0.4)
  },

  pulse(ctx, src, w, h, t, duration, progress, intensity, variant) {
    if (variant === 'freeze') {
      const frame = Math.floor(t * 8)
      const frozenT = frame / 8
      const scale = 1 + Math.sin(frozenT * TAU) * 0.02
      ctx.save()
      ctx.translate(w / 2, h / 2)
      ctx.scale(scale, scale)
      ctx.translate(-w / 2, -h / 2)
      ctx.drawImage(src, 0, 0, w, h)
      ctx.restore()
      return
    }
    const beat = 1 + Math.max(0, Math.sin(t * 4)) * 0.04 * intensity
    ctx.save()
    ctx.translate(w / 2, h / 2)
    ctx.scale(beat, beat)
    ctx.translate(-w / 2, -h / 2)
    ctx.drawImage(src, 0, 0, w, h)
    ctx.restore()
  },

  overlay(ctx, src, w, h, t, _dur, _p, intensity, variant) {
    ctx.drawImage(src, 0, 0, w, h)
    overlayGrain(ctx, w, h, intensity, t)
    if (variant === 'retro' || variant === 'grain') overlayScanlines(ctx, w, h, t, intensity)
    overlayVignette(ctx, w, h, intensity)
  },

  texture(ctx, src, w, h, t, _dur, _p, intensity) {
    ctx.drawImage(src, 0, 0, w, h)
    ctx.save()
    ctx.strokeStyle = `rgba(255,255,255,${0.08 * intensity})`
    ctx.lineWidth = 1
    for (let i = 0; i < 12; i++) {
      const x1 = ((i * 73 + t * 10) % 100) / 100 * w
      const y1 = ((i * 41) % 100) / 100 * h
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x1 + 40, y1 + 30)
      ctx.stroke()
    }
    ctx.restore()
  },
}

/**
 * Render background with effect into destCtx.
 * @param {CanvasRenderingContext2D} destCtx
 * @param {number} w
 * @param {number} h
 * @param {function(CanvasRenderingContext2D, number, number): void} drawBase - draws raw bg into ctx
 * @param {number} time
 * @param {number} duration
 * @param {object} fx - backgroundEffects config
 */
export function renderBackgroundWithEffects(destCtx, w, h, drawBase, time, duration, fx) {
  const meta = getBackgroundEffectById(fx?.effectId)
  if (!meta || meta.family === 'none') {
    drawBase(destCtx, w, h)
    return
  }

  const { canvas, ctx: bctx } = getBuffer(w, h)
  drawBase(bctx, w, h)

  const intensity = Math.max(0.15, Math.min(1, Number(fx.intensity) ?? 0.75))
  const speed = Math.max(0.1, Math.min(3, Number(fx.speed) ?? 1))
  const seed = effectSeed(meta.id || fx?.effectId)
  const timelineDur = Math.max(0.5, Number(duration) || 10)
  const cycleDur = resolveEffectCycleDuration(timelineDur, fx)
  const rawT = ((Number(time) || 0) * speed) + seed * 0.5
  const loopT = cycleDur > 0 ? rawT % cycleDur : rawT
  const progress = cycleDur > 0 ? loopT / cycleDur : 0
  const variant = resolveVariant(meta, seed)
  const intensityAdj = Math.min(1, intensity * (0.85 + seed * 0.35))

  destCtx.save()
  destCtx.setTransform(1, 0, 0, 1, 0, 0)
  const fn = FAMILIES[meta.family] || FAMILIES.glow
  fn(destCtx, canvas, w, h, loopT, cycleDur, progress, intensityAdj, variant, fx)
  destCtx.restore()
}
