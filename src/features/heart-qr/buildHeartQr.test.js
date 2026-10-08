import jsQR from 'jsqr'
import { describe, expect, it } from 'vitest'
import { buildHeartQr, outputToQr } from './buildHeartQr'

const URLS = [
  'https://qr-trai-tim-app.vercel.app/birthday',
  'https://qr-trai-tim-app.vercel.app/anniversary',
  'http://192.168.1.25:5176/birthday',
]

// Paints the heart the same way the SVG does: red modules on a white heart
// plate, black page around it.
function rasterize(geom, pxPerModule) {
  const { viewBox } = geom
  const width = Math.ceil(viewBox.w * pxPerModule)
  const height = Math.ceil(viewBox.h * pxPerModule)
  const pixels = new Uint8ClampedArray(width * height * 4)
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const ox = viewBox.x + (px + 0.5) / pxPerModule
      const oy = viewBox.y + (py + 0.5) / pxPerModule
      const [x, y] = outputToQr(geom, ox, oy)
      let rgb = [0, 0, 0]
      if (geom.onPlate(x, y)) rgb = geom.darkAt(x, y) ? [217, 4, 41] : [255, 255, 255]
      const i = (py * width + px) * 4
      pixels.set([...rgb, 255], i)
    }
  }
  return { pixels, width, height }
}

describe('buildHeartQr', () => {
  it.each(URLS)('decodes back to %s', (url) => {
    const geom = buildHeartQr(url)
    for (const scale of [6, 10]) {
      const { pixels, width, height } = rasterize(geom, scale)
      expect(jsQR(pixels, width, height)?.data).toBe(url)
    }
  })

  it('keeps the real code untouched and the gap band empty', () => {
    const geom = buildHeartQr(URLS[0])
    const { n, gap } = geom
    for (let r = -gap; r < n + gap; r++) {
      for (let c = -gap; c < n + gap; c++) {
        expect(geom.isLobeDark(c, r)).toBe(false)
      }
    }
    expect(geom.lobeCount).toBeGreaterThan(n * 4)
  })

  it('places decoration only on the two upper (bottom/right in QR space) sides', () => {
    const geom = buildHeartQr(URLS[0])
    const { n } = geom
    for (let r = -10; r < n + n; r++) {
      for (let c = -10; c < n + n; c++) {
        if (!geom.isLobeDark(c, r)) continue
        expect(c >= n || r >= n).toBe(true)
        // The corner region outside both lobes is the heart's cleft.
        expect(c >= n + 1 && r >= n + 1 && Math.hypot(c - n, r - n) < 2).toBe(false)
      }
    }
  })

  it('is deterministic for the same text', () => {
    expect(buildHeartQr(URLS[0]).lobePath).toBe(buildHeartQr(URLS[0]).lobePath)
    expect(buildHeartQr(URLS[0]).lobePath).not.toBe(buildHeartQr(URLS[1]).lobePath)
  })
})
