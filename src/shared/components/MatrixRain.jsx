import { useRef } from 'react'
import { useCanvasAnimation } from '../hooks/useCanvasAnimation'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/** Falling-letter rain, as in the dlove reference intro. */
export default function MatrixRain({ chars = 'HAPPYBIRTHDAY', color = '255, 77, 141', fontSize = 16 }) {
  const ref = useRef(null)
  const reduceMotion = usePrefersReducedMotion()
  const fps = reduceMotion ? 4 : 24

  useCanvasAnimation(
    ref,
    (ctx) => {
      let w = 0
      let h = 0
      let drops = []
      let acc = 0
      const pick = () => chars[Math.floor(Math.random() * chars.length)]

      return {
        resize(width, height) {
          w = width
          h = height
          const cols = Math.ceil(w / fontSize)
          drops = Array.from({ length: cols }, () => ({
            y: Math.random() * -h,
            speed: 0.6 + Math.random() * 0.8,
          }))
          ctx.fillStyle = '#000'
          ctx.fillRect(0, 0, w, h)
        },
        frame(dt) {
          acc += dt
          if (acc < 1 / fps) return
          acc = 0
          ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'
          ctx.fillRect(0, 0, w, h)
          ctx.font = `700 ${fontSize}px 'Be Vietnam Pro', monospace`
          ctx.textAlign = 'center'
          drops.forEach((d, i) => {
            const x = i * fontSize + fontSize / 2
            ctx.fillStyle = `rgba(${color}, ${0.35 + Math.random() * 0.45})`
            ctx.fillText(pick(), x, d.y)
            ctx.fillStyle = 'rgba(255, 225, 238, 0.95)'
            ctx.fillText(pick(), x, d.y + fontSize)
            d.y += fontSize * d.speed
            if (d.y > h + fontSize * 2 && Math.random() > 0.96) d.y = -fontSize * 2
          })
        },
      }
    },
    [chars, color, fontSize, fps],
  )

  return <canvas ref={ref} className="layer" aria-hidden="true" />
}
