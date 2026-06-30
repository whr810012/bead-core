# 矩形区域上色（paintRect）

**源文件：** `src/edit/paintRect.ts`

## 作用

编辑器矩形工具：在轴对齐矩形范围内，将所有**非外部**格子设为目标色号。

## 签名

```typescript
paintRect(grid, row0, col0, row1, col1, paletteId, hex): MappedGrid
```

`row0,col0` 与 `row1,col1` 可为任意对角，内部经 `normalizeRect` 规范为 `min/max`。

## 算法

```typescript
for row in [r0..r1]:
  for col in [c0..c1]:
    if cell exists && !cell.isExternal:
      cell = { paletteId, hex }
```

- 先 `cloneGrid` 深拷贝
- **不**检查原色，矩形内一律覆盖
- 外部格（`isExternal`）跳过，保持透明/背景语义

## 与 fillRegion 对比

| | paintRect | fillRegion |
|--|-----------|------------|
| 范围 | 轴对齐矩形 | 同色连通域 |
| 覆盖条件 | 矩形内所有非外部格 | 与起点同色的四连通块 |
| 典型用途 | 批量改色、铺底色 | 油漆桶换色 |

## 相关文档

- [fill-region.md](./fill-region.md)
