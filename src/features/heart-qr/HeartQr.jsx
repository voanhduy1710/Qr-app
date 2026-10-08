import { forwardRef, useId, useMemo } from 'react'
import { buildHeartQr, HEART_ROTATION } from './buildHeartQr'

export const QR_RED = '#d90429'

/** Heart-shaped QR as an SVG: red modules on a white heart plate. */
const HeartQr = forwardRef(function HeartQr({ text, color = QR_RED, className, title }, ref) {
  const clipId = useId()
  const geom = useMemo(() => buildHeartQr(text), [text])
  const { n, margin, lobes, viewBox: vb } = geom

  return (
    <svg
      ref={ref}
      className={className}
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      {title && <title>{title}</title>}
      <defs>
        <clipPath id={clipId}>
          {lobes.map((l) => (
            <circle key={`${l.cx}-${l.cy}`} cx={l.cx} cy={l.cy} r={l.r} />
          ))}
        </clipPath>
      </defs>
      <g transform={`rotate(${HEART_ROTATION}) translate(${-n / 2} ${-n / 2})`}>
        {/* Stroking the outline by the margin gives the quiet zone round corners. */}
        <g fill="#fff" stroke="#fff" strokeWidth={margin * 2} strokeLinejoin="round">
          <rect x="0" y="0" width={n} height={n} />
          {lobes.map((l) => (
            <circle key={`${l.cx}-${l.cy}`} cx={l.cx} cy={l.cy} r={l.r} />
          ))}
        </g>
        <g fill={color} stroke={color} strokeWidth="0.04">
          <path d={geom.qrPath} />
          <path d={geom.lobePath} clipPath={`url(#${clipId})`} />
        </g>
      </g>
    </svg>
  )
})

export default HeartQr

/** Renders an SVG element to a PNG blob (transparent background). */
export async function svgToPngBlob(svg, size = 1600) {
  const clone = svg.cloneNode(true)
  const [, , w, h] = svg.getAttribute('viewBox').split(' ').map(Number)
  const width = size
  const height = Math.round((size * h) / w)
  clone.setAttribute('width', width)
  clone.setAttribute('height', height)
  const markup = new XMLSerializer().serializeToString(clone)
  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }))
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').drawImage(img, 0, 0, width, height)
    return await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  } finally {
    URL.revokeObjectURL(url)
  }
}
