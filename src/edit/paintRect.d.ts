import type { MappedGrid } from '../types.js';
export interface RectBounds {
    row0: number;
    col0: number;
    row1: number;
    col1: number;
}
export declare function normalizeRect(row0: number, col0: number, row1: number, col1: number): RectBounds;
export declare function paintRect(grid: MappedGrid, row0: number, col0: number, row1: number, col1: number, paletteId: string, hex: string): MappedGrid;
//# sourceMappingURL=paintRect.d.ts.map