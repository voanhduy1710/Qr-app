import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Fireworks from '../../../shared/components/Fireworks'
import { heartCards } from '../../../shared/lib/heartPath'
import { usePrefersReducedMotion } from '../../../shared/hooks/usePrefersReducedMotion'

const ZOOM_IN_MS = 700
const HOLD_MS = 800
const ZOOM_OUT_MS = 850
const EASE_IN = 'cubic-bezier(0.22, 1, 0.36, 1)'
const EASE_MOVE = 'cubic-bezier(0.65, 0, 0.35, 1)'

// A deeper cleft than the classic curve, so the lobes still read with cards on top.
const HEART_DIP = 7
// How much neighbouring cards overlap, as a fraction of a card.
const HEART_OVERLAP = 0.14
// The dip card is lifted by this fraction of a card so it clears the title.
const DIP_LIFT = 0.14

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
  const fireworks = useRef(null)
  const [viewing, setViewing] = useState(null) // index of the photo shown full size
  const done = placed >= photos.length

  // Once the heart is complete, fireworks go off behind it now and then.
  useEffect(() => {
    if (!done || reduceMotion || !photos.length) return undefined
    const start = setTimeout(() => fireworks.current?.show(5), 400)
    const again = setInterval(() => fireworks.current?.show(2), 3600)
    return () => {
      clearTimeout(start)
      clearInterval(again)
    }
  }, [done, reduceMotion, photos.length])

  useLayoutEffect(() => {
    const el = boxRef.current
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Cards are sized so neighbours overlap a little and the heart reads as one piece.
  const layout = useMemo(() => {
    const { w, h } = box
    const { cardW, cardH, slots } = heartCards(photos.length, w, h, { dip: HEART_DIP, overlap: HEART_OVERLAP })
    const bigW = Math.min(w * 0.7, h * 0.62)
    return {
      bigW,
      k: bigW ? cardW / bigW : 0.2,
      // One card sits dead centre in the dip and (for an even count) one on the tip.
      slots: slots.map(([x, y], i) => ({
        x,
        y: i === 0 ? y - cardH * DIP_LIFT : y,
        // Small, stable tilt per slot so the heart looks hand-pinned; the centre cards stay straight.
        r: i === 0 || i * 2 === photos.length ? 0 : ((i * 37) % 9) - 4,
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
      <Fireworks ref={fireworks} className="photo-fireworks" />
      <div className="photo-heart" ref={boxRef} style={{ '--big': `${layout.bigW}px` }}>
        {photos.map((photo, i) => (
          <figure
            key={photo.id}
            ref={(el) => (cards.current[i] = el)}
            className={`photo-card${i < placed ? ' is-placed' : ''}`}
            style={i < placed && layout.slots[i] ? { transform: slotTransform(i), opacity: 1 } : undefined}
            {...(i < placed && {
              role: 'button',
              tabIndex: 0,
              'aria-label': `Xem ảnh ${i + 1}`,
              onClick: () => setViewing(i),
              onKeyDown: (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setViewing(i)
                }
              },
            })}
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

      {viewing !== null &&
        createPortal(
          <PhotoViewer photos={photos} index={viewing} onIndex={setViewing} onClose={() => setViewing(null)} />,
          document.body,
        )}

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

/** One photo at full size over everything; arrows, swipe or ←/→ step through, Esc closes. */
function PhotoViewer({ photos, index, onIndex, onClose }) {
  const closeRef = useRef(null)
  const swipe = useRef(null)
  const count = photos.length
  const step = (d) => onIndex((index + d + count) % count)

  useEffect(() => {
    const opener = document.activeElement
    closeRef.current?.focus()
    return () => opener?.focus?.()
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div
      className="photo-viewer"
      role="dialog"
      aria-modal="true"
      aria-label={`Ảnh ${index + 1} / ${count}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onPointerDown={(e) => (swipe.current = e.clientX)}
      onPointerUp={(e) => {
        const dx = swipe.current === null ? 0 : e.clientX - swipe.current
        swipe.current = null
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
      }}
    >
      <img key={photos[index].id} src={photos[index].url} alt={`Ảnh ${index + 1}`} draggable="false" />
      <button ref={closeRef} type="button" className="photo-viewer-btn photo-viewer-close" onClick={onClose} aria-label="Đóng">
        ×
      </button>
      {count > 1 && (
        <>
          <button type="button" className="photo-viewer-btn photo-viewer-prev" onClick={() => step(-1)} aria-label="Ảnh trước">
            ‹
          </button>
          <button type="button" className="photo-viewer-btn photo-viewer-next" onClick={() => step(1)} aria-label="Ảnh sau">
            ›
          </button>
          <span className="photo-viewer-count">
            {index + 1} / {count}
          </span>
        </>
      )}
    </div>
  )
}
