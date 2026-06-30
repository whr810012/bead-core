import type { MappedGrid } from '../types.js'

const NEIGHBORS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
]

export function markExternalBackground(
  grid: MappedGrid,
  backgroundPaletteIds: string[],
): MappedGrid {
  const backgroundSet = new Set(backgroundPaletteIds)
  if (backgroundSet.size === 0) {
    return grid.map((row) => row.map((cell) => ({ ...cell })))
  }

  const height = grid.length
  const width = grid[0]?.length ?? 0
  const result: MappedGrid = grid.map((row) => row.map((cell) => ({ ...cell })))
  const visited = Array.from({ length: height }, () => Array(width).fill(false))

  const isBackgroundCell = (row: number, col: number) =>
    backgroundSet.has(result[row][col].paletteId) && !result[row][col].isExternal

  const floodFrom = (startRow: number, startCol: number) => {
    if (visited[startRow][startCol] || !isBackgroundCell(startRow, startCol)) return
    const stack: Array<[number, number]> = [[startRow, startCol]]
    visited[startRow][startCol] = true

    while (stack.length > 0) {
      const [row, col] = stack.pop()!
      result[row][col] = { ...result[row][col], isExternal: true }

      for (const [dr, dc] of NEIGHBORS) {
        const nr = row + dr
        const nc = col + dc
        if (nr < 0 || nr >= height || nc < 0 || nc >= width || visited[nr][nc]) continue
        if (!isBackgroundCell(nr, nc)) continue
        visited[nr][nc] = true
        stack.push([nr, nc])
      }
    }
  }

  for (let col = 0; col < width; col++) {
    floodFrom(0, col)
    floodFrom(height - 1, col)
  }
  for (let row = 0; row < height; row++) {
    floodFrom(row, 0)
    floodFrom(row, width - 1)
  }

  return result
}
