import { useEffect, useState } from 'react'
import { fillNames, loadOverrides, mergeContent } from '../lib/giftContent'

// Never keep the recipient waiting on a slow network: fall back to defaults.
const TIMEOUT_MS = 2500

/** Page text for an occasion: defaults merged with admin overrides, names filled in. */
export function useGiftContent(occasion, defaults) {
  const [state, setState] = useState(() => ({ content: fillNames(defaults), ready: false }))

  useEffect(() => {
    let alive = true
    const finish = (overrides) => {
      if (!alive) return
      alive = false
      setState({ content: fillNames(mergeContent(defaults, overrides)), ready: true })
    }
    const timer = setTimeout(() => finish({}), TIMEOUT_MS)
    loadOverrides(occasion)
      .then(({ data }) => finish(data))
      .catch(() => finish({}))
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [occasion, defaults])

  return state
}
