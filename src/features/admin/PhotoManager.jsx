import { useCallback, useEffect, useRef, useState } from 'react'
import {
  MAX_PHOTOS,
  addPhoto,
  deletePhoto,
  listPhotos,
  replacePhoto,
  savePositions,
  shrinkImage,
} from '../../shared/lib/photos'
import Icon from './Icon'

/**
 * Photos shown in a gift page's photo heart, as a vertical list in display
 * order. Drag rows (or use the arrows) to reorder; tick rows to delete many.
 */
export default function PhotoManager({ occasion }) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(() => new Set())
  const [drag, setDrag] = useState(null) // { from, over }
  const [dropping, setDropping] = useState(false)
  const addInput = useRef(null)
  const replaceInput = useRef(null)
  const replaceTarget = useRef(null)

  const reload = useCallback(async () => {
    const list = await listPhotos(occasion)
    setPhotos(list)
    // Forget selections of photos that no longer exist.
    setSelected((s) => new Set(list.filter((p) => s.has(p.id)).map((p) => p.id)))
    setLoading(false)
  }, [occasion])

  useEffect(() => {
    reload().catch((err) => {
      setError(err.message)
      setLoading(false)
    })
  }, [reload])

  async function run(label, task) {
    setBusy(label)
    setError('')
    try {
      await task()
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      await reload().catch(() => {})
      setBusy('')
    }
  }

  function addFiles(list) {
    const room = MAX_PHOTOS - photos.length
    const files = [...list].filter((f) => f.type.startsWith('image/')).slice(0, room)
    if (!files.length) return
    run(`Uploading ${files.length} photo${files.length > 1 ? 's' : ''}…`, async () => {
      let position = photos.length
      for (const file of files) {
        await addPhoto(occasion, await shrinkImage(file), position++)
      }
    })
  }

  function onReplace(e) {
    const file = e.target.files[0]
    const photo = replaceTarget.current
    e.target.value = ''
    if (!file || !photo) return
    run('Replacing photo…', async () => replacePhoto(photo, occasion, await shrinkImage(file)))
  }

  function reorder(from, to) {
    if (to < 0 || to >= photos.length || from === to) return
    const next = [...photos]
    next.splice(to, 0, next.splice(from, 1)[0])
    setPhotos(next)
    run('Saving order…', () => savePositions(next))
  }

  function removeMany(ids) {
    const doomed = photos.filter((p) => ids.has(p.id))
    if (!doomed.length) return
    const label = doomed.length === 1 ? 'this photo' : `${doomed.length} photos`
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return
    run(`Deleting ${label}…`, async () => {
      for (const photo of doomed) await deletePhoto(photo)
      await savePositions(photos.filter((p) => !ids.has(p.id)))
      setSelected(new Set())
    })
  }

  function toggle(id) {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
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
            Each photo zooms in, then flies to its place on the heart, top to bottom in this order. Drag rows to reorder.
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

      <p className="dash-status" role="status">
        {busy}
      </p>
      {error && (
        <p className="dash-error" role="alert">
          {error}
        </p>
      )}

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
                  onChange={() => setSelected(allSelected ? new Set() : new Set(photos.map((p) => p.id)))}
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
              <span className="dash-hint dash-bulk-hint">Drop new images anywhere in this box to upload.</span>
            </div>

            <ol className="dash-photo-list">
              {photos.map((photo, i) => {
                const isOver = drag && drag.over === i && drag.from !== i
                const edge = isOver ? (drag.from < i ? ' is-drop-below' : ' is-drop-above') : ''
                return (
                  <li
                    key={photo.id}
                    className={`dash-photo-row${selected.has(photo.id) ? ' is-selected' : ''}${
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
                      checked={selected.has(photo.id)}
                      onChange={() => toggle(photo.id)}
                      aria-label={`Select photo ${i + 1}`}
                      disabled={locked}
                    />
                    <span className="dash-grip" aria-hidden="true">
                      ⋮⋮
                    </span>
                    <span className="dash-photo-pos">{i + 1}</span>
                    <img src={photo.url} alt={`Photo ${i + 1}`} loading="lazy" draggable="false" />
                    <span className="dash-photo-name" title={photo.storage_path}>
                      Appears {ordinal(i + 1)}
                      <small>{photo.storage_path.split('/').pop()}</small>
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
                        onClick={() => removeMany(new Set([photo.id]))}
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

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
