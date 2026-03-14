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

`qcl addons list -v` 和 `qcl addons detail` 命令会自动读取并显示 README.md 内容。

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

## 最佳实践

1. **使用 Glob 模式** - 使用 `**` 匹配整个目录树
2. **添加 README.md** - 为每个插件添加说明文档
3. **清晰的目录结构** - 保持模板和插件的目录结构清晰
4. **语义化命名** - 使用有意义的模板和插件名称

## 相关文档

- [仓库配置](./repos)
- [模板管理](/guide/template)
- [插件管理](/guide/addons)

