# 贡献文档

欢迎为 CoCli 文档做出贡献！

## 文档结构

文档使用 VitePress 构建，位于 `docs/` 目录：

- **guide/** - 指南文档，介绍核心概念和使用方法
- **commands/** - 命令参考，详细的命令说明
- **config/** - 配置文档，配置文件详解
- **examples/** - 示例文档，实用示例和最佳实践

## 添加新文档

1. 在相应的目录下创建 `.md` 文件
2. 在 `.vitepress/config.ts` 中添加导航和侧边栏配置
3. 使用 Markdown 编写文档内容

## 文档规范

### Markdown 语法

- 使用标准的 Markdown 语法
- 代码块需要指定语言
- 使用 VitePress 的特殊语法（如 `::: tip`、`::: warning` 等）

### 代码示例

```markdown
\`\`\`bash
cocli app create --template=vue3 my-app
\`\`\`
```

### 提示框

```markdown
::: tip 提示
这是一个提示信息
:::

::: warning 警告
这是一个警告信息
:::

::: danger 危险
这是一个危险信息
:::
```

## 本地开发

```bash
# 启动开发服务器
pnpm docs:dev

# 构建文档
pnpm docs:build

# 预览构建结果
pnpm docs:preview
```

## 提交更改

1. Fork 仓库
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

感谢你的贡献！

