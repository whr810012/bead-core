# CIEDE2000 感知色差（deltaE2000）

**源文件：** `src/color/ciede2000.ts`

## 作用

提供符合国际标准的**感知色差**计算，用于：

- 色板量化（[quantize.md](./quantize.md)）
- 色板最近色查找（[palette-match.md](./palette-match.md)）
- 区域合并相似判定（[merge-regions.md](./merge-regions.md)，经 `colorDistance` 封装）

相较 RGB 欧氏距离或简单 Oklab，CIEDE2000 更贴近人眼对「两颜色有多像」的判断，与主流拼豆工具一致。

## 色彩空间转换

### sRGB → 线性 RGB

```typescript
n <= 0.04045 ? n / 12.92 : pow((n + 0.055) / 1.055, 2.4)
```

### 线性 RGB → CIELAB（D65 白点）

经 XYZ 中间色空间，使用标准矩阵系数与白点归一化（`X/0.95047, Y/1.0, Z/1.08883`）。

导出函数：`rgbToLab(rgb) → { L, a, b }`

## ΔE2000 公式

`deltaE2000(lab1, lab2)` 实现完整 CIEDE2000:2000 流程，包括：

| 步骤 | 内容 |
|------|------|
| 色度修正 G | 补偿 a\* 轴在非灰色区域的旋转 |
| 修正色度 C'、色相 h' | 用于加权 |
| 加权因子 SL, SC, SH | 亮度、色度、色相方向的可变权重 |
| 旋转项 Rt | 蓝色区域色差修正 |
| 最终 ΔE | `sqrt(dL² + dC² + dH² + Rt·dC·dH)` |

返回值：**无量纲色差**，0 表示完全相同，通常 ΔE < 1 人眼难辨，ΔE > 5 明显可辨。

## 缓存

```typescript
getCachedLab(rgb)   // Map<"r,g,b", LabColor>
```

同一 RGB 在大量格子中重复出现时避免重复转换。

## 对外封装

```typescript
perceptualColorDistance(rgb1, rgb2)  // → deltaE2000
```

`color/oklab.ts` 中的 `colorDistance` 委托到此函数，供合并等区域算法统一使用。

## 典型 ΔE 参考

| ΔE | 感知 |
|----|------|
| 0 | 完全一致 |
| 1～2 | 极细微差异 |
| 3～5 | 可察觉 |
| >10 | 明显不同色 |

拼豆场景下，合并阈值 `mergeThreshold` 即在 ΔE 尺度上衡量「多像算同一色」。

## 相关文档

- [quantize.md](./quantize.md)
- [palette-match.md](./palette-match.md)
- [merge-regions.md](./merge-regions.md)
