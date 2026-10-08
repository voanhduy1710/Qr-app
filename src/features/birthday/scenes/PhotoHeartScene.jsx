import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { heartSlots } from '../../../shared/lib/heartPath'
import { usePrefersReducedMotion } from '../../../shared/hooks/usePrefersReducedMotion'

const ZOOM_IN_MS = 700
const HOLD_MS = 800
const ZOOM_OUT_MS = 850
const EASE_IN = 'cubic-bezier(0.22, 1, 0.36, 1)'
const EASE_MOVE = 'cubic-bezier(0.65, 0, 0.35, 1)'

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

// Waits for the image to be decoded so the zoom never starts on a blank card.
const ready = (img) => (img?.decode ? img.decode().catch(() => {}) : Promise.resolve())

/**
 * One photo at a time: it zooms in to the centre, holds, then zooms out to its
 * slot on a wide heart outline; then the next one starts. Only transform and
 * opacity animate, so it stays on the compositor and stays smooth.
 */
export default function PhotoHeartScene({ photos, content, className, onNext }) {
  const reduceMotion = usePrefersReducedMotion()
  const [placed, setPlaced] = useState(reduceMotion ? photos.length : 0)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const boxRef = useRef(null)
  const cards = useRef([])
  const skip = useRef(false)
  const done = placed >= photos.length

  useLayoutEffect(() => {
    const el = boxRef.current
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Slot size shrinks as photos are added so up to 18 still sit side by side on the outline.
  const layout = useMemo(() => {
    const { w, h } = box
    const cardW = w * Math.min(0.2, 0.12 * Math.sqrt(18 / Math.max(1, photos.length)))
    const cardH = cardW * 1.25
    const bigW = Math.min(w * 0.7, h * 0.62)
    const spanW = w - cardW
    const spanH = h - cardH
    return {
      bigW,
      k: bigW ? cardW / bigW : 0.2,
      // One card sits dead centre in the dip and (for an even count) one on the tip;
      // the rest are spaced so neighbours are equally far apart.
      slots: heartSlots(photos.length, { width: spanW, height: spanH, card: [cardW, cardH] }).map(([x, y], i) => ({
        x: (x * spanW) / 2,
        y: (y * spanH) / 2,
        // Small, stable tilt per slot so the heart looks hand-pinned; the centre cards stay straight.
        r: i === 0 || i * 2 === photos.length ? 0 : ((i * 37) % 13) - 6,
      })),
    }
  }, [box, photos.length])

  const slotTransform = (i) => {
    const { x, y, r } = layout.slots[i]
    return `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${r}deg) scale(${layout.k})`
  }

  useEffect(() => {
    if (reduceMotion || !box.w) return undefined
    let cancelled = false
    const running = []
    const animate = (el, frames, opts) => {
      const a = el.animate(frames, { fill: 'forwards', ...opts })
      running.push(a)
      return a.finished.catch(() => {})
    }

    ;(async () => {
      for (let i = placed; i < photos.length; i++) {
        const el = cards.current[i]
        if (!el) continue
        await ready(el.querySelector('img'))
        if (cancelled || skip.current) return
        el.style.zIndex = 3
        await animate(
          el,
          [
            { transform: 'translate(-50%, -50%) translateY(24px) scale(0.6) rotate(-4deg)', opacity: 0 },
            { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', opacity: 1 },
          ],
          { duration: ZOOM_IN_MS, easing: EASE_IN },
        )
        await wait(HOLD_MS)
        if (cancelled || skip.current) return
        await animate(
          el,
          [{ transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', opacity: 1 }, { transform: slotTransform(i), opacity: 1 }],
          { duration: ZOOM_OUT_MS, easing: EASE_MOVE },
        )
        if (cancelled || skip.current) return
        el.style.zIndex = ''
        setPlaced((n) => Math.max(n, i + 1))
      }
    })()

    return () => {
      cancelled = true
      running.forEach((a) => a.cancel())
    }
    // Runs once per layout; `placed` resumes where a resize interrupted it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, reduceMotion])

  function showAll() {
    skip.current = true
    cards.current.forEach((el) => {
      el?.getAnimations().forEach((a) => a.cancel())
      if (el) el.style.zIndex = ''
    })
    setPlaced(photos.length)
  }

  return (
    <div className={`${className} photo-scene${done ? ' is-done' : ''}`}>
      <div className="photo-heart" ref={boxRef} style={{ '--big': `${layout.bigW}px` }}>
        {photos.map((photo, i) => (
          <figure
            key={photo.id}
            ref={(el) => (cards.current[i] = el)}
            className={`photo-card${i < placed ? ' is-placed' : ''}`}
            style={i < placed && layout.slots[i] ? { transform: slotTransform(i), opacity: 1 } : undefined}
          >
            <img src={photo.url} alt="" draggable="false" />
          </figure>
        ))}

        {/* Once the heart is complete, its middle is the way forward. */}
        <button
          type="button"
          className="photo-caption"
          onClick={onNext}
          disabled={!done}
          aria-hidden={!done}
          aria-label={`${content.photoTitle} — ${content.photoNextHint}`}
        >
          <span className="script-title photo-title">{content.photoTitle}</span>
          <span className="photo-sub">{content.photoSub}</span>
        </button>
      </div>

      <div className="photo-footer">
        {done ? (
          <p className="hint photo-next">
            <span aria-hidden="true">👆</span> {content.photoNextHint}
          </p>
        ) : (
          <button type="button" className="btn-link photo-skip" onClick={showAll}>
            Xem tất cả ›
          </button>
        )}
      </div>
    </div>
  )
}
