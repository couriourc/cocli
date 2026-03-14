# 初始化配置

CoCli 使用配置文件来管理仓库和认证信息。你可以使用 `cocli init` 命令快速创建配置文件。

## 基本用法

### 交互式初始化

运行 `cocli init` 命令，工具会引导你完成配置：

```bash
cocli init
```

交互式流程包括：

1. **全局认证信息**（可选）
   - 全局用户名
   - 全局密码
   - 全局 Token

2. **仓库配置**
   - 添加本地仓库
   - 添加 GitHub 仓库
   - 添加 GitLab 仓库
   - 添加 FTP 仓库

### 非交互式初始化

使用 `-y` 或 `--yes` 参数快速创建默认配置：

```bash
cocli init -y
```

这将创建一个空的配置文件，你可以稍后手动编辑。

## 指定配置文件路径

使用 `-f` 或 `--file` 参数指定配置文件路径：

```bash
# 在当前目录创建
cocli init -f .qclrc

# 在用户主目录创建
cocli init -f ~/.qclrc

# 指定完整路径
cocli init -f /path/to/config.yaml
```

## 配置文件位置

CoCli 会按以下优先级查找配置文件：

1. 当前工作目录：`.qclrc`、`.qcl.yaml`、`.qcl.yml`
2. 用户主目录：`~/.qclrc`、`~/.qcl.yaml`、`~/.qcl.yml`

## 配置示例

初始化完成后，会生成类似以下的配置文件：

```yaml
# 全局认证信息（可选）
username: your-username
password: your-password
token: your-token

# 代理配置（可选）
proxy:
  url: http://proxy.example.com:8080

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
      url: ftp://ftp.example.com/path/to/repo
      username: ftp-user
      password: ftp-pass
```

## 下一步

- 📖 了解 [配置文件详解](/config/qclrc)
- 🔧 学习如何 [配置仓库](/config/repos)
- 💡 查看 [配置示例](/examples/)

