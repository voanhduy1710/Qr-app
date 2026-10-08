import { useEffect, useMemo, useRef, useState } from 'react'
import { loadOverrides, mergeContent, saveOverrides } from '../../shared/lib/giftContent'
import Icon from './Icon'

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

/**
 * Form for every personal text on a gift page, grouped by scene. Values start
 * from the defaults merged with what is saved in Supabase; saving stores only
 * the fields that differ from the defaults.
 */
export default function ContentEditor({ gift, onDirtyChange }) {
  const { defaults, schema } = gift
  const [saved, setSaved] = useState(null)
  const [values, setValues] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [status, setStatus] = useState({ busy: false, error: '', note: '' })
  const [open, setOpen] = useState(() => new Set([schema[0].id]))
  const [previewKey, setPreviewKey] = useState(0)
  const importInput = useRef(null)

  useEffect(() => {
    let alive = true
    loadOverrides(gift.id)
      .then(({ data, updatedAt: at }) => {
        if (!alive) return
        const merged = mergeContent(defaults, data)
        setSaved(merged)
        setValues(merged)
        setUpdatedAt(at)
      })
      .catch((err) => alive && setStatus((s) => ({ ...s, error: err.message })))
    return () => {
      alive = false
    }
  }, [gift.id, defaults])

  const changed = useMemo(
    () => (values && saved ? Object.keys(values).filter((k) => !same(values[k], saved[k])) : []),
    [values, saved],
  )
  const dirty = changed.length > 0

  useEffect(() => {
    onDirtyChange?.(dirty)
    if (!dirty) return undefined
    const warn = (e) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty, onDirtyChange])

  const set = (key, value) => setValues((v) => ({ ...v, [key]: value }))

  async function save() {
    setStatus({ busy: true, error: '', note: '' })
    try {
      const { updatedAt: at } = await saveOverrides(gift.id, values, defaults)
      setSaved(values)
      setUpdatedAt(at)
      setPreviewKey((k) => k + 1)
      setStatus({ busy: false, error: '', note: 'Saved' })
      setTimeout(() => setStatus((s) => ({ ...s, note: '' })), 2000)
    } catch (err) {
      setStatus({ busy: false, error: err.message || 'Could not save', note: '' })
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(values, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `content-${gift.id}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }

  async function importJson(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    try {
      const imported = JSON.parse(await file.text())
      setValues((v) => mergeContent(v, imported))
      setStatus({ busy: false, error: '', note: 'Imported — review, then click Save' })
    } catch {
      setStatus({ busy: false, error: 'That file is not valid JSON', note: '' })
    }
  }

  function toggle(id) {
    setOpen((o) => {
      const next = new Set(o)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (!values) {
    return <p className="dash-muted">{status.error || 'Loading content…'}</p>
  }

  const allOpen = open.size === schema.length

  return (
    <>
      <header className="dash-head">
        <div>
          <h1>{gift.name} content</h1>
          <p className="dash-muted">
            Every personal line on the gift page. Last saved:{' '}
            {updatedAt ? new Date(updatedAt).toLocaleString('en-GB') : 'never (using defaults)'}
          </p>
        </div>
        <div className="dash-actions">
          <button type="button" className="dash-btn dash-btn-ghost" onClick={exportJson}>
            <Icon name="download" size={16} />
            Export JSON
          </button>
          <button type="button" className="dash-btn dash-btn-ghost" onClick={() => importInput.current?.click()}>
            <Icon name="upload" size={16} />
            Import JSON
          </button>
          <input ref={importInput} type="file" accept="application/json" hidden onChange={importJson} />
        </div>
      </header>

      <div className="dash-savebar" data-dirty={dirty}>
        <span role="status">
          {status.error ? (
            <span className="dash-error">{status.error}</span>
          ) : status.note ? (
            status.note
          ) : dirty ? (
            `${changed.length} unsaved field${changed.length > 1 ? 's' : ''}`
          ) : (
            'All changes saved'
          )}
        </span>
        <div className="dash-actions">
          <button type="button" className="dash-btn dash-btn-ghost" onClick={() => setOpen(new Set(allOpen ? [] : schema.map((s) => s.id)))}>
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
          <button type="button" className="dash-btn" onClick={() => setValues(saved)} disabled={!dirty || status.busy}>
            Discard
          </button>
          <button type="button" className="dash-btn dash-btn-primary" onClick={save} disabled={!dirty || status.busy}>
            {status.busy ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      <div className="dash-editor">
        <div className="dash-sections">
          {schema.map((section) => {
            const edited = section.fields.filter((f) => !same(values[f.key], defaults[f.key])).length
            const unsaved = section.fields.some((f) => changed.includes(f.key))
            const isOpen = open.has(section.id)
            return (
              <section key={section.id} className={`dash-card dash-section${isOpen ? ' is-open' : ''}`}>
                <button type="button" className="dash-section-head" onClick={() => toggle(section.id)} aria-expanded={isOpen}>
                  <Icon name="chevron" size={16} className="dash-section-chevron" />
                  <span className="dash-section-title">{section.title}</span>
                  {unsaved && <span className="dash-badge is-unsaved">Unsaved</span>}
                  {edited > 0 && <span className="dash-badge">{edited} edited</span>}
                  <span className="dash-section-count">{section.fields.length} fields</span>
                </button>
                {isOpen && (
                  <div className="dash-section-body">
                    {section.hint && <p className="dash-hint">{section.hint}</p>}
                    {section.fields.map((field) => (
                      <Field
                        key={field.key}
                        field={field}
                        value={values[field.key]}
                        isDefault={same(values[field.key], defaults[field.key])}
                        onChange={(v) => set(field.key, v)}
                        onReset={() => set(field.key, defaults[field.key])}
                      />
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </div>

        <aside className="dash-preview" aria-label="Preview">
          <div className="dash-preview-head">
            <span>Preview (saved version)</span>
            <button type="button" className="dash-icon-btn" onClick={() => setPreviewKey((k) => k + 1)} aria-label="Reload preview">
              <Icon name="refresh" size={16} />
            </button>
          </div>
          <div className="dash-phone">
            <iframe key={previewKey} src={gift.path} title={`${gift.name} preview`} />
          </div>
        </aside>
      </div>
    </>
  )
}

function Field({ field, value, isDefault, onChange, onReset }) {
  const id = `f-${field.key}`
  return (
    <div className="dash-field">
      <div className="dash-field-head">
        <label className="dash-label" htmlFor={id}>
          {field.label}
        </label>
        {!isDefault && (
          <button type="button" className="dash-reset" onClick={onReset} title="Restore the default text">
            <Icon name="reset" size={14} />
            Default
          </button>
        )}
      </div>
      {field.type === 'text' && <input id={id} value={value} onChange={(e) => onChange(e.target.value)} />}
      {field.type === 'date' && <input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)} />}
      {field.type === 'textarea' && <TextArea id={id} value={value} onChange={onChange} />}
      {field.type === 'list' && <ListField id={id} items={value} onChange={onChange} />}
      {field.type === 'pages' && <ListField id={id} items={value} onChange={onChange} multiline itemLabel="Page" />}
      {field.type === 'cards' && <CardsField id={id} cards={value} onChange={onChange} />}
      {field.type === 'audio' && <AudioField id={id} value={value} onChange={onChange} />}
      {field.type === 'volume' && (
        <div className="dash-volume">
          <input id={id} type="range" min="0" max="100" step="5" value={value} onChange={(e) => onChange(Number(e.target.value))} />
          <span>{value}%</span>
        </div>
      )}
      {field.hint && <span className="dash-hint">{field.hint}</span>}
    </div>
  )
}

/** Path or link to an mp3, with a button to listen before saving. */
function AudioField({ id, value, onChange }) {
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState('')
  const audio = useRef(null)

  const stop = () => {
    audio.current?.pause()
    audio.current = null
    setPlaying(false)
  }
  useEffect(() => stop, [])

  function toggle() {
    if (playing) return stop()
    setError('')
    const el = new Audio(value)
    el.volume = 0.6
    el.onended = stop
    el.onerror = () => {
      setError('Could not play that file. Check the path, e.g. /music/song.mp3')
      stop()
    }
    audio.current = el
    el.play().then(() => setPlaying(true), () => {})
  }

  return (
    <>
      <div className="dash-audio">
        <input
          id={id}
          value={value}
          placeholder="/music/song.mp3"
          onChange={(e) => {
            stop()
            onChange(e.target.value.trim())
          }}
        />
        <button type="button" className="dash-btn dash-btn-ghost" onClick={toggle} disabled={!value}>
          {playing ? 'Stop' : 'Preview'}
        </button>
      </div>
      {error && <span className="dash-error">{error}</span>}
    </>
  )
}

function TextArea({ id, value, onChange, rows = 3 }) {
  return (
    <textarea
      id={id}
      value={value}
      rows={Math.max(rows, String(value).split('\n').length + 1)}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

const move = (list, i, d) => {
  const next = [...list]
  ;[next[i], next[i + d]] = [next[i + d], next[i]]
  return next
}

function RowTools({ index, count, onMove, onRemove, label }) {
  return (
    <div className="dash-row-tools">
      <button type="button" className="dash-icon-btn" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Move ${label} up`}>
        <Icon name="up" size={15} />
      </button>
      <button type="button" className="dash-icon-btn" onClick={() => onMove(1)} disabled={index === count - 1} aria-label={`Move ${label} down`}>
        <Icon name="down" size={15} />
      </button>
      <button type="button" className="dash-icon-btn is-danger" onClick={onRemove} aria-label={`Remove ${label}`}>
        <Icon name="close" size={15} />
      </button>
    </div>
  )
}

function ListField({ id, items, onChange, multiline = false, itemLabel = 'Line' }) {
  const update = (i, v) => onChange(items.map((x, j) => (j === i ? v : x)))
  return (
    <div className="dash-list" id={id}>
      {items.map((item, i) => (
        <div key={i} className="dash-list-row">
          <span className="dash-list-num">{i + 1}</span>
          {multiline ? (
            <TextArea value={item} onChange={(v) => update(i, v)} />
          ) : (
            <input value={item} onChange={(e) => update(i, e.target.value)} aria-label={`${itemLabel} ${i + 1}`} />
          )}
          <RowTools
            index={i}
            count={items.length}
            label={`${itemLabel.toLowerCase()} ${i + 1}`}
            onMove={(d) => onChange(move(items, i, d))}
            onRemove={() => onChange(items.filter((_, j) => j !== i))}
          />
        </div>
      ))}
      <button type="button" className="dash-add" onClick={() => onChange([...items, ''])}>
        <Icon name="plus" size={15} />
        Add {itemLabel.toLowerCase()}
      </button>
    </div>
  )
}

function CardsField({ id, cards, onChange }) {
  const update = (i, patch) => onChange(cards.map((c, j) => (j === i ? { ...c, ...patch } : c)))
  return (
    <div className="dash-cards" id={id}>
      {cards.map((card, i) => (
        <div key={i} className="dash-subcard">
          <div className="dash-subcard-head">
            <span className="dash-list-num">{i + 1}</span>
            <input
              value={card.title}
              onChange={(e) => update(i, { title: e.target.value })}
              placeholder="Card title"
              aria-label={`Card ${i + 1} title`}
            />
            <RowTools
              index={i}
              count={cards.length}
              label={`card ${i + 1}`}
              onMove={(d) => onChange(move(cards, i, d))}
              onRemove={() => onChange(cards.filter((_, j) => j !== i))}
            />
          </div>
          <TextArea value={card.text} onChange={(v) => update(i, { text: v })} rows={4} />
        </div>
      ))}
      <button type="button" className="dash-add" onClick={() => onChange([...cards, { title: '', text: '' }])}>
        <Icon name="plus" size={15} />
        Add card
      </button>
    </div>
  )
}
