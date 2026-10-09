import { useEffect, useRef, useState } from 'react'
import { playMelody } from '../../../shared/lib/audio'

// How much of the silver has to go before the whole card reveals itself.
const REVEAL_AT = 0.5

/** Three vouchers under a silver layer. Only one can be scratched; the rest lock. */
export default function ScratchScene({ content, className, onDone }) {
  const [chosen, setChosen] = useState(null)
  const [revealed, setRevealed] = useState(false)

  function reveal() {
    if (revealed) return
    setRevealed(true)
    playMelody([['C5', 0.25], ['E5', 0.25], ['G5', 0.25], ['C6', 0.75]], { bpm: 160, volume: 0.18 })
  }

  return (
    <div className={`${className} scratch-scene`}>
      <p className="eyebrow">{content.scratchEyebrow}</p>
      <h1 className="wish-title">{content.scratchTitle}</h1>

      <div className="scratch-list">
        {content.vouchers.map((text, i) => (
          <ScratchCard
            key={i}
            text={text}
            note={content.voucherNote}
            lockedText={content.scratchLocked}
            locked={chosen !== null && chosen !== i}
            revealed={revealed && chosen === i}
            onStart={() => setChosen((c) => (c === null ? i : c))}
            onReveal={reveal}
          />
        ))}
      </div>

      <div className="scratch-foot">
        {revealed ? (
          <>
            <p className="hint">{content.scratchDone}</p>
            <button type="button" className="btn btn-primary" onClick={onDone}>
              {content.scratchButton}
            </button>
          </>
        ) : (
          <p className="hint">{content.scratchHint}</p>
        )}
      </div>
    </div>
  )
}

function ScratchCard({ text, note, lockedText, locked, revealed, onStart, onReveal }) {
  const canvas = useRef(null)
  const last = useRef(null)
  const moves = useRef(0)

  // Paint the silver once; afterwards the canvas just stretches with the card.
  useEffect(() => {
    const el = canvas.current
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const { width, height } = el.getBoundingClientRect()
    el.width = Math.round(width * dpr)
    el.height = Math.round(height * dpr)
    const ctx = el.getContext('2d')
    ctx.scale(dpr, dpr)
    const g = ctx.createLinearGradient(0, 0, width, height)
    g.addColorStop(0, '#c9c4cd')
    g.addColorStop(0.5, '#e6e2e8')
    g.addColorStop(1, '#aaa4af')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = 'rgba(120, 112, 128, 0.28)'
    ctx.lineWidth = 5
    for (let x = -height; x < width + height; x += 14) {
      ctx.beginPath()
      ctx.moveTo(x, height)
      ctx.lineTo(x + height * 0.55, 0)
      ctx.stroke()
    }
    ctx.fillStyle = '#6b6470'
    ctx.font = "600 15px 'Be Vietnam Pro', system-ui, sans-serif"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('✦  CÀO ĐỂ NHẬN QUÀ  ✦', width / 2, height / 2)
  }, [])

  const point = (e) => {
    const r = canvas.current.getBoundingClientRect()
    return [((e.clientX - r.left) / r.width) * canvas.current.width, ((e.clientY - r.top) / r.height) * canvas.current.height]
  }

  function scratchTo(e) {
    const el = canvas.current
    const ctx = el.getContext('2d')
    const [x, y] = point(e)
    const [lx, ly] = last.current ?? [x, y]
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalCompositeOperation = 'destination-out'
    // Fully opaque, or each stroke only thins the silver instead of removing it.
    ctx.strokeStyle = '#000'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = el.height * 0.32
    ctx.beginPath()
    ctx.moveTo(lx, ly)
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.restore()
    last.current = [x, y]
    if (++moves.current % 6 === 0 && cleared() > REVEAL_AT) onReveal()
  }

  // Share of the silver already scratched off, sampled on a coarse grid.
  function cleared() {
    const el = canvas.current
    const { data } = el.getContext('2d').getImageData(0, 0, el.width, el.height)
    let clear = 0
    let total = 0
    for (let gy = 0; gy < 12; gy++) {
      for (let gx = 0; gx < 30; gx++) {
        const x = Math.floor(((gx + 0.5) / 30) * el.width)
        const y = Math.floor(((gy + 0.5) / 12) * el.height)
        total += 1
        if (data[(y * el.width + x) * 4 + 3] < 40) clear += 1
      }
    }
    return clear / total
  }

  return (
    <div
      className={`voucher${locked ? ' is-locked' : ''}${revealed ? ' is-revealed' : ''}`}
      tabIndex={locked || revealed ? -1 : 0}
      role="button"
      aria-label={locked ? lockedText : 'Cào phiếu quà'}
      onKeyDown={(e) => {
        // Keyboard users can't scratch: Enter or Space reveals the card.
        if (!locked && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onStart()
          onReveal()
        }
      }}
    >
      <span className="voucher-label">Voucher</span>
      <span className="voucher-text">{text}</span>
      <span className="voucher-note">{note}</span>
      <canvas
        ref={canvas}
        className="voucher-silver"
        onPointerDown={(e) => {
          if (locked || revealed) return
          e.currentTarget.setPointerCapture?.(e.pointerId)
          onStart()
          last.current = null
          scratchTo(e)
        }}
        onPointerMove={(e) => e.buttons && !locked && !revealed && scratchTo(e)}
        onPointerUp={() => {
          last.current = null
          if (!locked && !revealed && cleared() > REVEAL_AT) onReveal()
        }}
      />
      {locked && <span className="voucher-lock">{lockedText}</span>}
    </div>
  )
}
