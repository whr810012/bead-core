export function hexToRgb(hex) {
    const normalized = hex.replace('#', '').trim();
    if (normalized.length !== 6)
        return null;
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    if ([r, g, b].some((v) => Number.isNaN(v)))
        return null;
    return { r, g, b };
}
export function rgbToHex(rgb) {
    const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
}
function srgbChannelToLinear(channel) {
    const normalized = channel / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
}
function rgbToOklab(rgb) {
    const r = srgbChannelToLinear(rgb.r);
    const g = srgbChannelToLinear(rgb.g);
    const b = srgbChannelToLinear(rgb.b);
    const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
    const lRoot = Math.cbrt(l);
    const mRoot = Math.cbrt(m);
    const sRoot = Math.cbrt(s);
    return {
        l: 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot,
        a: 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot,
        b: 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot,
    };
}
const oklabCache = new Map();
function getOklab(rgb) {
    const key = `${rgb.r},${rgb.g},${rgb.b}`;
    const cached = oklabCache.get(key);
    if (cached)
        return cached;
    const oklab = rgbToOklab(rgb);
    oklabCache.set(key, oklab);
    return oklab;
}
/** Oklab distance scaled to 0-100 for threshold compatibility */
export function colorDistance(rgb1, rgb2) {
    const a = getOklab(rgb1);
    const b = getOklab(rgb2);
    const dl = a.l - b.l;
    const da = a.a - b.a;
    const db = a.b - b.b;
    return Math.sqrt(dl * dl + da * da + db * db) * 100;
}
