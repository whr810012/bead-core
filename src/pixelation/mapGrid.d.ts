import type { MappedGrid, PipelineOptions } from '../types.js';
export declare function mapImageToGrid(pixels: Uint8ClampedArray, imgWidth: number, imgHeight: number, options: Pick<PipelineOptions, 'gridWidth' | 'mode' | 'palette' | 'excludedPaletteIds'>): MappedGrid;
export declare function cloneGrid(grid: MappedGrid): MappedGrid;
export declare function gridDimensions(grid: MappedGrid): {
    width: number;
    height: number;
};
//# sourceMappingURL=mapGrid.d.ts.map