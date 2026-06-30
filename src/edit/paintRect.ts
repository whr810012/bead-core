import type { MappedGrid } from '../types.js'
import { cloneGrid } from '../pixelation/mapGrid.js'

export interface RectBounds {
  row0: number
  col0: number
  row1: number
  col1: number
}

export function normalizeRect(row0: number, col0: number, row1: number, col1: number): RectBounds {
  return {
    row0: Math.min(row0, row1),
    col0: Math.min(col0, col1),
    row1: Math.max(row0, row1),
    col1: Math.max(col0, col1),
  }
}

export function paintRect(
  grid: MappedGrid,
  row0: number,
  col0: number,
  row1: number,
  col1: number,
  paletteId: string,
  hex: string,
): MappedGrid {
  const result = cloneGrid(grid)
  const { row0: r0, col0: c0, row1: r1, col1: c1 } = normalizeRect(row0, col0, row1, col1)

  for (let row = r0; row <= r1; row++) {
    for (let col = c0; col <= c1; col++) {
      const cell = result[row]?.[col]
      if (!cell || cell.isExternal) continue
      result[row][col] = { paletteId, hex }
    }
  }

  return result
}
