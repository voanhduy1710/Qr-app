import { useEffect, useRef, useState } from 'react'
import Cake from './Cake'
import CakeDecor from './CakeDecor'

const HOLD_MS = 1600

// Load the stickers while the candle is still lit, so they pop in instantly.
const STICKER_URLS = ['kissy_face', 'bugcat-capoo', 'hatch', 'napoli_chatgpt', 'mentori', 'Sinister']

export default function CakeScene({ content, className, onBlown, onNext, fireworksRef }) {
  const [progress, setProgress] = useState(0)
  const [blown, setBlown] = useState(false)
  const holding = useRef(false)
  const flameRef = useRef(null)

  useEffect(() => {
    STICKER_URLS.forEach((name) => {
      new Image().src = `/gifs/${name}.gif`
    })
  }, [])

  // Holding fills the ring; letting go slowly drains it, like a candle recovering.
  useEffect(() => {
    if (blown) return undefined
    let raf = 0
    let last = performance.now()
    let p = 0
    const tick = (now) => {
      const dt = now - last
      last = now
      const next = holding.current ? p + dt / HOLD_MS : p - (dt / HOLD_MS) * 0.8
      p = Math.min(1, Math.max(0, next))
      setProgress(p)
      if (p >= 1) {
        holding.current = false
        fireworksRef.current?.show(8)
        setBlown(true)
        onBlown?.()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [blown, fireworksRef, onBlown])

  const start = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId)
    holding.current = true
  }
  const stop = () => {
    holding.current = false
  }
  const onKey = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      holding.current = e.type === 'keydown'
    }
  }

  const ring = 2 * Math.PI * 30

  return (
    <div className={`${className} cake-scene${blown ? ' is-blown' : ''}`}>
      <div className="cake-copy">
        {blown ? (
          <>
            <h1 className="script-title cake-hb">
              <span className="cake-hb-line">{content.cakeHbLine1}</span>
              <span className="cake-hb-line">{content.cakeHbLine2}</span>
            </h1>
            <p className="lead">{content.cakeBlowLead}</p>
          </>
        ) : (
          <>
            <h1 className="cake-title">{content.cakeTitle}</h1>
            <p className="lead">{content.cakeLead}</p>
          </>
        )}
      </div>

      <div
        className="cake-wrap"
        // Once the candle is out, the cake itself opens the gift.
        {...(blown && {
          role: 'button',
          tabIndex: 0,
          'aria-label': content.cakeOpenHint,
          onClick: onNext,
          onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onNext()
            }
          },
        })}
      >
        <CakeDecor blown={blown} />
        <Cake ref={flameRef} lit={!blown} flameScale={1 - progress * 0.55} />
        {!blown && (
          <button
            type="button"
            className="cake-hold"
            onPointerDown={start}
            onPointerUp={stop}
            onPointerCancel={stop}
            onKeyDown={onKey}
            onKeyUp={onKey}
            onContextMenu={(e) => e.preventDefault()}
            aria-label="Nhấn và giữ để thổi nến"
          >
            <svg viewBox="0 0 72 72" aria-hidden="true">
              <circle cx="36" cy="36" r="30" className="cake-ring-track" />
              <circle
                cx="36"
                cy="36"
                r="30"
                className="cake-ring"
                strokeDasharray={ring}
                strokeDashoffset={ring * (1 - progress)}
              />
            </svg>
          </button>
        )}
        {blown && (
          <div className="cake-smoke" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>

      <div className="cake-footer">
        {blown ? (
          <p className="hint cake-hint cake-next">
            <span aria-hidden="true">👆</span> {content.cakeOpenHint}
          </p>
        ) : (
          <p className="hint cake-hint">
            <span aria-hidden="true">👆</span> Nhấn &amp; giữ ngọn nến cho đến khi tắt
          </p>
        )}
      </div>
    </div>
  )
}
