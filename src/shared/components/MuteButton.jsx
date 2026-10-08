import { useSyncExternalStore } from 'react'
import { isMuted, setMuted, subscribeMuted } from '../lib/audio'

export default function MuteButton() {
  const muted = useSyncExternalStore(subscribeMuted, isMuted)
  return (
    <button
      type="button"
      className="mute-btn"
      onClick={() => setMuted(!muted)}
      aria-label={muted ? 'Bật nhạc' : 'Tắt nhạc'}
      aria-pressed={muted}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 9.5h3.5L12 5v14l-4.5-4.5H4z" />
        {muted ? <path d="M16 9.5l5 5m0-5l-5 5" /> : <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" />}
      </svg>
    </button>
  )
}
