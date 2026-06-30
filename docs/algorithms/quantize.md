# 色板量化配色（quantizeSamplesToGrid）

**源文件：** `src/conversion/quantize.ts`

## 作用

将降采样得到的 `SampleGrid`（每格一个 RGB 样本）映射到有限拼豆色板，输出最终的 `MappedGrid`。

## 核心类：PaletteMatcher

```typescript
class PaletteMatcher {
  constructor(entries: PaletteEntry[])
  match(rgb: Rgb): PaletteEntry
}
```

### 初始化

- 将色板中每个 `hex` 转为 RGB，再预计算 CIELAB 值
- 避免对每个格子重复做色彩空间转换

### 匹配

对每个采样 RGB：

1. `getCachedLab(rgb)` 得到目标 Lab
2. 遍历色板，计算 `deltaE2000(targetLab, paletteLab[i])`
3. 取 ΔE 最小的色板条目

详见 [ciede2000.md](./ciede2000.md)、[palette-match.md](./palette-match.md)。

## quantizeSamplesToGrid

逐格调用 `matcher.match(sample)`：

- `sample === null` → 写入 `fallback` 并设 `isExternal: true`
- 否则 → `{ paletteId, hex }` 来自匹配结果

## 杂点去除：despeckleGridSimple

**默认关闭**（`convertImageToPattern` 中 `despeckle = false`）。

算法（四邻域）：

1. 跳过 `isExternal` 格
2. 统计四邻中非外部格的主色（≥3 个同色邻居）
3. 若当前格与主邻色不同，且自身颜色在四邻中**零出现**（完全孤立），则替换为主邻色

适用：照片模式下偶发的单格错色；不适用：细线、1 像素宽笔画（会被误抹）。

## 复杂度

设网格 `W × H`，色板 `P` 色：

- 量化：`O(W × H × P)`，Lab 缓存使常数项降低
- 杂点去除：`O(W × H)`，固定四邻

## 相关文档

- [ciede2000.md](./ciede2000.md)
- [resample.md](./resample.md)
