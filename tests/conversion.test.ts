import { describe, expect, it } from 'vitest'
import { convertImageToPattern } from '../src/conversion/convertImageToPattern.js'
import { resampleImageToGrid } from '../src/conversion/resample.js'
import type { PaletteEntry } from '../src/types.js'

const palette: PaletteEntry[] = [
  {
    id: 'white',
    hex: '#FFFFFF',
    codes: { MARD: 'H1', COCO: 'H1', MANMAN: 'H1', PANPAN: 'H1', MIXIAOWO: 'H1' },
  },
  {
    id: 'black',
    hex: '#000000',
    codes: { MARD: 'H2', COCO: 'H2', MANMAN: 'H2', PANPAN: 'H2', MIXIAOWO: 'H2' },
  },
  {
    id: 'red',
    hex: '#FF0000',
    codes: { MARD: 'A1', COCO: 'A1', MANMAN: 'A1', PANPAN: 'A1', MIXIAOWO: 'A1' },
  },
  {
    id: 'green',
    hex: '#00FF00',
    codes: { MARD: 'B1', COCO: 'B1', MANMAN: 'B1', PANPAN: 'B1', MIXIAOWO: 'B1' },
  },
]

function solid(w: number, h: number, r: number, g: number, b: number) {
  const pixels = new Uint8ClampedArray(w * h * 4)
  for (let i = 0; i < w * h; i++) {
    const o = i * 4
    pixels[o] = r
    pixels[o + 1] = g
    pixels[o + 2] = b
    pixels[o + 3] = 255
  }
  return pixels
}

describe('convertImageToPattern', () => {
  it('maps solid red to red palette via area resample', () => {
    const pixels = solid(64, 64, 255, 0, 0)
    const grid = convertImageToPattern(pixels, 64, 64, {
      gridWidth: 8,
      mode: 'average',
      palette,
      excludedPaletteIds: [],
    })
    expect(grid.length).toBe(8)
    for (const row of grid) {
      for (const cell of row) {
        expect(cell.paletteId).toBe('red')
      }
    }
  })

  it('preserves sharp color blocks with nearest sampling', () => {
    const pixels = new Uint8ClampedArray(32 * 32 * 4)
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        const i = (y * 32 + x) * 4
        const isGreen = x >= 16
        pixels[i] = isGreen ? 0 : 255
        pixels[i + 1] = isGreen ? 255 : 0
        pixels[i + 2] = 0
        pixels[i + 3] = 255
      }
    }
    const grid = convertImageToPattern(pixels, 32, 32, {
      gridWidth: 8,
      mode: 'average',
      palette,
      excludedPaletteIds: [],
    })
    expect(grid[0][0].paletteId).toBe('red')
    expect(grid[0][7].paletteId).toBe('green')
    expect(grid[7][0].paletteId).toBe('red')
    expect(grid[7][7].paletteId).toBe('green')
  })

  it('marks transparent regions as external', () => {
    const pixels = new Uint8ClampedArray(8 * 8 * 4)
    const samples = resampleImageToGrid(pixels, 8, 8, 4, 4, 'average')
    expect(samples.every((row) => row.every((c) => c === null))).toBe(true)

    const grid = convertImageToPattern(pixels, 8, 8, {
      gridWidth: 4,
      mode: 'average',
      palette,
      excludedPaletteIds: [],
    })
    expect(grid[0][0].isExternal).toBe(true)
  })
})
