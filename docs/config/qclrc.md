# .qclrc 配置文件

`.qclrc` 是 CoCli 的主要配置文件，用于配置全局设置和仓库信息。

## 文件位置

- 用户主目录：`~/.qclrc`、`~/.qcl.yaml`、`~/.qcl.yml`
- 当前工作目录：`.qclrc`、`.qcl.yaml`、`.qcl.yml`
- 工作区目录：`{workspace}/.qclrc`

## 配置格式

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

## 配置字段说明

### 全局认证信息

| 字段 | 类型 | 说明 |
|------|------|------|
| `username` | `string` | 全局用户名（可选） |
| `password` | `string` | 全局密码（可选） |
| `token` | `string` | 全局 Token（可选） |

这些信息会被所有仓库使用，除非仓库级别有单独配置。

### 代理配置

| 字段 | 类型 | 说明 |
|------|------|------|
| `proxy.url` | `string` | 代理 URL（格式：`http://host:port`） |
| `proxy.host` | `string` | 代理主机名 |
| `proxy.port` | `number` | 代理端口 |
| `proxy.username` | `string` | 代理用户名（可选） |
| `proxy.password` | `string` | 代理密码（可选） |

### 仓库配置

仓库配置是一个数组，每个元素代表一个仓库。支持以下类型：

- **local** - 本地目录仓库
- **github** - GitHub 仓库
- **gitlab** - GitLab 仓库
- **ftp** - FTP 服务器仓库

## 配置优先级

1. **仓库级别配置** > **全局配置**
2. **Token** > **用户名+密码**（对于 Git 仓库）
3. **当前目录配置** > **用户主目录配置**

## 示例配置

### 最小配置

```yaml
repos:
  - local:
      type: local
      url: /path/to/local/repo
```

### 完整配置

```yaml
username: my-username
password: my-password
token: my-token

proxy:
  url: http://proxy.example.com:8080

repos:
  - local:
      type: local
      url: /path/to/local/repo
  
  - github:
      type: git
      repo: https://github.com/username/repo.git
      token: ghp_xxxxxxxxxxxxx
  
  - gitlab:
      type: gitlab
      repo: https://gitlab.com/username/repo.git
      token: glpat-xxxxxxxxxxxxx
  
  - ftp:
      type: ftp
      url: ftp://ftp.example.com/path/to/repo
      username: ftp-user
      password: ftp-pass
```

## 初始化配置

使用 `qcl init` 命令可以交互式创建配置文件：

```bash
qcl init
```

## 相关文档

- [`.qclocal` 配置](./qclocal)
- [仓库配置详解](./repos)
- [初始化命令](/commands/init)

