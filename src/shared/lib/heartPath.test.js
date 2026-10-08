import { describe, expect, it } from 'vitest'
import { heartSlots } from './heartPath'

describe('heartSlots', () => {
  it('returns the requested number of slots', () => {
    expect(heartSlots(0)).toEqual([])
    expect(heartSlots(16)).toHaveLength(16)
  })

  it('keeps every slot inside the unit box', () => {
    for (const [x, y] of heartSlots(16)) {
      expect(Math.abs(x)).toBeLessThanOrEqual(1)
      expect(Math.abs(y)).toBeLessThanOrEqual(1)
    }
  })

  it('starts at the top dip and puts the tip at the bottom', () => {
    const slots = heartSlots(16)
    expect(slots[0][0]).toBeCloseTo(0)
    expect(slots[0][1]).toBeLessThan(0)
    // Halfway round the outline is the bottom tip.
    expect(slots[8][0]).toBeCloseTo(0, 1)
    expect(slots[8][1]).toBeGreaterThan(0.85)
  })

  it('with a half-step offset, flanks the dip with a mirrored pair', () => {
    for (const n of [16, 20]) {
      const slots = heartSlots(n, { width: 500, height: 450, offset: 0.5, dip: 3 })
      const [first, last] = [slots[0], slots[n - 1]]
      expect(first[0]).toBeGreaterThan(0.05)
      expect(last[0]).toBeCloseTo(-first[0], 2)
      expect(last[1]).toBeCloseTo(first[1], 2)
    }
  })

  it('spaces neighbours roughly evenly', () => {
    const slots = heartSlots(16)
    const gaps = slots.map(([x, y], i) => {
      const [nx, ny] = slots[(i + 1) % slots.length]
      return Math.hypot(nx - x, ny - y)
    })
    expect(Math.max(...gaps) / Math.min(...gaps)).toBeLessThan(1.6)
  })
})
