import { useEffect, useRef, useState } from 'react'
import './flip-book.css'

/**
 * An open book with two facing pages. Pages are printed two per sheet (front on
 * the right, back on the left once turned); turning a sheet swings it over the
 * spine. Tap the right page or swipe left to go forward, left page / swipe
 * right to go back.
 */
export default function FlipBook({ pages, hint = 'Chạm hoặc vuốt để lật trang' }) {
  const [turned, setTurned] = useState(0)
  // The sheet currently swinging stays above everything until it lands.
  const [moving, setMoving] = useState(-1)
  const start = useRef(null)
  const sheets = []
  for (let i = 0; i < pages.length; i += 2) sheets.push([pages[i], pages[i + 1]])
  // The last spread shows the final page; an odd page count leaves the last back blank.
  const last = Math.floor(pages.length / 2)

  useEffect(() => {
    if (moving < 0) return undefined
    const t = setTimeout(() => setMoving(-1), 1000)
    return () => clearTimeout(t)
  }, [moving, turned])

  function turnTo(t) {
    if (t === turned || t < 0 || t > last) return
    setMoving(Math.min(t, turned))
    setTurned(t)
  }
  const next = () => turnTo(turned + 1)
  const prev = () => turnTo(turned - 1)

  function onPointerDown(e) {
    start.current = { x: e.clientX, y: e.clientY }
  }

  function onPointerUp(e) {
    if (!start.current) return
    const origin = start.current
    start.current = null
    // Let buttons and links inside a page work normally.
    if (e.target.closest('button, a')) return
    const dx = e.clientX - origin.x
    const dy = e.clientY - origin.y
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next()
      else prev()
      return
    }
    const { left, width } = e.currentTarget.getBoundingClientRect()
    if (e.clientX - left > width / 2) next()
    else prev()
  }

  const leftPage = turned * 2 - 1
  const rightPage = turned * 2

  return (
    <div className="book-wrap">
      <div
        className={`book${turned === 0 ? ' is-closed' : ''}`}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        role="group"
        aria-roledescription="sách"
        aria-label={`Trang ${Math.max(1, leftPage + 1)}–${Math.min(pages.length, rightPage + 1)} / ${pages.length}`}
      >
        <div className="book-spine" aria-hidden="true" />
        {sheets.map(([front, back], i) => (
          <div
            key={i}
            className={`book-sheet${i < turned ? ' is-turned' : ''}`}
            // Right stack: lower index on top. Left stack: latest turn on top.
            style={{ zIndex: i === moving ? sheets.length * 2 + 1 : i < turned ? i + 1 : sheets.length * 2 - i }}
          >
            <div className="book-face book-front" aria-hidden={2 * i !== rightPage}>
              {front}
            </div>
            <div className="book-face book-back" aria-hidden={2 * i + 1 !== leftPage}>
              {back}
            </div>
          </div>
        ))}
      </div>

      <div className="book-dots" aria-hidden="true">
        {Array.from({ length: last + 1 }, (_, i) => (
          <span key={i} className={i === turned ? 'is-active' : ''} />
        ))}
      </div>
      <p className="hint book-hint" style={{ visibility: turned < last ? 'visible' : 'hidden' }}>
        {hint}
      </p>
    </div>
  )
}
