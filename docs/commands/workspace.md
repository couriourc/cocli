# 工作区管理命令

## qcl workspace create

创建新工作区。

### 语法

```bash
qcl workspace create <工作区名称> [工作区路径]
```

### 参数

| 参数 | 说明 |
|------|------|
| `<工作区名称>` | 工作区名称（必需） |
| `[工作区路径]` | 工作区路径（可选，默认为当前目录 `.`） |

### 示例

```bash
# 在当前目录创建工作区
qcl workspace create my-workspace .

# 在指定路径创建工作区
qcl workspace create my-workspace /path/to/workspace
```

### 说明

- 工作区目录不能包含 `.qclocal` 文件（表示这是一个应用目录）
- 工作区可以有自己的 `.qclrc` 配置文件

## qcl workspace list

列出所有已配置的工作区。

### 语法

```bash
qcl workspace list
```

### 示例

```bash
qcl workspace list
```

### 输出示例

```
工作区列表:
  - my-workspace (路径: D:/Projects/my-workspace)
  - frontend-workspace (路径: D:/Projects/frontend)

共找到 2 个工作区
```

## qcl workspace use

切换到指定的工作区。

### 语法

```bash
qcl workspace use <工作区名称>
```

### 参数

| 参数 | 说明 |
|------|------|
| `<工作区名称>` | 工作区名称（必需） |

### 示例

```bash
qcl workspace use my-workspace
```

### 说明

- 切换后，`qcl app list` 等命令会在该工作区目录下执行
- 工作区配置会覆盖全局配置

## qcl workspace current

显示当前正在使用的工作区。

### 语法

```bash
qcl workspace current
```

### 示例

```bash
qcl workspace current
```

### 输出示例

```
当前工作区: my-workspace
路径: D:/Projects/my-workspace
```

## qcl workspace delete

删除指定的工作区（不会删除工作区目录）。

### 语法

```bash
qcl workspace delete <工作区名称>
```

### 参数

| 参数 | 说明 |
|------|------|
| `<工作区名称>` | 工作区名称（必需） |

### 示例

```bash
qcl workspace delete my-workspace
```

### 说明

- 只删除工作区配置，不会删除工作区目录和文件
- 如果删除的是当前工作区，需要手动切换或创建新的工作区

