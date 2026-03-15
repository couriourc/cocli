# CoCli - 脚手架工具

一个灵活、强大的项目脚手架工具，支持从多种来源（Git、本地目录）获取模板和插件。

> **注意**: CoCli 已从 Rust 实现迁移到 Node.js 实现，现在完全基于 Node.js 运行。需要 Node.js 18+ 和 pnpm/npm/yarn。

## 目录

- [安装](#安装)
- [快速开始](#快速开始)
- [配置文件](#配置文件)
- [项目配置文件 (.qclocal)](#项目配置文件-qclocal)
- [仓库元数据](#仓库元数据)
- [命令参考](#命令参考)
  - [应用管理 (app)](#应用管理-app)
  - [模板管理 (template)](#模板管理-template)
  - [插件管理 (addons)](#插件管理-addons)
  - [工作区管理 (workspace)](#工作区管理-workspace)
  - [配置管理 (config)](#配置管理-config)
- [示例](#示例)
- [常见问题](#常见问题)

## 安装

### 使用 pnpm

```bash
# 全局安装
pnpm add -g git+https://github.com/couriourc/cocli.git

# 或使用 dlx 直接运行
pnpm dlx git+https://github.com/couriourc/cocli.git <command>
```

### 使用 npm

```bash
npm install -g git+https://github.com/couriourc/cocli.git
```

### 从源码运行

```bash
cd apps/main
pnpm install
node src/index.js --help
```

## 快速开始

1. **创建配置文件**

   在用户主目录或项目根目录创建 `.qclrc` 或 `.qcl.yaml`：

   ```yaml
   repos:
     - local:
         type: local
         url: /path/to/your/templates
   ```

2. **列出可用模板**

   ```bash
   cocli template list
   ```

3. **创建项目**

   ```bash
   cocli app create --template=vue3 my-app
   ```
   
   创建项目后除了基础模板的内容外，如果模板内存在 `.qclocal`，则直接使用，否则默认创建。
   
   注意：`cocli create` 命令已废弃，请使用 `cocli app create`。

## 配置文件

配置文件支持以下位置（按查找顺序，找到第一个存在的文件即使用）：

1. **当前工作目录**：`.qclrc`、`.qcl.yaml`、`.qcl.yml`
2. **用户主目录**：`~/.qclrc`、`~/.qcl.yaml`、`~/.qcl.yml`

### 配置格式

```yaml
# 全局认证信息（可选，会被仓库级别的配置覆盖）
username: your-username
password: your-password
token: your-token

# 代理配置（可选）
proxy:
  url: http://proxy.example.com:8080
  # 或
  host: proxy.example.com
  port: 8080
  username: proxy-user
  password: proxy-pass

# 仓库列表
repos:
  # 本地目录仓库
  - local:
      type: local
      url: /absolute/path/to/repo
      # 或相对路径（相对于当前工作目录或可执行文件位置）
      # url: ./relative/path/to/repo

  # FTP 仓库
  - ftp:
      type: ftp
      url: ftp://ftp.example.com/path/to/repo
      username: ftp-username  # 可选，优先于全局配置
      password: ftp-password    # 可选，优先于全局配置

  # GitHub 仓库
  - github:
      type: git
      repo: https://github.com/username/repo.git
      username: github-username  # 可选
      password: github-password  # 可选
      token: github-token         # 可选，优先于 username/password

  # GitLab 仓库
  - gitlab:
      type: gitlab
      repo: https://gitlab.com/username/repo.git
      username: gitlab-username  # 可选
      password: gitlab-password  # 可选
      token: gitlab-token         # 可选
      git-config:                 # 可选的 Git 配置
        username: git-username
        password: git-password
```

### 配置说明

- **全局配置**：`username`、`password`、`token` 可以在全局级别设置，所有仓库都可以使用
- **优先级**：仓库级别的配置优先于全局配置
- **认证方式**：
  - Git 仓库：优先使用 `token`，其次使用 `username` + `password`
  - FTP 仓库：使用 `username` + `password`，如果未提供则使用匿名登录

### 配置优先级

配置文件按以下优先级加载（高优先级覆盖低优先级）：

1. **`.qclocal`**（项目目录中的本地配置）
2. **工作区配置**（如果设置了当前工作区）
3. **父级目录的 `.qclrc`**（向上查找）
4. **全局配置**（`~/.qclrc` 或 `~/.qcl.yaml`）

## 项目配置文件 (.qclocal)

每个项目目录可以包含一个 `.qclocal` 文件，用于配置项目特定的设置。

### .qclocal 格式

```yaml
# 当前创建的项目名
project: my-app

# 使用的模板名称
template: vue3

# Addons 配置
addons:
  # 插件安装目录（默认：./addons）
  target_dir: ./addons
  
  # 当执行 cocli addons sync 时自动同步的插件列表
  include:
    - addon-name
    - another-addon

# 仓库配置（可选，用于覆盖全局配置）
repos:
  - local:
      type: local
      url: /path/to/local/repo

# 是否从父级目录继承配置（如果 repos 为空）
inherit: true
```

### .qclocal 说明

- **`project`**：项目名称（可选）
- **`template`**：使用的模板名称（必需）
- **`addons.target_dir`**：插件安装目录，默认为 `./addons`。每个插件会安装到 `{target_dir}/{addon_name}/` 目录下
- **`addons.include`**：需要同步的插件列表，执行 `cocli addons sync` 时会自动同步这些插件
- **`repos`**：项目特定的仓库配置（可选）。如果未设置，将从父级目录或全局配置中查找
- **`inherit`**：如果设置为 `true` 且 `repos` 为空，工具会自动从父级目录的 `.qclrc` 文件中查找 `repos` 配置

### 配置继承示例

假设目录结构如下：

```
workspace/
  .qclrc          # 包含 repos 配置
  project1/
    .qclocal      # inherit: true, repos 为空
  project2/
    .qclocal      # 包含自己的 repos 配置
```

- `project1` 会继承 `workspace/.qclrc` 中的 `repos` 配置
- `project2` 使用自己的 `repos` 配置

## 仓库元数据

每个仓库根目录需要包含 `meta.yaml` 文件，用于定义可用的模板和插件。

### meta.yaml 格式

支持两种格式：

#### 格式 1：传统格式（每个 addon 单独定义）

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

#### 格式 2：新格式（统一管理 addons）

```yaml
# 模板定义
templates:
  vue3:
    root: templates/vue3/
    plop: true              # 启用 plop 支持（可选）
    plopfile: plopfile.js   # plop 配置文件路径（可选，默认为 plopfile.js）

# Addons 配置（统一管理）
addons:
  root: ./packages/        # Addons 的根目录
  target_dir: ./packages/  # Addons 的目标目录（可选）

# Plop 全局配置（可选）
plop:
  enabled: true            # 全局启用 plop
  plopfile: plopfile.js    # plop 配置文件路径
```

在新格式中，addons 会从 `root` 目录下的子目录自动识别。例如，如果 `root` 是 `./packages/`，那么 `packages/addon1/` 和 `packages/addon2/` 会被识别为两个独立的 addon。

### 格式选择

- **传统格式**：适合需要为每个 addon 单独配置路径的场景
- **新格式**：适合 addons 统一存放在一个目录下的场景，更简洁

两种格式可以混合使用，工具会自动识别并处理。

### 路径说明

- **相对路径**：相对于仓库根目录
- **绝对路径**：从仓库根目录开始的绝对路径
- **Glob 模式**：支持 `**` 通配符（递归匹配）
  - `packages/vue3/**` - 匹配 `packages/vue3/` 下的所有文件和目录
  - `./addons/add/**` - 匹配 `addons/add/` 下的所有内容

## 命令参考

### 应用管理 (app)

#### `cocli app create` - 创建新项目

从模板创建新项目。

```bash
cocli app create --template=<模板名> [--addons=<插件列表>] <项目名>
```

**参数：**

- `--template`, `-t`：模板名称（必需）
- `--addons`, `-a`：插件列表，逗号分隔（可选）
- `<项目名>`：项目目录名称（必需）

**示例：**

```bash
# 创建 Vue 3 项目
cocli app create --template=vue3 my-vue-app

# 创建 React 项目并添加插件
cocli app create --template=react --addons=add,minus my-react-app

# 使用短选项
cocli app create -t vue2 -a vue2-funs my-vue2-app
```

**注意：** `cocli create` 命令已废弃，请使用 `cocli app create`。

#### `cocli app list` - 列出应用

列出当前工作区（或当前目录）下的所有应用。

```bash
cocli app list
```

**说明：**

- 扫描当前工作区目录（如果设置了工作区）或当前目录
- 查找包含 `.qclocal` 文件的子目录
- 显示每个应用的项目名称、模板和目录名称

**示例：**

```bash
# 列出当前工作区的应用
cocli app list
```

**输出示例：**

```
应用列表:
  - my-app (模板: vue3, 目录: my-app)
  - another-app (模板: react, 目录: another-app)

共找到 2 个应用
```

### 模板管理 (template)

#### `cocli template list` - 列出可用模板

列出所有可用的模板。

```bash
cocli template list
```

**示例：**

```bash
# 列出所有模板
cocli template list
```

**输出示例：**

```
可用的模板:
  - react
  - vue2
  - vue3
```

### Plop 生成器 (plop)

#### `cocli plop run [生成器名]` - 运行 plop 生成器

在项目目录中运行 plop 生成器。

```bash
cocli plop run [生成器名]
```

**参数：**

- `[生成器名]`：要运行的生成器名称（可选，如果不提供会显示交互式菜单）

**示例：**

```bash
# 显示交互式菜单选择生成器
cocli plop run

# 直接运行指定的生成器
cocli plop run mod
cocli plop run vue
```

**说明：**

- 需要在项目目录中运行（项目必须包含 `plopfile.js`）
- 如果模板配置了 plop，创建项目时会自动设置 plop
- 确保已安装 plop 依赖：`npm install` 或 `pnpm install`

#### `cocli plop list` - 列出可用的 plop 生成器

列出当前项目中可用的 plop 生成器。

```bash
cocli plop list
```

**示例：**

```bash
# 列出所有可用的生成器
cocli plop list
```

**输出示例：**

```
可用的 plop 生成器:
  - mod
  - vue
```

### 插件管理 (addons)

#### `cocli addons list` - 列出可用插件

列出所有可用的插件。

```bash
cocli addons list [-v|--verbose]
```

**参数：**

- `-v`, `--verbose`：显示详细信息（包括来源、路径配置和 README.md 内容）

**示例：**

```bash
# 简单列表
cocli addons list

# 详细信息
cocli addons list -v
cocli addons list --verbose
```

**输出示例（简单模式）：**

```
可用的 addons:
  - add
  - minus
  - vue2-funs
  - vue3-funs
```

**输出示例（详细模式）：**

```
可用的 addons (详细信息):

add
  来源: D:/Projects/cocli/.test
  路径配置:
    - ./addons/add/**
  详细信息:
    # Add Addon
    提供加法相关的工具函数。
    ...
```

#### `cocli addons detail` - 查看插件详细信息

查看指定插件的完整详细信息，包括 README.md 内容。

```bash
cocli addons detail <插件名>
```

**参数：**

- `<插件名>`：插件名称（必需）

**示例：**

```bash
# 查看 add 插件的详细信息
cocli addons detail add

# 查看 vue3-funs 插件的详细信息
cocli addons detail vue3-funs
```

**输出示例：**

```
add
  来源: D:/Projects/cocli/.test
  路径配置:
    - ./addons/add/**
  详细信息:
    # Add Addon
    
    提供加法相关的工具函数。
    
    ## 使用方法
    
    ```javascript
    import { add, addMultiple } from './utils/math'
    
    const result = add(1, 2) // 3
    const sum = addMultiple(1, 2, 3, 4) // 10
    ```
```

#### `cocli addons add` - 添加插件到项目

向指定项目或当前目录添加插件。

```bash
cocli addons add <插件列表> [项目目录]
```

**参数：**

- `<插件列表>`：插件名称列表，多个插件用逗号分隔（必需）
- `[项目目录]`：目标项目目录（可选，默认为当前目录 `.`）

**示例：**

```bash
# 向当前目录添加插件
cocli addons add add .
cocli addons add add,minus .

# 向指定项目目录添加插件
cocli addons add add my-project
cocli addons add add,minus,vue3-funs my-project
```

**说明：**

- 插件会被安装到 `{项目目录}/{addons.target_dir}/{插件名}/` 目录下
- 如果项目目录中有 `.qclocal` 文件，会更新其中的 `addons.include` 列表
- 如果项目目录中没有 `.qclocal` 文件，会创建一个新的

#### `cocli addons sync` - 同步项目中的插件

根据 `.qclocal` 文件中的 `addons.include` 配置，同步项目中的插件。

```bash
cocli addons sync [项目目录]
```

**参数：**

- `[项目目录]`：目标项目目录（可选，默认为当前目录 `.`）

**示例：**

```bash
# 同步当前目录的插件
cocli addons sync .

# 同步指定项目的插件
cocli addons sync my-project
```

**说明：**

- 读取项目目录中的 `.qclocal` 文件
- 根据 `addons.include` 列表同步所有插件
- 如果插件已存在，会更新到最新版本

### 工作区管理 (workspace)

工作区用于管理多个项目的集合，类似于 VS Code 的工作区概念。

#### `cocli workspace create` - 创建工作区

创建新工作区。

```bash
cocli workspace create <工作区名称> [工作区路径]
```

**参数：**

- `<工作区名称>`：工作区名称（必需）
- `[工作区路径]`：工作区路径（可选，默认为当前目录 `.`）

**示例：**

```bash
# 在当前目录创建工作区
cocli workspace create my-workspace .

# 在指定路径创建工作区
cocli workspace create my-workspace /path/to/workspace
```

#### `cocli workspace list` - 列出所有工作区

列出所有已配置的工作区。

```bash
cocli workspace list
```

**示例：**

```bash
cocli workspace list
```

#### `cocli workspace use` - 切换工作区

切换到指定的工作区。

```bash
cocli workspace use <工作区名称>
```

**参数：**

- `<工作区名称>`：工作区名称（必需）

**示例：**

```bash
cocli workspace use my-workspace
```

#### `cocli workspace current` - 显示当前工作区

显示当前正在使用的工作区。

```bash
cocli workspace current
```

**示例：**

```bash
cocli workspace current
```

#### `cocli workspace delete` - 删除工作区

删除指定的工作区（不会删除工作区目录）。

```bash
cocli workspace delete <工作区名称>
```

**参数：**

- `<工作区名称>`：工作区名称（必需）

**示例：**

```bash
cocli workspace delete my-workspace
```

### 配置管理 (config)

#### `cocli config get` - 获取配置值

获取指定配置键的值。

```bash
cocli config get <配置键>
```

**参数：**

- `<配置键>`：配置键名称，如 `username`、`repos` 等（必需）

**示例：**

```bash
# 获取用户名
cocli config get username

# 获取仓库配置
cocli config get repos
```

#### `cocli config set` - 设置配置值

设置指定配置键的值（暂未实现）。

```bash
cocli config set <配置键> <配置值>
```

**参数：**

- `<配置键>`：配置键名称（必需）
- `<配置值>`：配置值（必需）

**注意：** 此功能暂未实现。

#### `cocli config list` - 列出所有配置

列出所有配置信息，包括当前工作区。

```bash
cocli config list
```

**示例：**

```bash
cocli config list
```

## 示例

### 示例 1：创建 Vue 3 项目

```bash
# 1. 列出可用模板
cocli template list

# 2. 创建项目
cocli app create --template=vue3 my-vue3-app

# 3. 进入项目目录
cd my-vue3-app

# 4. 添加插件
cocli addons add vue3-funs,add,minus .

# 5. 查看插件详细信息
cocli addons detail vue3-funs

# 6. 列出所有可用插件（详细信息）
cocli addons list -v
```

### 示例 2：使用工作区管理多个项目

```bash
# 1. 创建工作区
cocli workspace create my-workspace /path/to/workspace

# 2. 切换到工作区
cocli workspace use my-workspace

# 3. 创建多个项目
cocli app create --template=vue3 project1
cocli app create --template=react project2

# 4. 列出工作区中的所有应用
cocli app list

# 5. 查看当前工作区
cocli workspace current
```

### 示例 3：使用本地仓库

```yaml
# .qclrc
repos:
  - local:
      type: local
      url: D:/Projects/my-templates
```

```bash
# 列出本地仓库中的模板
cocli template list

# 创建项目
cocli app create --template=react my-app
```

### 示例 4：使用 GitHub 仓库

```yaml
# .qclrc
repos:
  - github:
      type: git
      repo: https://github.com/username/templates.git
      token: ghp_xxxxxxxxxxxxx
```

```bash
# 从 GitHub 仓库创建项目
cocli app create --template=vue3 my-app
```

### 示例 5：使用 .qclocal 配置继承

```yaml
# workspace/.qclrc
repos:
  - local:
      type: local
      url: /path/to/templates
```

```yaml
# workspace/project1/.qclocal
project: project1
template: vue3
addons:
  target_dir: ./addons
  include:
    - vue3-funs
inherit: true  # 继承父级目录的 repos 配置
```

```bash
# 在 project1 目录下，会自动使用 workspace/.qclrc 中的 repos 配置
cd workspace/project1
cocli addons list  # 使用继承的 repos 配置
```

## 常见问题

### Q: 配置文件应该放在哪里？

A: 配置文件可以放在：
- 用户主目录（`~/.qclrc`）- 全局配置
- 当前工作目录（`.qclrc`）- 项目特定配置
- 项目目录（`.qclocal`）- 项目本地配置

配置优先级（从高到低）：
1. `.qclocal`（项目目录）
2. 工作区配置（如果设置了工作区）
3. 父级目录的 `.qclrc`（向上查找）
4. 全局配置（`~/.qclrc`）

### Q: 如何添加多个仓库？

A: 在 `repos` 数组中添加多个仓库配置：

```yaml
repos:
  - local:
      type: local
      url: /path/to/local/repo
  - github:
      type: git
      repo: https://github.com/user/repo.git
```

### Q: 模板路径支持哪些格式？

A: 支持以下格式：
- 简单路径：`packages/react`
- Glob 模式：`packages/vue3/**`
- 多个路径：数组格式

### Q: 如何创建自定义模板？

A: 
1. 创建模板目录结构
2. 在仓库根目录创建 `meta.yaml`
3. 在 `meta.yaml` 中定义模板路径
4. 将仓库添加到配置文件中

### Q: 系统要求是什么？

A: 
- Node.js 18 或更高版本
- pnpm 10.15.0+（推荐）或 npm/yarn
- 不需要 Rust 或 Cargo（已迁移到 Node.js）

### Q: `.qclocal` 中的 `inherit` 字段有什么用？

A: `inherit` 字段用于配置继承。如果设置为 `true` 且 `repos` 为空，工具会自动从父级目录的 `.qclrc` 文件中查找 `repos` 配置。这对于在同一个工作区下管理多个项目非常有用。

### Q: 插件安装在哪里？

A: 插件会安装到 `{项目目录}/{addons.target_dir}/{插件名}/` 目录下。默认情况下，`addons.target_dir` 为 `./addons`，所以插件会安装在 `./addons/{插件名}/` 目录下。

### Q: `cocli addons sync` 和 `cocli addons add` 有什么区别？

A: 
- `cocli addons add`：添加指定的插件到项目，并更新 `.qclocal` 文件
- `cocli addons sync`：根据 `.qclocal` 文件中的 `addons.include` 列表，同步所有配置的插件

### Q: 如何查看插件的详细信息？

A: 使用 `cocli addons detail <插件名>` 命令可以查看插件的完整详细信息，包括 README.md 内容。或者使用 `cocli addons list -v` 查看所有插件的详细信息。

## 许可证

ISC

## 贡献

欢迎提交 Issue 和 Pull Request！
