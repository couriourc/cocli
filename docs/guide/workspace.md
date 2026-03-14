# 工作区

工作区是 CoCli 的核心概念之一，用于管理多个项目的集合。类似于 VS Code 的工作区，它可以帮助你更好地组织和管理相关项目。

## 什么是工作区？

工作区是一个目录，包含一个或多个应用项目。每个应用项目都有自己的 `.qclocal` 配置文件。

```
workspace/
  ├── .qclrc              # 工作区配置文件（可选）
  ├── project1/
  │   └── .qclocal        # 项目1的配置
  ├── project2/
  │   └── .qclocal        # 项目2的配置
  └── project3/
      └── .qclocal        # 项目3的配置
```

## 创建工作区

使用 `cocli workspace create` 命令创建工作区：

```bash
# 在当前目录下创建同名子目录作为工作区（推荐）
cocli workspace create my-workspace

# 在当前目录创建工作区
cocli workspace create my-workspace .

# 在指定路径创建工作区
cocli workspace create my-workspace /path/to/workspace
```

**提示**：
- 如果只提供工作区名称而不指定路径，系统会自动在当前目录下创建与工作区名称相同的子目录，这样更符合常见的使用场景
- 创建工作区时，如果工作区目录下不存在 `.qclrc` 配置文件，系统会自动创建一个默认配置文件
- 自动创建的配置文件会从全局配置继承 `repos` 配置（如果存在），方便快速开始使用

## 切换工作区

使用 `cocli workspace use` 切换到指定工作区：

```bash
cocli workspace use my-workspace
```

切换后，`cocli app list` 等命令会在该工作区目录下执行。

## 查看工作区

### 列出所有工作区

```bash
cocli workspace list
```

### 查看当前工作区

```bash
cocli workspace current
```

## 删除工作区

使用 `cocli workspace delete` 删除工作区（不会删除工作区目录）：

```bash
cocli workspace delete my-workspace
```

## 工作区配置

工作区可以有自己的 `.qclrc` 配置文件。创建工作区时，如果工作区目录下不存在 `.qclrc` 文件，系统会自动创建一个默认配置文件，并从全局配置继承 `repos` 配置（如果存在）。

工作区内的项目可以：

- 使用工作区的仓库配置
- 通过 `inherit: true` 继承工作区配置
- 覆盖工作区配置

### 配置文件位置

工作区配置文件位于工作区根目录：

```
my-workspace/
  ├── .qclrc          # 工作区配置文件（自动创建）
  ├── project1/
  │   └── .qclocal
  └── project2/
      └── .qclocal
```

## 使用场景

### 场景 1：多项目开发

当你需要同时开发多个相关项目时：

```bash
# 创建工作区（自动在当前目录下创建 frontend-workspace 目录）
cocli workspace create frontend-workspace

# 切换到工作区目录
cd frontend-workspace

# 创建多个项目
cocli app create --template=vue3 admin-panel
cocli app create --template=vue3 user-portal
cocli app create --template=react dashboard

# 查看所有项目
cocli app list
```

### 场景 2：团队协作

团队成员可以使用相同的工作区配置：

```bash
# 每个成员切换到相同的工作区
cocli workspace use team-workspace

# 所有成员共享相同的仓库配置
```

## 最佳实践

1. **为每个团队/项目组创建工作区**
2. **在工作区根目录配置 `.qclrc`**
3. **项目使用 `inherit: true` 继承工作区配置**
4. **定期使用 `cocli workspace list` 查看工作区状态**

## 相关命令

- `cocli workspace create` - 创建工作区
- `cocli workspace list` - 列出所有工作区
- `cocli workspace use` - 切换工作区
- `cocli workspace current` - 查看当前工作区
- `cocli workspace delete` - 删除工作区

