import { describe, it, expect } from 'vitest'
import { layoutCaption } from '../utils/layout'

// Fake proportional measurer: width = chars * fontSize * 0.5
const measure = (t: string, size: number) => t.length * size * 0.5

describe('layoutCaption', () => {
  it('uses max font size when text fits on one line', () => {
    // "HI..." = 5 chars; at 64px → 160px wide, fits in 1000
    const r = layoutCaption('HI...', 1000, measure)
    expect(r.fontSize).toBe(64)
    expect(r.lines).toEqual(['HI...'])
  })

  it('shrinks the font to fit a single line', () => {
    // 20 chars at 64px = 640px > 300; must shrink
    const text = 'A'.repeat(20)
    const r = layoutCaption(text, 300, measure, { minFontSize: 10 })
    expect(r.lines).toEqual([text])
    expect(measure(text, r.fontSize)).toBeLessThanOrEqual(300)
    expect(r.fontSize).toBeLessThan(64)
  })

  it('wraps to two lines when it cannot fit at min font size', () => {
    // Two long words that cannot share a line at minFontSize
    const r = layoutCaption('AAAAAAAAAA BBBBBBBBBB', 120, measure, {
      minFontSize: 20,
      maxLines: 2,
    })
    expect(r.fontSize).toBe(20)
    expect(r.lines.length).toBe(2)
    expect(r.lines[0]).toBe('AAAAAAAAAA')
    expect(r.lines[1]).toBe('BBBBBBBBBB')
  })
})
