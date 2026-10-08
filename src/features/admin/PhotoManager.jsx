import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MAX_PHOTOS, listPhotos, savePhotoChanges, shrinkImage } from '../../shared/lib/photos'
import Icon from './Icon'

const keyOf = (photo) => photo.id ?? photo.key

/**
 * Photos shown in a gift page's photo heart, as a vertical list in display
 * order. Every edit (add, replace, reorder, delete) only changes a local
 * draft; "Save changes" sends the whole draft in one batch.
 */
export default function PhotoManager({ occasion, onDirtyChange }) {
  const [saved, setSaved] = useState([])
  const [photos, setPhotos] = useState([]) // the draft
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState(() => new Set())
  const [drag, setDrag] = useState(null) // { from, over }
  const [dropping, setDropping] = useState(false)
  const addInput = useRef(null)
  const replaceInput = useRef(null)
  const replaceTarget = useRef(null)
  const previews = useRef(new Set()) // object URLs made for unsaved files

  const forgetPreviews = useCallback(() => {
    previews.current.forEach((url) => URL.revokeObjectURL(url))
    previews.current.clear()
  }, [])

  const preview = (file) => {
    const url = URL.createObjectURL(file)
    previews.current.add(url)
    return url
  }

  const reload = useCallback(async () => {
    const list = await listPhotos(occasion)
    setSaved(list)
    setPhotos(list)
    setSelected(new Set())
    setLoading(false)
  }, [occasion])

  useEffect(() => {
    reload().catch((err) => {
      setError(err.message)
      setLoading(false)
    })
  }, [reload])

  useEffect(() => forgetPreviews, [forgetPreviews])

  const changes = useMemo(() => {
    const kept = new Set(photos.filter((p) => p.id).map((p) => p.id))
    const added = photos.filter((p) => !p.id).length
    const replaced = photos.filter((p) => p.id && p.file).length
    const removed = saved.filter((p) => !kept.has(p.id)).length
    const keptSaved = saved.filter((p) => kept.has(p.id)).map((p) => p.id)
    const keptDraft = photos.filter((p) => p.id).map((p) => p.id)
    const moved = keptSaved.some((id, i) => id !== keptDraft[i])
    const parts = [
      added && `${added} added`,
      replaced && `${replaced} replaced`,
      removed && `${removed} removed`,
      moved && 'order changed',
    ].filter(Boolean)
    return parts.join(', ')
  }, [photos, saved])
  const dirty = changes !== ''

  useEffect(() => {
    onDirtyChange?.(dirty)
    if (!dirty) return undefined
    const warn = (e) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty, onDirtyChange])

  async function save() {
    setSaving(true)
    setBusy('Saving…')
    setError('')
    try {
      await savePhotoChanges(occasion, saved, photos, setBusy)
      await reload()
      forgetPreviews()
      setNote('Saved')
      setTimeout(() => setNote(''), 2000)
    } catch (err) {
      setError(err.message || 'Could not save')
    } finally {
      setSaving(false)
      setBusy('')
    }
  }

  function discard() {
    setPhotos(saved)
    setSelected(new Set())
    forgetPreviews()
  }

  // Shrinking happens here so the preview is exactly what will be uploaded.
  async function addFiles(list) {
    const room = MAX_PHOTOS - photos.length
    const files = [...list].filter((f) => f.type.startsWith('image/')).slice(0, room)
    if (!files.length) return
    setBusy('Preparing photos…')
    try {
      const added = []
      for (const file of files) {
        const small = await shrinkImage(file)
        added.push({ key: crypto.randomUUID(), file: small, name: file.name, url: preview(small) })
      }
      setPhotos((list) => [...list, ...added])
    } catch (err) {
      setError(err.message || 'Could not read that image')
    } finally {
      setBusy('')
    }
  }

  async function onReplace(e) {
    const file = e.target.files[0]
    const target = replaceTarget.current
    e.target.value = ''
    if (!file || !target) return
    setBusy('Preparing photo…')
    try {
      const small = await shrinkImage(file)
      const swap = { file: small, name: file.name, url: preview(small) }
      setPhotos((list) => list.map((p) => (keyOf(p) === keyOf(target) ? { ...p, ...swap } : p)))
    } catch (err) {
      setError(err.message || 'Could not read that image')
    } finally {
      setBusy('')
    }
  }

  function reorder(from, to) {
    if (to < 0 || to >= photos.length || from === to) return
    const next = [...photos]
    next.splice(to, 0, next.splice(from, 1)[0])
    setPhotos(next)
  }

  function removeMany(keys) {
    setPhotos((list) => list.filter((p) => !keys.has(keyOf(p))))
    setSelected(new Set())
  }

  function toggle(key) {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const full = photos.length >= MAX_PHOTOS
  const allSelected = photos.length > 0 && selected.size === photos.length
  const locked = Boolean(busy)

  return (
    <div aria-busy={locked}>
      <header className="dash-head">
        <div>
          <h1>Heart photos</h1>
          <p className="dash-muted">
            Photo 1 sits in the dip at the top, then the rest go clockwise around the heart. With an even number of
            photos, the middle one lands on the bottom tip. Drag rows to reorder, then save.
          </p>
        </div>
        <div className="dash-actions">
          <span className="dash-pill">
            {photos.length} / {MAX_PHOTOS} photos
          </span>
          <button
            type="button"
            className="dash-btn dash-btn-primary"
            onClick={() => addInput.current?.click()}
            disabled={full || locked}
          >
            <Icon name="plus" size={16} />
            Add photos
          </button>
        </div>
      </header>

      <input
        ref={addInput}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          addFiles(e.target.files)
          e.target.value = ''
        }}
      />
      <input ref={replaceInput} type="file" accept="image/*" hidden onChange={onReplace} />

      <div className="dash-savebar" data-dirty={dirty}>
        <span role="status">
          {error ? (
            <span className="dash-error">{error}</span>
          ) : busy ? (
            busy
          ) : note ? (
            note
          ) : dirty ? (
            `Unsaved: ${changes}`
          ) : (
            'All changes saved'
          )}
        </span>
        <div className="dash-actions">
          <button type="button" className="dash-btn" onClick={discard} disabled={!dirty || locked}>
            Discard
          </button>
          <button type="button" className="dash-btn dash-btn-primary" onClick={save} disabled={!dirty || locked}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      <div
        className={`dash-card dash-drop${dropping ? ' is-over' : ''}`}
        onDragOver={(e) => {
          if (!e.dataTransfer.types.includes('Files')) return
          e.preventDefault()
          setDropping(true)
        }}
        onDragLeave={() => setDropping(false)}
        onDrop={(e) => {
          if (!e.dataTransfer.files.length) return
          e.preventDefault()
          setDropping(false)
          if (!full && !locked) addFiles(e.dataTransfer.files)
        }}
      >
        {loading ? (
          <p className="dash-muted">Loading…</p>
        ) : photos.length === 0 ? (
          <p className="admin-empty">No photos yet. Drop images here or click “Add photos”.</p>
        ) : (
          <>
            <div className="dash-bulk">
              <label className="dash-check">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => el && (el.indeterminate = selected.size > 0 && !allSelected)}
                  onChange={() => setSelected(allSelected ? new Set() : new Set(photos.map(keyOf)))}
                  disabled={locked}
                />
                {selected.size ? `${selected.size} selected` : 'Select all'}
              </label>
              {selected.size > 0 && (
                <div className="dash-actions">
                  <button type="button" className="dash-btn dash-btn-ghost" onClick={() => setSelected(new Set())}>
                    Clear
                  </button>
                  <button
                    type="button"
                    className="dash-btn dash-btn-danger"
                    onClick={() => removeMany(selected)}
                    disabled={locked}
                  >
                    <Icon name="close" size={15} />
                    Delete selected
                  </button>
                </div>
              )}
              <span className="dash-hint dash-bulk-hint">Drop new images anywhere in this box to add them.</span>
            </div>

            <ol className="dash-photo-list">
              {photos.map((photo, i) => {
                const key = keyOf(photo)
                const isOver = drag && drag.over === i && drag.from !== i
                const edge = isOver ? (drag.from < i ? ' is-drop-below' : ' is-drop-above') : ''
                return (
                  <li
                    key={key}
                    className={`dash-photo-row${selected.has(key) ? ' is-selected' : ''}${
                      drag?.from === i ? ' is-dragging' : ''
                    }${edge}`}
                    draggable={!locked}
                    onDragStart={(e) => {
                      setDrag({ from: i, over: i })
                      e.dataTransfer.effectAllowed = 'move'
                    }}
                    onDragEnd={() => setDrag(null)}
                    onDragOver={(e) => {
                      if (!drag) return
                      e.preventDefault()
                      if (drag.over !== i) setDrag({ ...drag, over: i })
                    }}
                    onDrop={(e) => {
                      if (!drag) return
                      e.preventDefault()
                      e.stopPropagation()
                      reorder(drag.from, i)
                      setDrag(null)
                    }}
                  >
                    <input
                      type="checkbox"
                      className="dash-row-check"
                      checked={selected.has(key)}
                      onChange={() => toggle(key)}
                      aria-label={`Select photo ${i + 1}`}
                      disabled={locked}
                    />
                    <span className="dash-grip" aria-hidden="true">
                      ⋮⋮
                    </span>
                    <span className="dash-photo-pos">{i + 1}</span>
                    <img src={photo.url} alt={`Photo ${i + 1}`} loading="lazy" draggable="false" />
                    <span className="dash-photo-name" title={photo.name ?? photo.storage_path}>
                      {placeName(i, photos.length)}
                      <small>
                        {photo.file && <span className="dash-badge is-unsaved">{photo.id ? 'Replaced' : 'New'}</span>}{' '}
                        {photo.name ?? photo.storage_path.split('/').pop()}
                      </small>
                    </span>
                    <div className="dash-row-tools">
                      <button
                        type="button"
                        className="dash-icon-btn"
                        onClick={() => reorder(i, i - 1)}
                        disabled={i === 0 || locked}
                        aria-label={`Move photo ${i + 1} up`}
                      >
                        <Icon name="up" size={15} />
                      </button>
                      <button
                        type="button"
                        className="dash-icon-btn"
                        onClick={() => reorder(i, i + 1)}
                        disabled={i === photos.length - 1 || locked}
                        aria-label={`Move photo ${i + 1} down`}
                      >
                        <Icon name="down" size={15} />
                      </button>
                      <button
                        type="button"
                        className="dash-btn dash-btn-ghost"
                        onClick={() => {
                          replaceTarget.current = photo
                          replaceInput.current?.click()
                        }}
                        disabled={locked}
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        className="dash-icon-btn is-danger"
                        onClick={() => removeMany(new Set([key]))}
                        disabled={locked}
                        aria-label={`Delete photo ${i + 1}`}
                      >
                        <Icon name="close" size={15} />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ol>
          </>
        )}
      </div>
    </div>
  )
}

function placeName(i, count) {
  if (i === 0) return 'Top centre (dip)'
  if (count % 2 === 0 && i === count / 2) return 'Bottom tip'
  return i < count / 2 ? `Right side, ${ordinal(i)} from top` : `Left side, ${ordinal(count - i)} from top`
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
