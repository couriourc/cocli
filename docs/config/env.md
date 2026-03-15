# 环境变量配置

CoCli 支持通过环境变量覆盖配置，适合 CI/CD 和无侵入使用场景。

## 支持的环境变量

### COCLI_REPO

仓库配置（JSON 格式）。

**示例：**

```bash
export COCLI_REPO='[{"github":{"type":"git","repo":"https://github.com/user/repo"}}]'
```

**格式：**

```json
[
  {
    "github": {
      "type": "git",
      "repo": "https://github.com/user/repo",
      "token": "ghp_xxxxxxxxxxxx"
    }
  },
  {
    "local": {
      "type": "local",
      "url": "./templates"
    }
  }
]
```

### COCLI_USERNAME

全局用户名。

**示例：**

```bash
export COCLI_USERNAME=my-user
```

### COCLI_TOKEN

全局 Token。

**示例：**

```bash
export COCLI_TOKEN=ghp_xxxxxxxxxxxx
```

### COCLI_NO_CONFIG

不创建配置文件（无侵入模式）。

**示例：**

```bash
export COCLI_NO_CONFIG=true
cocli create my-app
```

## 使用场景

### CI/CD 集成

在 CI/CD 中使用环境变量配置：

```yaml
# GitHub Actions
env:
  COCLI_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  COCLI_REPO: '[{"github":{"type":"git","repo":"https://github.com/user/repo"}}]'
```

### 无侵入模式

生成的项目不包含 CoCli 配置文件：

```bash
COCLI_NO_CONFIG=true cocli create my-app
```

### 多环境配置

不同环境使用不同配置：

```bash
# 开发环境
export COCLI_REPO='[{"local":{"type":"local","url":"./dev-templates"}}]'

# 生产环境
export COCLI_REPO='[{"github":{"type":"git","repo":"https://github.com/user/prod-repo"}}]'
```

## 配置优先级

环境变量优先级最高：

1. **环境变量**（最高优先级）
2. 项目级配置（`.qclocal`）
3. 工作区配置（`.qclrc`）
4. 全局配置（`~/.qclrc`）
5. 默认配置

## 示例

### 基础使用

```bash
export COCLI_USERNAME=my-user
export COCLI_TOKEN=ghp_xxxxxxxxxxxx
cocli create my-app
```

### 多仓库配置

```bash
export COCLI_REPO='[
  {"local":{"type":"local","url":"./local-templates"}},
  {"github":{"type":"git","repo":"https://github.com/user/repo"}}
]'
cocli create my-app
```

### Docker 环境

```dockerfile
ENV COCLI_TOKEN=ghp_xxxxxxxxxxxx
ENV COCLI_REPO='[{"github":{"type":"git","repo":"https://github.com/user/repo"}}]'
RUN cocli create my-app
```

## 安全建议

1. **不要提交敏感信息**：不要在代码中硬编码 Token
2. **使用密钥管理**：使用 CI/CD 平台的密钥管理功能
3. **定期轮换**：定期更新 Token
4. **最小权限**：使用最小权限的 Token

## 常见问题

### Q: 环境变量不生效？

A: 检查环境变量名称是否正确，确保已导出。

### Q: 如何查看当前环境变量？

A: 使用命令：

```bash
echo $COCLI_TOKEN
env | grep COCLI
```

### Q: 环境变量和配置文件冲突？

A: 环境变量优先级更高，会覆盖配置文件。

