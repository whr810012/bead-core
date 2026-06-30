# 图片转图纸引擎（convertImageToPattern）

**源文件：** `src/conversion/convertImageToPattern.ts`

## 作用

将一张 RGBA 图片转换为拼豆色号网格（`MappedGrid`），是第五期清晰度升级的**核心转换引擎**，独立于后处理流水线，专注「采样 → 配色」。

## 输入 / 输出

### 输入（`ConvertImageOptions`）

| 字段 | 说明 |
|------|------|
| `gridWidth` | 目标横向格数；纵向按宽高比自动计算 |
| `mode` | `average`（照片）或 `dominant`（卡通） |
| `palette` | 完整色板条目列表 |
| `excludedPaletteIds` | 用户排除的色号 ID |
| `despeckle` | 是否去除孤立杂点，默认 `false` |

### 输出

`MappedGrid`：每个格子含 `paletteId`、`hex`，透明区域为 `isExternal: true`。

## 内部流程

```
filterActivePalette        过滤排除色
        ↓
preprocessForConversion    转换阶段预处理（当前为透传）
        ↓
resampleImageToGrid          降采样为 SampleGrid
        ↓
quantizeSamplesToGrid      CIEDE2000 匹配色板
        ↓
despeckleGridSimple        可选杂点去除（仅 average 模式）
```

### 格数计算

```typescript
gridHeight = max(1, round(gridWidth * imgHeight / imgWidth))
```

保持与原图相同的宽高比。

### 边界情况

- 激活色板为空时，返回全 `isExternal` 的占位网格。
- `fallback` 取激活色板首项，用于透明格与异常回退。

## 与 mapImageToGrid 的关系

`pixelation/mapGrid.ts` 中的 `mapImageToGrid` 现为兼容包装，内部直接委托 `convertImageToPattern`。

## 参数建议

| 场景 | gridWidth | mode | despeckle |
|------|-----------|------|-----------|
| 真人照片 | 接近短边像素数（上限 256） | `average` | `false` |
| 卡通插画 | 短边 ÷ 3 左右 | `dominant` | 一般不需要 |

## 相关文档

- [resample.md](./resample.md)
- [quantize.md](./quantize.md)
- [adjust-pixels.md](./adjust-pixels.md)
