# 智能参数建议（buildSuggestedParams）

> **注意：** 此功能**不在** `@wangdandan810012/bead-core` 内，由消费方应用实现。  
> 蛋蛋拼豆 Web 端实现见 [pindou-web `suggestParams.ts`](https://github.com/whr810012/pindou-web/blob/main/packages/app-shared/src/utils/suggestParams.ts)。

**源文件（pindou-web）：** `packages/app-shared/src/utils/suggestParams.ts`

## 作用

用户上传新图后，分析图像内容特征，**自动生成一套推荐的项目参数**（格数、模式、合并阈值、色板预设、图像调节、照片优化），并清除上一张图的排除色号。

入口：`applySuggestedParamsForImage()` → `buildSuggestedParams()`。

## 一、内容分析（analyzeImageContent）

在图像上按步长 `step = floor(min(w,h) / 32)` 采样：

1. 跳过透明像素（alpha < 128）
2. 计算亮度 `L = 0.299R + 0.587G + 0.114B`
3. 相邻采样点亮度差的平方累加 → 方差 `variance`
4. `isPhotoLike = variance > 100`

| variance | 解读 |
|----------|------|
| > 100 | 纹理丰富，倾向真人照片 |
| ≤ 100 | 色块平坦，倾向卡通/插画 |

## 二、各参数建议规则

### 格数（suggestGridWidth）

| 类型 | 公式 |
|------|------|
| 照片 | `clamp(48, minEdge, maxGrid)` — 尽量 1 源像素 → 1 格 |
| 卡通 | `clamp(40, round(minEdge/3), maxGrid)` — 适度降格去噪 |

`maxGrid` 由平台提供（Web 端为 256）。

### 像素化模式

- 照片 → `average`
- 卡通 → `dominant`

### 合并阈值（suggestMergeThreshold）

| 条件 | 阈值 |
|------|------|
| 照片 | 0 |
| 卡通，variance > 50 | 5 |
| 卡通，variance ≤ 50 | 7 |

### 色板预设（suggestPalettePresetId）

| 条件 | 预设 |
|------|------|
| 照片 | `pindou-full` |
| 卡通，variance > 60 | `pindou-168` |
| 卡通，variance ≤ 60 | `pindou-96` |

### 图像调节（suggestImageAdjust）

- 照片：`{ brightness: 0, contrast: 12, saturation: 0 }`
- 卡通：默认全 0

### 照片优化（suggestPhotoOptimize）

- 照片：`{ denoise: false, sharpen: true }`
- 卡通：默认全关

## 输出结构（SuggestedProjectParams）

```typescript
{
  gridWidth, mode, mergeThreshold, maxColors: 0,
  palettePresetId, imageAdjust, photoOptimize
}
```

## 相关文档

- [adjust-pixels.md](./adjust-pixels.md)
- [convert-image-to-pattern.md](./convert-image-to-pattern.md)
- [merge-regions.md](./merge-regions.md)
