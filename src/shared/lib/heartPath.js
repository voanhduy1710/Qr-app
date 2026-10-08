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
 * - `card`: [w, h] of the cards placed on the slots, in box units. When given,
 *   slots are nudged so neighbouring cards are equally far apart (arc length
 *   alone crowds them at the sharp dip and tip). Slot 0 stays on the dip and,
 *   for an even count, the middle slot stays on the tip.
 */
export function heartSlots(count, { width = 1, height = 1, offset = 0, dip = 5, card } = {}) {
  if (count <= 0) return []
  const STEPS = 1440
  const raw = []
  for (let i = 0; i < STEPS; i++) raw.push(heartPoint((i / STEPS) * Math.PI * 2, dip))
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
    const [bx, by] = norm[i % STEPS]
    lengths.push(lengths[i - 1] + Math.hypot((bx - ax) * width, (by - ay) * height))
  }
  const total = lengths[STEPS]
  // Position along the outline (0..1 of its length) -> point.
  let j = 0
  const at = (u) => {
    const target = (((u % 1) + 1) % 1) * total
    if (target < lengths[j]) j = 0
    while (lengths[j + 1] < target) j++
    return norm[j % STEPS]
  }

  let u = Array.from({ length: count }, (_, k) => (k + offset) / count)

  if (card && count > 2) {
    const [cw, ch] = card
    // How far apart two cards are, in card sizes (1 = just touching).
    const gap = ([ax, ay], [bx, by]) =>
      Math.max((Math.abs(ax - bx) * width) / 2 / cw, (Math.abs(ay - by) * height) / 2 / ch)
    for (let it = 0; it < 400; it++) {
      const pts = u.map(at)
      const g = pts.map((p, k) => gap(p, pts[(k + 1) % count]))
      const next = u.map((v, k) => v + 0.002 * (g[k] - g[(k - 1 + count) % count]))
      next[0] = 0
      if (count % 2 === 0) next[count / 2] = 0.5
      // Keep the heart mirror-symmetric.
      for (let k = 1; k < Math.ceil(count / 2); k++) {
        const m = (next[k] + (1 - next[count - k])) / 2
        next[k] = m
        next[count - k] = 1 - m
      }
      u = next
    }
  }
  return u.map(at)
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
