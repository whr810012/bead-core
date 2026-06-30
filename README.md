# @dandan/bead-core

蛋蛋拼豆核心算法库 — 将 RGBA 像素图转换为拼豆色号网格，支持 CIEDE2000 感知配色、区域合并、背景识别与编辑工具。

**零运行时依赖**，不绑定 UI 框架，可在 Node.js 或浏览器中使用。

在线演示（Web 端）：<https://dandanpindou.netlify.app>

## 安装

```bash
npm install @dandan/bead-core
```

## 快速示例

```typescript
import {
  prepareSourcePixels,
  runPipeline,
  computeColorStats,
  type PaletteEntry,
} from '@dandan/bead-core'

const palette: PaletteEntry[] = [
  { id: 'red-01', hex: '#E74C3C', codes: { MARD: 'A1', COCO: '', MANMAN: '', PANPAN: '', MIXIAOWO: '' } },
]

const pixels: Uint8ClampedArray = /* RGBA */
const width = 100
const height = 100

const adjusted = prepareSourcePixels(
  pixels, width, height,
  { brightness: 0, contrast: 12, saturation: 0 },
  { denoise: false, sharpen: true },
)

const { grid } = runPipeline(adjusted, width, height, {
  gridWidth: 100,
  mode: 'average',
  mergeThreshold: 0,
  maxColors: 0,
  palette,
  backgroundPaletteIds: ['neutral-001'],
  excludedPaletteIds: [],
})
```

## 主要 API

| 导出 | 说明 |
|------|------|
| `runPipeline` | 主流水线 |
| `convertImageToPattern` | 图片 → 网格 |
| `prepareSourcePixels` | 亮度 / 对比度 / 锐化 / 降噪 |
| `mergeSimilarRegions` | 相似色区域合并 |
| `markExternalBackground` | 外部背景标记 |
| `limitGridColors` | 限色 |
| `remapExcludedColors` | 排除色重映射 |
| `fillRegion` / `paintRect` | 编辑工具 |
| `trimGrid` / `flipGrid*` | 裁边与翻转 |
| `computeColorStats` | 色号统计 |

算法文档见 [docs/algorithms](./docs/algorithms/README.md)。

## 开发

```bash
npm install
npm test
npm run build
```

## 发布

```bash
npm login
npm publish --access public
```

## 致谢

算法思路受以下开源项目启发（本库为独立 TypeScript 实现）：

- [Zippland/perler-beads](https://github.com/Zippland/perler-beads)
- [liangdabiao/perler-beads-ai](https://github.com/liangdabiao/perler-beads-ai)

## License

MIT — Copyright (c) 2026 蛋蛋 — 见 [LICENSE](./LICENSE)。
