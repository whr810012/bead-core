import type { PixelationMode, Rgb } from '../types.js'

export type SampleGrid = (Rgb | null)[][]

function cellBounds(
  imgWidth: number,
  imgHeight: number,
  gridWidth: number,
  gridHeight: number,
  col: number,
  row: number,
): { x0: number; y0: number; x1: number; y1: number } {
  const x0 = Math.floor((col * imgWidth) / gridWidth)
  const y0 = Math.floor((row * imgHeight) / gridHeight)
  const x1 = Math.min(imgWidth, Math.ceil(((col + 1) * imgWidth) / gridWidth))
  const y1 = Math.min(imgHeight, Math.ceil(((row + 1) * imgHeight) / gridHeight))
  return { x0, y0, x1: Math.max(x0 + 1, x1), y1: Math.max(y0 + 1, y1) }
}

function readOpaqueRgb(
  pixels: Uint8ClampedArray,
  imgWidth: number,
  x: number,
  y: number,
): Rgb | null {
  if (x < 0 || y < 0 || x >= imgWidth) return null
  const i = (y * imgWidth + x) * 4
  if (pixels[i + 3] < 128) return null
  return { r: pixels[i], g: pixels[i + 1], b: pixels[i + 2] }
}

/**
 * 最近邻格心采样 — 与 canvas imageSmoothingEnabled=false 缩放到格网等价。
 * 不做区域平均，避免边缘被抹糊。
 */
function sampleCellNearest(
  pixels: Uint8ClampedArray,
  imgWidth: number,
  imgHeight: number,
  col: number,
  row: number,
  gridWidth: number,
  gridHeight: number,
): Rgb | null {
  const sx = Math.min(
    imgWidth - 1,
    Math.max(0, Math.round(((col + 0.5) * imgWidth) / gridWidth - 0.5)),
  )
  const sy = Math.min(
    imgHeight - 1,
    Math.max(0, Math.round(((row + 0.5) * imgHeight) / gridHeight - 0.5)),
  )
  return readOpaqueRgb(pixels, imgWidth, sx, sy)
}

/** 格内众数：仅当单格覆盖较多源像素时（卡通粗格） */
function sampleCellDominant(
  pixels: Uint8ClampedArray,
  imgWidth: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): Rgb | null {
  const buckets = new Map<
    string,
    { count: number; r: number; g: number; b: number }
  >()

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * imgWidth + x) * 4
      if (pixels[i + 3] < 128) continue
      const r = pixels[i]
      const g = pixels[i + 1]
      const b = pixels[i + 2]
      const key = `${r >> 3},${g >> 3},${b >> 3}`
      const bucket = buckets.get(key)
      if (bucket) {
        bucket.count++
        bucket.r += r
        bucket.g += g
        bucket.b += b
      } else {
        buckets.set(key, { count: 1, r, g, b })
      }
    }
  }

  let best: { count: number; r: number; g: number; b: number } | null = null
  for (const bucket of buckets.values()) {
    if (!best || bucket.count > best.count) best = bucket
  }
  if (!best) return null

  return {
    r: Math.round(best.r / best.count),
    g: Math.round(best.g / best.count),
    b: Math.round(best.b / best.count),
  }
}

const DOMINANT_CELL_PIXEL_THRESHOLD = 6

export function resampleImageToGrid(
  pixels: Uint8ClampedArray,
  imgWidth: number,
  imgHeight: number,
  gridWidth: number,
  gridHeight: number,
  mode: PixelationMode,
): SampleGrid {
  const grid: SampleGrid = []

  for (let row = 0; row < gridHeight; row++) {
    const line: (Rgb | null)[] = []
    for (let col = 0; col < gridWidth; col++) {
      const { x0, y0, x1, y1 } = cellBounds(
        imgWidth,
        imgHeight,
        gridWidth,
        gridHeight,
        col,
        row,
      )
      const cellPixels = (x1 - x0) * (y1 - y0)

      let rgb: Rgb | null
      if (mode === 'dominant' && cellPixels >= DOMINANT_CELL_PIXEL_THRESHOLD) {
        rgb =
          sampleCellDominant(pixels, imgWidth, x0, y0, x1, y1) ??
          sampleCellNearest(pixels, imgWidth, imgHeight, col, row, gridWidth, gridHeight)
      } else {
        rgb = sampleCellNearest(pixels, imgWidth, imgHeight, col, row, gridWidth, gridHeight)
      }
      line.push(rgb)
    }
    grid.push(line)
  }

  return grid
}
