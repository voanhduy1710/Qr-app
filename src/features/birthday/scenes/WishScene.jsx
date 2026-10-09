import { useEffect, useRef, useState } from 'react'

export default function WishScene({ content, className, onPick }) {
  const [open, setOpen] = useState(null)
  const [seen, setSeen] = useState(() => new Set())
  const continueRef = useRef(null)

  useEffect(() => {
    if (open === null) return undefined
    continueRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function show(i) {
    setOpen(i)
    setSeen((s) => new Set(s).add(i))
  }

  const wish = open === null ? null : content.wishes[open]

  return (
    <div className={`${className} wish-scene`}>
      <p className="eyebrow">Một điều ước</p>
      <h1 className="wish-title">{content.wishTitle}</h1>

      <div className="wish-grid" aria-hidden={open !== null}>
        {content.wishes.map((w, i) => (
          <button
            key={w.title}
            type="button"
            className={`wish-tag${seen.has(i) ? ' is-seen' : ''}`}
            style={{ '--i': i }}
            onClick={() => show(i)}
            tabIndex={open === null ? 0 : -1}
          >
            <span className="wish-tag-card">
              <span className="wish-tag-hole" aria-hidden="true" />
              <span className="wish-tag-text">{w.title}</span>
              <svg className="wish-tag-flower" viewBox="0 0 40 24" aria-hidden="true">
                <circle cx="12" cy="12" r="6" fill="#f0a3b5" />
                <circle cx="12" cy="12" r="2.5" fill="#d96f89" />
                <circle cx="26" cy="15" r="4.5" fill="#f6c1cd" />
                <circle cx="26" cy="15" r="1.8" fill="#e98aa1" />
                <ellipse cx="34" cy="10" rx="5" ry="2.2" fill="#9cc29a" transform="rotate(-30 34 10)" />
              </svg>
            </span>
          </button>
        ))}
      </div>

      <p className="hint">Chạm vào một chiếc thẻ</p>

      {wish && (
        <div className="postcard-backdrop" onClick={() => setOpen(null)}>
          <div
            key={open}
            className="postcard"
            role="dialog"
            aria-modal="true"
            aria-labelledby="postcard-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="postcard-stamp" aria-hidden="true">
              <svg viewBox="0 0 32 32">
                <path d="M16 29 3.6 16.6a7.4 7.4 0 0 1 10.5-10.5L16 8l1.9-1.9a7.4 7.4 0 0 1 10.5 10.5Z" />
              </svg>
            </div>
            <h2 id="postcard-title" className="postcard-title">
              {wish.title}
            </h2>
            <p className="postcard-text">{wish.text}</p>
            <p className="postcard-sign">— {content.from}</p>
            <div className="postcard-actions">
              <button type="button" className="btn" onClick={() => setOpen(null)}>
                <span aria-hidden="true">←</span> Xem điều ước khác
              </button>
              <button ref={continueRef} type="button" className="btn btn-primary" onClick={() => onPick(wish.title)}>
                Tiếp tục <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
