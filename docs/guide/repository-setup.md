# 仓库源搭建指南

本指南介绍如何搭建和配置 CoCli 的模板和插件仓库源。

## 概述

CoCli 支持多种类型的仓库源：
- **本地目录** (`local`) - 本地文件系统
- **Git 仓库** (`github`/`gitlab`) - GitHub、GitLab 等 Git 托管服务
- **FTP 服务器** (`ftp`) - FTP 服务器

每个仓库源需要包含 `meta.yaml` 文件来定义可用的模板和插件。

## 快速开始

### 1. 创建仓库目录结构

```bash
# 创建仓库根目录
mkdir my-templates-repo
cd my-templates-repo

# 创建模板和插件目录
mkdir -p templates/vue3
mkdir -p addons/vue3-utils
```

### 2. 创建 meta.yaml

在仓库根目录创建 `meta.yaml` 文件：

```yaml
# 模板定义
templates:
  vue3:
    root: templates/vue3/**
  
  react:
    root: templates/react/**

# 插件定义
addons:
  vue3-utils:
    root: addons/vue3-utils/**
  
  common-utils:
    root: addons/common-utils/**
```

### 3. 使用命令创建模板和插件

CoCli 提供了便捷的命令来创建模板和插件：

```bash
# 创建模板
cocli template create vue3 --path templates/vue3 --repo-dir .

# 创建插件
cocli addons create vue3-utils --path addons/vue3-utils --repo-dir .
```

这些命令会自动：
- 创建目录结构
- 生成 README.md 文件
- 更新 `meta.yaml` 文件

## 仓库类型配置

### 本地目录 (local)

适用于本地开发或局域网共享。

#### 配置示例

在 `.qclrc` 中配置：

```yaml
repos:
  - local:
      type: local
      url: /path/to/my-templates-repo
```

#### 目录结构

```
/path/to/my-templates-repo/
├── meta.yaml              # 元数据文件（必需）
├── templates/
│   ├── vue3/
│   │   ├── README.md
│   │   ├── src/
│   │   └── package.json
│   └── react/
│       └── ...
└── addons/
    ├── vue3-utils/
    │   ├── README.md
    │   └── src/
    └── common-utils/
        └── ...
```

### GitHub 仓库

适用于公开或私有的 GitHub 仓库。

#### 配置示例

```yaml
repos:
  - github:
      type: git
      repo: https://github.com/username/templates-repo.git
      token: ghp_xxxxxxxxxxxxx  # 可选，用于私有仓库
```

#### 设置步骤

1. **创建 GitHub 仓库**

   ```bash
   # 在 GitHub 上创建新仓库
   # 例如：https://github.com/username/my-templates
   ```

2. **推送代码**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/my-templates.git
   git push -u origin main
   ```

3. **配置认证（私有仓库）**

   如果需要访问私有仓库，需要配置 Token：
   
   - 在 GitHub 设置中创建 Personal Access Token
   - 在 `.qclrc` 中配置 `token` 字段

### GitLab 仓库

适用于 GitLab 托管的仓库。

#### 配置示例

```yaml
repos:
  - gitlab:
      type: gitlab
      repo: https://gitlab.com/username/templates-repo.git
      token: glpat-xxxxxxxxxxxxx  # 可选，用于私有仓库
```

#### 设置步骤

1. **创建 GitLab 仓库**
2. **推送代码**（同 GitHub）
3. **配置认证**（如需要）

### FTP 服务器

适用于通过 FTP 服务器共享的模板和插件。

#### 配置示例

```yaml
repos:
  - ftp:
      type: ftp
      url: ftp://ftp.example.com/templates
      username: ftp-user
      password: ftp-password
```

#### 设置步骤

1. **准备 FTP 服务器**
   - 确保 FTP 服务器可访问
   - 创建目录结构

2. **上传文件**
   ```bash
   # 使用 FTP 客户端上传文件
   # 确保包含 meta.yaml 文件
   ```

3. **配置认证**
   - 在 `.qclrc` 中配置用户名和密码

## meta.yaml 详解

### 基本结构

```yaml
# 模板定义
templates:
  template-name:
    root: path/to/template/**

# 插件定义
addons:
  addon-name:
    root: path/to/addon/**
```

### 路径配置

#### 简单路径

```yaml
templates:
  react:
    root: templates/react
```

匹配 `templates/react/` 目录下的所有内容。

#### Glob 模式

```yaml
templates:
  vue3:
    root: templates/vue3/**
```

`**` 表示递归匹配所有文件和目录。

**支持的 Glob 模式：**
- `**` - 递归匹配所有文件和目录
- `*` - 匹配单个目录层级
- `?` - 匹配单个字符

#### 多个路径

```yaml
templates:
  vue2:
    root:
      - templates/vue2/**
      - templates/vue2-cli/**
```

可以指定多个路径，所有匹配的内容都会被复制到项目中。

### 完整示例

```yaml
# 模板定义
templates:
  # Vue 3 模板
  vue3:
    root: templates/vue3/**
  
  # React 模板
  react:
    root: templates/react/**
  
  # Vue 2 模板（多个路径）
  vue2:
    root:
      - templates/vue2/**
      - templates/vue2-cli/**

# 插件定义
addons:
  # Vue 3 工具插件
  vue3-utils:
    root: addons/vue3-utils/**
  
  # 通用工具插件
  common-utils:
    root: addons/common-utils/**
  
  # 表单验证插件
  form-validator:
    root: addons/form-validator/**
```

## 模板开发

### 创建模板

#### 方式一：使用命令（推荐）

```bash
cd /path/to/repo
cocli template create vue3 --path templates/vue3
```

#### 方式二：手动创建

1. **创建目录结构**

   ```
   templates/
     └── vue3/
         ├── README.md
         ├── src/
         │   ├── main.js
         │   └── App.vue
         ├── package.json
         └── vite.config.js
   ```

2. **创建 README.md**

   ```markdown
   # Vue 3 模板
   
   这是一个使用 CoCli 创建的 Vue 3 项目模板。
   
   ## 使用方法
   
   ```bash
   cocli app create --template=vue3 <项目名>
   ```
   ```

3. **更新 meta.yaml**

   ```yaml
   templates:
     vue3:
       root: templates/vue3/**
   ```

### 模板最佳实践

1. **清晰的目录结构** - 保持模板结构清晰易懂
2. **包含 README.md** - 说明模板的用途和使用方法
3. **使用语义化命名** - 模板名称应该清晰表达用途
4. **提供示例代码** - 在模板中包含示例代码
5. **版本管理** - 使用 Git 管理模板版本

## 插件开发

### 创建插件

#### 方式一：使用命令（推荐）

```bash
cd /path/to/repo
cocli addons create vue3-utils --path addons/vue3-utils
```

#### 方式二：手动创建

1. **创建目录结构**

   ```
   addons/
     └── vue3-utils/
         ├── README.md
         ├── src/
         │   ├── index.js
         │   └── utils.js
         └── package.json
   ```

2. **创建 README.md**

   ```markdown
   # Vue3 Utils
   
   提供 Vue 3 常用工具函数。
   
   ## 功能
   
   - 格式化日期
   - 数据验证
   - 工具函数
   
   ## 使用方法
   
   ```javascript
   import { formatDate, validate } from './vue3-utils'
   ```
   ```

3. **更新 meta.yaml**

   ```yaml
   addons:
     vue3-utils:
       root: addons/vue3-utils/**
   ```

### 插件最佳实践

1. **单一职责** - 每个插件专注于一个功能领域
2. **清晰的 API** - 提供清晰的接口和文档
3. **包含 README.md** - 详细说明插件功能和使用方法
4. **提供示例** - 在 README 中包含使用示例
5. **版本管理** - 使用 Git 管理插件版本

## 仓库配置

### 在 .qclrc 中配置

```yaml
# 全局认证信息（可选）
username: your-username
password: your-password
token: your-token

# 仓库列表
repos:
  # 本地仓库
  - local:
      type: local
      url: /path/to/local/repo
  
  # GitHub 仓库
  - github:
      type: git
      repo: https://github.com/username/repo.git
      token: ghp_xxxxxxxxxxxxx
  
  # GitLab 仓库
  - gitlab:
      type: gitlab
      repo: https://gitlab.com/username/repo.git
      token: glpat-xxxxxxxxxxxxx
  
  # FTP 仓库
  - ftp:
      type: ftp
      url: ftp://ftp.example.com/templates
      username: ftp-user
      password: ftp-password
```

### 配置优先级

CoCli 会按以下顺序查找配置：

1. **项目目录** - `.qclocal` 文件中的 `repos` 配置
2. **父级目录** - 向上查找父级目录的 `.qclrc` 文件
3. **用户主目录** - `~/.qclrc` 文件
4. **当前目录** - `.qclrc` 文件

## 验证仓库

### 测试模板列表

```bash
# 列出所有可用模板
cocli template list
```

### 测试插件列表

```bash
# 列出所有可用插件
cocli addons list

# 查看详细信息
cocli addons list -v
```

### 测试模板创建

```bash
# 使用模板创建测试项目
cocli app create --template=vue3 test-project

# 检查创建的项目
cd test-project
ls -la
```

## 常见问题

### Q: meta.yaml 文件必须存在吗？

A: 是的，`meta.yaml` 文件是必需的。它定义了仓库中可用的模板和插件。

### Q: 如何更新模板或插件？

A: 更新仓库中的文件，然后用户可以使用 `cocli addons sync` 同步更新。

### Q: 支持多个仓库吗？

A: 是的，可以在 `.qclrc` 中配置多个仓库。CoCli 会从所有配置的仓库中查找模板和插件。

### Q: 如何组织大型仓库？

A: 建议按功能或框架分类组织：
```
repo/
├── meta.yaml
├── templates/
│   ├── frontend/
│   │   ├── vue3/
│   │   └── react/
│   └── backend/
│       └── express/
└── addons/
    ├── vue/
    └── react/
```

### Q: 私有仓库如何配置？

A: 对于 Git 仓库，需要在配置中添加 `token` 字段。对于 FTP，需要配置 `username` 和 `password`。

## 相关文档

- [meta.yaml 配置详解](/config/meta)
- [仓库配置说明](/config/repos)
- [模板使用指南](/guide/template)
- [插件使用指南](/guide/addons)

