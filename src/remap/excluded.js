import { findClosestPaletteEntry, filterActivePalette } from '../color/palette.js';
import { hexToRgb } from '../color/oklab.js';
export function remapExcludedColors(grid, palette, excludedPaletteIds) {
    const excluded = new Set(excludedPaletteIds);
    if (excluded.size === 0) {
        return grid.map((row) => row.map((cell) => ({ ...cell })));
    }
    const usedIds = new Set();
    for (const row of grid) {
        for (const cell of row) {
            if (!cell.isExternal)
                usedIds.add(cell.paletteId);
        }
    }
    const remapTargets = filterActivePalette(palette.filter((entry) => usedIds.has(entry.id)), excluded);
    if (remapTargets.length === 0) {
        return grid.map((row) => row.map((cell) => ({ ...cell })));
    }
    return grid.map((row) => row.map((cell) => {
        if (cell.isExternal || !excluded.has(cell.paletteId)) {
            return { ...cell };
        }
        const rgb = hexToRgb(cell.hex);
        if (!rgb)
            return { ...cell };
        const closest = findClosestPaletteEntry(rgb, remapTargets);
        return { paletteId: closest.id, hex: closest.hex };
    }));
}
