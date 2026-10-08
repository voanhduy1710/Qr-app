import { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { findOccasion } from '../../config/occasions'
import { getSiteUrl } from '../../config/siteUrl'
import HeartQr, { svgToPngBlob } from './HeartQr'
import './heart-qr.css'

export default function HeartQrPage() {
  const { occasion: occasionId } = useParams()
  const occasion = findOccasion(occasionId)
  const navigate = useNavigate()
  const svgRef = useRef(null)
  const [saving, setSaving] = useState(false)

  if (!occasion) return <Navigate to="/home" replace />
  const giftUrl = `${getSiteUrl()}${occasion.path}`

  async function download() {
    if (!svgRef.current || saving) return
    setSaving(true)
    try {
      const blob = await svgToPngBlob(svgRef.current)
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `qr-trai-tim-${occasion.id}.png`
      a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="qr-page">
      <button
        type="button"
        className="qr-icon-btn qr-back"
        onClick={() => navigate('/home', { viewTransition: true })}
        aria-label="Quay lại trang quản lý"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
      <button
        type="button"
        className="qr-icon-btn qr-download"
        onClick={download}
        disabled={saving}
        aria-label="Tải ảnh mã QR"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19h14" />
        </svg>
      </button>

      <a
        className="qr-heart-link"
        href={occasion.path}
        onClick={(e) => {
          e.preventDefault()
          navigate(occasion.path, { viewTransition: true })
        }}
      >
        <HeartQr ref={svgRef} text={giftUrl} className="qr-heart" title={`Mã QR mở quà ${occasion.label}`} />
      </a>

      <p className="qr-caption">Quét mã để mở quà</p>
    </main>
  )
}
