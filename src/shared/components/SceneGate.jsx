import { unlockAudio } from '../lib/audio'
import './scene-gate.css'

/** Full-screen "tap to open" cover; the tap also unlocks audio playback. */
export default function SceneGate({ title, subtitle = 'Chạm để mở quà', onOpen, className = 'scene' }) {
  return (
    <button
      type="button"
      className={`${className} gate`}
      onClick={() => {
        unlockAudio()
        onOpen()
      }}
    >
      <span className="gate-heart" aria-hidden="true">
        <svg viewBox="0 0 32 32">
          <path d="M16 29 3.6 16.6a7.4 7.4 0 0 1 10.5-10.5L16 8l1.9-1.9a7.4 7.4 0 0 1 10.5 10.5Z" />
        </svg>
      </span>
      <span className="script-title gate-title">{title}</span>
      <span className="hint gate-sub">{subtitle}</span>
    </button>
  )
}
