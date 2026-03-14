# 模板

模板是预定义的项目结构，用于快速创建新项目。QCli 支持从多种来源获取模板。

## 查看可用模板

使用 `qcl template list` 查看所有可用模板：

```bash
qcl template list
```

### 输出示例

```
可用的模板:
  - react
  - vue2
  - vue3
```

## 使用模板创建项目

```bash
qcl app create --template=<模板名> <项目名>
```

### 示例

```bash
# 创建 Vue 3 项目
qcl app create --template=vue3 my-vue3-app

# 创建 React 项目
qcl app create --template=react my-react-app
```

## 模板来源

模板可以从以下来源获取：

- **本地目录** - 本地文件系统
- **Git 仓库** - GitHub、GitLab 等
- **FTP 服务器** - FTP 服务器上的模板

## 模板定义

模板在仓库的 `meta.yaml` 文件中定义：

```yaml
templates:
  # 简单路径
  react:
    root: packages/react
  
  # 支持 glob 模式
  vue3:
    root: packages/vue3/**
  
  # 多个路径
  vue2:
    root:
      - packages/vue2/**
      - packages/vue2-cli/**
```

## 路径说明

### 简单路径

```yaml
react:
  root: packages/react
```

匹配 `packages/react/` 目录下的所有内容。

### Glob 模式

```yaml
vue3:
  root: packages/vue3/**
```

`**` 表示递归匹配所有文件和目录。

### 多个路径

```yaml
vue2:
  root:
    - packages/vue2/**
    - packages/vue2-cli/**
```

可以指定多个路径，所有匹配的内容都会被复制到项目中。

## 创建自定义模板

### 1. 准备模板文件

创建模板目录结构：

```
my-templates/
  ├── meta.yaml
  └── packages/
      └── vue3/
          ├── src/
          ├── package.json
          └── ...
```

### 2. 定义 meta.yaml

```yaml
templates:
  vue3:
    root: packages/vue3/**
```

### 3. 配置仓库

在 `.qclrc` 中添加仓库配置：

```yaml
repos:
  - local:
      type: local
      url: /path/to/my-templates
```

### 4. 使用模板

```bash
qcl app create --template=vue3 my-app
```

## 模板变量（未来功能）

未来版本可能会支持模板变量，例如：

```yaml
templates:
  vue3:
    root: packages/vue3/**
    variables:
      - name: projectName
        prompt: "项目名称"
        default: "my-app"
```

## 相关命令

- `qcl template list` - 列出可用模板
- `qcl app create` - 使用模板创建项目

## 最佳实践

1. **使用语义化的模板名称**
2. **保持模板结构清晰**
3. **在模板中包含 README.md**
4. **使用 glob 模式匹配整个目录**

