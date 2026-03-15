# 多源仓库

CoCli 支持多种仓库类型，包括 Git、FTP 和本地仓库，让你可以灵活配置模板和插件源。

## 支持的仓库类型

### Git 仓库

支持 GitHub、GitLab 等 Git 托管平台。

**配置示例：**

```yaml
repos:
  - github:
      type: git
      repo: https://github.com/user/repo
      token: your-token  # 可选
```

### 本地仓库

使用本地文件系统作为仓库。

**配置示例：**

```yaml
repos:
  - local:
      type: local
      url: ./templates
```

### FTP 仓库

使用 FTP 服务器作为仓库（可选扩展）。

**配置示例：**

```yaml
repos:
  - ftp:
      type: ftp
      url: ftp://example.com/templates
      username: user
      password: pass
```

## 配置仓库

### 在 .qclrc 中配置

编辑 `.qclrc` 文件：

```yaml
repos:
  - github:
      type: git
      repo: https://github.com/user/repo
  - local:
      type: local
      url: ./local-templates
```

### 使用命令配置

```bash
cocli config set repos '[{"github":{"type":"git","repo":"https://github.com/user/repo"}}]'
```

## 仓库优先级

多个仓库按配置顺序查找，找到即停止：

```yaml
repos:
  - local:
      type: local
      url: ./local-templates  # 优先使用本地仓库
  - github:
      type: git
      repo: https://github.com/user/repo  # 本地找不到时使用
```

## Git 仓库认证

### 使用 Token

```yaml
repos:
  - github:
      type: git
      repo: https://github.com/user/repo
      token: ghp_xxxxxxxxxxxx
```

### 使用用户名密码

```yaml
repos:
  - github:
      type: git
      repo: https://github.com/user/repo
      username: your-username
      password: your-password
```

### 使用环境变量

```bash
export COCLI_TOKEN=ghp_xxxxxxxxxxxx
```

## 本地仓库

### 创建本地仓库

```bash
cocli repo init ./my-repo
```

这会创建仓库目录结构：

```
my-repo/
├── meta.yaml
├── templates/
└── addons/
```

### 使用本地仓库

```yaml
repos:
  - local:
      type: local
      url: ./my-repo
```

**注意**：使用绝对路径或相对于 `.qclrc` 文件的路径。

## 仓库同步

CoCli 会自动同步仓库内容：

1. **首次使用**：下载仓库内容到临时目录
2. **后续使用**：使用缓存或重新下载
3. **离线模式**：网络失败时使用本地缓存

## 仓库结构

### 标准结构

```
repo/
├── meta.yaml          # 仓库元数据
├── templates/         # 模板目录
│   └── vue3/
└── addons/           # 插件目录
    └── my-plugin/
```

### meta.yaml 配置

```yaml
templates:
  vue3:
    root: templates/vue3/**

addons:
  my-plugin:
    root: addons/my-plugin/**
```

## 私有仓库

### GitHub 私有仓库

使用 Token 访问私有仓库：

```yaml
repos:
  - github:
      type: git
      repo: https://github.com/user/private-repo
      token: ghp_xxxxxxxxxxxx
```

### GitLab 私有仓库

```yaml
repos:
  - gitlab:
      type: gitlab
      repo: https://gitlab.com/user/private-repo
      token: glpat-xxxxxxxxxxxx
```

## 多仓库管理

### 工作区级别

在工作区 `.qclrc` 中配置：

```yaml
workspace:
  name: my-workspace

repos:
  - github:
      type: git
      repo: https://github.com/team/shared-templates
  - local:
      type: local
      url: ./team-templates
```

### 项目级别

在项目 `.qclocal` 中配置：

```yaml
project: my-project
template: vue3

repos:
  - github:
      type: git
      repo: https://github.com/project/custom-templates
```

## 最佳实践

1. **本地优先**：优先使用本地仓库，提高速度
2. **版本控制**：将仓库配置纳入版本控制
3. **Token 安全**：使用环境变量存储敏感信息
4. **仓库组织**：按团队/项目组织仓库

## 常见问题

### Q: 如何添加多个仓库？

A: 在 `repos` 数组中添加多个仓库配置：

```yaml
repos:
  - github:
      type: git
      repo: https://github.com/user/repo1
  - github:
      type: git
      repo: https://github.com/user/repo2
```

### Q: 仓库同步失败怎么办？

A: 检查以下几点：
1. 网络连接是否正常
2. 认证信息是否正确
3. 仓库地址是否正确

### Q: 可以使用相对路径吗？

A: 可以，相对于 `.qclrc` 文件的路径。

