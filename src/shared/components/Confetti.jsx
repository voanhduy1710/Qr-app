import { forwardRef, useImperativeHandle, useRef } from 'react'
import { useCanvasAnimation } from '../hooks/useCanvasAnimation'

const COLORS = ['#ff4d8d', '#f2c879', '#ffffff', '#ff8fab', '#ffd6e0', '#e11d48']

/** Canvas confetti. Call `ref.current.burst(x, y)` with viewport coordinates. */
const Confetti = forwardRef(function Confetti(_, ref) {
  const canvasRef = useRef(null)
  const pieces = useRef([])

  useImperativeHandle(ref, () => ({
    burst(x, y, count = 140) {
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1
        const speed = 280 + Math.random() * 520
        pieces.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          rot: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 14,
          w: 5 + Math.random() * 6,
          h: 3 + Math.random() * 4,
          color: COLORS[i % COLORS.length],
          life: 3 + Math.random() * 1.5,
        })
      }
    },
  }))

  useCanvasAnimation(
    canvasRef,
    (ctx) => {
      let w = 0
      let h = 0
      return {
        resize(width, height) {
          w = width
          h = height
        },
        frame(dt) {
          ctx.clearRect(0, 0, w, h)
          pieces.current = pieces.current.filter((p) => p.life > 0 && p.y < h + 40)
          for (const p of pieces.current) {
            p.life -= dt
            p.vy += 620 * dt
            p.vx *= 0.985
            p.vy *= 0.985
            p.x += p.vx * dt
            p.y += p.vy * dt
            p.rot += p.spin * dt
            ctx.save()
            ctx.globalAlpha = Math.min(1, p.life)
            ctx.translate(p.x, p.y)
            ctx.rotate(p.rot)
            ctx.scale(1, Math.cos(p.rot * 1.7))
            ctx.fillStyle = p.color
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
            ctx.restore()
          }
        },
      }
    },
    [],
  )

  return <canvas ref={canvasRef} className="layer confetti-layer" aria-hidden="true" />
})

export default Confetti
