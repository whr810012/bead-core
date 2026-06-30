import type { PixelationMode } from '../types.js'

/** 转换阶段不做额外模糊处理；锐化/对比度由 prepareSourcePixels 统一负责 */
export function preprocessForConversion(
  pixels: Uint8ClampedArray,
  _width: number,
  _height: number,
  _mode: PixelationMode,
): Uint8ClampedArray {
  return pixels
}
