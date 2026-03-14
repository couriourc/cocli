# GitHub Actions 设置指南

## 快速开始

### 1. 更新 package.json

确保 `apps/main/package.json` 中的以下字段已正确配置：

```json
{
  "name": "cocli",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/couriourc/cocli.git"
  },
  "bugs": {
    "url": "https://github.com/couriourc/cocli/issues"
  },
  "homepage": "https://github.com/couriourc/cocli#readme"
}
```

将 `couriourc` 替换为你的 GitHub 用户名。

### 2. 发布新版本

#### 方式一：使用 GitHub Actions 自动发布（推荐）

```bash
# 1. 更新版本号（在 apps/main/Cargo.toml 和 apps/main/package.json）
# 2. 提交更改
git add .
git commit -m "chore: bump version to 1.0.0"

# 3. 创建 tag（必须以 v 开头）
git tag v1.0.0

# 4. 推送代码和 tag
git push origin main
git push origin v1.0.0
```

推送 tag 后，GitHub Actions 会自动：
- ✅ 在所有平台（Linux、Windows、macOS）构建二进制文件
- ✅ 打包所有平台的二进制文件
- ✅ 创建 GitHub Release（包含所有平台的二进制文件）

**注意：** 本包通过 Git 分发，用户可以通过 `npm install -g git+https://github.com/couriourc/cocli.git#vx.x.x` 安装，无需发布到 npm registry。

#### 方式二：本地测试构建

**注意：本地构建只能构建当前平台的版本。**

```bash
# 1. 进入 apps/main 目录
cd apps/main

# 2. 构建二进制文件
pnpm build
# 或
cargo build --release

# 3. 测试二进制文件
# Windows: target/release/cocli.exe --version
# Linux/macOS: ./target/release/cocli --version
```

**重要提示：**
- ⚠️ 本地构建只能构建当前平台的二进制文件
- ⚠️ 推荐使用 GitHub Actions 自动构建，可以同时支持所有平台
- ⚠️ 用户可以通过 `npm install -g git+https://github.com/couriourc/cocli.git#vx.x.x` 安装

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

### 二进制文件未找到

1. 检查 Rust 构建是否成功
2. 查看 GitHub Actions 日志中的错误信息
3. 确保 `apps/main/Cargo.toml` 配置正确

### GitHub Release 创建失败

1. 检查 `GITHUB_TOKEN`（通常自动提供，无需手动设置）
2. 确保有创建 Release 的权限

## 注意事项

- ⚠️ **本包通过 Git 分发，不需要发布到 npm registry**
- ⚠️ 用户可以通过 `npm install -g git+https://github.com/couriourc/cocli.git#vx.x.x` 安装
- ⚠️ 版本号必须遵循语义化版本（SemVer）
- ⚠️ tag 名称必须以 `v` 开头（例如 `v1.0.0`）
- ⚠️ 确保 `apps/main/package.json` 中的 `files` 字段包含所有需要发布的文件
- ⚠️ GitHub Actions 会自动构建所有平台的二进制文件并创建 Release

