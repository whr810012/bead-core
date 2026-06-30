import type { PipelineOptions, PipelineResult } from '../types.js'
import { markExternalBackground } from '../background/floodFill.js'
import { convertImageToPattern } from '../conversion/convertImageToPattern.js'
import { mergeSimilarRegions } from '../merge/mergeRegions.js'
import { remapExcludedColors } from '../remap/excluded.js'
import { limitGridColors } from '../remap/limitColors.js'

export function runPipeline(
  pixels: Uint8ClampedArray,
  imgWidth: number,
  imgHeight: number,
  options: PipelineOptions,
): PipelineResult {
  let grid = convertImageToPattern(pixels, imgWidth, imgHeight, {
    gridWidth: options.gridWidth,
    mode: options.mode,
    palette: options.palette,
    excludedPaletteIds: options.excludedPaletteIds,
    despeckle: false,
  })

  grid = mergeSimilarRegions(grid, options.mergeThreshold)

  if (options.maxColors > 0) {
    grid = limitGridColors(grid, options.palette, options.maxColors)
  }

  grid = markExternalBackground(grid, options.backgroundPaletteIds)
  grid = remapExcludedColors(grid, options.palette, options.excludedPaletteIds)

  return {
    grid,
    width: grid[0]?.length ?? 0,
    height: grid.length,
  }
}
