# 拼豆核心算法文档

本目录对 `@wangdandan810012/bead-core` 中的主要算法逐一说明。建议按流水线顺序阅读。

## 流水线总览

```
prepareSourcePixels          图像调节（见 adjust-pixels.md）
        ↓
runPipeline                  完整流水线编排（见 run-pipeline.md）
  ├─ convertImageToPattern   转换引擎（见 convert-image-to-pattern.md）
  │    ├─ resample            降采样（见 resample.md）
  │    └─ quantize             CIEDE2000 配色（见 quantize.md）
  ├─ mergeSimilarRegions       区域合并（见 merge-regions.md）
  ├─ limitGridColors           限色（见 limit-colors.md）
  ├─ markExternalBackground    背景标记（见 flood-fill-background.md）
  └─ remapExcludedColors       排除色重映射（见 remap-excluded.md）
```

## 文档索引

| 文档 | 源文件 | 说明 |
|------|--------|------|
| [run-pipeline.md](./run-pipeline.md) | `pipeline/runPipeline.ts` | 拼豆生成主流水线 |
| [convert-image-to-pattern.md](./convert-image-to-pattern.md) | `conversion/convertImageToPattern.ts` | 图片→网格转换引擎 |
| [resample.md](./resample.md) | `conversion/resample.ts` | 保边降采样 |
| [quantize.md](./quantize.md) | `conversion/quantize.ts` | 色板量化与杂点去除 |
| [ciede2000.md](./ciede2000.md) | `color/ciede2000.ts` | CIEDE2000 感知色差 |
| [palette-match.md](./palette-match.md) | `color/palette.ts` | 色板最近色查找 |
| [adjust-pixels.md](./adjust-pixels.md) | `image/adjustPixels.ts` | 亮度/对比度/锐化/降噪 |
| [merge-regions.md](./merge-regions.md) | `merge/mergeRegions.ts` | 相似色区域合并 |
| [flood-fill-background.md](./flood-fill-background.md) | `background/floodFill.ts` | 外部背景洪水填充 |
| [limit-colors.md](./limit-colors.md) | `remap/limitColors.ts` | 最大颜色数限制 |
| [remap-excluded.md](./remap-excluded.md) | `remap/excluded.ts` | 排除色号重映射 |
| [fill-region.md](./fill-region.md) | `edit/fillRegion.ts` | 同色连通填充 |
| [paint-rect.md](./paint-rect.md) | `edit/paintRect.ts` | 矩形区域上色 |
| [trim-grid.md](./trim-grid.md) | `edit/trimGrid.ts` | 自动裁边与翻转 |
| [color-stats.md](./color-stats.md) | `stats/colorStats.ts` | 色号统计与连通域 |

> **智能参数建议**（`buildSuggestedParams`）不在本库内，由消费方应用实现（如 [pindou-web](https://github.com/whr810012/pindou-web) 的 `packages/app-shared/src/utils/suggestParams.ts`）。说明见 [suggest-params.md](./suggest-params.md)。
