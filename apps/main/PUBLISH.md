# 发布指南

本包（`cocli`）是 CoCli 的核心 CLI 工具，通过 Git 仓库分发。

## 重要提示

⚠️ **本包通过 Git 分发，不需要发布到 npm registry！**

用户可以通过 `npm install -g git+https://github.com/couriourc/cocli.git` 安装。

## 发布方式

### 使用 Git Tags 发布版本

1. **更新版本号**：
   - `apps/main/Cargo.toml`
   - `apps/main/package.json`

2. **提交更改**：
   ```bash
   git add .
   git commit -m "chore: bump version to x.x.x"
   git push origin main
   ```

3. **创建并推送 Git Tag**：
   ```bash
   # 创建 tag（必须以 v 开头，例如 v0.1.0）
   git tag vx.x.x
   git push origin vx.x.x
   ```

4. **GitHub Actions 会自动**：
   - 构建所有平台的二进制文件
   - 创建 GitHub Release
   - 上传二进制文件到 Release

### 用户安装方式

用户可以通过以下方式安装：

```bash
# 安装最新版本
npm install -g git+https://github.com/couriourc/cocli.git

# 安装特定版本（使用 git tag）
npm install -g git+https://github.com/couriourc/cocli.git#v0.1.0

# 使用 pnpm
pnpm add -g git+https://github.com/couriourc/cocli.git#v0.1.0
```

## 包结构

发布到 npm 的包包含：
- `bin/` - 可执行文件脚本和二进制文件
- `README.md` - 包说明文档

不包含：
- `src/` - Rust 源代码
- `Cargo.toml` / `Cargo.lock` - Rust 构建配置
- `target/` - 构建产物（除了发布需要的二进制文件）

## 验证发布

发布后，可以通过以下方式验证：

```bash
# 从 Git 安装
npm install -g git+https://github.com/couriourc/cocli.git#vx.x.x

# 验证安装
cocli --version
```

## 版本管理

- 使用 Git tags 管理版本（格式：`v0.1.0`）
- 遵循语义化版本（SemVer）
- 每个 tag 对应一个可安装的版本

## 故障排除

### 从 Git 安装失败

如果从 Git 安装时遇到问题：

1. **检查 Git URL**：
   确保仓库 URL 正确且可访问

2. **检查 Tag 是否存在**：
   ```bash
   git ls-remote --tags https://github.com/couriourc/cocli.git
   ```

3. **检查构建依赖**：
   从 Git 安装会自动构建，需要确保系统有 Rust 和 Cargo

4. **使用预构建的二进制文件**：
   可以从 GitHub Release 下载预构建的二进制文件

