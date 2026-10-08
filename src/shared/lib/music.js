import { supabase } from './supabase'
import { BUCKET } from './photos'

// Same limit as the storage bucket.
export const MAX_MUSIC_BYTES = 10 * 1024 * 1024

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured (.env)')
  return supabase
}

/** Uploads an mp3 for an occasion and returns its public URL. */
export async function uploadMusic(occasion, file) {
  const db = requireClient()
  if (file.size > MAX_MUSIC_BYTES) throw new Error('That file is over 10 MB')
  const path = `${occasion}/music/${crypto.randomUUID()}.mp3`
  // Some browsers report mp3 as audio/mp3 or nothing at all; store it as the standard type.
  const { error } = await db.storage.from(BUCKET).upload(path, file, { contentType: 'audio/mpeg' })
  if (error) throw error
  return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

/** Path inside the bucket for one of our own public URLs, or null for anything else (e.g. /music/song.mp3). */
function pathOf(url) {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const at = typeof url === 'string' ? url.indexOf(marker) : -1
  return at === -1 ? null : decodeURIComponent(url.slice(at + marker.length))
}

/** Deletes uploaded music files no longer in use. Links that are not ours are ignored. */
export async function removeMusic(urls) {
  if (!supabase) return
  const paths = urls.map(pathOf).filter(Boolean)
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths)
}
