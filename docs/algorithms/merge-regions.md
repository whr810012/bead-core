# 相似色区域合并（mergeSimilarRegions）

**源文件：** `src/merge/mergeRegions.ts`

## 作用

在初始量化网格上，将**感知颜色相近且四连通**的格子合并为同一色号，减少杂色碎块、降低用色种类。

## 参数

| 参数 | 说明 |
|------|------|
| `grid` | 输入 `MappedGrid` |
| `threshold` | ΔE 相似阈值；`≤ 0` 时**跳过合并**，原样复制 |

照片推荐 `threshold = 0` 以保留细节；卡通可用 5～12。

## 算法流程

对网格中每个未访问的非外部格作为种子：

```
1. BFS/栈遍历四邻域
2. 邻格与当前格 ΔE ≤ threshold 则纳入同一区域
3. 统计区域内各 paletteId 出现次数
4. 将整个区域统一为票数最多的色号（保留其 hex）
```

### 相似判定

```typescript
cellsSimilar(a, b, threshold):
  if either isExternal → false
  colorDistance(hexToRgb(a), hexToRgb(b)) <= threshold
```

`colorDistance` 即 CIEDE2000 ΔE，见 [ciede2000.md](./ciede2000.md)。

### 区域着色

合并后区域内所有格设为**主导色的 paletteId + hex**，而非重新量化，保证与色板条目严格一致。

## 复杂度

最坏 `O(W × H)`，每个格最多访问一次；四邻域 BFS。

## 效果示意

```
合并前（阈值内碎色）     合并后（统一主导色）
■□■□■                  ■■■■■
□■□■□        →         ■■■■■
■□■□■                  ■■■■■
```

## 相关文档

- [run-pipeline.md](./run-pipeline.md)
- [ciede2000.md](./ciede2000.md)
