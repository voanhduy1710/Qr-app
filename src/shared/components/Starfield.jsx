import { useRef } from 'react'
import { useCanvasAnimation } from '../hooks/useCanvasAnimation'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/**
 * Twinkling stars with the occasional shooting star. `shine` brightens and
 * enlarges every star (eased in), e.g. when a wish joins the sky.
 */
export default function Starfield({ density = 1, shooting = true, tint = '255, 240, 245', shine = false }) {
  const ref = useRef(null)
  const shineRef = useRef(shine)
  shineRef.current = shine
  const reduceMotion = usePrefersReducedMotion()
  const drifting = !reduceMotion
  const meteorsOn = shooting && !reduceMotion

  useCanvasAnimation(
    ref,
    (ctx) => {
      let w = 0
      let h = 0
      let stars = []
      let meteors = []
      let nextMeteor = 2
      let glow = shineRef.current ? 1 : 0

      return {
        resize(width, height) {
          w = width
          h = height
          const count = Math.round(((w * h) / 4200) * density)
          stars = Array.from({ length: count }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.1 + 0.25,
            phase: Math.random() * Math.PI * 2,
            speed: 0.6 + Math.random() * 1.8,
            drift: 2 + Math.random() * 5,
          }))
        },
        frame(dt, t) {
          ctx.clearRect(0, 0, w, h)
          glow += ((shineRef.current ? 1 : 0) - glow) * Math.min(1, dt * 1.2)
          for (const s of stars) {
            if (drifting) s.y -= s.drift * dt
            if (s.y < -2) s.y = h + 2
            const tw = 0.5 + 0.5 * Math.sin(t * s.speed * (1 + glow) + s.phase)
            const a = Math.min(1, 0.25 + 0.75 * tw + glow * 0.35)
            const r = s.r * (1 + glow * 0.9)
            if (glow > 0.05 && s.r > 0.8) {
              ctx.fillStyle = `rgba(255, 226, 160, ${(glow * a * 0.22).toFixed(3)})`
              ctx.beginPath()
              ctx.arc(s.x, s.y, r * 4, 0, Math.PI * 2)
              ctx.fill()
            }
            ctx.fillStyle = `rgba(${tint}, ${a.toFixed(3)})`
            ctx.beginPath()
            ctx.arc(s.x, s.y, r, 0, Math.PI * 2)
            ctx.fill()
          }

          if (meteorsOn) {
            nextMeteor -= dt
            if (nextMeteor <= 0) {
              nextMeteor = 3 + Math.random() * 5
              meteors.push({ x: Math.random() * w * 0.8 + w * 0.2, y: Math.random() * h * 0.4, life: 1 })
            }
          }
          meteors = meteors.filter((m) => m.life > 0)
          for (const m of meteors) {
            m.life -= dt * 1.1
            m.x -= 520 * dt
            m.y += 260 * dt
            const grad = ctx.createLinearGradient(m.x, m.y, m.x + 120, m.y - 60)
            grad.addColorStop(0, `rgba(255,255,255,${Math.max(0, m.life)})`)
            grad.addColorStop(1, 'rgba(255,255,255,0)')
            ctx.strokeStyle = grad
            ctx.lineWidth = 1.4
            ctx.beginPath()
            ctx.moveTo(m.x, m.y)
            ctx.lineTo(m.x + 120, m.y - 60)
            ctx.stroke()
          }
        },
      }
    },
    [density, meteorsOn, drifting, tint],
  )

  return <canvas ref={ref} className="layer" aria-hidden="true" />
}
