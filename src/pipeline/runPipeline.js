import { markExternalBackground } from '../background/floodFill.js';
import { mergeSimilarRegions } from '../merge/mergeRegions.js';
import { mapImageToGrid } from '../pixelation/mapGrid.js';
import { remapExcludedColors } from '../remap/excluded.js';
export function runPipeline(pixels, imgWidth, imgHeight, options) {
    let grid = mapImageToGrid(pixels, imgWidth, imgHeight, options);
    grid = mergeSimilarRegions(grid, options.mergeThreshold);
    grid = markExternalBackground(grid, options.backgroundPaletteIds);
    grid = remapExcludedColors(grid, options.palette, options.excludedPaletteIds);
    return {
        grid,
        width: grid[0]?.length ?? 0,
        height: grid.length,
    };
}
