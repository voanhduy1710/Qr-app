import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { supabase } from '../../shared/lib/supabase'
import ContentEditor from './ContentEditor'
import Icon from './Icon'
import LoginForm from './LoginForm'
import Overview from './Overview'
import PhotoManager from './PhotoManager'
import PreviewPanel from './PreviewPanel'
import QrPanel from './QrPanel'
import { GIFTS, toolsFor } from './registry'
import { signOut, useAdminSession } from './useAdminSession'
import '../occasion-picker/occasion-picker.css'
import './admin.css'
import './dashboard.css'

export default function HomePage() {
  const status = useAdminSession()

  useEffect(() => {
    document.title = 'Gift manager · QR Trái Tim'
  }, [])

  if (!supabase) {
    return (
      <main className="admin admin-center">
        <p className="admin-error">Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY in .env</p>
      </main>
    )
  }
  if (status === 'loading') return <div className="page-black" />
  if (status !== 'admin') return <LoginForm />
  return <Dashboard />
}

/** The current view lives in the URL (?view=birthday/content) so reloads and links keep it. */
function useView() {
  const [params, setParams] = useSearchParams()
  const [giftId, tool] = (params.get('view') || 'overview').split('/')
  const gift = GIFTS.find((g) => g.id === giftId)
  const valid = gift && toolsFor(gift).some((t) => t.id === tool)
  const open = (next) => setParams(next === 'overview' ? {} : { view: next })
  return valid ? { gift, tool, open } : { gift: null, tool: 'overview', open }
}

function Dashboard() {
  const { gift, tool, open } = useView()
  const [navOpen, setNavOpen] = useState(false)
  const [dirty, setDirty] = useState(false)

  // Leaving an editor with unsaved changes asks first.
  const go = (next) => {
    if (dirty && !window.confirm('You have unsaved changes. Leave this page?')) return
    setDirty(false)
    setNavOpen(false)
    open(next)
  }

  const current = gift ? `${gift.id}/${tool}` : 'overview'
  const toolLabel = gift && toolsFor(gift).find((t) => t.id === tool)?.label

  return (
    <div className={`dash${navOpen ? ' is-nav-open' : ''}`}>
      <aside className="dash-side" aria-label="Navigation">
        <div className="dash-brand">
          <Icon name="heart" size={22} className="dash-brand-mark" />
          <span>QR Trái Tim</span>
        </div>

        <nav className="dash-nav">
          <NavItem icon="home" label="Overview" active={current === 'overview'} onClick={() => go('overview')} />
          {GIFTS.map((g) => (
            <div key={g.id} className="dash-group">
              <p className="dash-group-title">
                {g.name}
                <span>{g.path}</span>
              </p>
              {toolsFor(g).map((t) => (
                <NavItem
                  key={t.id}
                  icon={t.icon}
                  label={t.label}
                  active={current === `${g.id}/${t.id}`}
                  onClick={() => go(`${g.id}/${t.id}`)}
                />
              ))}
            </div>
          ))}
        </nav>

        <button type="button" className="dash-nav-item dash-logout" onClick={signOut}>
          <Icon name="logout" />
          Sign out
        </button>
      </aside>
      <button type="button" className="dash-scrim" aria-label="Close menu" onClick={() => setNavOpen(false)} />

      <div className="dash-main">
        <header className="dash-top">
          <button type="button" className="dash-icon-btn dash-menu" onClick={() => setNavOpen(true)} aria-label="Open menu">
            <Icon name="menu" />
          </button>
          <nav className="dash-crumbs" aria-label="Breadcrumb">
            <span>Manage</span>
            <Icon name="chevron" size={14} />
            {gift ? (
              <>
                <span>{gift.name}</span>
                <Icon name="chevron" size={14} />
                <strong>{toolLabel}</strong>
              </>
            ) : (
              <strong>Overview</strong>
            )}
          </nav>
          {gift && (
            <a className="dash-btn dash-btn-ghost" href={gift.path} target="_blank" rel="noreferrer">
              <Icon name="external" size={16} />
              Open gift page
            </a>
          )}
        </header>

        <main className="dash-content">
          {!gift && <Overview onOpen={go} />}
          {gift && tool === 'content' && <ContentEditor key={gift.id} gift={gift} onDirtyChange={setDirty} />}
          {gift && tool === 'photos' && <PhotoManager key={gift.id} occasion={gift.id} onDirtyChange={setDirty} />}
          {gift && tool === 'preview' && <PreviewPanel key={gift.id} gift={gift} />}
          {gift && tool === 'qr' && <QrPanel key={gift.id} gift={gift} />}
        </main>
      </div>
    </div>
  )
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      className={`dash-nav-item${active ? ' is-active' : ''}`}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
    >
      <Icon name={icon} />
      {label}
    </button>
  )
}
