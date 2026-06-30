import type { Rgb } from '../types.js'

export interface LabColor {
  L: number
  a: number
  b: number
}

function srgbToLinear(c: number): number {
  const n = c / 255
  return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4)
}

/** sRGB → CIELAB (D65) */
export function rgbToLab(rgb: Rgb): LabColor {
  const r = srgbToLinear(rgb.r)
  const g = srgbToLinear(rgb.g)
  const b = srgbToLinear(rgb.b)

  let x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375
  let y = r * 0.2126729 + g * 0.7151522 + b * 0.072175
  let z = r * 0.0193339 + g * 0.119192 + b * 0.9503041

  x /= 0.95047
  y /= 1.0
  z /= 1.08883

  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)

  const fx = f(x)
  const fy = f(y)
  const fz = f(z)

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  }
}

/** CIEDE2000 ΔE（与 PerlerBeads 等工具常用的感知色差一致） */
export function deltaE2000(lab1: LabColor, lab2: LabColor): number {
  const { L: L1, a: a1, b: b1 } = lab1
  const { L: L2, a: a2, b: b2 } = lab2

  const avgLp = (L1 + L2) / 2
  const C1 = Math.sqrt(a1 * a1 + b1 * b1)
  const C2 = Math.sqrt(a2 * a2 + b2 * b2)
  const avgC = (C1 + C2) / 2

  const G =
    0.5 *
    (1 -
      Math.sqrt(Math.pow(avgC, 7) / (Math.pow(avgC, 7) + Math.pow(25, 7))))

  const a1p = (1 + G) * a1
  const a2p = (1 + G) * a2
  const C1p = Math.sqrt(a1p * a1p + b1 * b1)
  const C2p = Math.sqrt(a2p * a2p + b2 * b2)
  const avgCp = (C1p + C2p) / 2

  let h1p = Math.atan2(b1, a1p) * (180 / Math.PI)
  if (h1p < 0) h1p += 360
  let h2p = Math.atan2(b2, a2p) * (180 / Math.PI)
  if (h2p < 0) h2p += 360

  let avgHp = Math.abs(h1p - h2p) > 180 ? (h1p + h2p + 360) / 2 : (h1p + h2p) / 2

  const T =
    1 -
    0.17 * Math.cos((avgHp - 30) * (Math.PI / 180)) +
    0.24 * Math.cos(2 * avgHp * (Math.PI / 180)) +
    0.32 * Math.cos((3 * avgHp + 6) * (Math.PI / 180)) -
    0.2 * Math.cos((4 * avgHp - 63) * (Math.PI / 180))

  let dhp = h2p - h1p
  if (Math.abs(dhp) > 180) dhp += dhp > 0 ? -360 : 360

  const dLp = L2 - L1
  const dCp = C2p - C1p
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * (Math.PI / 180))

  const Sl = 1 + (0.015 * Math.pow(avgLp - 50, 2)) / Math.sqrt(20 + Math.pow(avgLp - 50, 2))
  const Sc = 1 + 0.045 * avgCp
  const Sh = 1 + 0.015 * avgCp * T

  const dTheta = 30 * Math.exp(-Math.pow((avgHp - 275) / 25, 2))
  const Rc =
    2 *
    Math.sqrt(Math.pow(avgCp, 7) / (Math.pow(avgCp, 7) + Math.pow(25, 7)))
  const Rt = -Rc * Math.sin(2 * dTheta * (Math.PI / 180))

  const dL = dLp / Sl
  const dC = dCp / Sc
  const dH = dHp / Sh

  return Math.sqrt(dL * dL + dC * dC + dH * dH + Rt * dC * dH)
}

const labCache = new Map<string, LabColor>()

export function getCachedLab(rgb: Rgb): LabColor {
  const key = `${rgb.r},${rgb.g},${rgb.b}`
  const hit = labCache.get(key)
  if (hit) return hit
  const lab = rgbToLab(rgb)
  labCache.set(key, lab)
  return lab
}

/** 感知色差（ΔE2000），用于配色与区域合并 */
export function perceptualColorDistance(rgb1: Rgb, rgb2: Rgb): number {
  return deltaE2000(getCachedLab(rgb1), getCachedLab(rgb2))
}
