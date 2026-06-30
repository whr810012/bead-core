# 同色连通填充（fillRegion）

**源文件：** `src/edit/fillRegion.ts`

## 作用

编辑器「油漆桶」工具：从点击格出发，将所有**四连通、同色、非外部**的格子填充为目标色号。

## 签名

```typescript
fillRegion(grid, row, col, targetPaletteId, targetHex): MappedGrid
```

返回新网格（不可变更新），不修改原 `grid`。

## 算法

基于**栈式 DFS / BFS**：

```
1. 若起点 isExternal → 返回 cloneGrid(grid)
2. sourceId = 起点.paletteId
3. 若 sourceId === targetPaletteId → 无变化
4. 从 (row,col) 压栈遍历：
     - 跳过越界、已访问、外部格
     - 跳过 paletteId !== sourceId 的格
     - 写入 targetPaletteId + targetHex
```

### 连通性

四邻域：`上、下、左、右`（不含对角线），与合并、背景填充一致。

## 边界行为

| 情况 | 结果 |
|------|------|
| 点击外部格 | 不变 |
| 点击已是目标色 | 不变 |
| 封闭区域内部 | 仅填充与起点同色的连通块 |

## 相关文档

- [paint-rect.md](./paint-rect.md)
- [merge-regions.md](./merge-regions.md)
