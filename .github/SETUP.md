# GitHub Actions 设置指南

## 快速开始

### 1. 设置 NPM Token

1. 登录 [npmjs.com](https://www.npmjs.com/)
2. 进入 Account Settings > Access Tokens
3. 创建新的 Access Token（选择 "Automation" 类型，具有 publish 权限）
4. 复制生成的 token

5. 在 GitHub 仓库中设置 Secret：
   - 进入仓库 Settings > Secrets and variables > Actions
   - 点击 "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: 粘贴刚才复制的 npm token
   - 点击 "Add secret"

### 2. 更新 package.json

确保 `apps/main/package.json` 中的以下字段已正确配置：

```json
{
  "name": "qcl",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/couriourc/qcli.git"
  },
  "bugs": {
    "url": "https://github.com/couriourc/qcli/issues"
  },
  "homepage": "https://github.com/couriourc/qcli#readme"
}
```

将 `couriourc` 替换为你的 GitHub 用户名。

### 3. 发布新版本

```bash
# 1. 更新版本号（在 apps/main/Cargo.toml 和 apps/main/package.json）
# 2. 提交更改
git add .
git commit -m "chore: bump version to 1.0.0"

# 3. 创建 tag
git tag v1.0.0

# 4. 推送代码和 tag
git push origin main
git push origin v1.0.0
```

推送 tag 后，GitHub Actions 会自动：
- ✅ 在所有平台（Linux、Windows、macOS）构建二进制文件
- ✅ 打包所有平台的二进制文件
- ✅ 发布到 npm
- ✅ 创建 GitHub Release

## 工作流说明

### CI 工作流 (`ci.yml`)

**触发条件：**
- 推送到 `main` 或 `master` 分支
- 创建 Pull Request

**功能：**
- 在三个平台上构建项目
- 验证构建是否成功
- 测试二进制文件

### Release 工作流 (`release.yml`)

**触发条件：**
- 推送以 `v` 开头的 tag（例如 `v1.0.0`）

**功能：**
- 构建所有平台的二进制文件
- 打包到 npm 包
- 发布到 npm
- 创建 GitHub Release

## 故障排除

### npm 发布失败

1. 检查 `NPM_TOKEN` 是否正确设置
2. 确保 npm 包名可用（如果包名已被占用，需要修改 `package.json` 中的 `name`）
3. 检查版本号是否已存在（npm 不允许重复发布相同版本）

### 二进制文件未找到

1. 检查 Rust 构建是否成功
2. 查看 GitHub Actions 日志中的错误信息
3. 确保 `apps/main/Cargo.toml` 配置正确

### GitHub Release 创建失败

1. 检查 `GITHUB_TOKEN`（通常自动提供，无需手动设置）
2. 确保有创建 Release 的权限

## 注意事项

- ⚠️ 首次发布到 npm 需要使用 `npm publish --access public`（如果包名不包含 scope）
- ⚠️ 版本号必须遵循语义化版本（SemVer）
- ⚠️ tag 名称必须以 `v` 开头（例如 `v1.0.0`）
- ⚠️ 确保 `apps/main/package.json` 中的 `files` 字段包含所有需要发布的文件

