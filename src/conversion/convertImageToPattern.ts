import type { MappedGrid, PaletteEntry, PixelationMode } from '../types.js'
import { filterActivePalette } from '../color/palette.js'
import { preprocessForConversion } from './enhance.js'
import { resampleImageToGrid } from './resample.js'
import { despeckleGridSimple, quantizeSamplesToGrid } from './quantize.js'

export interface ConvertImageOptions {
  gridWidth: number
  mode: PixelationMode
  palette: PaletteEntry[]
  excludedPaletteIds: string[]
  /** 照片模式下去除孤立杂点，默认关闭（易抹细线） */
  despeckle?: boolean
}

/**
 * 图片转拼豆图纸 — 独立转换引擎
 *
 * 1. 预处理（照片轻锐化）
 * 2. 保边自适应降采样
 * 3. CIEDE2000 感知配色
 */
export function convertImageToPattern(
  pixels: Uint8ClampedArray,
  imgWidth: number,
  imgHeight: number,
  options: ConvertImageOptions,
): MappedGrid {
  const { gridWidth, mode, palette, excludedPaletteIds, despeckle = false } = options
  const gridHeight = Math.max(1, Math.round((gridWidth * imgHeight) / imgWidth))
  const excluded = new Set(excludedPaletteIds)
  const activePalette = filterActivePalette(palette, excluded)
  const fallback = activePalette[0] ?? palette[0]

  if (activePalette.length === 0) {
    return Array.from({ length: gridHeight }, () =>
      Array.from({ length: gridWidth }, () => ({
        paletteId: fallback.id,
        hex: fallback.hex,
        isExternal: true,
      })),
    )
  }

  const prepared = preprocessForConversion(pixels, imgWidth, imgHeight, mode)
  const samples = resampleImageToGrid(
    prepared,
    imgWidth,
    imgHeight,
    gridWidth,
    gridHeight,
    mode,
  )

  let grid = quantizeSamplesToGrid(samples, activePalette, fallback, mode)

  if (despeckle && mode === 'average') {
    grid = despeckleGridSimple(grid)
  }

  return grid
}
