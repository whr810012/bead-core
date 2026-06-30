# 拼豆生成流水线（runPipeline）

**源文件：** `src/pipeline/runPipeline.ts`

## 作用

将预处理后的 RGBA 像素数组与一组用户参数，编排为完整的拼豆网格生成流程，是 `bead-core` 对外的**主入口算法**。

## 输入 / 输出

### 输入

| 参数 | 类型 | 说明 |
|------|------|------|
| `pixels` | `Uint8ClampedArray` | 源图像素（RGBA，已调节） |
| `imgWidth` / `imgHeight` | `number` | 图像尺寸 |
| `options` | `PipelineOptions` | 格宽、模式、合并阈值、限色、色板等 |

### 输出

`PipelineResult`：`{ grid, width, height }`，其中 `grid` 为 `MappedGrid`（二维色号网格）。

## 处理步骤

```
1. convertImageToPattern   → 像素转初始网格
2. mergeSimilarRegions     → 按阈值合并相似邻域
3. limitGridColors         → 可选压缩颜色种类
4. markExternalBackground  → 标记贴边外部背景
5. remapExcludedColors     → 替换用户排除的色号
```

```typescript
let grid = convertImageToPattern(pixels, imgWidth, imgHeight, { ... })
grid = mergeSimilarRegions(grid, options.mergeThreshold)
if (options.maxColors > 0) {
  grid = limitGridColors(grid, options.palette, options.maxColors)
}
grid = markExternalBackground(grid, options.backgroundPaletteIds)
grid = remapExcludedColors(grid, options.palette, options.excludedPaletteIds)
```

## 设计要点

- **阶段解耦**：转换、合并、限色、背景、排除色各自独立，可单测、可替换。
- **顺序固定**：先合并再限色，可避免限色后被合并破坏；背景标记在限色之后，避免内部白岛被误标。
- **上游依赖**：调用前应由 `prepareSourcePixels` 完成亮度/锐化等调节（见 [adjust-pixels.md](./adjust-pixels.md)）。

## 调用方

`packages/app-shared/src/utils/pipeline.ts` 中的 `processCurrentProject()` 负责加载色板、组装 `PipelineOptions` 并调用本函数。

## 相关文档

- [convert-image-to-pattern.md](./convert-image-to-pattern.md)
- [merge-regions.md](./merge-regions.md)
- [limit-colors.md](./limit-colors.md)
- [flood-fill-background.md](./flood-fill-background.md)
- [remap-excluded.md](./remap-excluded.md)
