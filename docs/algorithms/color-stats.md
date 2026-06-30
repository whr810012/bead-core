# 色号统计与连通域（colorStats）

**源文件：** `src/stats/colorStats.ts`

## 作用

对最终 `MappedGrid` 做统计分析，支撑：

- 采购清单（各色豆粒数量、品牌色号）
- 进度追踪（已完成格数）
- 分区拼豆（同色连通区域列表）

## computeColorStats

### 输入

| 参数 | 说明 |
|------|------|
| `grid` | 拼豆网格 |
| `brand` | 品牌体系 `MARD` / `COCO` 等 |
| `codeLookup` | `(paletteId, brand) → 显示用豆号` |

### 输出

`ColorStat[]`，按用量降序：

```typescript
{ paletteId, hex, count, displayCode }
```

跳过 `isExternal` 格。

## countTotalBeads

非外部格子总数 = 需拼豆粒数。

## countCompleted

给定 `completedCells: Set<"row,col">`，统计其中非外部且已标记完成的格数，用于「专心拼豆」进度条。

## getConnectedRegions

按指定 `paletteId` 提取所有**四连通同色区域**：

```
对每个未访问的非外部、匹配 paletteId 的格：
  BFS 收集连通 cells
  → { cells: [{row,col},...], paletteId }
```

结果按 `cells.length` 降序，大区域优先。

### 用途

- 分区域高亮预览
- 按块指导拼豆顺序
- 分析色块碎片化程度

## 与采购估算

消费方 UI 可用 `count / BEADS_PER_BAG`（例如每包 1000 粒）估算采购包数。

## 相关文档

- [flood-fill-background.md](./flood-fill-background.md)
- [run-pipeline.md](./run-pipeline.md)
