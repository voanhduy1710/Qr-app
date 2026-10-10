import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Fireworks from '../../../shared/components/Fireworks'
import { SHAPES } from '../../../shared/lib/fireworkShapes'
import { mulberry32 } from '../../../shared/lib/rng'

const STAR_PATH =
  'M24 2c1.6 11.6 10.4 20.4 22 22-11.6 1.6-20.4 10.4-22 22-1.6-11.6-10.4-20.4-22-22C13.6 22.4 22.4 13.6 24 2z'

// Stars like the wish that light up once it lands: seeded so they never jump
// between renders. All about the same size and only in the upper sky. These are
// candidates on a jittered grid; `pickSisters` keeps an evenly spaced subset
// that fits the screen and stays off the text.
const SISTERS = (() => {
  const rand = mulberry32(20261008)
  const COLS = 18
  const ROWS = 7
  const out = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = 2 + ((c + 0.15 + rand() * 0.7) / COLS) * 96
      const y = 2 + ((r + 0.15 + rand() * 0.7) / ROWS) * 52
      out.push([x, y, 0.48 + rand() * 0.16, rand() * 2.4, rand()])
    }
  }
  // Seeded order, so the greedy pick below spreads out instead of filling row by row.
  return out.sort((a, b) => a[4] - b[4])
})()

// Closest two stars may sit, in px.
const SISTER_SPACING = 72
// Clear space kept around the text and the moon, in px.
const TEXT_MARGIN = 14

function pickSisters(box, blocked, landing) {
  const kept = [landing]
  const out = []
  SISTERS.forEach(([x, y, s], i) => {
    const px = (x / 100) * box.width
    const py = (y / 100) * box.height
    const half = 27 * s + TEXT_MARGIN
    const hitsText = blocked.some(
      (r) => px + half > r.left && px - half < r.right && py + half > r.top && py - half < r.bottom,
    )
    if (hitsText || kept.some(([kx, ky]) => Math.hypot(kx - px, ky - py) < SISTER_SPACING)) return
    kept.push([px, py])
    out.push(i)
  })
  return out
}

const FLIGHT_MS = 2400
// How long the landed wish is left alone before the two endings are offered.
const CHOICE_DELAY_MS = 5000
const SHAPE_EVERY_MS = 2300

const ENDINGS = ['sleep', 'fireworks']

// Twinkles on the family's outline, as % of the picture (x, y, size, delay).
const TWINKLES = [
  [45, 6.5, 15, 0],
  [33.5, 18.5, 12, 0.9],
  [61.5, 18.5, 13, 1.7],
  [67.5, 42, 10, 0.5],
  [73, 70, 12, 2.2],
  [38, 49, 9, 1.3],
  [62, 93, 10, 2.8],
]

export default function SkyScene({ content, className, onSend, onReplay, previewEnding }) {
  // idle -> flying -> landed
  const [phase, setPhase] = useState('idle')
  const [flight, setFlight] = useState({ x: 0, y: 0 })
  const starRef = useRef(null)
  const sceneRef = useRef(null)
  const moonRef = useRef(null)
  const eyebrowRef = useRef(null)
  const titleRef = useRef(null)
  const wishRef = useRef(null)
  const [sisters, setSisters] = useState([])
  const [choicesReady, setChoicesReady] = useState(false)
  const [ending, setEnding] = useState(() => (ENDINGS.includes(previewEnding) ? previewEnding : null)) // null | 'sleep' | 'fireworks'
  const fireworks = useRef(null)

  useEffect(() => {
    if (phase !== 'landed') return undefined
    const t = setTimeout(() => setChoicesReady(true), CHOICE_DELAY_MS)
    return () => clearTimeout(t)
  }, [phase])

  // Fireworks night: one shaped burst after another, every shape once per
  // shuffled round, with a plain burst now and then in between.
  useEffect(() => {
    if (ending !== 'fireworks') return undefined
    let order = []
    let next = 0
    let side = 0
    const fire = () => {
      const fw = fireworks.current
      const el = sceneRef.current
      if (!fw || !el) return
      if (next >= order.length) {
        order = [...SHAPES].sort(() => Math.random() - 0.5)
        next = 0
      }
      const { width: w, height: h } = el.getBoundingClientRect()
      const half = Math.max(56, Math.min(130, Math.min(w, h) * 0.17))
      // Alternate left and right halves so a new shape never lands on the last one.
      side = 1 - side
      const x = w * (side ? 0.62 + Math.random() * 0.12 : 0.26 + Math.random() * 0.12)
      fw.launchShape(order[next++], x, h * (0.2 + Math.random() * 0.2), half)
    }
    const first = setTimeout(fire, 600)
    const shapes = setInterval(fire, SHAPE_EVERY_MS)
    const plain = setInterval(() => fireworks.current?.show(1), 7000)
    return () => {
      clearTimeout(first)
      clearInterval(shapes)
      clearInterval(plain)
    }
  }, [ending])

  useLayoutEffect(() => {
    const scene = sceneRef.current
    const measure = () => {
      const box = scene.getBoundingClientRect()
      const local = (el) => {
        const r = el.getBoundingClientRect()
        return {
          left: r.left - box.left,
          right: r.right - box.left,
          top: r.top - box.top,
          bottom: r.bottom - box.top,
        }
      }
      const blocked = [moonRef, eyebrowRef, titleRef, wishRef]
        .map((ref) => ref.current)
        .filter(Boolean)
        .map(local)
      // Where the wish lands (see send), so no sister crowds it.
      const landing = [window.innerWidth * 0.74 - box.left, window.innerHeight * 0.13 - box.top]
      setSisters(pickSisters(box, blocked, landing))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(scene)
    return () => ro.disconnect()
    // Measured again once the wish lands, when the entrance animations are long over.
  }, [content.skyTitle, phase === 'landed'])

  function send() {
    if (phase !== 'idle') return
    // A knight's move: up a lot, across a little, along a curve, ending top-right.
    const r = starRef.current.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    setFlight({
      x: window.innerWidth * 0.74 - cx,
      y: Math.min(0, window.innerHeight * 0.13 - cy),
    })
    setPhase('flying')
    onSend?.()
    setTimeout(() => setPhase('landed'), FLIGHT_MS)
  }

  // Opened on an ending from the admin preview: send the wish straight away.
  useEffect(() => {
    if (previewEnding && ending) send()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sent = phase !== 'idle'

  return (
    <div ref={sceneRef} className={`${className} sky-scene is-${phase}${ending ? ` is-ending-${ending}` : ''}`}>
      {ending === 'fireworks' && <Fireworks ref={fireworks} className="sky-fireworks" />}
      <svg ref={moonRef} className="sky-moon" viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <mask id="sky-moon-cut">
            <rect width="64" height="64" fill="#fff" />
            <circle cx="42" cy="24" r="22" fill="#000" />
          </mask>
        </defs>
        <circle cx="32" cy="32" r="26" mask="url(#sky-moon-cut)" />
      </svg>

      <div className="sky-sisters" aria-hidden="true">
        {sisters.map((i) => {
          const [x, y, s, d] = SISTERS[i]
          return (
            <svg
              key={i}
              viewBox="0 0 48 48"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                '--s': s,
                '--d': `${d.toFixed(2)}s`,
                '--tw': `${(2 + (i % 5) * 0.45).toFixed(2)}s`,
              }}
            >
              <path d={STAR_PATH} />
            </svg>
          )
        })}
      </div>

      <p ref={eyebrowRef} className="eyebrow">
        Gửi lên trời
      </p>
      <h1 ref={titleRef} className="script-title sky-title">
        {content.skyTitle}
      </h1>

      <button
        ref={starRef}
        type="button"
        className="sky-star"
        style={{
          '--fx': `${flight.x}px`,
          '--fy': `${flight.y}px`,
          '--flight': `${FLIGHT_MS}ms`,
        }}
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

      <p ref={wishRef} className="sky-wish">{content.skyWish}</p>
      <p className="lead sky-lead" aria-live="polite">
        {sent ? content.skyDone : content.skyHint}
      </p>

      <div className="sky-actions">
        {phase === 'landed' && choicesReady && !ending && (
          <div className="sky-choices">
            <button type="button" className="btn" onClick={() => setEnding('sleep')}>
              {content.skyChoiceSleep}
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setEnding('fireworks')}>
              {content.skyChoiceFireworks}
            </button>
          </div>
        )}
        {ending === 'fireworks' && (
          <div className="sky-choices">
            <button type="button" className="btn btn-primary sky-replay" onClick={() => setEnding('sleep')}>
              {content.fireworksToSleep}
            </button>
            <button type="button" className="btn sky-replay" onClick={onReplay}>
              Xem lại từ đầu
            </button>
          </div>
        )}
      </div>

      {ending === 'fireworks' && (
        <>
          <div className="sky-ground" aria-hidden="true" />
          <div className="sky-family">
            <img src={content.fireworksImage} alt="" draggable="false" />
            {TWINKLES.map(([x, y, size, delay], i) => (
              <i key={i} style={{ left: `${x}%`, top: `${y}%`, '--size': `${size}px`, '--delay': `${delay}s` }} />
            ))}
          </div>
        </>
      )}

      {ending === 'sleep' && (
        <div className="sky-sleep">
          <div className="sky-sleep-card">
            <img src={content.sleepImage} alt={content.sleepCaption} draggable="false" />
            <p className="script-title sky-sleep-caption">{content.sleepCaption}</p>
            <div className="sky-choices">
              <button type="button" className="btn btn-primary" onClick={() => setEnding('fireworks')}>
                {content.sleepToFireworks}
              </button>
              <button type="button" className="btn" onClick={onReplay}>
                Xem lại từ đầu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
