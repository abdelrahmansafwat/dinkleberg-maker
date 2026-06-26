import { describe, it, expect } from 'vitest'
import { toCaption } from '../utils/caption'

describe('toCaption', () => {
  it('appends berg, uppercases, and adds the !! exclamation', () => {
    expect(toCaption('Smith')).toBe('SMITHBERG!!')
  })
  it('trims surrounding whitespace', () => {
    expect(toCaption('  Crocker  ')).toBe('CROCKERBERG!!')
  })
  it('works when the name already ends in berg', () => {
    expect(toCaption('Dinkle')).toBe('DINKLEBERG!!')
  })
  it('throws on empty input', () => {
    expect(() => toCaption('')).toThrow('empty name')
  })
  it('throws on whitespace-only input', () => {
    expect(() => toCaption('   ')).toThrow('empty name')
  })
})
