import { describe, expect, it } from 'vitest'
import { flipGridHorizontal, flipGridVertical, trimGrid } from '../src/edit/trimGrid.js'
import type { MappedGrid } from '../src/types.js'

function cell(id: string, external = false) {
  return { paletteId: id, hex: '#000000', isExternal: external }
}

describe('trimGrid', () => {
  it('removes empty external borders', () => {
    const grid: MappedGrid = [
      [cell('bg', true), cell('bg', true)],
      [cell('bg', true), cell('a')],
    ]
    const trimmed = trimGrid(grid)
    expect(trimmed.length).toBe(1)
    expect(trimmed[0].length).toBe(1)
    expect(trimmed[0][0].paletteId).toBe('a')
  })
})

describe('flipGrid', () => {
  it('flips horizontally', () => {
    const grid: MappedGrid = [[cell('a'), cell('b')]]
    expect(flipGridHorizontal(grid)[0].map((c) => c.paletteId)).toEqual(['b', 'a'])
  })

  it('flips vertically', () => {
    const grid: MappedGrid = [[cell('a')], [cell('b')]]
    expect(flipGridVertical(grid).map((row) => row[0].paletteId)).toEqual(['b', 'a'])
  })
})
