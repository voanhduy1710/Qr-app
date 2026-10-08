import { useEffect, useRef } from 'react'
import { useCanvasAnimation } from '../hooks/useCanvasAnimation'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { traceHeart } from '../lib/heartPath'

export const HEART = '♥'

/**
 * Glowing dots that fly together to spell each word in turn, then scatter and
 * regroup into the next one. `HEART` is drawn as a true heart shape. The last
 * word stays on screen; `onDone` fires after it has been held.
 */
export default function ParticleText({ words, holdMs = 1500, color = '255, 120, 170', onDone, scale = 1 }) {
  const ref = useRef(null)
  const reduceMotion = usePrefersReducedMotion()
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useCanvasAnimation(
    ref,
    (ctx) => {
      let w = 0
      let h = 0
      let particles = []
      let index = -1
      let timer = 0.35
      let finished = false
      const sampler = document.createElement('canvas')
      const sctx = sampler.getContext('2d', { willReadFrequently: true })

      function sample(word) {
        const gap = Math.max(3, Math.round(Math.min(w, h) / 105))
        sampler.width = Math.ceil(w)
        sampler.height = Math.ceil(h)
        sctx.clearRect(0, 0, w, h)
        sctx.fillStyle = '#fff'
        if (word === HEART) {
          traceHeart(sctx, w / 2, h / 2, Math.min(w * 0.7, h * 0.42) * scale)
          sctx.fill()
        } else {
          // "WORDS ♥" draws the words followed by a true heart shape.
          const withHeart = word.endsWith(HEART)
          const text = withHeart ? word.slice(0, -HEART.length).trim() : word
          const font = (px) => `800 ${px}px 'Be Vietnam Pro', system-ui, sans-serif`
          let size = Math.min(h * 0.3, 260) * scale
          sctx.font = font(size)
          // Heart is ~0.9em wide with a 0.3em gap before it.
          const measure = () => sctx.measureText(text).width + (withHeart ? size * 1.2 : 0)
          const measured = measure()
          if (measured > w * 0.88) {
            size *= (w * 0.88) / measured
            sctx.font = font(size)
          }
          const total = measure()
          const left = (w - total) / 2
          sctx.textAlign = 'left'
          sctx.textBaseline = 'middle'
          sctx.fillText(text, left, h / 2)
          if (withHeart) {
            traceHeart(sctx, left + total - size * 0.45, h / 2, size * 0.9)
            sctx.fill()
          }
        }
        const { data } = sctx.getImageData(0, 0, sampler.width, sampler.height)
        const points = []
        for (let y = 0; y < sampler.height; y += gap) {
          for (let x = 0; x < sampler.width; x += gap) {
            if (data[(y * sampler.width + x) * 4 + 3] > 128) points.push([x, y])
          }
        }
        // Shuffle so particles cross the screen instead of sliding in rows.
        for (let i = points.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[points[i], points[j]] = [points[j], points[i]]
        }
        return points
      }

      function showWord(word) {
        const targets = sample(word)
        while (particles.length < targets.length) {
          const a = Math.random() * Math.PI * 2
          const r = Math.max(w, h) * (0.4 + Math.random() * 0.4)
          particles.push({ x: w / 2 + Math.cos(a) * r, y: h / 2 + Math.sin(a) * r, vx: 0, vy: 0, alpha: 0 })
        }
        particles.forEach((p, i) => {
          // A little burst between words makes the transition feel alive.
          p.vx += (Math.random() - 0.5) * 6
          p.vy += (Math.random() - 0.5) * 6
          if (i < targets.length) {
            ;[p.tx, p.ty] = targets[i]
            p.free = false
            if (reduceMotion) {
              // No flying: words simply appear.
              p.x = p.tx
              p.y = p.ty
              p.vx = 0
              p.vy = 0
              p.alpha = 1
            }
          } else {
            p.free = true
            if (reduceMotion) p.alpha = 0
          }
        })
      }

      return {
        resize(width, height) {
          w = width
          h = height
          if (index >= 0) showWord(words[index])
        },
        frame(dt) {
          timer -= dt
          if (timer <= 0 && !finished) {
            if (index < words.length - 1) {
              index += 1
              showWord(words[index])
              timer = (index === words.length - 1 ? holdMs * 1.8 : holdMs) / 1000
            } else {
              finished = true
              onDoneRef.current?.()
            }
          }

          ctx.clearRect(0, 0, w, h)
          ctx.globalCompositeOperation = 'lighter'
          const k = Math.min(1, dt * 60)
          const size = Math.max(1.6, Math.min(w, h) / 230)
          for (const p of particles) {
            if (p.free) {
              p.vx *= 0.96
              p.vy = p.vy * 0.96 + 0.05
              p.alpha = Math.max(0, p.alpha - dt * 1.5)
            } else {
              p.vx = (p.vx + (p.tx - p.x) * 0.012 * k) * 0.88
              p.vy = (p.vy + (p.ty - p.y) * 0.012 * k) * 0.88
              p.alpha = Math.min(1, p.alpha + dt * 2)
            }
            p.x += p.vx * k
            p.y += p.vy * k
            if (p.alpha <= 0.01) continue
            ctx.fillStyle = `rgba(${color}, ${p.alpha * 0.9})`
            ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size)
          }
          ctx.globalCompositeOperation = 'source-over'
        },
      }
    },
    [words.join('|'), holdMs, color, scale, reduceMotion],
  )

  return <canvas ref={ref} className="layer" role="img" aria-label={words.join(' ')} />
}
