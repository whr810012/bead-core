import type { MappedGrid, PipelineOptions } from '../types.js'
import { convertImageToPattern } from '../conversion/convertImageToPattern.js'

export { convertImageToPattern } from '../conversion/convertImageToPattern.js'

export function mapImageToGrid(
  pixels: Uint8ClampedArray,
  imgWidth: number,
  imgHeight: number,
  options: Pick<PipelineOptions, 'gridWidth' | 'mode' | 'palette' | 'excludedPaletteIds'>,
): MappedGrid {
  return convertImageToPattern(pixels, imgWidth, imgHeight, options)
}

export function cloneGrid(grid: MappedGrid): MappedGrid {
  return grid.map((row) => row.map((cell) => ({ ...cell })))
}

export function gridDimensions(grid: MappedGrid): { width: number; height: number } {
  return { width: grid[0]?.length ?? 0, height: grid.length }
}
