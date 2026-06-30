# 排除色号重映射（remapExcludedColors）

**源文件：** `src/remap/excluded.ts`

## 作用

用户可将某些拼豆色号标记为「排除/缺货」。本算法在流水线末尾，将网格中仍使用被排除色号的格子，**重映射到未排除且仍在使用的色号中 ΔE 最近者**。

## 输入

| 参数 | 说明 |
|------|------|
| `grid` | 经合并、限色、背景标记后的网格 |
| `palette` | 完整色板 |
| `excludedPaletteIds` | 排除列表 |

`excludedPaletteIds` 为空时原样返回。

## 算法

```
1. 收集 grid 中实际用到的 paletteId → usedIds
2. remapTargets = palette 中 ∈ usedIds 且 ∉ excluded 的条目
3. 对每个格子：
     if isExternal 或 paletteId 未被排除 → 不变
     else closest = findClosestPaletteEntry(cell.rgb, remapTargets)
```

### 重映射目标集

仅在「当前图纸已用到、且未被排除」的色号中找替代，避免映射到从未出现的冷门色。

若 `remapTargets` 为空（全部可用色都被排除），原样返回。

## 与转换阶段排除的区别

| 阶段 | 行为 |
|------|------|
| `convertImageToPattern` | `filterActivePalette` 阻止**新量化**使用排除色 |
| `remapExcludedColors` | 处理**已有网格**中残留的排除色（如换排除列表、导入旧项目） |

## 用户操作联动

上传新图时 `applySuggestedParamsForImage` 会调用 `restoreAllExcluded()` 清除上一张图的排除列表，避免误伤新图。

## 相关文档

- [run-pipeline.md](./run-pipeline.md)
- [palette-match.md](./palette-match.md)
- [suggest-params.md](./suggest-params.md)
