import { useEffect, useRef, useState } from 'react'
import { playMelody } from '../../../shared/lib/audio'
import { Balloon } from './CakeDecor'

const COLORS = ['#f07a9a', '#f2c879', '#b99cf0', '#8fd0c4', '#ff9f7a']
const SPAWN_MS = 750
const MAX_LIVE = 9
const POP_NOTES = ['C6', 'D6', 'E6', 'G6', 'A6']

let nextId = 0
function makeBalloon(head = 0) {
  const rise = 6.5 + Math.random() * 3
  return {
    id: nextId++,
    x: 6 + Math.random() * 82,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 62 + Math.random() * 26,
    rise,
    sway: 2.4 + Math.random() * 1.6,
    // A head start (negative delay) so the first balloons are already on screen.
    delay: -head * rise,
  }
}

/**
 * Balloons keep floating up; each pop bursts into confetti and shows the next
 * message. Once every message has been shown, tapping the last card opens the letter.
 */
export default function BalloonScene({ content, className, onDone }) {
  const messages = content.balloonMessages.length ? content.balloonMessages : ['♥']
  const goal = messages.length
  const [balloons, setBalloons] = useState(() => [0.55, 0.35, 0.15].map(makeBalloon))
  const [bursts, setBursts] = useState([])
  const [popped, setPopped] = useState(0)
  const field = useRef(null)
  const done = popped >= goal

  useEffect(() => {
    if (done) return undefined
    const t = setInterval(() => setBalloons((list) => (list.length >= MAX_LIVE ? list : [...list, makeBalloon()])), SPAWN_MS)
    return () => clearInterval(t)
  }, [done])

  function pop(e, b) {
    e.preventDefault()
    const box = field.current.getBoundingClientRect()
    const r = e.currentTarget.getBoundingClientRect()
    const burst = { id: b.id, color: b.color, x: r.left + r.width / 2 - box.left, y: r.top + r.width * 0.45 - box.top }
    setBalloons((list) => list.filter((x) => x.id !== b.id))
    setBursts((list) => [...list, burst])
    setTimeout(() => setBursts((list) => list.filter((x) => x.id !== b.id)), 900)
    if (!done) setPopped((n) => n + 1)
    playMelody([[POP_NOTES[popped % POP_NOTES.length], 0.5]], { bpm: 200, volume: 0.16 })
  }

  const message = popped ? messages[Math.min(popped, goal) - 1] : null

  return (
    <div className={`${className} balloon-scene`}>
      <div ref={field} className="balloon-field">
        {balloons.map((b) => (
          <button
            key={b.id}
            type="button"
            className="balloon-float"
            style={{
              left: `${b.x}%`,
              width: `${b.size}px`,
              '--rise': `${b.rise}s`,
              '--sway': `${b.sway}s`,
              animationDelay: `${b.delay}s`,
            }}
            onPointerDown={(e) => pop(e, b)}
            onAnimationEnd={(e) => e.animationName === 'balloon-rise' && setBalloons((list) => list.filter((x) => x.id !== b.id))}
            aria-label="Nổ bóng"
          >
            <Balloon color={b.color} className="balloon-art" />
          </button>
        ))}
        {bursts.map((p) => (
          <span key={p.id} className="balloon-burst" style={{ left: p.x, top: p.y, '--c': p.color }} aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <i key={i} style={{ '--a': `${i * 30 + (p.id % 7) * 5}deg`, '--d': `${46 + (i % 3) * 18}px` }} />
            ))}
          </span>
        ))}
      </div>

      <header className="balloon-head">
        <p className="eyebrow">{content.balloonEyebrow}</p>
        <h1 className="wish-title">{content.balloonTitle}</h1>
      </header>

      {message && (
        <div
          key={popped}
          className={`balloon-card${done ? ' is-next' : ''}`}
          role={done ? 'button' : 'status'}
          tabIndex={done ? 0 : undefined}
          onClick={done ? onDone : undefined}
          onKeyDown={(e) => {
            if (done && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              onDone()
            }
          }}
        >
          <p>{message}</p>
          <span className="balloon-count">
            {Math.min(popped, goal)} / {goal}
          </span>
        </div>
      )}

      <footer className="balloon-foot">
        {done ? (
          <p className="hint">{content.balloonDone}</p>
        ) : (
          <p className="hint">
            <span aria-hidden="true">👆</span> {content.balloonLeft.replace('{count}', goal - popped)}
          </p>
        )}
      </footer>
    </div>
  )
}
