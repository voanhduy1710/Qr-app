import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { getSiteUrl } from '../../config/siteUrl'
import HeartQr, { QR_RED, svgToPngBlob } from '../heart-qr/HeartQr'
import Icon from './Icon'

const COLORS = [QR_RED, '#e11d48', '#ff4d8d', '#b0124a', '#000000']

export default function QrPanel({ gift }) {
  const svgRef = useRef(null)
  const [color, setColor] = useState(QR_RED)
  const [size, setSize] = useState(1600)
  const [note, setNote] = useState('')
  const url = `${getSiteUrl()}${gift.path}`

  async function download() {
    const blob = await svgToPngBlob(svgRef.current, size)
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `qr-trai-tim-${gift.id}.png`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }

  async function copy() {
    await navigator.clipboard.writeText(url)
    setNote('Link copied')
    setTimeout(() => setNote(''), 1800)
  }

  return (
    <>
      <header className="dash-head">
        <div>
          <h1>{gift.name} QR code</h1>
          <p className="dash-muted">The heart code opens the gift page. Print it or send the image to the recipient.</p>
        </div>
      </header>

      <div className="dash-qr">
        <div className="dash-card dash-qr-stage">
          <HeartQr ref={svgRef} text={url} color={color} className="dash-qr-svg" title={`${gift.name} QR code`} />
        </div>

        <div className="dash-card dash-form">
          <label className="dash-field">
            <span className="dash-label">Link inside the code</span>
            <div className="dash-input-row">
              <input readOnly value={url} onFocus={(e) => e.target.select()} />
              <button type="button" className="dash-btn" onClick={copy}>
                <Icon name="copy" size={16} />
                Copy
              </button>
            </div>
            <span className="dash-hint" role="status">
              {note || 'On localhost the code uses your LAN IP so a phone on the same Wi‑Fi can scan it. Set VITE_SITE_URL to pin a domain.'}
            </span>
          </label>

          <fieldset className="dash-field">
            <legend className="dash-label">Code colour</legend>
            <div className="dash-swatches">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`dash-swatch${c === color ? ' is-active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                  aria-label={c}
                  aria-pressed={c === color}
                />
              ))}
            </div>
            <span className="dash-hint">Darker colours scan most reliably. Downloads have a transparent background.</span>
          </fieldset>

          <label className="dash-field">
            <span className="dash-label">Download size</span>
            <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
              <option value={800}>800 px · for messaging</option>
              <option value={1600}>1600 px · default</option>
              <option value={3200}>3200 px · for print</option>
            </select>
          </label>

          <div className="dash-actions">
            <button type="button" className="dash-btn dash-btn-primary" onClick={download}>
              <Icon name="download" size={16} />
              Download PNG
            </button>
            <Link className="dash-btn" to={`/qr/${gift.id}`}>
              <Icon name="qr" size={16} />
              Full screen
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
