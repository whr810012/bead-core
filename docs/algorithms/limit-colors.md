# 最大颜色数限制（limitGridColors）

**源文件：** `src/remap/limitColors.ts`

## 作用

当用户设置 `maxColors > 0` 时，将网格中**非外部格子**使用的色号种类压缩到不超过 `maxColors`，并将被剔除的格子重映射到保留色中最接近的颜色。

`maxColors = 0` 表示不限制，直接返回原网格。

## 算法步骤

### 1. 统计用量

```typescript
countPaletteUsage(grid)  // 跳过 isExternal
```

得到 `Map<paletteId, count>`。

### 2. 选取保留色

按用量降序排序，取前 `maxColors` 个 `paletteId` 构成 `allowedIds`。

### 3. 重映射被剔除格

对每个非外部、不在 `allowedIds` 中的格子：

```typescript
nearestAmong(paletteId, hex, allowedIds, palette)
```

在允许集合内找 ΔE 最近的色板条目，替换该格 `paletteId` 与 `hex`。

## 与合并的关系

流水线中 **先合并、后限色**：

- 合并减少细碎邻域
- 限色在合并结果上按全局用量截断

若先限色再合并，可能因合并引入新色而突破上限。

## 使用建议

| 场景 | maxColors |
|------|-----------|
| 不限制（默认） | 0 |
| 头像 | 12～24 |
| 风景 | 16～32 |

限色过少会导致颜色不全、层次丢失；UI 提示见 `SettingsDrawer.vue`。

## 相关文档

- [run-pipeline.md](./run-pipeline.md)
- [palette-match.md](./palette-match.md)
