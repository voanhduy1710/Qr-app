function Gift({ box, ribbon, className }) {
  return (
    <svg className={`cake-gift ${className}`} viewBox="0 0 100 104" aria-hidden="true">
      <ellipse cx="50" cy="100" rx="44" ry="4" fill="rgba(0,0,0,0.35)" />
      <rect x="10" y="44" width="80" height="54" rx="4" fill={box} />
      <rect x="10" y="44" width="80" height="54" rx="4" fill="url(#gift-shade)" />
      <rect x="44" y="44" width="12" height="54" fill={ribbon} />
      <g className="cake-gift-lid">
        <rect x="4" y="32" width="92" height="16" rx="3" fill={box} />
        <rect x="4" y="32" width="92" height="16" rx="3" fill="url(#gift-shade)" opacity="0.6" />
        <rect x="44" y="32" width="12" height="16" fill={ribbon} />
        <path d="M50 32c-6-14-26-20-28-10s20 10 28 10z" fill={ribbon} />
        <path d="M50 32c6-14 26-20 28-10s-20 10-28 10z" fill={ribbon} />
        <circle cx="50" cy="31" r="5" fill={ribbon} />
      </g>
    </svg>
  )
}

export function Balloon({ color, className }) {
  return (
    <svg className={`cake-balloon ${className}`} viewBox="0 0 60 170" aria-hidden="true">
      <path d="M30 70c-6 20 8 36 0 56s6 30 0 44" fill="none" stroke="rgba(255,240,230,0.55)" strokeWidth="1.2" />
      <path d="M26 74h8l-4-7z" fill={color} />
      <ellipse cx="30" cy="36" rx="26" ry="32" fill={color} />
      <ellipse cx="20" cy="22" rx="6" ry="10" fill="rgba(255,255,255,0.35)" transform="rotate(-20 20 22)" />
    </svg>
  )
}

// Stickers that pop up beside the presents once the candle is out, three a side.
const STICKERS = [
  { src: '/gifs/kissy_face.gif', className: 'is-s1' },
  { src: '/gifs/bugcat-capoo.gif', className: 'is-s2' },
  { src: '/gifs/hatch.gif', className: 'is-s3' },
  { src: '/gifs/napoli_chatgpt.gif', className: 'is-s4' },
  { src: '/gifs/mentori.gif', className: 'is-s5' },
  { src: '/gifs/Sinister.gif', className: 'is-s6' },
]

/** Presents at the cake's feet and balloons floating behind it. */
export default function CakeDecor({ blown }) {
  return (
    <div className={`cake-decor${blown ? ' is-blown' : ''}`} aria-hidden="true">
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="gift-shade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity="0.18" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.08" />
            <stop offset="1" stopColor="#000" stopOpacity="0.22" />
          </linearGradient>
        </defs>
      </svg>

      <Balloon color="#f07a9a" className="is-b1" />
      <Balloon color="#f2c879" className="is-b2" />
      <Balloon color="#b99cf0" className="is-b3" />
      <Balloon color="#8fd0c4" className="is-b4" />

      <Gift box="#c0394f" ribbon="#f2c879" className="is-g1" />
      <Gift box="#f3e2c7" ribbon="#e48da3" className="is-g2" />
      <Gift box="#7a5cc0" ribbon="#ffd9e2" className="is-g3" />

      {blown &&
        STICKERS.map((s) => <img key={s.src} src={s.src} alt="" className={`cake-sticker ${s.className}`} draggable="false" />)}
    </div>
  )
}
