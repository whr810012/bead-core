import type { LabColor } from '../color/ciede2000.js'
import { deltaE2000, getCachedLab } from '../color/ciede2000.js'
import { findClosestPaletteEntry } from '../color/palette.js'
import type { MappedCell, MappedGrid, PaletteEntry, PixelationMode, Rgb } from '../types.js'
import type { SampleGrid } from './resample.js'

export class PaletteMatcher {
  private readonly entries: PaletteEntry[]
  private readonly labs: LabColor[]

  constructor(entries: PaletteEntry[]) {
    this.entries = entries
    this.labs = entries.map((e) => {
      const hex = e.hex.replace('#', '')
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      return getCachedLab({ r, g, b })
    })
  }

  match(rgb: Rgb): PaletteEntry {
    if (this.entries.length === 1) return this.entries[0]

    const targetLab = getCachedLab(rgb)
    let bestIdx = 0
    let bestDist = Infinity

    for (let i = 0; i < this.entries.length; i++) {
      const dist = deltaE2000(targetLab, this.labs[i])
      if (dist < bestDist) {
        bestDist = dist
        bestIdx = i
        if (dist === 0) break
      }
    }

    return this.entries[bestIdx]
  }
}

export function quantizeSamplesToGrid(
  samples: SampleGrid,
  palette: PaletteEntry[],
  fallback: PaletteEntry,
  mode: PixelationMode,
): MappedGrid {
  const matcher = new PaletteMatcher(palette)
  const height = samples.length
  const width = samples[0]?.length ?? 0

  const grid: MappedGrid = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({
      paletteId: fallback.id,
      hex: fallback.hex,
    })),
  )

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const sample = samples[row][col]
      if (!sample) {
        grid[row][col] = { paletteId: fallback.id, hex: fallback.hex, isExternal: true }
        continue
      }
      const entry = matcher.match(sample)
      grid[row][col] = { paletteId: entry.id, hex: entry.hex }
    }
  }

  return grid
}

/** 去除孤立杂点：当前格与多数邻域不一致且无同色邻居时，改为主邻色 */
export function despeckleGridSimple(grid: MappedGrid): MappedGrid {
  const height = grid.length
  const width = grid[0]?.length ?? 0
  const result: MappedGrid = grid.map((row) => row.map((cell) => ({ ...cell })))
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]] as const

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const cell = result[row][col]
      if (cell.isExternal) continue

      const neighbors: MappedCell[] = []
      for (const [dr, dc] of dirs) {
        const nr = row + dr
        const nc = col + dc
        if (nr < 0 || nr >= height || nc < 0 || nc >= width) continue
        const n = result[nr][nc]
        if (!n.isExternal) neighbors.push(n)
      }
      if (neighbors.length < 3) continue

      const counts = new Map<string, { count: number; cell: MappedCell }>()
      for (const n of neighbors) {
        const prev = counts.get(n.paletteId)
        if (prev) prev.count++
        else counts.set(n.paletteId, { count: 1, cell: n })
      }

      let dominant: { count: number; cell: MappedCell } | null = null
      for (const v of counts.values()) {
        if (!dominant || v.count > dominant.count) dominant = v
      }
      if (!dominant || dominant.count < 3) continue
      if (cell.paletteId === dominant.cell.paletteId) continue

      const sameAsSelf = neighbors.filter((n) => n.paletteId === cell.paletteId).length
      if (sameAsSelf === 0) {
        result[row][col] = { paletteId: dominant.cell.paletteId, hex: dominant.cell.hex }
      }
    }
  }

  return result
}

export { findClosestPaletteEntry }
