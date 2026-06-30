# 外部背景洪水填充（markExternalBackground）

**源文件：** `src/background/floodFill.ts`

## 作用

识别并标记**与网格四边连通**的背景色区域，将其设为 `isExternal: true`。这些格子在统计、导出、拼豆计数时可忽略。

内部封闭的背景色岛（如人物衣服里的白色块）**不会**被标记。

## 输入

| 参数 | 说明 |
|------|------|
| `grid` | 量化后的 `MappedGrid` |
| `backgroundPaletteIds` | 视为「背景」的色号 ID 列表（通常白色/浅灰） |

`backgroundPaletteIds` 由 `app-shared/utils/backgroundPalette.ts` 根据色板自动解析。

## 算法

```
1. 建立 backgroundSet
2. 从四条边上的每一格出发 floodFrom
3. floodFrom：若该格是背景色且未访问
     → 标记 isExternal = true
     → 四邻域继续扩展（仅背景色）
```

### 判定条件

```typescript
isBackgroundCell(row, col) =
  backgroundSet.has(paletteId) && !cell.isExternal
```

已是外部的格不再作为扩展源。

## 设计动机

拼豆图纸常只需主体，贴边的大片白底无需逐颗拼豆。洪水填充从边界出发，天然区分「外部背景」与「内部同色区域」。

## 下游影响

- `computeColorStats` / `countTotalBeads` 跳过 `isExternal`
- 编辑器填充、矩形绘制跳过外部格
- 导出 PNG/PDF 可选择是否显示外部格

## 相关文档

- [run-pipeline.md](./run-pipeline.md)
- [trim-grid.md](./trim-grid.md)
