# 网格裁边与翻转（trimGrid）

**源文件：** `src/edit/trimGrid.ts`

## 作用

### trimGrid — 自动裁边

裁掉四周**整行或整列均为 `isExternal`** 的空白边框，缩小有效图纸范围。

常用于去除上传图四周透明/白边后的无效区域。

### flipGridHorizontal / flipGridVertical

水平或垂直翻转整个网格，供编辑器镜像操作。

## trimGrid 算法

```
top, bottom, left, right = 网格四边初始索引

while 顶行全 external → top++
while 底行全 external → bottom--
while 左列全 external → left++
while 右列全 external → right--

若 top > bottom 或 left > right → 返回原 grid（避免空结果）
else → slice(top..bottom, left..right)
```

### 判定函数

- `rowIsAllExternal(row)`：该行每个 `cell.isExternal`
- `colIsAllExternal(grid, col)`：该列每个 `cell.isExternal`

## 翻转

```typescript
flipGridHorizontal: 每行 reverse()
flipGridVertical:   行数组 reverse()
```

格子对象浅拷贝在新位置，paletteId/hex 不变。

## 典型流程

```
生成网格 → markExternalBackground → trimGrid → 得到紧凑主体
```

## 相关文档

- [flood-fill-background.md](./flood-fill-background.md)
