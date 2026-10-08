import { forwardRef, useImperativeHandle, useRef } from 'react'
import { useCanvasAnimation } from '../hooks/useCanvasAnimation'

const PALETTES = [
  ['#ff4d8d', '#ff8fab', '#ffd6e0'],
  ['#f2c879', '#ffe7a8', '#ffffff'],
  ['#8ec5ff', '#c9e4ff', '#ffffff'],
  ['#b28dff', '#e0d1ff', '#ffd6e0'],
  ['#7ef0c0', '#d3fff0', '#ffffff'],
]
const GRAVITY = 140

/**
 * Canvas fireworks. `ref.current.launch(x, y)` fires one rocket that bursts at
 * (x, y) in viewport coordinates; `ref.current.show(count)` fires a volley.
 */
const Fireworks = forwardRef(function Fireworks(_, ref) {
  const canvasRef = useRef(null)
  const rockets = useRef([])
  const sparks = useRef([])
  const size = useRef({ w: 0, h: 0 })

  function launch(x, y, delay = 0) {
    const { h } = size.current
    rockets.current.push({
      x: x + (Math.random() - 0.5) * 60,
      y: h + 10,
      tx: x,
      ty: y,
      delay,
      palette: PALETTES[Math.floor(Math.random() * PALETTES.length)],
      trail: [],
    })
  }

  useImperativeHandle(ref, () => ({
    launch,
    show(count = 6) {
      const { w, h } = size.current
      for (let i = 0; i < count; i++) {
        launch(w * (0.15 + Math.random() * 0.7), h * (0.12 + Math.random() * 0.3), i * 0.35 + Math.random() * 0.2)
      }
    },
  }))

  function explode(r) {
    const count = 70 + Math.floor(Math.random() * 40)
    const power = 160 + Math.random() * 90
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + Math.random() * 0.1
      const v = power * (0.55 + Math.random() * 0.45)
      sparks.current.push({
        x: r.tx,
        y: r.ty,
        px: r.tx,
        py: r.ty,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life: 1.2 + Math.random() * 0.8,
        max: 2,
        color: r.palette[i % r.palette.length],
      })
    }
  }

  useCanvasAnimation(
    canvasRef,
    (ctx) => ({
      resize(width, height) {
        size.current = { w: width, h: height }
      },
      frame(dt) {
        const { w, h } = size.current
        ctx.clearRect(0, 0, w, h)
        ctx.globalCompositeOperation = 'lighter'
        ctx.lineCap = 'round'

        rockets.current = rockets.current.filter((r) => {
          if (r.delay > 0) {
            r.delay -= dt
            return true
          }
          // Ease toward the burst point; slows near the top like a real shell.
          const dy = r.ty - r.y
          r.y += dy * Math.min(1, dt * 3.2) - 220 * dt
          r.x += (r.tx - r.x) * Math.min(1, dt * 3)
          r.trail.push([r.x, r.y])
          if (r.trail.length > 10) r.trail.shift()
          ctx.strokeStyle = 'rgba(255, 230, 190, 0.9)'
          ctx.lineWidth = 2
          ctx.beginPath()
          r.trail.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
          ctx.stroke()
          if (r.y <= r.ty + 4) {
            explode(r)
            return false
          }
          return true
        })

        sparks.current = sparks.current.filter((s) => s.life > 0)
        for (const s of sparks.current) {
          s.px = s.x
          s.py = s.y
          s.life -= dt
          s.vx *= 0.975
          s.vy = s.vy * 0.975 + GRAVITY * dt
          s.x += s.vx * dt
          s.y += s.vy * dt
          const a = Math.min(1, s.life / 0.8)
          ctx.globalAlpha = a * (0.75 + Math.random() * 0.25)
          ctx.strokeStyle = s.color
          ctx.lineWidth = 2.2
          ctx.beginPath()
          ctx.moveTo(s.px - (s.x - s.px) * 2, s.py - (s.y - s.py) * 2)
          ctx.lineTo(s.x, s.y)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'
      },
    }),
    [],
  )

  return <canvas ref={canvasRef} className="layer confetti-layer" aria-hidden="true" />
})

export default Fireworks
