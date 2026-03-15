# 发布指南

本包（`cocli`）是 CoCli 的核心 CLI 工具，通过 Git 仓库分发。

## 重要提示

⚠️ **本包通过 Git 分发，不需要发布到 npm registry！**

用户可以通过 `npm install -g git+https://github.com/couriourc/cocli.git` 安装。

## 包结构说明

本仓库是一个 monorepo，包含多个子项目：
- `apps/main/` - 主 CLI 工具（这是实际发布的包）
- `docs/` - 文档站点
- 根目录 - 开发工具和配置

**重要：** 根目录的 `package.json` 已配置 `repository.directory: "apps/main"`，这意味着：
- 当用户执行 `pnpm add git+https://github.com/couriourc/cocli.git` 时
- npm/pnpm 会自动识别并使用 `apps/main/package.json` 作为包的配置
- 发布时只需要关注 `apps/main/` 目录的内容

## 发布方式

### 使用 Git Tags 发布版本

1. **更新版本号**：
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
   - 验证 Node.js 包可以正常安装和运行
   - 创建 GitHub Release
   - 发布 Release 说明

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

**实际发布的包位于 `apps/main/` 目录**，包含：
- `bin/` - 可执行文件脚本
- `src/` - Node.js 源代码
- `README.md` - 包说明文档
- `package.json` - Node.js 包配置

**根目录的 `package.json` 配置：**
- `private: true` - 防止意外发布根目录
- `repository.directory: "apps/main"` - 指定实际包的位置

这样配置后，从 Git 安装时会自动使用 `apps/main/package.json` 作为包的配置。

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

3. **检查依赖**：
   从 Git 安装需要确保系统有 Node.js 和 pnpm

