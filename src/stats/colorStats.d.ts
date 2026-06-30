import type { BrandSystem, ColorStat, MappedGrid } from '../types.js';
export declare function computeColorStats(grid: MappedGrid, brand: BrandSystem, codeLookup: (paletteId: string, brand: BrandSystem) => string): ColorStat[];
export declare function countTotalBeads(grid: MappedGrid): number;
export declare function countCompleted(grid: MappedGrid, completedCells: Set<string>): number;
export interface ConnectedRegion {
    cells: Array<{
        row: number;
        col: number;
    }>;
    paletteId: string;
}
export declare function getConnectedRegions(grid: MappedGrid, paletteId: string): ConnectedRegion[];
//# sourceMappingURL=colorStats.d.ts.map