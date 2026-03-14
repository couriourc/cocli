# QCli

一个灵活、强大的项目脚手架工具，支持从多种来源获取模板和插件。

[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Rust](https://img.shields.io/badge/rust-1.70+-orange.svg)](https://www.rust-lang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.15.0-blue.svg)](https://pnpm.io/)

## ✨ 特性

- 🚀 **快速创建项目** - 使用模板快速创建新项目，支持多种框架和库
- 🔌 **插件系统** - 灵活的插件系统，轻松扩展项目功能
- 📦 **多源支持** - 支持 Git、FTP、本地目录等多种仓库来源
- 🎯 **工作区管理** - 强大的工作区管理功能，轻松管理多个项目
- ⚙️ **配置灵活** - 支持全局配置、项目配置和配置继承
- 🛠️ **智能提示** - 智能错误提示和建议，提升开发体验
- 🤖 **AI 集成** - 内置 AI 功能，支持聊天、建议、工具和技能管理

## 📦 安装

### 使用 pnpm（推荐）

```bash
# 全局安装
pnpm add -g qcl

# 或使用 dlx 直接运行
pnpm dlx qcl@latest <command>
```

### 使用 npm

```bash
npm install -g qcl
```

### 从源码构建

```bash
# 克隆仓库
git clone https://github.com/couriourc/qcli.git
cd qcli

# 安装依赖
pnpm install

# 构建项目
pnpm build

# 运行
cd apps/main
cargo run -- --help
```

## 🚀 快速开始

### 1. 初始化配置

```bash
qcl init
```

这将引导你完成配置文件的创建，包括：
- 全局认证信息（可选）
- 仓库配置（local、github、gitlab、ftp）

或使用非交互模式快速创建默认配置：

```bash
qcl init -y
```

### 2. 创建你的第一个项目

```bash
# 查看可用模板
qcl template list

# 创建项目
qcl app create --template=vue3 my-first-app

# 查看项目列表
qcl app list
```

### 3. 添加插件

```bash
# 查看可用插件
qcl addons list

# 查看插件详情
qcl addons detail vue3-funs

# 添加插件到项目
cd my-first-app
qcl addons add vue3-funs .
```

## 📖 主要命令

### 工作区管理

```bash
# 创建新工作区
qcl workspace create <name> [path]

# 列出所有工作区
qcl workspace list

# 切换到指定工作区
qcl workspace use <name>

# 显示当前工作区
qcl workspace current

# 删除工作区
qcl workspace delete <name>
```

### 应用管理

```bash
# 创建新项目
qcl app create --template=<template> <name>

# 列出当前工作区的应用
qcl app list
```

### 模板管理

```bash
# 列出所有可用模板
qcl template list
```

### 插件管理

```bash
# 列出所有可用插件
qcl addons list [--source=<source>]

# 查看插件详情
qcl addons detail <name>

# 添加插件到项目
qcl addons add <name> <path>

# 同步插件
qcl addons sync <path>
```

### 配置管理

```bash
# 获取配置值
qcl config get <key>

# 设置配置值
qcl config set <key> <value>

# 列出所有配置
qcl config list
```

### AI 功能

```bash
# AI 聊天
qcl ai chat [message]

# AI 建议
qcl ai suggest [context]

# 查看可用工具
qcl ai tools

# 查看资源
qcl ai resources

# 技能管理
qcl ai skills list
qcl ai skills show <name>
qcl ai skills execute <name> [args...]
qcl ai skills create <name>
qcl ai skills delete <name>
```

## 📁 项目结构

```
qcli/
├── apps/
│   └── main/              # 主应用（Rust）
│       ├── src/
│       │   ├── main.rs     # 入口文件
│       │   ├── commands.rs # 命令定义
│       │   ├── config.rs   # 配置管理
│       │   ├── ai.rs       # AI 功能
│       │   ├── skills.rs   # 技能管理
│       │   ├── template.rs # 模板管理
│       │   ├── repo.rs     # 仓库管理
│       │   └── suggest.rs  # 智能建议
│       └── Cargo.toml
├── docs/                   # 文档（VitePress）
│   ├── guide/              # 指南
│   ├── commands/           # 命令参考
│   ├── config/             # 配置说明
│   └── examples/           # 示例
├── package.json            # 根 package.json
├── turbo.json              # Turbo 配置
└── README.md
```

## 🛠️ 开发

### 前置要求

- [Rust](https://www.rust-lang.org/) 1.70 或更高版本
- [Cargo](https://doc.rust-lang.org/cargo/)
- [Node.js](https://nodejs.org/) 18+ 和 [pnpm](https://pnpm.io/) 10.15.0+

### 开发命令

```bash
# 安装依赖
pnpm install

# 开发模式运行
pnpm dev

# 构建项目
pnpm build

# 运行文档开发服务器
pnpm docs:dev

# 构建文档
pnpm docs:build
```

### 运行测试

```bash
cd apps/main
cargo test
```

## 📚 文档

完整的文档请访问：[文档站点](https://your-docs-site.com)

或本地运行文档服务器：

```bash
pnpm docs:dev
```

### 自动部署到 GitHub Pages

项目已配置 GitHub Actions 工作流，当推送到 `main` 或 `master` 分支时，会自动构建并部署文档到 GitHub Pages。

**首次使用前需要配置：**

1. 在 GitHub 仓库设置中启用 GitHub Pages：
   - 进入仓库的 `Settings` → `Pages`
   - 在 `Source` 中选择 `GitHub Actions`

2. 工作流会自动：
   - 监听 `docs/` 目录的变化
   - 使用 pnpm 安装依赖
   - 构建 VitePress 文档
   - 自动设置正确的 base 路径（根据仓库名）
   - 部署到 GitHub Pages

3. 部署完成后，文档将自动发布到：
   - 如果仓库名是 `username.github.io`：`https://username.github.io`
   - 其他情况：`https://username.github.io/仓库名/`

**手动触发部署：**

在 GitHub Actions 页面可以手动触发工作流运行。

## 🤝 贡献

欢迎贡献！请阅读 [贡献指南](docs/CONTRIBUTING.md) 了解如何参与项目。

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📝 许可证

本项目采用 ISC 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

## 🙏 致谢

感谢所有为本项目做出贡献的开发者！

## 📮 反馈

如果你有任何问题或建议，请：

- 提交 [Issue](https://github.com/couriourc/qcli/issues)
- 开启 [Discussion](https://github.com/couriourc/qcli/discussions)

---

Made with ❤️ by the QCli team

