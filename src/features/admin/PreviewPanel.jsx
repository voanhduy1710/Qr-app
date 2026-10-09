import { useState } from 'react'
import Icon from './Icon'

/**
 * The gift page in a phone frame, opened straight on any section, so one part
 * can be checked without clicking through everything before it. Shows the
 * saved version of the content and photos.
 */
export default function PreviewPanel({ gift }) {
  const [current, setCurrent] = useState(gift.scenes[0])
  const [reload, setReload] = useState(0)
  const src = `${gift.path}?${new URLSearchParams(current.query)}`

  function open(scene) {
    setCurrent(scene)
    setReload((n) => n + 1)
  }

  return (
    <>
      <header className="dash-head">
        <div>
          <h1>{gift.name} preview</h1>
          <p className="dash-muted">
            Jump straight to any section. This is the saved version: save changes in Content or Photos first. Sound
            only starts when the page is opened from the beginning.
          </p>
        </div>
        <div className="dash-actions">
          <a className="dash-btn dash-btn-ghost" href={src} target="_blank" rel="noreferrer">
            <Icon name="external" size={16} />
            Open this section
          </a>
        </div>
      </header>

      <div className="dash-previewer">
        <nav className="dash-card dash-scene-list" aria-label="Sections">
          {gift.scenes.map((scene, i) => (
            <button
              key={scene.id}
              type="button"
              className={`dash-scene${scene.id === current.id ? ' is-active' : ''}`}
              aria-current={scene.id === current.id ? 'true' : undefined}
              onClick={() => open(scene)}
            >
              <span className="dash-scene-num">{i + 1}</span>
              {scene.label}
            </button>
          ))}
        </nav>

        <div className="dash-preview dash-preview-live" aria-label="Preview">
          <div className="dash-preview-head">
            <span>{current.label} · saved version</span>
            <button
              type="button"
              className="dash-icon-btn"
              onClick={() => setReload((n) => n + 1)}
              aria-label="Restart this section"
            >
              <Icon name="refresh" size={16} />
            </button>
          </div>
          <div className="dash-phone">
            <iframe key={reload} src={src} title={`${gift.name}: ${current.label}`} />
          </div>
        </div>
      </div>
    </>
  )
}
