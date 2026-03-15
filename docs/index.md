---
layout: home

hero:
  name: CoCli
  text: 灵活的项目脚手架工具
  tagline: 支持多源模板、插件管理、工作区管理、Hygen 集成
  image:
    src: /logo.png
    alt: CoCli
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/couriourc/cocli

features:
  - icon: 🚀
    title: 零配置启动
    details: 无需手动 init，直接使用默认模板创建项目，对标 shadcn 的极简交互体验
  - icon: 🧩
    title: 原子化模板
    details: 支持按需添加单个组件/模块，而非全量模板引入，灵活组合项目结构
  - icon: 🔌
    title: 插件系统
    details: 强大的插件管理，支持添加、同步、移除，轻松扩展项目功能
  - icon: 🏢
    title: 工作区管理
    details: 多工作区支持，团队协作更高效，配置隔离更清晰
  - icon: 📦
    title: 多源仓库
    details: 支持 Git、FTP、本地仓库，灵活配置模板和插件源
  - icon: ⚡
    title: Hygen 集成
    details: 内置 Hygen 代码生成器，支持自定义生成器，提升开发效率
---

## 快速开始

### 1. 安装

```bash
npm install -g cocli
# 或
pnpm add -g cocli
```

### 2. 创建项目

```bash
# 零配置启动（使用默认模板）
cocli create my-app

# 指定模板
cocli create my-app --template=vue3
```

### 3. 添加组件

```bash
# 添加原子化模板项
cocli add button
cocli add table

# 列出可用项
cocli list
```

## 核心特性

### 🎯 零配置启动

无需任何配置，直接创建项目：

```bash
cocli create my-app
```

### 🧩 原子化模板系统

按需添加组件/模块，而非全量引入：

```bash
cocli add button
cocli add table --version=1.0.0
```

### 🔌 插件管理

轻松管理项目插件：

```bash
cocli addons add my-plugin
cocli addons sync
```

### 🏢 工作区管理

支持多工作区，团队协作更高效：

```bash
cocli workspace init my-workspace
cocli workspace list
```

## 使用场景

- **个人项目**：快速创建项目模板，按需添加组件
- **团队协作**：统一模板和插件管理，保持项目一致性
- **企业级**：多工作区、多源仓库，灵活配置

## 下一步

- 📖 [阅读完整指南](/guide/getting-started)
- 📚 [查看命令参考](/guide/commands)
- ⚙️ [了解配置选项](/config/qclrc)
- 💡 [查看使用示例](/examples/basic)

