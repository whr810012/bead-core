# 推送到 GitHub

仓库地址：<https://github.com/whr810012/bead-core>

## 首次推送

```bash
git init
git add .
git commit -m "feat: 蛋蛋拼豆核心算法库 @dandan/bead-core"
git branch -M main
git remote add origin git@github.com:whr810012/bead-core.git
git push -u origin main
```

## 发布 npm

```bash
npm login
npm publish --access public
```

## 与 pindou-web 联动

```json
"@dandan/bead-core": "file:../bead-core"
```

发布 npm 后改为 `"@dandan/bead-core": "^0.1.0"`。
