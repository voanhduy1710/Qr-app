import QRCode from 'qrcode'
import { hashString, mulberry32 } from '../../shared/lib/rng'

// Turning the QR 225° clockwise points its finder-free corner (bottom-right)
// straight up, so that corner becomes the heart's cleft and the three finder
// patterns sit at the left, right and bottom tip, like the reference image.
export const HEART_ROTATION = 225

/**
 * Builds the geometry of a heart-shaped QR code, all in QR module units.
 *
 * The heart is a QR rotated into a diamond plus two semicircle lobes resting
 * on its two upper edges. Lobes carry seeded decorative modules; a `gap` band
 * around the real code stays empty so scanners still see clean finder and
 * timing patterns, and the white plate extends `margin` modules past the
 * outline to act as the quiet zone.
 */
export function buildHeartQr(text, { gap = 1, margin = 1, density = 0.5, seed } = {}) {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'H' })
  const n = qr.modules.size
  const data = qr.modules.data
  const isQrDark = (c, r) => c >= 0 && r >= 0 && c < n && r < n && data[r * n + c] === 1

  // Lobes sit on the bottom and right sides: the two sides that meet at the
  // finder-free corner.
  const radius = n / 2
  const lobes = [
    { cx: n / 2, cy: n, r: radius },
    { cx: n, cy: n / 2, r: radius },
  ]
  const inLobe = (x, y, pad = 0) =>
    lobes.some(({ cx, cy, r }) => (x - cx) ** 2 + (y - cy) ** 2 <= (r + pad) ** 2)

  const rand = mulberry32(seed ?? hashString(text))
  const lobeDark = new Set()
  const reach = Math.ceil(n + radius) + 1
  for (let r = -1; r <= reach; r++) {
    for (let c = -1; c <= reach; c++) {
      if (c >= -gap && c < n + gap && r >= -gap && r < n + gap) continue
      // Cells clipped by the lobe outline still count; the SVG clips them round.
      if (!inLobe(c + 0.5, r + 0.5, Math.SQRT1_2)) continue
      if (rand() < density) lobeDark.add(`${c},${r}`)
    }
  }
  const isLobeDark = (c, r) => lobeDark.has(`${c},${r}`)

  // Extent of the rotated shape around the QR centre (see docs/PLAN.md §2):
  // lobe centres sit n/2 from the centre at ±45° above it.
  const lobeReach = (Math.SQRT1_2 * n) / 2 + radius + margin
  const tipReach = Math.SQRT1_2 * n + margin
  const pad = 1
  const viewBox = {
    x: -lobeReach - pad,
    y: -lobeReach - pad,
    w: 2 * (lobeReach + pad),
    h: lobeReach + tipReach + 2 * pad,
  }

  return {
    text,
    n,
    gap,
    margin,
    lobes,
    viewBox,
    isQrDark,
    isLobeDark,
    lobeCount: lobeDark.size,
    qrPath: runsPath(0, n, 0, n, isQrDark),
    lobePath: runsPath(-1, reach + 1, -1, reach + 1, isLobeDark),
    /** True when a point in QR coordinates lies on the white plate. */
    onPlate(x, y) {
      const dx = Math.max(0, -x, x - n)
      const dy = Math.max(0, -y, y - n)
      return Math.hypot(dx, dy) <= margin || inLobe(x, y, margin)
    },
    /** True when a point in QR coordinates should be painted as a dark module. */
    darkAt(x, y) {
      const c = Math.floor(x)
      const r = Math.floor(y)
      if (isQrDark(c, r)) return true
      return isLobeDark(c, r) && inLobe(x, y)
    },
  }
}

// One subpath per horizontal run of dark cells keeps the path short and avoids
// hairline seams between neighbouring modules once the group is rotated.
function runsPath(c0, c1, r0, r1, isDark) {
  let d = ''
  for (let r = r0; r < r1; r++) {
    let c = c0
    while (c < c1) {
      if (!isDark(c, r)) {
        c++
        continue
      }
      const start = c
      while (c < c1 && isDark(c, r)) c++
      d += `M${start} ${r}h${c - start}v1h${start - c}z`
    }
  }
  return d
}

/** Maps a point from output (rotated, centred) space back to QR coordinates. */
export function outputToQr(geom, x, y) {
  const a = (-HEART_ROTATION * Math.PI) / 180
  const cos = Math.cos(a)
  const sin = Math.sin(a)
  return [x * cos - y * sin + geom.n / 2, x * sin + y * cos + geom.n / 2]
}
