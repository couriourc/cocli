# .qclrc 配置详解

`.qclrc` 是 CoCli 的配置文件，支持 YAML 格式。

## 配置文件位置

配置文件按以下优先级查找：

1. 当前目录（`.qclrc`）
2. 父级目录（向上查找）
3. 用户主目录（`~/.qclrc`）

## 配置结构

### 基本结构

```yaml
# 工作区配置（可选）
workspace:
  name: my-workspace
  description: 我的工作区

# 仓库配置
repos:
  - github:
      type: git
      repo: https://github.com/user/repo
  - local:
      type: local
      url: ./templates

# 全局认证（可选）
username: my-user
password: my-password
token: my-token

# 代理配置（可选）
proxy: http://proxy.example.com:8080
```

## 配置项说明

### workspace

工作区配置。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | ✅ | 工作区名称 |
| `description` | string | ❌ | 工作区描述 |

**示例：**

```yaml
workspace:
  name: my-workspace
  description: 我的工作区
```

### repos

仓库配置列表。

#### GitHub 仓库

```yaml
repos:
  - github:
      type: git
      repo: https://github.com/user/repo
      token: ghp_xxxxxxxxxxxx  # 可选
      username: user            # 可选
      password: pass            # 可选
```

#### GitLab 仓库

```yaml
repos:
  - gitlab:
      type: gitlab
      repo: https://gitlab.com/user/repo
      token: glpat-xxxxxxxxxxxx
```

#### 本地仓库

```yaml
repos:
  - local:
      type: local
      url: ./templates  # 相对路径或绝对路径
```

#### FTP 仓库

```yaml
repos:
  - ftp:
      type: ftp
      url: ftp://example.com/templates
      username: user
      password: pass
```

### username / password / token

全局认证信息（可选）。

```yaml
username: my-user
password: my-password
token: my-token
```

### proxy

代理配置（可选）。

```yaml
proxy: http://proxy.example.com:8080
```

## 配置示例

### 基础配置

```yaml
repos:
  - github:
      type: git
      repo: https://github.com/user/repo
```

### 多仓库配置

```yaml
repos:
  - local:
      type: local
      url: ./local-templates
  - github:
      type: git
      repo: https://github.com/user/repo
  - gitlab:
      type: gitlab
      repo: https://gitlab.com/user/repo
```

### 完整配置

```yaml
workspace:
  name: my-workspace
  description: 我的工作区

repos:
  - github:
      type: git
      repo: https://github.com/user/repo
      token: ghp_xxxxxxxxxxxx
  - local:
      type: local
      url: ./templates

username: my-user
token: ghp_xxxxxxxxxxxx
proxy: http://proxy.example.com:8080
```

## 配置优先级

配置加载优先级（从高到低）：

1. 环境变量
2. 项目级配置（`.qclocal`）
3. 工作区配置（`.qclrc`）
4. 全局配置（`~/.qclrc`）

## 环境变量覆盖

支持使用环境变量覆盖配置：

```bash
export COCLI_USERNAME=my-user
export COCLI_TOKEN=ghp_xxxxxxxxxxxx
export COCLI_REPO='[{"github":{"type":"git","repo":"https://github.com/user/repo"}}]'
```

## 常见问题

### Q: 配置文件格式错误怎么办？

A: 检查 YAML 语法，确保缩进正确。

### Q: 如何查看当前配置？

A: 使用命令：

```bash
cocli config list
cocli config get repos
```

### Q: 配置修改后不生效？

A: 检查配置文件位置和优先级。

