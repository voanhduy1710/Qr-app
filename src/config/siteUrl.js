/* global __LAN_HOST__ */

// Base URL the QR codes point at. Priority:
// 1. VITE_SITE_URL (pin a canonical domain once it exists)
// 2. LAN address when the app is opened on localhost in dev, so phones can scan
// 3. Wherever the app is currently served from
export function getSiteUrl() {
  const pinned = import.meta.env.VITE_SITE_URL
  if (pinned) return pinned.replace(/\/+$/, '')

  const { protocol, hostname, port, origin } = window.location
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1'
  if (isLocal && typeof __LAN_HOST__ === 'string' && __LAN_HOST__) {
    return `${protocol}//${__LAN_HOST__}${port ? `:${port}` : ''}`
  }
  return origin
}
