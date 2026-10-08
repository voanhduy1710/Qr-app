// `dip` sets how deep the cleft between the lobes is (smaller = shallower).
function heartPoint(t, dip = 5) {
  return [
    16 * Math.sin(t) ** 3,
    -(13 * Math.cos(t) - dip * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
  ]
}

/**
 * `count` points along the heart outline, starting at the top dip and going
 * clockwise. Each axis is normalised to [-1, 1] on its own (y pointing down),
 * so the heart fills whatever box it is mapped onto.
 *
 * Options:
 * - `width` / `height`: the box the slots will be mapped onto, so spacing is
 *   even on screen even when the box is not square.
 * - `offset`: shift along the outline in slot steps; 0.5 puts a pair of slots
 *   either side of the dip instead of one slot in it.
 * - `dip`: cleft depth (see heartPoint).
 */
export function heartSlots(count, { width = 1, height = 1, offset = 0, dip = 5 } = {}) {
  if (count <= 0) return []
  const STEPS = 1440
  const raw = []
  for (let i = 0; i <= STEPS; i++) raw.push(heartPoint((i / STEPS) * Math.PI * 2, dip))
  const xs = raw.map((p) => p[0])
  const ys = raw.map((p) => p[1])
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2
  const halfX = (Math.max(...xs) - Math.min(...xs)) / 2
  const halfY = (Math.max(...ys) - Math.min(...ys)) / 2
  const norm = raw.map(([x, y]) => [(x - cx) / halfX, (y - cy) / halfY])

  const lengths = [0]
  for (let i = 1; i <= STEPS; i++) {
    const [ax, ay] = norm[i - 1]
    const [bx, by] = norm[i]
    lengths.push(lengths[i - 1] + Math.hypot((bx - ax) * width, (by - ay) * height))
  }
  const total = lengths[STEPS]
  const slots = []
  let j = 0
  for (let k = 0; k < count; k++) {
    const target = (((k + offset) / count) % 1) * total
    if (target < lengths[j]) j = 0
    while (lengths[j + 1] < target) j++
    slots.push(norm[j])
  }
  return slots
}

// Classic parametric heart, scaled so the shape spans roughly `size` px.
export function traceHeart(ctx, cx, cy, size) {
  const s = size / 34
  ctx.beginPath()
  for (let i = 0; i <= 120; i++) {
    const t = (i / 120) * Math.PI * 2
    const x = 16 * Math.sin(t) ** 3
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    if (i === 0) ctx.moveTo(cx + x * s, cy - y * s)
    else ctx.lineTo(cx + x * s, cy - y * s)
  }
  ctx.closePath()
}
