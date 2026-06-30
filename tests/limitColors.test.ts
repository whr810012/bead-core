import { describe, expect, it } from 'vitest'
import { limitGridColors } from '../src/remap/limitColors.js'
import type { MappedGrid, PaletteEntry } from '../src/types.js'

const palette: PaletteEntry[] = [
  { id: 'a', hex: '#FF0000', codes: { MARD: 'A', COCO: 'A', MANMAN: 'A', PANPAN: 'A', MIXIAOWO: 'A' } },
  { id: 'b', hex: '#00FF00', codes: { MARD: 'B', COCO: 'B', MANMAN: 'B', PANPAN: 'B', MIXIAOWO: 'B' } },
  { id: 'c', hex: '#0000FF', codes: { MARD: 'C', COCO: 'C', MANMAN: 'C', PANPAN: 'C', MIXIAOWO: 'C' } },
  { id: 'd', hex: '#FFFF00', codes: { MARD: 'D', COCO: 'D', MANMAN: 'D', PANPAN: 'D', MIXIAOWO: 'D' } },
]

function gridFromIds(ids: string[][]): MappedGrid {
  return ids.map((row) =>
    row.map((id) => ({
      paletteId: id,
      hex: palette.find((p) => p.id === id)?.hex ?? '#000000',
      isExternal: false,
    })),
  )
}

describe('limitGridColors', () => {
  it('returns unchanged when maxColors is 0', () => {
    const grid = gridFromIds([
      ['a', 'b'],
      ['c', 'd'],
    ])
    expect(limitGridColors(grid, palette, 0)).toEqual(grid)
  })

  it('merges rare colors into top N', () => {
    const grid = gridFromIds([
      ['a', 'a', 'a', 'b'],
      ['a', 'c', 'd', 'd'],
    ])
    const limited = limitGridColors(grid, palette, 2)
    const used = new Set<string>()
    for (const row of limited) {
      for (const cell of row) {
        used.add(cell.paletteId)
      }
    }
    expect(used.size).toBeLessThanOrEqual(2)
    expect(used.has('a')).toBe(true)
  })
})
