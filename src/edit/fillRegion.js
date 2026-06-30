import { cloneGrid } from '../pixelation/mapGrid.js';
const NEIGHBORS = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
];
export function fillRegion(grid, row, col, targetPaletteId, targetHex) {
    const start = grid[row]?.[col];
    if (!start || start.isExternal)
        return cloneGrid(grid);
    const sourceId = start.paletteId;
    if (sourceId === targetPaletteId)
        return cloneGrid(grid);
    const result = cloneGrid(grid);
    const height = result.length;
    const width = result[0]?.length ?? 0;
    const visited = new Set();
    const stack = [[row, col]];
    while (stack.length > 0) {
        const [r, c] = stack.pop();
        const key = `${r},${c}`;
        if (visited.has(key))
            continue;
        if (r < 0 || r >= height || c < 0 || c >= width)
            continue;
        const cell = result[r][c];
        if (cell.isExternal || cell.paletteId !== sourceId)
            continue;
        visited.add(key);
        result[r][c] = { paletteId: targetPaletteId, hex: targetHex };
        for (const [dr, dc] of NEIGHBORS) {
            stack.push([r + dr, c + dc]);
        }
    }
    return result;
}
