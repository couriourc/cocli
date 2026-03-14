# GitHub Actions 工作流说明

## CI 工作流 (`ci.yml`)

在每次推送到 `main` 或 `master` 分支，以及创建 Pull Request 时自动运行。

**功能：**
- 在 Linux、Windows、macOS 三个平台上构建项目
- 验证二进制文件是否正确构建
- 测试二进制文件是否可以正常运行

## Release 工作流 (`release.yml`)

当创建以 `v` 开头的 tag（例如 `v1.0.0`）时自动触发发布。

**功能：**
- 在所有平台上构建二进制文件
- 打包所有平台的二进制文件到 npm 包
- 发布到 npm
- 创建 GitHub Release

### 使用方法

1. **设置 NPM_TOKEN**

   在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加：
   - `NPM_TOKEN`: 你的 npm access token（需要 publish 权限）

2. **创建发布**

   ```bash
   # 更新版本号
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **自动发布**

   工作流会自动：
   - 构建所有平台的二进制文件
   - 更新 package.json 版本号
   - 发布到 npm
   - 创建 GitHub Release

### 注意事项

- 确保 `apps/main/package.json` 中的 `repository` 字段指向正确的 GitHub 仓库
- npm 包名需要在 npm 上可用
- 首次发布需要使用 `npm publish --access public`（如果包名包含 scope）

