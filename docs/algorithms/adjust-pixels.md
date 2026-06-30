# 源图像素调节（prepareSourcePixels）

**源文件：** `src/image/adjustPixels.ts`

## 作用

在送入 [run-pipeline.md](./run-pipeline.md) 之前，对原始 RGBA 像素做**可选的色调调节与照片优化**，输出新的 `Uint8ClampedArray`（不修改原数组）。

## 入口函数

```typescript
prepareSourcePixels(pixels, width, height, adjust, optimize)
  → applyImageAdjustments(...)
  → applyPhotoOptimize(...)
```

## 一、图像调节（ImageAdjust）

| 参数 | 范围建议 | 实现 |
|------|----------|------|
| `brightness` | 约 -100～100 | 每通道 ± `brightness * 2.55` |
| `contrast` | 约 -100～100 | 标准对比度因子 `(259*(c+255))/(255*(259-c))` |
| `saturation` | 约 -100～100 | HSL 空间调整 S 后转回 RGB |

- 全为 0 时直接返回原像素，零拷贝短路
- alpha `< 128` 的像素原样保留，不参与调节

## 二、照片优化（PhotoOptimize）

### 降噪（denoise）

`applyMedianDenoise`：3×3 邻域中值滤波，逐通道取中位数。对透明像素跳过。

### 锐化（sharpen）

`applyUnsharpMask`：

```
blur = medianDenoise(pixels)
out = pixels + 0.4 * (pixels - blur)
```

非锐化掩模，默认 `amount = 0.4`，增强边缘对比而不引入大范围噪点。

执行顺序：先降噪（若开启）→ 再锐化（若开启）。

## 智能参数联动

[suggest-params.md](./suggest-params.md) 对照片类图片默认：

- `contrast: 12`
- `sharpen: true`
- `denoise: false`

## 与转换引擎的分工

`conversion/enhance.ts` 的 `preprocessForConversion` 当前为**透传**，所有锐化/对比度统一在本模块完成，避免转换阶段二次模糊。

## 相关文档

- [run-pipeline.md](./run-pipeline.md)
- [suggest-params.md](./suggest-params.md)
