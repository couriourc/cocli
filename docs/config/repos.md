# 仓库配置

QCli 支持多种类型的仓库，包括本地目录、Git 仓库和 FTP 服务器。

## 仓库类型

### 本地仓库 (local)

使用本地文件系统作为仓库。

```yaml
repos:
  - local:
      type: local
      url: /absolute/path/to/repo
      # 或相对路径
      # url: ./relative/path/to/repo
```

**配置字段：**

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `type` | `string` | 是 | 必须为 `local` |
| `url` | `string` | 是 | 本地目录路径（绝对路径或相对路径） |

### GitHub 仓库

使用 GitHub 作为仓库来源。

```yaml
repos:
  - github:
      type: git
      repo: https://github.com/username/repo.git
      token: ghp_xxxxxxxxxxxxx  # 推荐使用 Token
      # 或使用用户名密码
      # username: github-username
      # password: github-password
```

**配置字段：**

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `type` | `string` | 是 | 必须为 `git` |
| `repo` | `string` | 是 | GitHub 仓库 URL |
| `token` | `string` | 否 | GitHub Personal Access Token（推荐） |
| `username` | `string` | 否 | GitHub 用户名 |
| `password` | `string` | 否 | GitHub 密码 |

**认证优先级：** Token > 用户名+密码

### GitLab 仓库

使用 GitLab 作为仓库来源。

```yaml
repos:
  - gitlab:
      type: gitlab
      repo: https://gitlab.com/username/repo.git
      token: glpat-xxxxxxxxxxxxx
      # 或使用用户名密码
      # username: gitlab-username
      # password: gitlab-password
      git-config:  # 可选的 Git 配置
        username: git-username
        password: git-password
```

**配置字段：**

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `type` | `string` | 是 | 必须为 `gitlab` |
| `repo` | `string` | 是 | GitLab 仓库 URL |
| `token` | `string` | 否 | GitLab Personal Access Token（推荐） |
| `username` | `string` | 否 | GitLab 用户名 |
| `password` | `string` | 否 | GitLab 密码 |
| `git-config` | `object` | 否 | Git 配置（用于 Git 操作） |

### FTP 仓库

使用 FTP 服务器作为仓库。

```yaml
repos:
  - ftp:
      type: ftp
      url: ftp://ftp.example.com/path/to/repo
      username: ftp-username  # 可选
      password: ftp-password    # 可选
```

**配置字段：**

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `type` | `string` | 是 | 必须为 `ftp` |
| `url` | `string` | 是 | FTP 服务器 URL |
| `username` | `string` | 否 | FTP 用户名（未提供则使用匿名登录） |
| `password` | `string` | 否 | FTP 密码 |

## 认证配置

### 全局认证

在 `.qclrc` 中配置全局认证信息：

```yaml
username: global-username
password: global-password
token: global-token

repos:
  - github:
      type: git
      repo: https://github.com/username/repo.git
      # 如果没有指定 token/username，会使用全局配置
```

### 仓库级别认证

每个仓库可以有自己的认证配置：

```yaml
repos:
  - github:
      type: git
      repo: https://github.com/username/repo.git
      token: repo-specific-token  # 仓库特定的 Token
```

**优先级：** 仓库级别配置 > 全局配置

## 多仓库配置

可以配置多个仓库：

```yaml
repos:
  - local:
      type: local
      url: /path/to/local/repo
  
  - github:
      type: git
      repo: https://github.com/user1/repo1.git
      token: token1
  
  - github:
      type: git
      repo: https://github.com/user2/repo2.git
      token: token2
  
  - gitlab:
      type: gitlab
      repo: https://gitlab.com/user/repo.git
      token: glpat-xxx
```

QCli 会按顺序搜索所有仓库，直到找到所需的模板或插件。

## 获取认证 Token

### GitHub Token

1. 访问 [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token"
3. 选择所需权限（至少需要 `repo` 权限）
4. 复制生成的 Token

### GitLab Token

1. 访问 GitLab 项目设置
2. 进入 "Access Tokens"
3. 创建新的 Personal Access Token
4. 选择所需权限（至少需要 `read_repository` 权限）
5. 复制生成的 Token

## 相关文档

- [`.qclrc` 配置](./qclrc)
- [仓库元数据](./meta)

