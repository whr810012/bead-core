import { describe, expect, it } from 'vitest'
import { fillRegion } from '../src/edit/fillRegion.js'
import type { MappedGrid } from '../src/types.js'

function gridFromRows(rows: string[][]): MappedGrid {
  return rows.map((row) =>
    row.map((id) => ({
      paletteId: id,
      hex: id === 'ext' ? '#eee' : id === 'a' ? '#f00' : '#00f',
      isExternal: id === 'ext',
    })),
  )
}

describe('fillRegion', () => {
  it('fills connected region of same palette id', () => {
    const grid = gridFromRows([
      ['a', 'a', 'b'],
      ['a', 'b', 'b'],
      ['ext', 'b', 'b'],
    ])
    const filled = fillRegion(grid, 0, 0, 'c', '#0f0')
    expect(filled[0][0].paletteId).toBe('c')
    expect(filled[0][1].paletteId).toBe('c')
    expect(filled[1][0].paletteId).toBe('c')
    expect(filled[0][2].paletteId).toBe('b')
    expect(filled[2][0].isExternal).toBe(true)
  })

  it('does not fill external cells', () => {
    const grid = gridFromRows([['ext', 'a']])
    const filled = fillRegion(grid, 0, 1, 'c', '#0f0')
    expect(filled[0][1].paletteId).toBe('c')
  })
})
