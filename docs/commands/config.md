# 配置管理命令

## qcl config get

获取指定配置键的值。

### 语法

```bash
qcl config get <配置键>
```

### 参数

| 参数 | 说明 |
|------|------|
| `<配置键>` | 配置键名称，如 `username`、`repos` 等（必需） |

### 示例

```bash
# 获取用户名
qcl config get username

# 获取仓库配置
qcl config get repos
```

### 输出示例

```bash
# 获取 username
$ qcl config get username
your-username

# 获取 repos
$ qcl config get repos
- local:
    type: local
    url: /path/to/repo
```

## qcl config set

设置指定配置键的值。

::: warning 注意
此功能暂未实现。
:::

### 语法

```bash
qcl config set <配置键> <配置值>
```

### 参数

| 参数 | 说明 |
|------|------|
| `<配置键>` | 配置键名称（必需） |
| `<配置值>` | 配置值（必需） |

## qcl config list

列出所有配置信息，包括当前工作区。

### 语法

```bash
qcl config list
```

### 示例

```bash
qcl config list
```

### 输出示例

```
配置信息:
当前工作区: my-workspace

全局配置:
  username: your-username
  repos: 3 个仓库
```

