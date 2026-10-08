import { forwardRef } from 'react'

/** Two-tier watercolour-ish cake. The flame is exposed through `flameRef` for effects. */
const Cake = forwardRef(function Cake({ flameScale = 1, lit = true }, flameRef) {
  return (
    <svg className="cake-svg" viewBox="0 0 240 250" aria-hidden="true">
      <defs>
        <radialGradient id="cake-glow">
          <stop offset="0" stopColor="#ffd27a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cake-flame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ff7a2f" />
          <stop offset="0.55" stopColor="#ffc24d" />
          <stop offset="1" stopColor="#fff3c4" />
        </linearGradient>
        <linearGradient id="cake-tier-top" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f6d3db" />
          <stop offset="0.5" stopColor="#fdeef1" />
          <stop offset="1" stopColor="#f3c9d3" />
        </linearGradient>
        <linearGradient id="cake-tier-bottom" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f1bfcc" />
          <stop offset="0.5" stopColor="#fbe1e7" />
          <stop offset="1" stopColor="#eeb5c4" />
        </linearGradient>
        <pattern id="cake-candle" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="8" height="8" fill="#fff8ef" />
          <rect width="3.5" height="8" fill="#f28fab" />
        </pattern>
      </defs>

      <circle cx="120" cy="34" r="70" fill="url(#cake-glow)" style={{ opacity: lit ? flameScale : 0, transition: 'opacity 600ms' }} />

      {/* plate */}
      <ellipse cx="120" cy="226" rx="112" ry="15" fill="#d9c6cf" />
      <ellipse cx="120" cy="222" rx="112" ry="15" fill="#f4ecef" />
      <path d="M102 236h36l8 12H94z" fill="#e6d8de" />

      {/* bottom tier */}
      <rect x="28" y="150" width="184" height="70" rx="10" fill="url(#cake-tier-bottom)" />
      <rect x="28" y="208" width="184" height="8" fill="#e7b85c" opacity="0.85" />
      <ellipse cx="120" cy="151" rx="92" ry="15" fill="#fff4f6" />
      <path
        d="M28 151c0 10 6 18 12 16s4-12 10-12 4 18 12 18 6-14 12-14 4 10 10 10 5-16 12-16 4 20 12 20 6-18 12-18 4 12 10 12 6-16 12-16 4 14 12 14 6-10 10-10 6 16 12 16 4-12 8-14v-6H28z"
        fill="#fff4f6"
      />
      {Array.from({ length: 13 }, (_, i) => (
        <circle key={i} cx={38 + i * 13.7} cy="204" r="2.4" fill="#fffaf2" />
      ))}

      {/* top tier */}
      <rect x="62" y="98" width="116" height="56" rx="8" fill="url(#cake-tier-top)" />
      <rect x="62" y="144" width="116" height="6" fill="#e7b85c" opacity="0.85" />
      <ellipse cx="120" cy="99" rx="58" ry="11" fill="#fffaf7" />
      <path
        d="M62 99c0 8 5 14 9 12s3-8 8-8 3 14 9 14 4-10 9-10 3 8 8 8 4-12 9-12 3 15 9 15 4-12 9-12 3 8 7 8 5-10 9-10 3 9 6 9v-6H62z"
        fill="#fffaf7"
      />

      {/* roses */}
      {[
        [56, 168, 1],
        [184, 172, 0.9],
        [150, 116, 0.75],
        [80, 120, 0.7],
      ].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <ellipse cx="-12" cy="6" rx="9" ry="4" fill="#9cc29a" transform="rotate(-25)" />
          <ellipse cx="12" cy="7" rx="9" ry="4" fill="#9cc29a" transform="rotate(25)" />
          <circle r="11" fill="#f0a3b5" />
          <circle r="7.5" fill="#e98aa1" />
          <circle r="3.5" fill="#d96f89" />
        </g>
      ))}

      {/* candle */}
      <rect x="114" y="44" width="12" height="56" rx="3" fill="url(#cake-candle)" />
      <path d="M120 44v-7" stroke="#3a2a20" strokeWidth="1.6" strokeLinecap="round" />

      <g
        ref={flameRef}
        className={`cake-flame${lit ? '' : ' is-out'}`}
        style={{ '--flame-scale': flameScale }}
      >
        <path d="M120 4c7 10 11 18 8 27-2 6-6 8-8 8s-6-2-8-8c-3-9 1-17 8-27z" fill="url(#cake-flame)" />
        <path d="M120 20c3 5 4 9 3 13-1 3-2 4-3 4s-2-1-3-4c-1-4 0-8 3-13z" fill="#fffbe8" />
      </g>
    </svg>
  )
})

export default Cake
