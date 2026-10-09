// Firework shapes. Each one is drawn as a filled silhouette on a 100 x 100
// canvas (white = shape, `cut` = holes such as eyes or windows); its outline is
// then sampled into evenly spaced points that the sparks fly out to.

const circle = (c, x, y, r) => {
  c.beginPath()
  c.arc(x, y, r, 0, Math.PI * 2)
  c.fill()
}
const ellipse = (c, x, y, rx, ry, rot = 0) => {
  c.beginPath()
  c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2)
  c.fill()
}
const poly = (c, pts) => {
  c.beginPath()
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)))
  c.closePath()
  c.fill()
}
const rect = (c, x, y, w, h, r = 0) => {
  c.beginPath()
  c.roundRect(x, y, w, h, r)
  c.fill()
}
// Everything drawn inside `fn` is cut out of the shape.
const cut = (c, fn) => {
  c.globalCompositeOperation = 'destination-out'
  fn()
  c.globalCompositeOperation = 'source-over'
}
const line = (c, pts, width) => {
  c.lineWidth = width
  c.lineCap = 'round'
  c.lineJoin = 'round'
  c.beginPath()
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)))
  c.stroke()
}
const wheels = (c, xs, y, r) => {
  xs.forEach((x) => circle(c, x, y, r))
  cut(c, () => xs.forEach((x) => circle(c, x, y, r * 0.45)))
}

const DRAW = {
  heart(c) {
    c.beginPath()
    for (let i = 0; i <= 120; i++) {
      const t = (i / 120) * Math.PI * 2
      const x = 16 * Math.sin(t) ** 3
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
      c.lineTo(50 + x * 2.8, 47 - y * 2.8)
    }
    c.fill()
  },
  star(c) {
    poly(c, Array.from({ length: 10 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5
      const r = i % 2 ? 19 : 46
      return [50 + Math.cos(a) * r, 54 + Math.sin(a) * r]
    }))
  },
  cat(c) {
    circle(c, 50, 56, 32)
    poly(c, [[22, 44], [24, 10], [46, 28]])
    poly(c, [[78, 44], [76, 10], [54, 28]])
    cut(c, () => {
      ellipse(c, 38, 52, 4.5, 7)
      ellipse(c, 62, 52, 4.5, 7)
      poly(c, [[46, 64], [54, 64], [50, 69]])
    })
  },
  dog(c) {
    circle(c, 50, 50, 30)
    ellipse(c, 20, 52, 11, 24, 0.25)
    ellipse(c, 80, 52, 11, 24, -0.25)
    ellipse(c, 50, 74, 16, 12)
    cut(c, () => {
      circle(c, 39, 46, 4.5)
      circle(c, 61, 46, 4.5)
      ellipse(c, 50, 66, 6, 4.5)
    })
  },
  bear(c) {
    circle(c, 24, 26, 13)
    circle(c, 76, 26, 13)
    circle(c, 50, 54, 34)
    cut(c, () => {
      circle(c, 24, 26, 5)
      circle(c, 76, 26, 5)
      circle(c, 38, 48, 4)
      circle(c, 62, 48, 4)
      ellipse(c, 50, 66, 11, 8)
    })
    ellipse(c, 50, 63, 4.5, 3.2)
  },
  panda(c) {
    circle(c, 22, 24, 12)
    circle(c, 78, 24, 12)
    circle(c, 50, 54, 34)
    cut(c, () => {
      ellipse(c, 36, 50, 8, 11, 0.6)
      ellipse(c, 64, 50, 8, 11, -0.6)
      ellipse(c, 50, 68, 5, 3.5)
    })
    circle(c, 37, 49, 2.6)
    circle(c, 63, 49, 2.6)
  },
  bird(c) {
    ellipse(c, 46, 58, 30, 21, -0.1)
    circle(c, 72, 38, 14)
    poly(c, [[83, 34], [97, 39], [84, 43]])
    poly(c, [[20, 52], [3, 40], [8, 62]])
    cut(c, () => {
      circle(c, 75, 35, 2.6)
      ellipse(c, 42, 56, 15, 8, -0.4)
    })
    ellipse(c, 42, 56, 9, 4, -0.4)
  },
  flower(c) {
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 5
      circle(c, 50 + Math.cos(a) * 22, 40 + Math.sin(a) * 22, 15)
    }
    rect(c, 48, 60, 4, 36, 2)
    ellipse(c, 62, 82, 10, 4.5, -0.6)
    cut(c, () => circle(c, 50, 40, 10))
    circle(c, 50, 40, 5)
  },
  football(c) {
    circle(c, 50, 50, 42)
    const pent = (cx, cy, r, rot) =>
      Array.from({ length: 5 }, (_, i) => {
        const a = rot + (i * Math.PI * 2) / 5
        return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
      })
    cut(c, () => {
      poly(c, pent(50, 50, 13, -Math.PI / 2))
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i * Math.PI * 2) / 5 + Math.PI / 5
        poly(c, pent(50 + Math.cos(a) * 30, 50 + Math.sin(a) * 30, 7.5, a + Math.PI))
      }
    })
  },
  car(c) {
    rect(c, 8, 48, 84, 22, 8)
    poly(c, [[24, 50], [34, 30], [68, 30], [80, 50]])
    cut(c, () => {
      poly(c, [[33, 48], [39, 35], [50, 35], [50, 48]])
      poly(c, [[54, 48], [54, 35], [65, 35], [73, 48]])
      circle(c, 28, 72, 11)
      circle(c, 72, 72, 11)
    })
    wheels(c, [28, 72], 72, 9)
  },
  bus(c) {
    rect(c, 6, 26, 88, 46, 8)
    cut(c, () => {
      for (let i = 0; i < 4; i++) rect(c, 12 + i * 17, 32, 13, 14, 2)
      rect(c, 82, 32, 8, 26, 2)
      circle(c, 26, 74, 10)
      circle(c, 74, 74, 10)
    })
    wheels(c, [26, 74], 74, 8)
  },
  tank(c) {
    rect(c, 8, 62, 84, 20, 10)
    poly(c, [[14, 62], [22, 50], [80, 50], [88, 62]])
    rect(c, 32, 36, 32, 16, 7)
    rect(c, 60, 40, 38, 6, 3)
    cut(c, () => [20, 35, 50, 65, 80].forEach((x) => circle(c, x, 72, 5)))
  },
  firetruck(c) {
    rect(c, 6, 46, 64, 26, 4)
    poly(c, [[70, 72], [70, 38], [84, 38], [94, 52], [94, 72]])
    c.strokeStyle = '#fff'
    line(c, [[10, 40], [66, 26]], 3)
    line(c, [[10, 46], [66, 32]], 3)
    for (let i = 0; i < 6; i++) line(c, [[14 + i * 9, 41 - i * 2.2], [14 + i * 9, 45 - i * 2.2]], 2.5)
    cut(c, () => {
      poly(c, [[74, 52], [74, 42], [82, 42], [89, 52]])
      circle(c, 22, 74, 10)
      circle(c, 80, 74, 10)
    })
    wheels(c, [22, 80], 74, 8)
  },
  ambulance(c) {
    rect(c, 6, 32, 62, 40, 6)
    poly(c, [[68, 72], [68, 42], [82, 42], [94, 56], [94, 72]])
    cut(c, () => {
      rect(c, 31, 40, 8, 24, 1)
      rect(c, 23, 48, 24, 8, 1)
      poly(c, [[72, 54], [72, 46], [80, 46], [87, 54]])
      circle(c, 24, 74, 10)
      circle(c, 78, 74, 10)
    })
    wheels(c, [24, 78], 74, 8)
  },
  plane(c) {
    ellipse(c, 50, 50, 44, 7)
    poly(c, [[44, 46], [30, 14], [38, 14], [62, 46]])
    poly(c, [[44, 54], [30, 86], [38, 86], [62, 54]])
    poly(c, [[10, 46], [4, 30], [12, 30], [22, 46]])
    cut(c, () => [62, 70, 78].forEach((x) => circle(c, x, 49, 2)))
  },
  sakura(c) {
    // Crown of blossom clouds on a forked trunk.
    ;[[50, 26, 20], [30, 36, 17], [70, 36, 17], [22, 52, 13], [78, 52, 13], [40, 48, 16], [60, 48, 16]].forEach(([x, y, r]) =>
      circle(c, x, y, r),
    )
    c.strokeStyle = '#fff'
    line(c, [[50, 96], [50, 66], [40, 54]], 8)
    line(c, [[50, 70], [62, 56]], 6)
    rect(c, 32, 92, 36, 5, 2)
    cut(c, () => [[50, 30], [30, 40], [70, 40]].forEach(([x, y]) => circle(c, x, y, 3.5)))
  },
}

export const SHAPES = Object.keys(DRAW)

const cache = new Map()

/** Outline points of a shape, centred, in [-1, 1] (y down), roughly `count` of them. */
export function shapePoints(name, count = 130) {
  const key = `${name}:${count}`
  if (cache.has(key)) return cache.get(key)
  const N = 160
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = N
  const c = canvas.getContext('2d', { willReadFrequently: true })
  c.scale(N / 100, N / 100)
  c.fillStyle = '#fff'
  DRAW[name](c)
  const { data } = c.getImageData(0, 0, N, N)
  const on = (x, y) => x >= 0 && y >= 0 && x < N && y < N && data[(y * N + x) * 4 + 3] > 128
  const edge = []
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (on(x, y) && (!on(x - 1, y) || !on(x + 1, y) || !on(x, y - 1) || !on(x, y + 1))) edge.push([x, y])
    }
  }
  // Keep evenly spaced edge points: a fixed spacing chosen so about `count` survive.
  let spacing = Math.sqrt(edge.length / count) * 1.6
  let picked = []
  for (let attempt = 0; attempt < 6; attempt++) {
    picked = []
    const grid = new Map()
    const cell = (x, y) => `${Math.floor(x / spacing)},${Math.floor(y / spacing)}`
    for (const [x, y] of edge) {
      const gx = Math.floor(x / spacing)
      const gy = Math.floor(y / spacing)
      let near = false
      for (let dy = -1; dy <= 1 && !near; dy++) {
        for (let dx = -1; dx <= 1 && !near; dx++) {
          for (const [px, py] of grid.get(`${gx + dx},${gy + dy}`) ?? []) {
            if ((px - x) ** 2 + (py - y) ** 2 < spacing * spacing) {
              near = true
              break
            }
          }
        }
      }
      if (near) continue
      picked.push([x, y])
      const k = cell(x, y)
      grid.set(k, [...(grid.get(k) ?? []), [x, y]])
    }
    if (Math.abs(picked.length - count) < count * 0.15) break
    spacing *= Math.sqrt(picked.length / count)
  }
  const xs = picked.map((p) => p[0])
  const ys = picked.map((p) => p[1])
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2
  const half = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2
  const pts = picked.map(([x, y]) => [(x - cx) / half, (y - cy) / half])
  cache.set(key, pts)
  return pts
}
