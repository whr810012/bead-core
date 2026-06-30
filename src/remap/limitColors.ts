import { colorDistance, hexToRgb } from '../color/oklab.js'
import type { MappedGrid, PaletteEntry } from '../types.js'

function countPaletteUsage(grid: MappedGrid): Map<string, number> {
  const counts = new Map<string, number>()
  for (const row of grid) {
    for (const cell of row) {
      if (cell.isExternal) continue
      counts.set(cell.paletteId, (counts.get(cell.paletteId) ?? 0) + 1)
    }
  }
  return counts
}

function nearestAmong(
  paletteId: string,
  hex: string,
  allowedIds: Set<string>,
  palette: PaletteEntry[],
): PaletteEntry {
  const target = hexToRgb(hex)
  if (!target) {
    const fallback = palette.find((p) => allowedIds.has(p.id))
    return fallback ?? palette[0]
  }

  let best = palette.find((p) => p.id === paletteId && allowedIds.has(p.id))
  let bestDist = best ? 0 : Infinity

  for (const entry of palette) {
    if (!allowedIds.has(entry.id)) continue
    const rgb = hexToRgb(entry.hex)
    if (!rgb) continue
    const dist = colorDistance(target, rgb)
    if (dist < bestDist) {
      bestDist = dist
      best = entry
    }
  }

  return best ?? palette[0]
}

/** 将 grid 中非背景格子的颜色种类压缩到 maxColors 以内（0 表示不限制） */
export function limitGridColors(
  grid: MappedGrid,
  palette: PaletteEntry[],
  maxColors: number,
): MappedGrid {
  if (maxColors <= 0) return grid

  const counts = countPaletteUsage(grid)
  if (counts.size <= maxColors) return grid

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
  const allowedIds = new Set(sorted.slice(0, maxColors).map(([id]) => id))

  return grid.map((row) =>
    row.map((cell) => {
      if (cell.isExternal || allowedIds.has(cell.paletteId)) {
        return { ...cell }
      }
      const nearest = nearestAmong(cell.paletteId, cell.hex, allowedIds, palette)
      return { paletteId: nearest.id, hex: nearest.hex, isExternal: false }
    }),
  )
}
