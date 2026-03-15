# CoCli 快速开始指南（优化版）

## 安装

```bash
npm install -g cocli
# 或
pnpm add -g cocli
```

## 零配置启动（对标 shadcn）

无需任何配置，直接创建项目：

```bash
# 使用默认模板（vue3）
cocli create my-app

# 指定模板
cocli create my-app --template=react
```

## 原子化添加（对标 shadcn）

按需添加组件/模块，而非全量引入：

```bash
# 添加单个组件
cocli add button

# 添加模块（自动安装依赖）
cocli add table  # 自动安装 button 依赖

# 指定版本
cocli add button --version=1.0.0

# 列出所有可用项
cocli list

# 按类型列出
cocli list component
cocli list module

# 移除项
cocli remove button
```

## 配置管理

### 简化配置（可选）

```bash
# 初始化配置（可选，零配置启动无需此步骤）
cocli init

# 查看配置
cocli config list

# 获取配置值
cocli config get repos

# 设置配置值
cocli config set repos '[{"github":{"repo":"..."}}]'

# 可视化编辑
cocli config edit
```

### 配置文件格式

**cocli.json**（新格式，推荐）：
```json
{
  "repos": [
    {
      "github": {
        "type": "git",
        "repo": "https://github.com/user/repo"
      }
    }
  ],
  "items": ["button", "table"]
}
```

**.qclrc**（旧格式，仍然支持）：
```yaml
repos:
  - github:
      type: git
      repo: https://github.com/user/repo
```

### 环境变量支持

```bash
export COCLI_REPO='[{"github":{"repo":"..."}}]'
export COCLI_USERNAME="your-username"
export COCLI_TOKEN="your-token"
export COCLI_NO_CONFIG=true  # 不创建配置文件（无侵入模式）
```

## 核心命令

```bash
# 创建项目
cocli create <name>              # 零配置启动
cocli create <name> --template=<template>

# 原子化添加/移除
cocli add <item>                 # 添加模板项
cocli add <item> --version=<ver> # 指定版本
cocli remove <item>              # 移除模板项
cocli list [type]                # 列出可用项

# 配置管理
cocli init                       # 初始化配置（可选）
cocli config list                # 列出配置
cocli config get <key>           # 获取配置值
cocli config set <key> <value>   # 设置配置值
cocli config edit                # 可视化编辑

# 兼容旧命令（向后兼容）
cocli app create                 # 等同于 cocli create
cocli template list              # 等同于 cocli list
cocli addons add                 # 等同于 cocli add
```

## 模板仓库配置

在 `meta.yaml` 中添加原子化配置：

```yaml
# 原子化模板配置
atomic:
  button:
    type: component
    description: 按钮组件
    version: 1.0.0
    root: components/button/**
    target: src/components/ui
    dependencies: []

  table:
    type: component
    description: 表格组件
    version: 1.0.0
    root: components/table/**
    target: src/components/ui
    dependencies:
      - button  # 自动安装依赖
```

参考 `repo/meta-atomic.yaml.example` 获取完整示例。

## 特性对比

| 特性 | shadcn | CoCli（优化后） |
|------|--------|----------------|
| 零配置启动 | ✅ | ✅ |
| 原子化添加 | ✅ | ✅ |
| 无侵入 | ✅ | ✅ |
| 版本化 | ✅ | ✅ |
| 离线缓存 | ✅ | ✅ |
| 简化配置 | ✅ | ✅ |

## 最佳实践

1. **零配置启动**：优先使用默认模板，减少配置负担
2. **原子化添加**：按需添加组件/模块，避免全量引入
3. **版本锁定**：生产环境指定版本，避免更新导致兼容问题
4. **无侵入集成**：生成的项目独立运行，不依赖 CoCli

## 更多信息

- 详细优化说明：查看 `OPTIMIZATION.md`
- 完整文档：查看 `docs/` 目录

