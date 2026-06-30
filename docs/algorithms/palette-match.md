# 色板最近色查找（findClosestPaletteEntry）

**源文件：** `src/color/palette.ts`

## 作用

给定一个目标 RGB 和色板列表，返回**感知距离最近**的 `PaletteEntry`，是色板匹配的底层原语。

## 算法

```typescript
targetLab = getCachedLab(target)
paletteLabs = getPaletteLabs(palette)   // WeakMap 缓存

for each entry i:
  dist = deltaE2000(targetLab, paletteLabs[i])
  keep minimum
```

- 使用 CIEDE2000，见 [ciede2000.md](./ciede2000.md)
- `getPaletteLabs` 对同一 `palette` 数组引用缓存 Lab 数组，避免重复计算
- 若 `distance === 0` 提前退出

## filterActivePalette

```typescript
palette.filter(entry => !excludedIds.has(entry.id))
```

在转换、排除色重映射前，移除用户标记为「不可用」的色号。

## 与 PaletteMatcher 的区别

| | `findClosestPaletteEntry` | `PaletteMatcher`（quantize） |
|--|---------------------------|------------------------------|
| 位置 | `color/palette.ts` | `conversion/quantize.ts` |
| 场景 | 单次查找、排除色重映射 | 批量网格量化 |
| 缓存 | WeakMap 按 palette 数组 | 构造时一次性预计算 |

两者均使用 ΔE2000，逻辑等价，面向不同调用频率优化。

## 相关文档

- [ciede2000.md](./ciede2000.md)
- [quantize.md](./quantize.md)
- [remap-excluded.md](./remap-excluded.md)
