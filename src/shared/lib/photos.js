import { supabase } from './supabase'

const BUCKET = 'gift-photos'
export const MAX_PHOTOS = 20

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

export async function addPhoto(occasion, file, position) {
  const db = requireClient()
  const path = newPath(occasion, file)
  const up = await db.storage.from(BUCKET).upload(path, file, { contentType: file.type })
  if (up.error) throw up.error
  const { error } = await db.from('gift_photos').insert({ occasion, storage_path: path, position })
  if (error) {
    await db.storage.from(BUCKET).remove([path])
    throw error
  }
}

/** Swap the file behind a photo, keeping its slot. */
export async function replacePhoto(photo, occasion, file) {
  const db = requireClient()
  const path = newPath(occasion, file)
  const up = await db.storage.from(BUCKET).upload(path, file, { contentType: file.type })
  if (up.error) throw up.error
  const { error } = await db.from('gift_photos').update({ storage_path: path }).eq('id', photo.id)
  if (error) {
    await db.storage.from(BUCKET).remove([path])
    throw error
  }
  await db.storage.from(BUCKET).remove([photo.storage_path])
}

export async function deletePhoto(photo) {
  const db = requireClient()
  const { error } = await db.from('gift_photos').delete().eq('id', photo.id)
  if (error) throw error
  await db.storage.from(BUCKET).remove([photo.storage_path])
}

/** Persist a new order: `photos` is the full list in the order to save. */
export async function savePositions(photos) {
  const db = requireClient()
  const results = await Promise.all(
    photos.map((p, i) => db.from('gift_photos').update({ position: i }).eq('id', p.id)),
  )
  const failed = results.find((r) => r.error)
  if (failed) throw failed.error
}
