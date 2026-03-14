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

使用 `qcl workspace create` 命令创建工作区：

```bash
# 在当前目录创建工作区
qcl workspace create my-workspace .

# 在指定路径创建工作区
qcl workspace create my-workspace /path/to/workspace
```

## 切换工作区

使用 `qcl workspace use` 切换到指定工作区：

```bash
qcl workspace use my-workspace
```

切换后，`qcl app list` 等命令会在该工作区目录下执行。

## 查看工作区

### 列出所有工作区

```bash
qcl workspace list
```

### 查看当前工作区

```bash
qcl workspace current
```

## 删除工作区

使用 `qcl workspace delete` 删除工作区（不会删除工作区目录）：

```bash
qcl workspace delete my-workspace
```

## 工作区配置

工作区可以有自己的 `.qclrc` 配置文件。工作区内的项目可以：

- 使用工作区的仓库配置
- 通过 `inherit: true` 继承工作区配置
- 覆盖工作区配置

## 使用场景

### 场景 1：多项目开发

当你需要同时开发多个相关项目时：

```bash
# 创建工作区
qcl workspace create frontend-workspace ./frontend

# 创建多个项目
cd frontend
qcl app create --template=vue3 admin-panel
qcl app create --template=vue3 user-portal
qcl app create --template=react dashboard

# 查看所有项目
qcl app list
```

### 场景 2：团队协作

团队成员可以使用相同的工作区配置：

```bash
# 每个成员切换到相同的工作区
qcl workspace use team-workspace

# 所有成员共享相同的仓库配置
```

## 最佳实践

1. **为每个团队/项目组创建工作区**
2. **在工作区根目录配置 `.qclrc`**
3. **项目使用 `inherit: true` 继承工作区配置**
4. **定期使用 `qcl workspace list` 查看工作区状态**

## 相关命令

- `qcl workspace create` - 创建工作区
- `qcl workspace list` - 列出所有工作区
- `qcl workspace use` - 切换工作区
- `qcl workspace current` - 查看当前工作区
- `qcl workspace delete` - 删除工作区

