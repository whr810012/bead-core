import type { MappedGrid } from '../types.js'

function rowIsAllExternal(row: MappedGrid[number]): boolean {
  return row.every((cell) => cell.isExternal)
}

function colIsAllExternal(grid: MappedGrid, col: number): boolean {
  return grid.every((row) => row[col]?.isExternal)
}

/** 裁掉四周全部为 external 的行与列 */
export function trimGrid(grid: MappedGrid): MappedGrid {
  if (!grid.length || !grid[0]?.length) return grid

  let top = 0
  let bottom = grid.length - 1
  let left = 0
  let right = grid[0].length - 1

  while (top <= bottom && rowIsAllExternal(grid[top])) top++
  while (bottom >= top && rowIsAllExternal(grid[bottom])) bottom--
  while (left <= right && colIsAllExternal(grid, left)) left++
  while (right >= left && colIsAllExternal(grid, right)) right--

  if (top > bottom || left > right) return grid

  return grid.slice(top, bottom + 1).map((row) => row.slice(left, right + 1))
}

export function flipGridHorizontal(grid: MappedGrid): MappedGrid {
  return grid.map((row) => [...row].reverse())
}

export function flipGridVertical(grid: MappedGrid): MappedGrid {
  return [...grid].reverse()
}
