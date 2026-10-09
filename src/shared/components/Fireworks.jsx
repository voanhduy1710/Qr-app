import { forwardRef, useImperativeHandle, useRef } from 'react'
import { useCanvasAnimation } from '../hooks/useCanvasAnimation'
import { shapePoints } from '../lib/fireworkShapes'

const PALETTES = [
  ['#ff4d8d', '#ff8fab', '#ffd6e0'],
  ['#f2c879', '#ffe7a8', '#ffffff'],
  ['#8ec5ff', '#c9e4ff', '#ffffff'],
  ['#b28dff', '#e0d1ff', '#ffd6e0'],
  ['#7ef0c0', '#d3fff0', '#ffffff'],
]
const GRAVITY = 90
// Per-frame slow-down at 60 fps; applied by elapsed time so every frame rate matches.
const DRAG = 0.975
// A spark launched at `offset * REACH` per second comes to rest `offset` away (60 fps, DRAG).
const REACH = 60 * (1 - DRAG)

// Direction (about unit length) of the heart outline at angle t, y pointing down,
// centred so the burst point sits in the middle of the heart.
function heartDir(t) {
  const x = 16 * Math.sin(t) ** 3
  const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) - 2.5
  return [x / 16, y / 16]
}

/**
 * Canvas fireworks. `ref.current.launch(x, y)` fires one rocket that bursts at
 * (x, y) in viewport coordinates; `ref.current.show(count)` fires a volley;
 * `ref.current.launchShape(name, x, y, size)` bursts into a shape (see fireworkShapes).
 */
const Fireworks = forwardRef(function Fireworks({ className = 'confetti-layer' }, ref) {
  const canvasRef = useRef(null)
  const rockets = useRef([])
  const sparks = useRef([])
  const size = useRef({ w: 0, h: 0 })

  function launch(x, y, delay = 0, shape = null) {
    const { h } = size.current
    rockets.current.push({
      x: x + (Math.random() - 0.5) * 60,
      y: h + 10,
      tx: x,
      ty: y,
      delay,
      palette: PALETTES[Math.floor(Math.random() * PALETTES.length)],
      trail: [],
      shape,
    })
  }

  useImperativeHandle(ref, () => ({
    launch,
    launchShape(name, x, y, half) {
      launch(x, y, 0, { name, half })
    },
    show(count = 6) {
      const { w, h } = size.current
      for (let i = 0; i < count; i++) {
        launch(w * (0.15 + Math.random() * 0.7), h * (0.12 + Math.random() * 0.3), i * 0.35 + Math.random() * 0.2)
      }
    },
  }))

  // Every burst opens into a heart: sparks leave along the heart outline, so as
  // they fly out together they draw it. Drag and gravity act the same on every
  // spark, so the heart keeps its shape while it grows and sinks.
  function explode(r) {
    if (r.shape) return explodeShape(r)
    const count = 90 + Math.floor(Math.random() * 30)
    const power = 150 + Math.random() * 80
    const tilt = (Math.random() - 0.5) * 0.5
    const spark = (vx, vy, i, life) =>
      sparks.current.push({ x: r.tx, y: r.ty, px: r.tx, py: r.ty, vx, vy, life, color: r.palette[i % r.palette.length] })
    for (let i = 0; i < count; i++) {
      const [hx, hy] = heartDir((i / count) * Math.PI * 2)
      const v = power * (0.97 + Math.random() * 0.06)
      const x = hx * Math.cos(tilt) - hy * Math.sin(tilt)
      const y = hx * Math.sin(tilt) + hy * Math.cos(tilt)
      spark(x * v, y * v, i, 1.5 + Math.random() * 0.3)
      // A smaller heart inside for depth.
      if (i % 3 === 0) spark(x * v * 0.55, y * v * 0.55, i + 1, 1.3 + Math.random() * 0.3)
    }
  }

  // Each spark flies to one point of the shape's outline and settles there, so
  // the burst draws the shape; it sinks gently and lingers so it can be read.
  function explodeShape(r) {
    const { name, half } = r.shape
    const [main, soft] = r.palette
    shapePoints(name).forEach(([px, py], i) => {
      const jitter = 0.96 + Math.random() * 0.08
      sparks.current.push({
        x: r.tx,
        y: r.ty,
        px: r.tx,
        py: r.ty,
        vx: px * half * REACH * jitter,
        vy: py * half * REACH * jitter,
        life: 2.3 + Math.random() * 0.4,
        color: i % 5 === 0 ? soft : main,
        gravity: 18,
        width: 2.8,
      })
    })
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
          const drag = DRAG ** (dt * 60)
          s.vx *= drag
          s.vy = s.vy * drag + (s.gravity ?? GRAVITY) * dt
          s.x += s.vx * dt
          s.y += s.vy * dt
          const a = Math.min(1, s.life / 0.8)
          ctx.globalAlpha = a * (0.75 + Math.random() * 0.25)
          ctx.strokeStyle = s.color
          ctx.lineWidth = s.width ?? 2.2
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

  return <canvas ref={canvasRef} className={`layer ${className}`} aria-hidden="true" />
})

export default Fireworks
