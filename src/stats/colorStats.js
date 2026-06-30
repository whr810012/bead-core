export function computeColorStats(grid, brand, codeLookup) {
    const counts = new Map();
    for (const row of grid) {
        for (const cell of row) {
            if (cell.isExternal)
                continue;
            const existing = counts.get(cell.paletteId);
            if (existing) {
                existing.count++;
            }
            else {
                counts.set(cell.paletteId, { hex: cell.hex, count: 1 });
            }
        }
    }
    return Array.from(counts.entries())
        .map(([paletteId, { hex, count }]) => ({
        paletteId,
        hex,
        count,
        displayCode: codeLookup(paletteId, brand),
    }))
        .sort((a, b) => b.count - a.count);
}
export function countTotalBeads(grid) {
    let total = 0;
    for (const row of grid) {
        for (const cell of row) {
            if (!cell.isExternal)
                total++;
        }
    }
    return total;
}
export function countCompleted(grid, completedCells) {
    let total = 0;
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < (grid[0]?.length ?? 0); col++) {
            const cell = grid[row][col];
            if (!cell.isExternal && completedCells.has(`${row},${col}`))
                total++;
        }
    }
    return total;
}
export function getConnectedRegions(grid, paletteId) {
    const height = grid.length;
    const width = grid[0]?.length ?? 0;
    const visited = Array.from({ length: height }, () => Array(width).fill(false));
    const regions = [];
    const neighbors = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
    ];
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            if (visited[row][col])
                continue;
            const cell = grid[row][col];
            if (cell.isExternal || cell.paletteId !== paletteId)
                continue;
            const cells = [];
            const stack = [[row, col]];
            visited[row][col] = true;
            while (stack.length > 0) {
                const [r, c] = stack.pop();
                cells.push({ row: r, col: c });
                for (const [dr, dc] of neighbors) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr < 0 || nr >= height || nc < 0 || nc >= width || visited[nr][nc])
                        continue;
                    const next = grid[nr][nc];
                    if (next.isExternal || next.paletteId !== paletteId)
                        continue;
                    visited[nr][nc] = true;
                    stack.push([nr, nc]);
                }
            }
            if (cells.length > 0) {
                regions.push({ cells, paletteId });
            }
        }
    }
    return regions.sort((a, b) => b.cells.length - a.cells.length);
}
