export interface ImageAdjust {
  brightness: number
  contrast: number
  saturation: number
}

export const DEFAULT_IMAGE_ADJUST: ImageAdjust = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
}

export interface PhotoOptimize {
  denoise: boolean
  sharpen: boolean
}

export const DEFAULT_PHOTO_OPTIMIZE: PhotoOptimize = {
  denoise: false,
  sharpen: false,
}

function clampByte(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)))
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
  else if (max === gn) h = ((bn - rn) / d + 2) / 6
  else h = ((rn - gn) / d + 4) / 6
  return [h, s, l]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = clampByte(l * 255)
    return [v, v, v]
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t
    if (tt < 0) tt += 1
    if (tt > 1) tt -= 1
    if (tt < 1 / 6) return p + (q - p) * 6 * tt
    if (tt < 1 / 2) return q
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return [
    clampByte(hue2rgb(p, q, h + 1 / 3) * 255),
    clampByte(hue2rgb(p, q, h) * 255),
    clampByte(hue2rgb(p, q, h - 1 / 3) * 255),
  ]
}

function medianOf(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

function applyMedianDenoise(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(pixels.length)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      if (pixels[i + 3] < 128) {
        out.set(pixels.subarray(i, i + 4), i)
        continue
      }
      const rs: number[] = []
      const gs: number[] = []
      const bs: number[] = []
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
          const ni = (ny * width + nx) * 4
          if (pixels[ni + 3] < 128) continue
          rs.push(pixels[ni])
          gs.push(pixels[ni + 1])
          bs.push(pixels[ni + 2])
        }
      }
      if (!rs.length) {
        out.set(pixels.subarray(i, i + 4), i)
        continue
      }
      out[i] = medianOf(rs)
      out[i + 1] = medianOf(gs)
      out[i + 2] = medianOf(bs)
      out[i + 3] = pixels[i + 3]
    }
  }
  return out
}

function applyUnsharpMask(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  amount = 0.4,
): Uint8ClampedArray {
  const blur = applyMedianDenoise(pixels, width, height)
  const out = new Uint8ClampedArray(pixels.length)
  for (let i = 0; i < pixels.length; i += 4) {
    out[i] = clampByte(pixels[i] + amount * (pixels[i] - blur[i]))
    out[i + 1] = clampByte(pixels[i + 1] + amount * (pixels[i + 1] - blur[i + 1]))
    out[i + 2] = clampByte(pixels[i + 2] + amount * (pixels[i + 2] - blur[i + 2]))
    out[i + 3] = pixels[i + 3]
  }
  return out
}

export function applyImageAdjustments(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  adjust: ImageAdjust,
): Uint8ClampedArray {
  const { brightness, contrast, saturation } = adjust
  if (brightness === 0 && contrast === 0 && saturation === 0) {
    return pixels
  }

  const out = new Uint8ClampedArray(pixels.length)
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast))

  for (let i = 0; i < pixels.length; i += 4) {
    const a = pixels[i + 3]
    if (a < 128) {
      out.set(pixels.subarray(i, i + 4), i)
      continue
    }

    let r = pixels[i] + brightness * 2.55
    let g = pixels[i + 1] + brightness * 2.55
    let b = pixels[i + 2] + brightness * 2.55

    r = contrastFactor * (r - 128) + 128
    g = contrastFactor * (g - 128) + 128
    b = contrastFactor * (b - 128) + 128

    if (saturation !== 0) {
      const [h, s, l] = rgbToHsl(clampByte(r), clampByte(g), clampByte(b))
      const ns = Math.max(0, Math.min(1, s + saturation / 100))
      const rgb = hslToRgb(h, ns, l)
      r = rgb[0]
      g = rgb[1]
      b = rgb[2]
    }

    out[i] = clampByte(r)
    out[i + 1] = clampByte(g)
    out[i + 2] = clampByte(b)
    out[i + 3] = a
  }

  return out
}

export function applyPhotoOptimize(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  optimize: PhotoOptimize,
): Uint8ClampedArray {
  let result = pixels
  if (optimize.denoise) {
    result = applyMedianDenoise(result, width, height)
  }
  if (optimize.sharpen) {
    result = applyUnsharpMask(result, width, height)
  }
  return result
}

export function prepareSourcePixels(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  adjust: ImageAdjust,
  optimize: PhotoOptimize,
): Uint8ClampedArray {
  let result = applyImageAdjustments(pixels, width, height, adjust)
  result = applyPhotoOptimize(result, width, height, optimize)
  return result
}
