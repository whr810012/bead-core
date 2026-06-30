import type { MappedCell, MappedGrid } from '../types.js'
import { colorDistance, hexToRgb } from '../color/oklab.js'

const NEIGHBORS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
]

function cellsSimilar(a: MappedCell, b: MappedCell, threshold: number): boolean {
  if (a.isExternal || b.isExternal) return false
  const rgbA = hexToRgb(a.hex)
  const rgbB = hexToRgb(b.hex)
  if (!rgbA || !rgbB) return false
  return colorDistance(rgbA, rgbB) <= threshold
}

export function mergeSimilarRegions(grid: MappedGrid, threshold: number): MappedGrid {
  if (threshold <= 0) {
    return grid.map((row) => row.map((cell) => ({ ...cell })))
  }

  const height = grid.length
  const width = grid[0]?.length ?? 0
  const result: MappedGrid = grid.map((row) => row.map((cell) => ({ ...cell })))
  const visited = Array.from({ length: height }, () => Array(width).fill(false))

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      if (visited[row][col]) continue
      const seed = result[row][col]
      if (seed.isExternal) {
        visited[row][col] = true
        continue
      }

      const stack: Array<[number, number]> = [[row, col]]
      const region: Array<[number, number]> = []
      visited[row][col] = true

      while (stack.length > 0) {
        const [r, c] = stack.pop()!
        region.push([r, c])

        for (const [dr, dc] of NEIGHBORS) {
          const nr = r + dr
          const nc = c + dc
          if (nr < 0 || nr >= height || nc < 0 || nc >= width || visited[nr][nc]) continue
          if (!cellsSimilar(result[r][c], result[nr][nc], threshold)) continue
          visited[nr][nc] = true
          stack.push([nr, nc])
        }
      }

      const counts = new Map<string, number>()
      for (const [r, c] of region) {
        const cell = result[r][c]
        counts.set(cell.paletteId, (counts.get(cell.paletteId) ?? 0) + 1)
      }

      let dominantId = seed.paletteId
      let maxCount = 0
      for (const [id, count] of counts) {
        if (count > maxCount) {
          maxCount = count
          dominantId = id
        }
      }

      const dominantCell = region
        .map(([r, c]) => result[r][c])
        .find((cell) => cell.paletteId === dominantId) ?? seed

      for (const [r, c] of region) {
        result[r][c] = { paletteId: dominantCell.paletteId, hex: dominantCell.hex }
      }
    }
  }

  return result
}
