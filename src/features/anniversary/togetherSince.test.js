import { describe, expect, it } from 'vitest'
import { togetherSince } from './togetherSince'

describe('togetherSince', () => {
  it('counts whole days and a calendar breakdown', () => {
    expect(togetherSince('2024-02-14', new Date(2026, 9, 8, 12))).toEqual({
      days: 967,
      years: 2,
      months: 7,
      rest: 24,
    })
  })

  it('handles exact anniversaries', () => {
    expect(togetherSince('2025-10-08', new Date(2026, 9, 8, 9))).toMatchObject({ years: 1, months: 0, rest: 0 })
  })

  it('never goes negative for future dates', () => {
    expect(togetherSince('2030-01-01', new Date(2026, 0, 1))).toEqual({ days: 0, years: 0, months: 0, rest: 0 })
  })
})
