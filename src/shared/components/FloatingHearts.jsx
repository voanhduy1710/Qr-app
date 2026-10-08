import { useMemo } from 'react'
import './floating-hearts.css'

/** Hearts (or petals) drifting upward behind the content. Pure CSS animation. */
export default function FloatingHearts({ count = 14, color = '#ff8fab', variant = 'heart' }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 10 + Math.random() * 16,
        duration: 9 + Math.random() * 10,
        delay: -Math.random() * 18,
        sway: (Math.random() - 0.5) * 80,
        opacity: 0.25 + Math.random() * 0.5,
      })),
    [count],
  )

  return (
    <div className={`floaters floaters-${variant}`} aria-hidden="true">
      {items.map((it) => (
        <span
          key={it.id}
          style={{
            left: `${it.left}%`,
            width: it.size,
            height: it.size,
            animationDuration: `${it.duration}s`,
            animationDelay: `${it.delay}s`,
            '--sway': `${it.sway}px`,
            '--alpha': it.opacity,
            color,
          }}
        >
          <svg viewBox="0 0 32 32">
            {variant === 'petal' ? (
              <path d="M16 2C9 9 7 18 16 30 25 18 23 9 16 2Z" />
            ) : (
              <path d="M16 29 3.6 16.6a7.4 7.4 0 0 1 10.5-10.5L16 8l1.9-1.9a7.4 7.4 0 0 1 10.5 10.5Z" />
            )}
          </svg>
        </span>
      ))}
    </div>
  )
}
