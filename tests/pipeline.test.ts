import { describe, expect, it } from 'vitest'
import { runPipeline } from '../src/pipeline/runPipeline.js'
import type { PaletteEntry, PipelineOptions } from '../src/types.js'

const testPalette: PaletteEntry[] = [
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

function createSolidImage(width: number, height: number, r: number, g: number, b: number) {
  const pixels = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < width * height; i++) {
    const offset = i * 4
    pixels[offset] = r
    pixels[offset + 1] = g
    pixels[offset + 2] = b
    pixels[offset + 3] = 255
  }
  return pixels
}

function baseOptions(overrides: Partial<PipelineOptions> = {}): PipelineOptions {
  return {
    gridWidth: 4,
    mode: 'dominant',
    mergeThreshold: 0,
    maxColors: 0,
    backgroundPaletteIds: ['white'],
    excludedPaletteIds: [],
    palette: testPalette,
    ...overrides,
  }
}

describe('runPipeline', () => {
  it('maps solid red image to red palette entries', () => {
    const pixels = createSolidImage(8, 8, 255, 0, 0)
    const result = runPipeline(pixels, 8, 8, baseOptions())

    expect(result.width).toBe(4)
    expect(result.height).toBe(4)
    for (const row of result.grid) {
      for (const cell of row) {
        expect(cell.paletteId).toBe('red')
      }
    }
  })

  it('marks border-connected white as external background', () => {
    const pixels = new Uint8ClampedArray(8 * 8 * 4)
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const i = (y * 8 + x) * 4
        const isCenter = x >= 2 && x <= 5 && y >= 2 && y <= 5
        if (isCenter) {
          pixels[i] = 255
          pixels[i + 1] = 0
          pixels[i + 2] = 0
        } else {
          pixels[i] = 255
          pixels[i + 1] = 255
          pixels[i + 2] = 255
        }
        pixels[i + 3] = 255
      }
    }

    const result = runPipeline(pixels, 8, 8, baseOptions({ gridWidth: 4, mergeThreshold: 5 }))
    const corners = [
      result.grid[0][0],
      result.grid[0][3],
      result.grid[3][0],
      result.grid[3][3],
    ]
    for (const cell of corners) {
      expect(cell.isExternal).toBe(true)
    }
    expect(result.grid[1][1].paletteId).toBe('red')
  })

  it('remaps excluded colors to nearest available used color', () => {
    const pixels = createSolidImage(8, 8, 255, 0, 0)
    const result = runPipeline(
      pixels,
      8,
      8,
      baseOptions({ excludedPaletteIds: ['red'] }),
    )

    for (const row of result.grid) {
      for (const cell of row) {
        expect(cell.paletteId).not.toBe('red')
      }
    }
  })
})

describe('colorDistance', () => {
  it('returns zero for identical colors', async () => {
    const { colorDistance } = await import('../src/color/oklab.js')
    expect(colorDistance({ r: 10, g: 20, b: 30 }, { r: 10, g: 20, b: 30 })).toBe(0)
  })
})
