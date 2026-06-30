import type { PaletteEntry, Rgb } from '../types.js'
import { hexToRgb } from './oklab.js'
import { deltaE2000, getCachedLab, type LabColor } from './ciede2000.js'

const paletteLabCache = new WeakMap<readonly PaletteEntry[], LabColor[]>()

function getPaletteLabs(palette: readonly PaletteEntry[]): LabColor[] {
  const cached = paletteLabCache.get(palette)
  if (cached) return cached
  const labs = palette.map((entry) => {
    const rgb = hexToRgb(entry.hex)
    return rgb ? getCachedLab(rgb) : { L: 0, a: 0, b: 0 }
  })
  paletteLabCache.set(palette, labs)
  return labs
}

/** 用 CIEDE2000（ΔE）在色板中找最接近真实豆色的条目 */
export function findClosestPaletteEntry(target: Rgb, palette: PaletteEntry[]): PaletteEntry {
  if (palette.length === 0) {
    throw new Error('Palette must not be empty')
  }

  const targetLab = getCachedLab(target)
  const paletteLabs = getPaletteLabs(palette)

  let minDistance = Infinity
  let closest = palette[0]

  for (let i = 0; i < palette.length; i++) {
    const distance = deltaE2000(targetLab, paletteLabs[i])
    if (distance < minDistance) {
      minDistance = distance
      closest = palette[i]
      if (distance === 0) break
    }
  }

  return closest
}

export function filterActivePalette(
  palette: PaletteEntry[],
  excludedIds: Set<string>,
): PaletteEntry[] {
  return palette.filter((entry) => !excludedIds.has(entry.id))
}
