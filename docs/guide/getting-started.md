# 快速开始

欢迎使用 QCli！本指南将帮助你在几分钟内开始使用 QCli。

## 什么是 QCli？

QCli 是一个灵活、强大的项目脚手架工具，支持从多种来源（Git、FTP、本地目录）获取模板和插件。它可以帮助你：

- 🚀 快速创建新项目
- 🔌 管理项目插件
- 📦 从多个仓库获取模板和插件
- 🎯 管理工作区
- ⚙️ 灵活的配置管理

## 安装

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
git clone https://github.com/couriourc/qcli.git
cd qcli/apps/main
cargo build --release
```

## 第一步：初始化配置

使用 `qcl init` 命令创建配置文件：

```bash
qcl init
```

这将引导你完成配置文件的创建，包括：

- 全局认证信息（可选）
- 仓库配置（local、github、gitlab、ftp）

或者使用非交互模式快速创建默认配置：

```bash
qcl init -y
```

## 创建你的第一个项目

1. **查看可用模板**

   ```bash
   qcl template list
   ```

2. **创建项目**

   ```bash
   qcl app create --template=vue3 my-first-app
   ```

3. **查看项目列表**

   ```bash
   qcl app list
   ```

## 添加插件

1. **查看可用插件**

   ```bash
   qcl addons list
   ```

2. **查看插件详情**

   ```bash
   qcl addons detail vue3-funs
   ```

3. **添加插件到项目**

   ```bash
   cd my-first-app
   qcl addons add vue3-funs .
   ```

## 下一步

- 📖 阅读 [安装指南](/guide/installation) 了解更多安装选项
- 📚 查看 [命令参考](/commands/) 了解所有可用命令
- ⚙️ 了解 [配置文件](/config/) 的详细说明
- 💡 查看 [示例](/examples/) 学习更多用法

