# 发布命令指南

## 快速发布（使用脚本）

### Windows

```bash
RELEASE.bat 0.1.0
```

### Linux/macOS

```bash
chmod +x RELEASE.sh
./RELEASE.sh 0.1.0
```

## 手动发布步骤

### 1. 更新版本号

更新以下文件中的版本号（例如：`0.1.0`）：

**apps/main/Cargo.toml:**
```toml
version = "0.1.0"
```

**apps/main/package.json:**
```json
"version": "0.1.0"
```

### 2. 提交更改

```bash
# 进入项目根目录
cd D:\Projects\qcli

# 添加更改的文件
git add apps/main/Cargo.toml apps/main/package.json

# 提交
git commit -m "chore: bump version to 0.1.0"

# 推送到远程
git push origin main
```

### 3. 创建并推送 Git Tag

```bash
# 创建 tag（必须以 v 开头）
git tag v0.1.0

# 推送 tag
git push origin v0.1.0
```

### 4. 验证发布

等待几分钟后，GitHub Actions 会自动：
- ✅ 构建所有平台的二进制文件
- ✅ 创建 GitHub Release
- ✅ 上传二进制文件

查看发布状态：
- Actions: https://github.com/couriourc/cocli/actions
- Releases: https://github.com/couriourc/cocli/releases

### 5. 测试安装

发布完成后，用户可以安装：

```bash
# 安装特定版本
npm install -g git+https://github.com/couriourc/cocli.git#v0.1.0

# 验证安装
cocli --version
```

## 完整命令示例

假设要发布版本 `0.1.0`：

```bash
# 1. 进入项目根目录
cd D:\Projects\qcli

# 2. 更新版本号（手动编辑文件或使用脚本）
# 编辑 apps/main/Cargo.toml: version = "0.1.0"
# 编辑 apps/main/package.json: "version": "0.1.0"

# 3. 提交更改
git add apps/main/Cargo.toml apps/main/package.json
git commit -m "chore: bump version to 0.1.0"
git push origin main

# 4. 创建并推送 tag
git tag v0.1.0
git push origin v0.1.0

# 5. 等待 GitHub Actions 完成（约 5-10 分钟）

# 6. 验证发布
npm install -g git+https://github.com/couriourc/cocli.git#v0.1.0
cocli --version
```

## 注意事项

- ⚠️ 版本号必须遵循语义化版本（SemVer）：`主版本号.次版本号.修订号`
- ⚠️ Tag 名称必须以 `v` 开头（例如：`v0.1.0`）
- ⚠️ 确保所有更改已提交到 `main` 分支
- ⚠️ 推送 tag 后，GitHub Actions 会自动触发构建和发布

## 版本号规范

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

示例：
- `0.1.0` → `0.1.1` (修复 bug)
- `0.1.0` → `0.2.0` (新增功能)
- `0.1.0` → `1.0.0` (重大变更)

