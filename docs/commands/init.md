# 初始化命令

## qcl init

初始化配置文件，创建 `.qclrc` 或 `.qcl.yaml` 文件。

### 语法

```bash
qcl init [-f|--file <文件路径>] [-y|--yes]
```

### 参数

| 参数 | 简写 | 说明 |
|------|------|------|
| `--file` | `-f` | 配置文件路径（可选，默认为当前目录的 `.qclrc`） |
| `--yes` | `-y` | 非交互模式，使用默认配置 |

### 示例

```bash
# 交互式初始化（推荐）
qcl init

# 非交互模式
qcl init -y

# 指定配置文件路径
qcl init -f ~/.qclrc
```

### 交互式流程

运行 `qcl init` 后，会引导你完成以下配置：

1. **全局认证信息**（可选）
   - 全局用户名
   - 全局密码
   - 全局 Token

2. **仓库配置**
   - 添加本地仓库（`local`）
   - 添加 GitHub 仓库（`github`）
   - 添加 GitLab 仓库（`gitlab`）
   - 添加 FTP 仓库（`ftp`）
   - 输入 `done` 完成配置

### 示例交互

```bash
$ qcl init
🔧 初始化 CoCli 配置文件
按 Enter 跳过可选配置项

全局用户名（可选，按 Enter 跳过）: myuser
全局密码（可选，按 Enter 跳过）: 
全局 Token（可选，按 Enter 跳过）: 

📦 配置仓库
添加仓库配置（输入 'done' 完成）:

仓库类型 (local/github/gitlab/ftp，或 'done' 完成): local
本地路径: /path/to/repo
✓ 已添加本地仓库

仓库类型 (local/github/gitlab/ftp，或 'done' 完成): done

✅ 配置文件已创建: D:\Projects\cocli\.qclrc
💡 提示: 你可以随时编辑此文件来修改配置
```

### 生成的配置文件

```yaml
username: myuser
password: null
token: null
proxy: null
repos:
  - local:
      type: local
      url: /path/to/repo
```

### 说明

- 如果配置文件已存在，会询问是否覆盖
- 使用 `-y` 参数可以快速创建空配置文件
- 配置文件会以 YAML 格式保存

