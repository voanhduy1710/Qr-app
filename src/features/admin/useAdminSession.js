import { useEffect, useState } from 'react'
import { supabase } from '../../shared/lib/supabase'

const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL

// Admin rights come from app_metadata, which only the server can set.
const isAdmin = (session) => session?.user?.app_metadata?.role === 'admin'

/** `status` is 'loading' | 'signed-out' | 'admin'. */
export function useAdminSession() {
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (!supabase) {
      setStatus('signed-out')
      return undefined
    }
    supabase.auth.getSession().then(({ data }) => setStatus(isAdmin(data.session) ? 'admin' : 'signed-out'))
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(isAdmin(session) ? 'admin' : 'signed-out')
    })
    return () => data.subscription.unsubscribe()
  }, [])

  return status
}

/** Signs in by username; the password is checked (bcrypt) by Supabase Auth, never in the browser. */
export async function signIn(username, password) {
  if (!supabase) throw new Error('Supabase is not configured (.env)')
  if (!ADMIN_EMAIL || username.trim().toLowerCase() !== String(ADMIN_USERNAME).toLowerCase()) {
    throw new Error('Wrong username or password')
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password })
  if (error) throw new Error('Wrong username or password')
  if (!isAdmin(data.session)) {
    await supabase.auth.signOut()
    throw new Error('This account is not an admin')
  }
}

export function signOut() {
  return supabase?.auth.signOut()
}
