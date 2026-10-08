import { describe, expect, it } from 'vitest'
import { diff, fillNames, mergeContent } from './giftContent'

const defaults = { name: 'A', from: 'B', title: 'Hi {name}', list: ['x {from}'], cards: [{ t: '{name}' }] }

describe('gift content', () => {
  it('merges known keys with matching types only', () => {
    const merged = mergeContent(defaults, { name: 'C', list: 'nope', extra: 1 })
    expect(merged.name).toBe('C')
    expect(merged.list).toEqual(['x {from}'])
    expect(merged).not.toHaveProperty('extra')
  })

  it('fills {name} and {from} deeply', () => {
    const filled = fillNames(mergeContent(defaults, { name: 'Mẹ' }))
    expect(filled.title).toBe('Hi Mẹ')
    expect(filled.list).toEqual(['x B'])
    expect(filled.cards[0].t).toBe('Mẹ')
  })

  it('stores only fields that differ from the defaults', () => {
    expect(diff({ ...defaults, name: 'Z' }, defaults)).toEqual({ name: 'Z' })
  })
})
