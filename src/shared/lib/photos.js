import { supabase } from './supabase'

export const BUCKET = 'gift-photos'
export const MAX_PHOTOS = 18

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured (.env)')
  return supabase
}

const withUrl = (row) => ({
  ...row,
  url: supabase.storage.from(BUCKET).getPublicUrl(row.storage_path).data.publicUrl,
})

/** Photos for an occasion, in display order. Empty when Supabase is not configured. */
export async function listPhotos(occasion) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('gift_photos')
    .select('id, storage_path, position')
    .eq('occasion', occasion)
    .order('position')
  if (error) throw error
  return data.map(withUrl)
}

/** Downscale big camera photos to a phone-friendly JPEG. GIFs pass through to keep animation. */
export async function shrinkImage(file, maxSide = 1600) {
  if (file.type === 'image/gif') return file
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.86))
  return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })
}

function newPath(occasion, file) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  return `${occasion}/${crypto.randomUUID()}.${ext}`
}

/**
 * Applies a whole editing session in as few requests as possible.
 *
 * `saved` is the list as loaded; `draft` is the list to end up with, in order.
 * Draft items are saved rows (`id`, `storage_path`), optionally with a `file`
 * that replaces the image, or new items with only a `file`.
 *
 * Requests: one upload per new/replaced file (unavoidable), then at most one
 * delete, one insert, one upsert for every position, and one storage cleanup.
 */
export async function savePhotoChanges(occasion, saved, draft, onProgress = () => {}) {
  const db = requireClient()
  const keep = new Set(draft.filter((p) => p.id).map((p) => p.id))
  const removed = saved.filter((p) => !keep.has(p.id))
  const uploads = draft.filter((p) => p.file)
  const uploaded = []
  const staleFiles = removed.map((p) => p.storage_path)
  let rowsWritten = false

  try {
    const pathFor = new Map()
    for (const [i, item] of uploads.entries()) {
      onProgress(`Uploading ${i + 1} of ${uploads.length}…`)
      const path = newPath(occasion, item.file)
      const up = await db.storage.from(BUCKET).upload(path, item.file, { contentType: item.file.type })
      if (up.error) throw up.error
      uploaded.push(path)
      pathFor.set(item, path)
    }

    onProgress('Saving…')
    const rows = draft.map((item, position) => ({
      ...(item.id && { id: item.id }),
      occasion,
      storage_path: pathFor.get(item) ?? item.storage_path,
      position,
    }))
    const fresh = rows.filter((r) => !r.id)
    const existing = rows.filter((r) => r.id)
    if (fresh.length) {
      const { error } = await db.from('gift_photos').insert(fresh)
      if (error) throw error
      rowsWritten = true
    }
    if (existing.length) {
      const { error } = await db.from('gift_photos').upsert(existing, { onConflict: 'id' })
      if (error) throw error
    }
    // Deleting last means a failure earlier never loses photos.
    if (removed.length) {
      const { error } = await db.from('gift_photos').delete().in('id', removed.map((p) => p.id))
      if (error) throw error
    }
    // Files that were replaced are no longer referenced.
    for (const item of draft) if (item.id && item.file) staleFiles.push(item.storage_path)
  } catch (err) {
    // If no row points at the new uploads yet, don't leave them behind.
    if (uploaded.length && !rowsWritten) await db.storage.from(BUCKET).remove(uploaded)
    throw err
  }

  if (staleFiles.length) await db.storage.from(BUCKET).remove(staleFiles)
}
