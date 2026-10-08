import { useSyncExternalStore } from 'react'

const query = '(prefers-reduced-motion: reduce)'
const subscribe = (cb) => {
  const mql = window.matchMedia(query)
  mql.addEventListener('change', cb)
  return () => mql.removeEventListener('change', cb)
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false)
}
