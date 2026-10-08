import { supabase } from './supabase'

const TABLE = 'gift_content'

/** Admin overrides for an occasion ({} when none or Supabase is not configured). */
export async function loadOverrides(occasion) {
  if (!supabase) return { data: {}, updatedAt: null }
  const { data, error } = await supabase
    .from(TABLE)
    .select('data, updated_at')
    .eq('occasion', occasion)
    .maybeSingle()
  if (error) throw error
  return { data: data?.data ?? {}, updatedAt: data?.updated_at ?? null }
}

/** Replaces the stored overrides for an occasion. Only fields that differ from the defaults are kept. */
export async function saveOverrides(occasion, values, defaults) {
  if (!supabase) throw new Error('Supabase is not configured (.env)')
  const data = diff(values, defaults)
  const updatedAt = new Date().toISOString()
  const { error } = await supabase
    .from(TABLE)
    .upsert({ occasion, data, updated_at: updatedAt }, { onConflict: 'occasion' })
  if (error) throw error
  return { data, updatedAt }
}

export function diff(values, defaults) {
  const out = {}
  for (const [k, v] of Object.entries(values)) {
    if (JSON.stringify(v) !== JSON.stringify(defaults[k])) out[k] = v
  }
  return out
}

/** Defaults with overrides on top; unknown keys and wrong types are ignored. */
export function mergeContent(defaults, overrides = {}) {
  const out = { ...defaults }
  for (const [k, v] of Object.entries(overrides)) {
    if (!(k in defaults)) continue
    if (Array.isArray(defaults[k]) !== Array.isArray(v)) continue
    out[k] = v
  }
  return out
}

/** Replaces {name} / {from} in every string (deeply) with the current names. */
export function fillNames(content) {
  const vars = { name: content.name, from: content.from }
  const fill = (v) => {
    if (typeof v === 'string') return v.replace(/\{(name|from)\}/g, (_, key) => vars[key] ?? '')
    if (Array.isArray(v)) return v.map(fill)
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fill(x)]))
    return v
  }
  return fill(content)
}
