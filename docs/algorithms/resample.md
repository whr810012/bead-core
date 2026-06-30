# 保边降采样（resampleImageToGrid）

**源文件：** `src/conversion/resample.ts`

## 作用

将 `width × height` 的源图像素，降采样为 `gridWidth × gridHeight` 的**颜色样本网格**（`SampleGrid`），每个格子一个 `Rgb | null`（`null` 表示透明）。

降采样结果尚未匹配色板，由 [quantize.md](./quantize.md) 完成配色。

## 核心策略

### 照片模式（`average`）— 最近邻格心采样

对每个目标格 `(col, row)`，计算格心在源图上的坐标：

```typescript
sx = round((col + 0.5) * imgWidth / gridWidth - 0.5)
sy = round((row + 0.5) * imgHeight / gridHeight - 0.5)
```

读取该点的不透明像素 RGB。等价于 Canvas 设置 `imageSmoothingEnabled = false` 后缩放到格数，**不做区域平均**，避免边缘被抹糊。

### 卡通模式（`dominant`）— 条件众数采样

当单格覆盖的源像素数 `≥ 6` 时：

1. 遍历格内所有不透明像素
2. 将 RGB 量化到 5 bit（`r >> 3`）分桶计数
3. 取出现次数最多的桶，桶内 RGB 求均值作为代表色

若格内像素不足 6 个，或众数采样失败，回退到最近邻格心采样。

## 格边界计算（cellBounds）

```typescript
x0 = floor(col * imgWidth / gridWidth)
y0 = floor(row * imgHeight / gridHeight)
x1 = ceil((col + 1) * imgWidth / gridWidth)
y1 = ceil((row + 1) * imgHeight / gridHeight)
```

保证每格至少覆盖 1×1 源像素，相邻格无间隙、无重叠遗漏。

## 透明度处理

`readOpaqueRgb` 在 alpha `< 128` 时返回 `null`，后续量化阶段将该格标为 `isExternal`。

## 设计动机

| 旧方案 | 新方案 | 收益 |
|--------|--------|------|
| 格内 sRGB 线性空间平均 | 最近邻单点采样 | 照片边缘更锐利 |
| 统一区域平均 | 粗格才用众数 | 卡通大色块仍稳定 |

## 相关文档

- [convert-image-to-pattern.md](./convert-image-to-pattern.md)
- [quantize.md](./quantize.md)
