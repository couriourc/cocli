# VitePress 文档站点

这是 CoCli 的文档站点，使用 VitePress 构建。

## 文档结构

```
docs/
  ├── .vitepress/          # VitePress 配置
  │   ├── config.ts        # 配置文件
  │   └── theme/           # 主题自定义
  ├── guide/               # 指南文档
  │   ├── getting-started.md
  │   ├── installation.md
  │   ├── init.md
  │   ├── workspace.md
  │   ├── app.md
  │   ├── template.md
  │   └── addons.md
  ├── commands/            # 命令参考
  │   ├── index.md
  │   ├── app.md
  │   ├── template.md
  │   ├── addons.md
  │   ├── workspace.md
  │   ├── config.md
  │   └── init.md
  ├── config/              # 配置文档
  │   ├── index.md
  │   ├── qclrc.md
  │   ├── qclocal.md
  │   ├── repos.md
  │   └── meta.md
  ├── examples/            # 示例文档
  │   ├── index.md
  │   ├── vue-project.md
  │   ├── workspace.md
  │   ├── addons.md
  │   └── inherit.md
  └── index.md             # 首页
```

## 开发

启动开发服务器：

```bash
pnpm docs:dev
```

访问 http://localhost:5173 查看文档。

## 构建

构建生产版本：

```bash
pnpm docs:build
```

构建后的文件在 `docs/.vitepress/dist` 目录。

## 预览

预览构建结果：

```bash
pnpm docs:preview
```

## 部署

### GitHub Pages

1. 构建文档：
   ```bash
   pnpm docs:build
   ```

2. 配置 GitHub Actions 自动部署（可选）

3. 在仓库设置中启用 GitHub Pages，指向 `docs/.vitepress/dist` 目录

### Vercel / Netlify

直接连接 GitHub 仓库，VitePress 会自动识别并部署。

### 自定义部署

将 `docs/.vitepress/dist` 目录的内容上传到任何静态网站托管服务。

