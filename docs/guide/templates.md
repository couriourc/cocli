# 模板系统

CoCli 的模板系统支持多种模板类型，包括完整项目模板和原子化模板片段。

## 模板类型

### 完整项目模板

完整项目模板包含一个完整项目的所有文件，适合快速创建新项目。

**示例：**

```bash
cocli create my-app --template=vue3
```

### 原子化模板

原子化模板是独立的组件或模块，可以按需添加到现有项目中。

**示例：**

```bash
cocli add button
cocli add table
```

## 使用模板

### 创建项目

使用模板创建新项目：

```bash
# 使用默认模板
cocli create my-app

# 指定模板
cocli create my-app --template=vue3

# 查看可用模板
cocli template list
```

### 添加原子化模板

在现有项目中添加原子化模板项：

```bash
# 添加单个组件
cocli add button

# 添加多个组件
cocli add button table form

# 指定版本
cocli add button --version=1.0.0

# 强制覆盖
cocli add button --force
```

## Hygen 集成

CoCli 支持 Hygen 代码生成器，可以在创建项目后自动进入交互模式。

### 启用 Hygen

在 `meta.yaml` 中配置：

```yaml
hygen:
  enabled: true
  templatesDir: _templates
```

### 使用 Hygen

创建项目后，如果模板启用了 Hygen，会自动进入交互模式：

```bash
cocli create my-app --template=vue3
```

**输出：**

```
🎨 正在启动 Hygen 交互模式...
💡 提示: 你可以使用 Hygen 生成器来创建项目结构

? 请选择生成器类型：component
? 组件名称：button
✔ 组件创建成功
```

### 手动运行 Hygen

如果项目已包含 Hygen 模板，可以手动运行：

```bash
cd my-app
npm run g
# 或
hygen
```

## 模板依赖

原子化模板支持依赖关系，添加模板时会自动安装依赖。

**示例：**

```yaml
# meta.yaml
atomic:
  table:
    type: component
    root: atomic/table/**
    dependencies:
      - button  # 自动安装 button 组件
```

当运行 `cocli add table` 时，会自动安装 `button` 组件。

## 自定义模板

### 创建模板

创建新模板：

```bash
cocli template create my-template
```

这会在当前仓库中创建模板目录结构。

### 模板结构

```
templates/
└── my-template/
    ├── package.json
    ├── src/
    │   └── main.ts
    └── README.md
```

### 配置模板

在 `meta.yaml` 中配置模板：

```yaml
templates:
  my-template:
    root: templates/my-template/**
    description: 我的自定义模板
    version: 1.0.0
```

### 创建原子化模板

创建原子化模板项：

```yaml
atomic:
  my-component:
    type: component
    description: 我的组件
    version: 1.0.0
    root: atomic/my-component/**
    target: src/components
    dependencies: []
```

## 模板版本化

模板支持版本管理，可以指定特定版本：

```bash
cocli add button --version=1.0.0
```

在 `meta.yaml` 中配置版本：

```yaml
atomic:
  button:
    version: 1.0.0
    root: atomic/button/v1.0.0/**
```

## 模板缓存

CoCli 会自动缓存模板，首次下载后可以在离线状态下使用。

缓存位置：`~/.cocli/cache`

## 最佳实践

1. **版本锁定**：生产环境建议指定版本，避免更新导致兼容问题
2. **依赖管理**：合理使用依赖关系，避免循环依赖
3. **模板组织**：按类型组织模板（component/module/template）
4. **文档完善**：为模板添加清晰的描述和 README

## 常见问题

### Q: 如何更新模板？

A: 模板更新后，使用 `--force` 参数强制更新：

```bash
cocli add button --force
```

### Q: 模板依赖如何处理？

A: CoCli 会自动解析并安装依赖，无需手动处理。

### Q: 如何创建私有模板？

A: 使用本地仓库或私有 Git 仓库配置模板源。

