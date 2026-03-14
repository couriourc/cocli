# 工作区管理命令

## cocli workspace create

创建新工作区。

### 语法

```bash
cocli workspace create <工作区名称> [工作区路径]
```

### 参数

| 参数 | 说明 |
|------|------|
| `<工作区名称>` | 工作区名称（必需） |
| `[工作区路径]` | 工作区路径（可选，如果未指定，将在当前目录下创建同名子目录） |

### 示例

```bash
# 在当前目录下创建同名子目录作为工作区（推荐）
cocli workspace create my-workspace

# 在当前目录创建工作区
cocli workspace create my-workspace .

# 在指定路径创建工作区
cocli workspace create my-workspace /path/to/workspace

# 在当前目录下的相对路径创建工作区
cocli workspace create my-workspace ./workspaces/my-workspace
```

### 说明

- 如果未指定路径，会在当前目录下自动创建与工作区名称相同的子目录
- 如果指定路径为 `.`，则使用当前目录作为工作区
- 工作区目录不能包含 `.qclocal` 文件（表示这是一个应用目录）
- 创建工作区时，如果工作区目录下不存在 `.qclrc` 配置文件，会自动创建一个默认配置文件
- 自动创建的配置文件会从全局配置继承 `repos` 配置（如果存在）
- 工作区可以有自己的 `.qclrc` 配置文件，用于覆盖或扩展全局配置

## cocli workspace list

列出所有已配置的工作区。

### 语法

```bash
cocli workspace list
```

### 示例

```bash
cocli workspace list
```

### 输出示例

```
工作区列表:
  - my-workspace (路径: D:/Projects/my-workspace)
  - frontend-workspace (路径: D:/Projects/frontend)

共找到 2 个工作区
```

## cocli workspace use

切换到指定的工作区。

### 语法

```bash
cocli workspace use <工作区名称>
```

### 参数

| 参数 | 说明 |
|------|------|
| `<工作区名称>` | 工作区名称（必需） |

### 示例

```bash
cocli workspace use my-workspace
```

### 说明

- 切换后，`cocli app list` 等命令会在该工作区目录下执行
- 工作区配置会覆盖全局配置

## cocli workspace current

显示当前正在使用的工作区。

### 语法

```bash
cocli workspace current
```

### 示例

```bash
cocli workspace current
```

### 输出示例

```
当前工作区: my-workspace
路径: D:/Projects/my-workspace
```

## cocli workspace delete

删除指定的工作区（不会删除工作区目录）。

### 语法

```bash
cocli workspace delete <工作区名称>
```

### 参数

| 参数 | 说明 |
|------|------|
| `<工作区名称>` | 工作区名称（必需） |

### 示例

```bash
cocli workspace delete my-workspace
```

### 说明

- 只删除工作区配置，不会删除工作区目录和文件
- 如果删除的是当前工作区，需要手动切换或创建新的工作区

