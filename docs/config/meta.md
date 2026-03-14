# 仓库元数据

每个仓库根目录需要包含 `meta.yaml` 文件，用于定义可用的模板和插件。

## meta.yaml 位置

`meta.yaml` 文件必须位于仓库根目录：

```
my-repo/
  ├── meta.yaml        # 元数据文件（必需）
  ├── packages/
  │   ├── vue3/
  │   └── react/
  └── addons/
      ├── add/
      └── minus/
```

## 文件格式

`meta.yaml` 是一个 YAML 格式的文件，包含两个主要部分：`templates` 和 `addons`。

```yaml
# 模板定义
templates:
  # 简单路径（字符串）
  react:
    root: packages/react
  
  # 单个路径（字符串，支持 glob 模式）
  vue3:
    root: packages/vue3/**
  
  # 多个路径（数组）
  vue2:
    root:
      - packages/vue2/**
      - packages/vue2-cli/**

# 插件（Addons）定义
addons:
  # 每个插件需要一个名称
  add:
    root: ./addons/add/**
  
  minus:
    root: ./addons/minus/**
  
  vue2-funs:
    root: ./addons/vue2-funs/**
  
  vue3-funs:
    root: ./addons/vue3-funs/**
```

## 字段说明

### 顶层字段

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `templates` | `object` | 否 | 模板定义映射，键为模板名称，值为模板配置 |
| `addons` | `object` | 否 | 插件定义映射，键为插件名称，值为插件配置 |

**注意：** `templates` 和 `addons` 至少需要存在一个，否则仓库将没有可用的模板或插件。

### templates 字段

`templates` 是一个对象（映射），其中：

- **键（Key）**：模板名称，用于在 `cocli app create --template=<名称>` 中引用
- **值（Value）**：模板配置对象，包含以下字段：

#### TemplateConfig 字段

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `root` | `string \| array<string>` | 是 | 模板根路径，可以是单个路径字符串或路径数组。支持 Glob 模式 |

**示例：**

```yaml
templates:
  # 单个路径（字符串）
  react:
    root: packages/react
  
  # 单个路径（Glob 模式）
  vue3:
    root: packages/vue3/**
  
  # 多个路径（数组）
  vue2:
    root:
      - packages/vue2/**
      - packages/vue2-cli/**
```

### addons 字段

`addons` 是一个对象（映射），其中：

- **键（Key）**：插件名称，用于在 `cocli addons add <名称>` 中引用
- **值（Value）**：插件配置对象，包含以下字段：

#### AddonConfig 字段

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `root` | `string \| array<string>` | 是 | 插件根路径，可以是单个路径字符串或路径数组。支持 Glob 模式 |

**示例：**

```yaml
addons:
  # 单个路径（Glob 模式）
  add:
    root: ./addons/add/**
  
  # 多个路径（数组）
  vue3-funs:
    root:
      - ./addons/vue3-funs/**
      - ./addons/vue3-utils/**
```

### root 字段详解

`root` 字段支持两种格式：

1. **字符串格式**：单个路径
   ```yaml
   root: packages/react/**
   ```

2. **数组格式**：多个路径
   ```yaml
   root:
     - packages/vue2/**
     - packages/vue2-cli/**
   ```

#### root 路径规则

- **相对路径**：相对于仓库根目录
  ```yaml
  root: templates/vue3/**
  ```

- **绝对路径**：从仓库根目录开始（以 `/` 开头）
  ```yaml
  root: /templates/vue3/**
  ```

- **Glob 模式支持**：
  - `**` - 递归匹配所有文件和目录
  - `*` - 匹配单个目录层级
  - `?` - 匹配单个字符

**路径示例：**

| 路径 | 说明 |
|------|------|
| `packages/react` | 匹配 `packages/react` 目录（不递归） |
| `packages/react/**` | 匹配 `packages/react/` 下的所有内容（递归） |
| `packages/react/*` | 匹配 `packages/react/` 下的直接子项（不递归） |
| `./addons/add/**` | 匹配 `addons/add/` 下的所有内容 |
| `/templates/vue3/**` | 从仓库根目录开始的绝对路径 |

## 模板定义

### 简单路径

```yaml
templates:
  react:
    root: packages/react
```

匹配 `packages/react/` 目录下的所有内容。

### Glob 模式

```yaml
templates:
  vue3:
    root: packages/vue3/**
```

`**` 表示递归匹配所有文件和目录。

**支持的 Glob 模式：**

- `**` - 递归匹配所有文件和目录
- `*` - 匹配单个目录层级
- `?` - 匹配单个字符

### 多个路径

```yaml
templates:
  vue2:
    root:
      - packages/vue2/**
      - packages/vue2-cli/**
```

可以指定多个路径，所有匹配的内容都会被复制到项目中。

## 插件定义

插件的定义方式与模板相同：

```yaml
addons:
  add:
    root: ./addons/add/**
  
  vue3-funs:
    root: ./addons/vue3-funs/**
```

### 插件 README.md

建议在每个插件目录中添加 `README.md` 文件，描述插件的功能和使用方法：

```
addons/
  └── add/
      ├── README.md      # 插件说明文档
      └── src/
```

`cocli addons list -v` 和 `cocli addons detail` 命令会自动读取并显示 README.md 内容。

## 路径说明

### 相对路径

相对于仓库根目录：

```yaml
templates:
  vue3:
    root: packages/vue3/**
```

### 绝对路径

从仓库根目录开始的绝对路径：

```yaml
templates:
  vue3:
    root: /packages/vue3/**
```

### Glob 模式示例

| 模式 | 说明 |
|------|------|
| `packages/vue3` | 匹配 `packages/vue3` 目录 |
| `packages/vue3/**` | 匹配 `packages/vue3/` 下的所有内容（递归） |
| `packages/vue3/*` | 匹配 `packages/vue3/` 下的直接子项（不递归） |
| `./addons/add/**` | 匹配 `addons/add/` 下的所有内容 |

## 完整示例

```yaml
# 模板定义
templates:
  # Vue 3 模板
  vue3:
    root: packages/vue3/**
  
  # React 模板
  react:
    root: packages/react/**
  
  # Vue 2 模板（多个路径）
  vue2:
    root:
      - packages/vue2/**
      - packages/vue2-cli/**

# 插件定义
addons:
  # 基础工具插件
  add:
    root: ./addons/add/**
  
  minus:
    root: ./addons/minus/**
  
  # Vue 相关插件
  vue2-funs:
    root: ./addons/vue2-funs/**
  
  vue3-funs:
    root: ./addons/vue3-funs/**
```

## 快速创建仓库

CoCli 提供了便捷的命令来创建和初始化仓库：

### 创建新仓库

```bash
# 在当前目录创建新仓库
cocli repo create my-repo

# 在指定路径创建仓库
cocli repo create my-repo --path /path/to/repo
```

这个命令会：
- 创建仓库目录结构（`templates/` 和 `addons/` 目录）
- 创建空的 `meta.yaml` 文件
- 创建 `README.md` 文件

### 初始化现有目录为仓库

```bash
# 在当前目录初始化仓库
cocli repo init

# 在指定路径初始化仓库
cocli repo init --path /path/to/existing/dir
```

这个命令会：
- 在当前目录创建 `meta.yaml` 文件（如果不存在）
- 创建基本的目录结构（如果不存在）

## 快速创建模板和插件

CoCli 提供了便捷的命令来创建模板和插件，无需手动编辑 `meta.yaml`：

### 创建模板

```bash
# 在仓库目录中创建模板
cd /path/to/repo
cocli template create vue3

# 指定模板路径
cocli template create react --path packages/react

# 指定仓库目录
cocli template create vue3 --repo-dir /path/to/repo
```

### 创建插件

```bash
# 在仓库目录中创建插件
cd /path/to/repo
cocli addons create my-plugin

# 指定插件路径
cocli addons create vue3-utils --path addons/vue3-utils

# 指定仓库目录
cocli addons create my-plugin --repo-dir /path/to/repo
```

这些命令会自动：
- 创建模板/插件目录结构
- 生成 README.md 文件
- 更新或创建 `meta.yaml` 文件

## 最佳实践

1. **使用 Glob 模式** - 使用 `**` 匹配整个目录树
2. **添加 README.md** - 为每个插件添加说明文档
3. **清晰的目录结构** - 保持模板和插件的目录结构清晰
4. **语义化命名** - 使用有意义的模板和插件名称
5. **使用创建命令** - 使用 `cocli template create` 和 `cocli addons create` 快速创建

## 相关文档

- [仓库配置](./repos)
- [模板管理](/guide/template)
- [插件管理](/guide/addons)
- [模板命令参考](/commands/template)
- [插件命令参考](/commands/addons)

