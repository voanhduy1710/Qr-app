import { useEffect, useState } from 'react'
import { getSiteUrl } from '../../config/siteUrl'
import { loadOverrides } from '../../shared/lib/giftContent'
import { MAX_PHOTOS, listPhotos } from '../../shared/lib/photos'
import HeartQr from '../heart-qr/HeartQr'
import Icon from './Icon'
import { GIFTS, toolsFor } from './registry'

const formatTime = (iso) =>
  iso ? new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never'

export default function Overview({ onOpen }) {
  return (
    <>
      <header className="dash-head">
        <div>
          <h1>Overview</h1>
          <p className="dash-muted">Each occasion is its own gift page. Manage its text, photos and QR code from here.</p>
        </div>
      </header>
      <div className="dash-gifts">
        {GIFTS.map((g) => (
          <GiftCard key={g.id} gift={g} onOpen={onOpen} />
        ))}
      </div>
    </>
  )
}

function GiftCard({ gift, onOpen }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let alive = true
    Promise.all([
      loadOverrides(gift.id).catch(() => ({ data: {}, updatedAt: null })),
      gift.hasPhotos ? listPhotos(gift.id).catch(() => []) : Promise.resolve(null),
    ]).then(([content, photos]) => {
      if (alive) setStats({ edited: Object.keys(content.data).length, updatedAt: content.updatedAt, photos })
    })
    return () => {
      alive = false
    }
  }, [gift])

  const fieldCount = gift.schema.reduce((n, s) => n + s.fields.length, 0)
  const url = `${getSiteUrl()}${gift.path}`

  return (
    <article className="dash-card dash-gift">
      <button type="button" className="dash-gift-qr" onClick={() => onOpen(`${gift.id}/qr`)} aria-label={`${gift.name} QR code`}>
        <HeartQr text={url} className="dash-gift-qr-svg" />
      </button>
      <div className="dash-gift-body">
        <h2>
          {gift.name} <span className="dash-sub">· {gift.label}</span>
        </h2>
        <a className="dash-link" href={gift.path} target="_blank" rel="noreferrer">
          {url.replace(/^https?:\/\//, '')}
        </a>
        <dl className="dash-stats">
          <div>
            <dt>Edited fields</dt>
            <dd>{stats ? `${stats.edited} / ${fieldCount}` : '…'}</dd>
          </div>
          {gift.hasPhotos && (
            <div>
              <dt>Photos</dt>
              <dd>{stats ? `${stats.photos.length} / ${MAX_PHOTOS}` : '…'}</dd>
            </div>
          )}
          <div>
            <dt>Last saved</dt>
            <dd>{stats ? formatTime(stats.updatedAt) : '…'}</dd>
          </div>
        </dl>
        <div className="dash-actions">
          {toolsFor(gift).map((t) => (
            <button key={t.id} type="button" className="dash-btn" onClick={() => onOpen(`${gift.id}/${t.id}`)}>
              <Icon name={t.icon} size={16} />
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </article>
  )
}
