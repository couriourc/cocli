# CoCli 文档

这是 CoCli 的 VitePress 文档站点。

## 本地开发

启动开发服务器：

```bash
pnpm docs:dev
```

访问 http://localhost:5173

## 构建

构建静态文件：

```bash
pnpm docs:build
```

构建结果在 `.vitepress/dist` 目录。

## 预览

预览构建结果：

```bash
pnpm docs:preview
```

## 部署

### GitHub Pages

1. 构建文档：`pnpm docs:build`
2. 将 `.vitepress/dist` 目录推送到 `gh-pages` 分支
3. 在 GitHub 仓库设置中启用 Pages

### Vercel

1. 连接 GitHub 仓库
2. 构建命令：`pnpm docs:build`
3. 输出目录：`.vitepress/dist`

## 文档结构

```
docs/
├── index.md              # 首页
├── guide/                # 指南
│   ├── getting-started.md
│   ├── commands.md
│   ├── templates.md
│   ├── addons.md
│   ├── workspace.md
│   ├── repo.md
│   └── advanced.md
├── config/               # 配置参考
│   ├── qclrc.md
│   ├── meta-yaml.md
│   └── env.md
└── examples/             # 使用示例
    ├── basic.md
    ├── vue3-project.md
    ├── team.md
    └── troubleshooting.md
```

## 贡献

欢迎提交 PR 改进文档！

