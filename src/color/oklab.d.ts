import type { Rgb } from '../types.js';
export declare function hexToRgb(hex: string): Rgb | null;
export declare function rgbToHex(rgb: Rgb): string;
/** Oklab distance scaled to 0-100 for threshold compatibility */
export declare function colorDistance(rgb1: Rgb, rgb2: Rgb): number;
//# sourceMappingURL=oklab.d.ts.map