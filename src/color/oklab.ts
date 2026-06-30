import type { Rgb } from '../types.js'
import { perceptualColorDistance } from './ciede2000.js'

export function hexToRgb(hex: string): Rgb | null {
  const normalized = hex.replace('#', '').trim()
  if (normalized.length !== 6) return null
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  if ([r, g, b].some((v) => Number.isNaN(v))) return null
  return { r, g, b }
}

export function rgbToHex(rgb: Rgb): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase()
}

/** 感知色差 ΔE2000（与拼豆行业工具一致的配色度量） */
export function colorDistance(rgb1: Rgb, rgb2: Rgb): number {
  return perceptualColorDistance(rgb1, rgb2)
}
