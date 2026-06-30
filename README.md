# @wangdandan810012/bead-core

蛋蛋拼豆核心算法库 — 将 RGBA 像素图转换为拼豆色号网格，支持 CIEDE2000 感知配色、区域合并、背景识别与编辑工具。

- **零运行时依赖**，不绑定 UI 框架
- 可在 **Node.js ≥ 18** 或 **浏览器** 中使用
- 在线演示：<https://dandanpindou.netlify.app>

## 安装

```bash
npm install @wangdandan810012/bead-core
```

本包为 **ESM** 模块，请在 `package.json` 中设置 `"type": "module"`，或在 TypeScript 中使用 `"module": "ESNext"`。

## 核心概念

### 色板 `PaletteEntry[]`

每个色号包含唯一 ID、显示色值，以及各品牌对应的豆号：

```typescript
import type { PaletteEntry } from '@wangdandan810012/bead-core'

const palette: PaletteEntry[] = [
  {
    id: 'red-01',
    hex: '#E74C3C',
    codes: { MARD: 'A1', COCO: 'A1', MANMAN: 'A1', PANPAN: 'A1', MIXIAOWO: 'A1' },
  },
  {
    id: 'neutral-001',
    hex: '#FFFFFF',
    codes: { MARD: 'H1', COCO: 'H1', MANMAN: 'H1', PANPAN: 'H1', MIXIAOWO: 'H1' },
  },
]
```

`codes` 的键为品牌体系 `BrandSystem`：`MARD` | `COCO` | `MANMAN` | `PANPAN` | `MIXIAOWO`。不使用某品牌时填空字符串即可。

### 像素数据

所有图像输入均为 **RGBA 格式** 的 `Uint8ClampedArray`，长度 = `width × height × 4`，按行优先排列。

### 输出网格 `MappedGrid`

二维数组 `MappedCell[][]`，每个格子包含：

| 字段 | 说明 |
|------|------|
| `paletteId` | 匹配到的色板 ID |
| `hex` | 显示用十六进制色值 |
| `isExternal` | 可选，标记为外部背景（不计入拼豆数量） |

---

## 快速开始

完整流程：**读取图片 → 预处理 → 生成图纸 → 统计色号**。

```typescript
import {
  prepareSourcePixels,
  runPipeline,
  computeColorStats,
  countTotalBeads,
  trimGrid,
  type PaletteEntry,
  type BrandSystem,
} from '@wangdandan810012/bead-core'

// 1. 准备色板与像素（见下方「浏览器 / Node 读取图片」）
const palette: PaletteEntry[] = [/* ... */]
const pixels: Uint8ClampedArray = /* RGBA */
const width = 800
const height = 600

// 2. 图像预处理（可选）
const adjusted = prepareSourcePixels(
  pixels, width, height,
  { brightness: 0, contrast: 12, saturation: 0 },  // 亮度 / 对比度 / 饱和度
  { denoise: false, sharpen: true },                  // 降噪 / 锐化
)

// 3. 运行主流水线
const { grid, width: gridW, height: gridH } = runPipeline(adjusted, width, height, {
  gridWidth: 80,              // 输出网格宽度（高度按比例自动计算）
  mode: 'average',            // 'average' 照片 | 'dominant' 卡通/像素风
  mergeThreshold: 5,          // 相似色合并阈值，0 = 不合并
  maxColors: 0,               // 最大颜色数，0 = 不限
  palette,
  backgroundPaletteIds: ['neutral-001'],  // 视为背景的色号 ID
  excludedPaletteIds: [],               // 排除的色号（会重映射到最近色）
})

// 4. 裁掉四周空白背景（可选）
const trimmed = trimGrid(grid)

// 5. 统计色号
const brand: BrandSystem = 'MARD'
const stats = computeColorStats(trimmed, brand, (paletteId, b) => {
  const entry = palette.find((p) => p.id === paletteId)
  return entry?.codes[b] ?? paletteId
})

console.log(`网格 ${gridW}×${gridH}，共 ${countTotalBeads(trimmed)} 颗豆`)
console.log(stats) // [{ paletteId, hex, count, displayCode }, ...]
```

---

## 浏览器：从 Canvas 读取像素

```typescript
import { runPipeline, type PaletteEntry } from '@wangdandan810012/bead-core'

async function imageToGrid(imageUrl: string, palette: PaletteEntry[]) {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = imageUrl
  await img.decode()

  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)

  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)

  return runPipeline(data, width, height, {
    gridWidth: 64,
    mode: 'average',
    mergeThreshold: 0,
    maxColors: 0,
    palette,
    backgroundPaletteIds: [],
    excludedPaletteIds: [],
  })
}
```

## Node.js：从文件读取像素

Node 本身不提供图像解码，需配合 `sharp` 等库：

```typescript
import sharp from 'sharp'
import { runPipeline, type PaletteEntry } from '@wangdandan810012/bead-core'

async function fileToGrid(filePath: string, palette: PaletteEntry[]) {
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  return runPipeline(new Uint8ClampedArray(data), info.width, info.height, {
    gridWidth: 64,
    mode: 'average',
    mergeThreshold: 0,
    maxColors: 0,
    palette,
    backgroundPaletteIds: [],
    excludedPaletteIds: [],
  })
}
```

> `sharp` 不是本库依赖，需自行安装：`npm install sharp`

---

## 流水线参数说明

`runPipeline` 按以下顺序执行各步骤：

```
convertImageToPattern → mergeSimilarRegions → limitGridColors
  → markExternalBackground → remapExcludedColors
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `gridWidth` | `number` | 输出网格列数，行数 = `round(gridWidth × 原图高 / 原图宽)` |
| `mode` | `'average' \| 'dominant'` | 照片用 `average`（区域均值配色），卡通/像素风用 `dominant`（主色） |
| `mergeThreshold` | `number` | CIEDE2000 色差阈值，合并相邻相似色块；`0` 关闭 |
| `maxColors` | `number` | 限制最终颜色种类数；`0` 不限 |
| `palette` | `PaletteEntry[]` | 可用色板，不能为空 |
| `backgroundPaletteIds` | `string[]` | 从网格四边洪泛填充，标记为 `isExternal: true` |
| `excludedPaletteIds` | `string[]` | 排除的色号，自动重映射到色板中最近色 |

---

## 分步调用（高级）

不需要完整流水线时，可单独使用各模块：

```typescript
import {
  convertImageToPattern,
  mergeSimilarRegions,
  markExternalBackground,
  limitGridColors,
  remapExcludedColors,
} from '@wangdandan810012/bead-core'

// 仅做图片 → 网格转换
let grid = convertImageToPattern(pixels, width, height, {
  gridWidth: 64,
  mode: 'dominant',
  palette,
  excludedPaletteIds: [],
  despeckle: false,  // 去除孤立杂点（仅 average 模式有效）
})

grid = mergeSimilarRegions(grid, 5)
grid = limitGridColors(grid, palette, 20)
grid = markExternalBackground(grid, ['neutral-001'])
grid = remapExcludedColors(grid, palette, ['old-color-id'])
```

---

## 编辑工具

所有编辑函数返回**新网格**（不可变），不修改原数组。

```typescript
import {
  fillRegion,
  paintRect,
  trimGrid,
  flipGridHorizontal,
  flipGridVertical,
  cloneGrid,
} from '@wangdandan810012/bead-core'

// 油漆桶：填充同色连通区域
grid = fillRegion(grid, row, col, 'red-01', '#E74C3C')

// 矩形上色
grid = paintRect(grid, row0, col0, row1, col1, 'blue-01', '#3498DB')

// 裁掉四周全为 external 的行列
grid = trimGrid(grid)

// 翻转
grid = flipGridHorizontal(grid)
grid = flipGridVertical(grid)

// 深拷贝
const copy = cloneGrid(grid)
```

---

## 统计与分区

```typescript
import {
  computeColorStats,
  countTotalBeads,
  countCompleted,
  getConnectedRegions,
} from '@wangdandan810012/bead-core'

// 各色号用量（按 count 降序）
const stats = computeColorStats(grid, 'MARD', codeLookup)

// 非 external 格子总数
const total = countTotalBeads(grid)

// 拼豆进度（completedCells 为 "row,col" 字符串集合）
const done = countCompleted(grid, new Set(['0,0', '1,2']))

// 某色号的所有连通区域（按面积降序）
const regions = getConnectedRegions(grid, 'red-01')
// [{ cells: [{row, col}, ...], paletteId: 'red-01' }, ...]
```

---

## API 一览

| 分类 | 导出 | 说明 |
|------|------|------|
| 流水线 | `runPipeline` | 完整生成流程 |
| 转换 | `convertImageToPattern` | 图片 → 网格 |
| 转换 | `mapImageToGrid` | `convertImageToPattern` 别名 |
| 预处理 | `prepareSourcePixels` | 亮度 / 对比度 / 饱和度 / 锐化 / 降噪 |
| 预处理 | `applyImageAdjustments` / `applyPhotoOptimize` | 分步预处理 |
| 合并 | `mergeSimilarRegions` | 相似色区域合并 |
| 背景 | `markExternalBackground` | 外部背景洪泛标记 |
| 限色 | `limitGridColors` | 限制最大颜色数 |
| 重映射 | `remapExcludedColors` | 排除色重映射 |
| 编辑 | `fillRegion` / `paintRect` | 填充 / 矩形上色 |
| 编辑 | `trimGrid` / `flipGridHorizontal` / `flipGridVertical` | 裁边 / 翻转 |
| 工具 | `cloneGrid` / `gridDimensions` | 克隆 / 尺寸 |
| 统计 | `computeColorStats` / `countTotalBeads` | 色号统计 / 总数 |
| 统计 | `countCompleted` / `getConnectedRegions` | 进度 / 连通域 |
| 色彩 | `findClosestPaletteEntry` / `deltaE2000` | 最近色 / 色差 |
| 色彩 | `hexToRgb` / `rgbToHex` | 颜色转换 |
| 类型 | `PaletteEntry`, `MappedGrid`, `PipelineOptions` 等 | TypeScript 类型 |

完整算法说明见 [docs/algorithms](https://github.com/whr810012/bead-core/blob/main/docs/algorithms/README.md)。

---

## 开发

```bash
git clone https://github.com/whr810012/bead-core.git
cd bead-core
npm install
npm test        # 运行测试
npm run build   # 编译到 dist/
```

## License

MIT — Copyright (c) 2026 蛋蛋 — 见 [LICENSE](./LICENSE)。

## 致谢

算法思路受以下开源项目启发（本库为独立 TypeScript 实现）：

- [Zippland/perler-beads](https://github.com/Zippland/perler-beads)
- [liangdabiao/perler-beads-ai](https://github.com/liangdabiao/perler-beads-ai)
