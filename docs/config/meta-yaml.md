# meta.yaml 配置详解

`meta.yaml` 是仓库的元数据配置文件，定义了模板、插件和 Hygen 配置。

## 文件位置

`meta.yaml` 文件位于仓库根目录：

```
repo/
├── meta.yaml
├── templates/
└── addons/
```

## 配置结构

### 基本结构

```yaml
# 模板配置
templates:
  vue3:
    root: templates/vue3/**

# 插件配置
addons:
  my-plugin:
    root: addons/my-plugin/**

# Hygen 配置（可选）
hygen:
  enabled: true
  templatesDir: _templates

# 原子化模板配置（可选）
atomic:
  button:
    type: component
    root: atomic/button/**
```

## 模板配置

### 基础模板

```yaml
templates:
  vue3:
    root: templates/vue3/**
    description: Vue 3 项目模板
    version: 1.0.0
```

### 模板字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `root` | string/array | ✅ | 模板路径（支持 glob 模式） |
| `description` | string | ❌ | 模板描述 |
| `version` | string | ❌ | 模板版本 |
| `hygen` | boolean | ❌ | 是否启用 Hygen |
| `templatesDir` | string | ❌ | Hygen 模板目录 |

### 多路径模板

```yaml
templates:
  vue3:
    root:
      - templates/vue3/**
      - templates/shared/**
```

## 插件配置

### 统一管理（推荐）

```yaml
addons:
  root: ./addons/
  target_dir: ./addons/
```

然后在 `addons/` 目录下创建插件目录。

### 单独配置

```yaml
addons:
  my-plugin:
    root: addons/my-plugin/**
    description: 我的插件
    version: 1.0.0
```

### 插件字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `root` | string/array | ✅ | 插件路径（支持 glob 模式） |
| `description` | string | ❌ | 插件描述 |
| `version` | string | ❌ | 插件版本 |

## 原子化模板配置

### 基础配置

```yaml
atomic:
  button:
    type: component
    description: 按钮组件
    version: 1.0.0
    root: atomic/button/**
    target: src/components/ui
    dependencies: []
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | ✅ | 类型（component/module/template/addon） |
| `description` | string | ❌ | 描述 |
| `version` | string | ❌ | 版本 |
| `root` | string/array | ✅ | 模板路径 |
| `target` | string | ❌ | 安装目标目录 |
| `dependencies` | array | ❌ | 依赖项列表 |

### 依赖关系

```yaml
atomic:
  button:
    type: component
    root: atomic/button/**
    dependencies: []

  table:
    type: component
    root: atomic/table/**
    dependencies:
      - button  # 依赖 button 组件
```

## Hygen 配置

### 全局配置

```yaml
hygen:
  enabled: true
  templatesDir: _templates
```

### 模板级别配置

```yaml
templates:
  vue3:
    root: templates/vue3/**
    hygen: true
    templatesDir: _templates
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `enabled` | boolean | ✅ | 是否启用 Hygen |
| `templatesDir` | string | ❌ | Hygen 模板目录（默认：`_templates`） |

## 完整示例

```yaml
# 模板配置
templates:
  vue3:
    root: templates/vue3/**
    description: Vue 3 项目模板
    version: 1.0.0
    hygen: true
    templatesDir: _templates

  react:
    root: templates/react/**
    description: React 项目模板
    version: 1.0.0

# 插件配置（统一管理）
addons:
  root: ./addons/
  target_dir: ./addons/

# 原子化模板配置
atomic:
  button:
    type: component
    description: 按钮组件
    version: 1.0.0
    root: atomic/button/**
    target: src/components/ui
    dependencies: []

  table:
    type: component
    description: 表格组件
    version: 1.0.0
    root: atomic/table/**
    target: src/components/ui
    dependencies:
      - button

  api-module:
    type: module
    description: API 模块
    version: 1.0.0
    root: atomic/api-module/**
    target: src/modules
    dependencies: []

# Hygen 全局配置
hygen:
  enabled: true
  templatesDir: _templates
```

## 路径模式

支持 glob 模式：

- `templates/vue3/**`：匹配所有文件
- `templates/vue3/*`：匹配一级目录
- `templates/vue3/**/*.ts`：匹配所有 .ts 文件

## 常见问题

### Q: 如何配置多个模板？

A: 在 `templates` 下添加多个键值对：

```yaml
templates:
  vue3:
    root: templates/vue3/**
  react:
    root: templates/react/**
```

### Q: 路径配置错误怎么办？

A: 检查路径是否正确，支持相对路径和 glob 模式。

### Q: 如何更新模板版本？

A: 修改 `version` 字段，并更新对应的模板路径。

