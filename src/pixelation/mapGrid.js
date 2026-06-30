import { findClosestPaletteEntry, filterActivePalette } from '../color/palette.js';
function srgbToLinear(channel) {
    const n = channel / 255;
    return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}
function linearToSrgb(channel) {
    const c = channel <= 0.0031308 ? channel * 12.92 : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
    return Math.max(0, Math.min(255, Math.round(c * 255)));
}
function getCellRepresentativeColor(pixels, imgWidth, startX, startY, cellWidth, cellHeight, mode) {
    let rSum = 0;
    let gSum = 0;
    let bSum = 0;
    let pixelCount = 0;
    const colorCounts = {};
    let dominant = null;
    let maxCount = 0;
    const endX = startX + cellWidth;
    const endY = startY + cellHeight;
    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            const index = (y * imgWidth + x) * 4;
            if (pixels[index + 3] < 128)
                continue;
            const r = pixels[index];
            const g = pixels[index + 1];
            const b = pixels[index + 2];
            pixelCount++;
            if (mode === 'average') {
                rSum += srgbToLinear(r);
                gSum += srgbToLinear(g);
                bSum += srgbToLinear(b);
            }
            else {
                // 量化到 5 bit 减少噪点，再取桶内均值作为代表色
                const qr = r >> 3;
                const qg = g >> 3;
                const qb = b >> 3;
                const key = `${qr},${qg},${qb}`;
                const bucket = colorCounts[key];
                if (bucket) {
                    bucket.count++;
                    bucket.r += r;
                    bucket.g += g;
                    bucket.b += b;
                }
                else {
                    colorCounts[key] = { count: 1, r, g, b };
                }
                if (colorCounts[key].count > maxCount) {
                    maxCount = colorCounts[key].count;
                    const bkt = colorCounts[key];
                    dominant = {
                        r: Math.round(bkt.r / bkt.count),
                        g: Math.round(bkt.g / bkt.count),
                        b: Math.round(bkt.b / bkt.count),
                    };
                }
            }
        }
    }
    if (pixelCount === 0)
        return null;
    if (mode === 'average') {
        return {
            r: linearToSrgb(rSum / pixelCount),
            g: linearToSrgb(gSum / pixelCount),
            b: linearToSrgb(bSum / pixelCount),
        };
    }
    return dominant;
}
export function mapImageToGrid(pixels, imgWidth, imgHeight, options) {
    const { gridWidth, mode, palette, excludedPaletteIds } = options;
    const gridHeight = Math.max(1, Math.round((gridWidth * imgHeight) / imgWidth));
    const excluded = new Set(excludedPaletteIds);
    const activePalette = filterActivePalette(palette, excluded);
    const fallback = activePalette[0] ?? palette[0];
    const grid = Array.from({ length: gridHeight }, () => Array.from({ length: gridWidth }, () => ({
        paletteId: fallback.id,
        hex: fallback.hex,
    })));
    const cellWidth = imgWidth / gridWidth;
    const cellHeight = imgHeight / gridHeight;
    for (let row = 0; row < gridHeight; row++) {
        for (let col = 0; col < gridWidth; col++) {
            const startX = Math.floor(col * cellWidth);
            const startY = Math.floor(row * cellHeight);
            const endX = Math.min(imgWidth, Math.ceil((col + 1) * cellWidth));
            const endY = Math.min(imgHeight, Math.ceil((row + 1) * cellHeight));
            const w = Math.max(1, endX - startX);
            const h = Math.max(1, endY - startY);
            const representative = getCellRepresentativeColor(pixels, imgWidth, startX, startY, w, h, mode);
            if (!representative || activePalette.length === 0) {
                grid[row][col] = { paletteId: fallback.id, hex: fallback.hex, isExternal: true };
                continue;
            }
            const closest = findClosestPaletteEntry(representative, activePalette);
            grid[row][col] = { paletteId: closest.id, hex: closest.hex };
        }
    }
    return grid;
}
export function cloneGrid(grid) {
    return grid.map((row) => row.map((cell) => ({ ...cell })));
}
export function gridDimensions(grid) {
    return { width: grid[0]?.length ?? 0, height: grid.length };
}
