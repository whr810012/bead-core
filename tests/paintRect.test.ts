import { describe, expect, it } from 'vitest'
import { paintRect } from '../src/edit/paintRect.js'

describe('paintRect', () => {
  it('paints rectangle region', () => {
    const grid = [
      [
        { paletteId: 'a', hex: '#f00' },
        { paletteId: 'a', hex: '#f00' },
      ],
      [
        { paletteId: 'b', hex: '#00f' },
        { paletteId: 'ext', hex: '#eee', isExternal: true },
      ],
    ]
    const painted = paintRect(grid, 0, 0, 1, 0, 'c', '#0f0')
    expect(painted[0][0].paletteId).toBe('c')
    expect(painted[1][0].paletteId).toBe('c')
    expect(painted[0][1].paletteId).toBe('a')
    expect(painted[1][1].isExternal).toBe(true)
  })
})
