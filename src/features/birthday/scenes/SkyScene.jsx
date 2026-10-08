import { useRef, useState } from 'react'
import { mulberry32 } from '../../../shared/lib/rng'

const STAR_PATH = 'M24 2c1.6 11.6 10.4 20.4 22 22-11.6 1.6-20.4 10.4-22 22-1.6-11.6-10.4-20.4-22-22C13.6 22.4 22.4 13.6 24 2z'

// Stars like the wish that light up once it lands: seeded so they never jump
// between renders. Big ones stay out of the middle where the text sits.
const SISTERS = (() => {
  const rand = mulberry32(20261008)
  const out = []
  while (out.length < 56) {
    const x = 3 + rand() * 94
    const y = 3 + rand() * 94
    const s = 0.18 + rand() ** 2 * 0.55
    const inText = x > 12 && x < 88 && y > 22 && y < 84
    if (inText && s > 0.3) continue
    out.push([x, y, s, rand() * 2.4])
  }
  return out
})()

const FLIGHT_MS = 2400

export default function SkyScene({ content, className, onSend, onReplay }) {
  // idle -> flying -> landed
  const [phase, setPhase] = useState('idle')
  const [flight, setFlight] = useState({ x: 0, y: 0 })
  const starRef = useRef(null)

  function send() {
    if (phase !== 'idle') return
    // A knight's move: up a lot, across a little, along a curve, ending top-right.
    const r = starRef.current.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    setFlight({ x: window.innerWidth * 0.74 - cx, y: Math.min(0, window.innerHeight * 0.13 - cy) })
    setPhase('flying')
    onSend?.()
    setTimeout(() => setPhase('landed'), FLIGHT_MS)
  }

  const sent = phase !== 'idle'

  return (
    <div className={`${className} sky-scene is-${phase}`}>
      <svg className="sky-moon" viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <mask id="sky-moon-cut">
            <rect width="64" height="64" fill="#fff" />
            <circle cx="42" cy="24" r="22" fill="#000" />
          </mask>
        </defs>
        <circle cx="32" cy="32" r="26" mask="url(#sky-moon-cut)" />
      </svg>

      <div className="sky-sisters" aria-hidden="true">
        {SISTERS.map(([x, y, s, d], i) => (
          <svg
            key={i}
            viewBox="0 0 48 48"
            style={{ left: `${x}%`, top: `${y}%`, '--s': s, '--d': `${d.toFixed(2)}s`, '--tw': `${(2 + (i % 5) * 0.45).toFixed(2)}s` }}
          >
            <path d={STAR_PATH} />
          </svg>
        ))}
      </div>

      <p className="eyebrow">Gửi lên trời</p>
      <h1 className="script-title sky-title">{content.skyTitle}</h1>

      <button
        ref={starRef}
        type="button"
        className="sky-star"
        style={{ '--fx': `${flight.x}px`, '--fy': `${flight.y}px`, '--flight': `${FLIGHT_MS}ms` }}
        onClick={send}
        aria-label="Gửi điều ước"
        disabled={sent}
      >
        {/* x and y ride different easings, so the path bends into an arc. */}
        <span className="sky-star-x">
          <span className="sky-star-y">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path d={STAR_PATH} />
            </svg>
          </span>
        </span>
      </button>

      <p className="sky-wish">{content.skyWish}</p>
      <p className="lead sky-lead" aria-live="polite">
        {sent ? content.skyDone : content.skyHint}
      </p>

      <div className="sky-actions">
        {phase === 'landed' && (
          <button type="button" className="btn" onClick={onReplay}>
            Xem lại từ đầu
          </button>
        )}
      </div>
    </div>
  )
}
