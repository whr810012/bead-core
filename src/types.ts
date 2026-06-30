export type BrandSystem = 'MARD' | 'COCO' | 'MANMAN' | 'PANPAN' | 'MIXIAOWO'

export type PixelationMode = 'dominant' | 'average'

export interface Rgb {
  r: number
  g: number
  b: number
}

export interface PaletteEntry {
  id: string
  hex: string
  codes: Record<BrandSystem, string>
}

export interface MappedCell {
  paletteId: string
  hex: string
  isExternal?: boolean
}

export type MappedGrid = MappedCell[][]

export interface PipelineOptions {
  gridWidth: number
  mode: PixelationMode
  mergeThreshold: number
  maxColors: number
  backgroundPaletteIds: string[]
  excludedPaletteIds: string[]
  palette: PaletteEntry[]
}

export interface PipelineResult {
  grid: MappedGrid
  width: number
  height: number
}

export interface ColorStat {
  paletteId: string
  hex: string
  count: number
  displayCode: string
}

export interface RenderOptions {
  cellSize?: number
  showGrid?: boolean
  highlightPaletteId?: string | null
  completedCells?: Set<string>
}
