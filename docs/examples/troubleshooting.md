# 常见问题与排错

本章收集了使用 CoCli 时常见的问题和解决方案。

## 安装问题

### Q: 安装失败

**问题：** `npm install -g cocli` 失败

**解决方案：**

1. 检查 Node.js 版本（需要 Node.js 18+）
2. 使用 sudo（Linux/Mac）或管理员权限（Windows）
3. 清除 npm 缓存：`npm cache clean --force`
4. 使用 pnpm：`pnpm add -g cocli`

### Q: 命令未找到

**问题：** 运行 `cocli` 提示命令未找到

**解决方案：**

1. 检查安装路径是否在 PATH 中
2. 重新安装：`npm install -g cocli`
3. 检查全局 bin 目录：`npm config get prefix`

## 配置问题

### Q: 配置文件不存在

**问题：** `未找到配置文件，请先配置 .qclrc 或 .qcl.yaml`

**解决方案：**

1. 运行 `cocli init` 初始化配置
2. 或使用零配置启动：`cocli create my-app`（使用默认模板）

### Q: 配置文件格式错误

**问题：** `解析配置文件失败`

**解决方案：**

1. 检查 YAML 语法
2. 确保缩进正确（使用空格，不要使用 Tab）
3. 检查引号匹配
4. 使用 YAML 验证工具验证

### Q: 配置不生效

**问题：** 修改配置后不生效

**解决方案：**

1. 检查配置文件位置和优先级
2. 检查环境变量是否覆盖了配置
3. 重新加载配置：`cocli config list`

## 模板问题

### Q: 模板不存在

**问题：** `❌ 未找到模板: vue3`

**解决方案：**

1. 检查模板名称是否正确：`cocli template list`
2. 检查仓库配置是否正确
3. 检查网络连接（Git 仓库）
4. 检查仓库中是否有该模板

### Q: 模板下载失败

**问题：** `克隆仓库失败` 或网络超时

**解决方案：**

1. 检查网络连接
2. 检查 Git 仓库地址是否正确
3. 检查认证信息（Token/用户名密码）
4. 使用本地仓库作为备选

### Q: 模板版本不存在

**问题：** `未找到版本: 2.0.0`

**解决方案：**

1. 检查版本号是否正确
2. 查看可用版本：`cocli list`
3. 使用 `latest` 版本：`cocli add button`

## 组件问题

### Q: 组件添加失败

**问题：** `❌ 未找到模板项: button`

**解决方案：**

1. 检查组件名称是否正确：`cocli list`
2. 检查仓库配置
3. 检查组件是否在 `atomic` 配置中

### Q: 组件依赖安装失败

**问题：** 添加组件时依赖安装失败

**解决方案：**

1. 检查依赖项是否存在
2. 检查是否有循环依赖
3. 手动安装依赖：`cocli add <dependency>`

### Q: 组件已存在

**问题：** `模板项 button 已存在`

**解决方案：**

1. 使用 `--force` 强制覆盖：`cocli add button --force`
2. 或先移除：`cocli remove button`，然后重新添加

## 工作区问题

### Q: 当前目录不是工作区

**问题：** `当前目录不是工作区（未找到 .qclrc 文件）`

**解决方案：**

1. 创建工作区：`cocli workspace init my-workspace`
2. 切换到工作区目录：`cd my-workspace`
3. 或在当前目录创建 `.qclrc` 文件

### Q: 工作区配置错误

**问题：** 工作区配置无法加载

**解决方案：**

1. 检查 `.qclrc` 文件格式
2. 确保包含 `workspace` 配置
3. 检查文件权限

## 仓库问题

### Q: Git 仓库认证失败

**问题：** `克隆仓库失败: authentication failed`

**解决方案：**

1. 检查 Token 是否正确
2. 检查 Token 是否过期
3. 检查仓库权限
4. 使用用户名密码认证

### Q: 本地仓库路径不存在

**问题：** `本地路径不存在: ./templates`

**解决方案：**

1. 检查路径是否正确（相对路径或绝对路径）
2. 检查路径权限
3. 确保路径存在

### Q: 多个仓库冲突

**问题：** 多个仓库中有同名模板

**解决方案：**

1. 调整仓库优先级（按配置顺序）
2. 使用完整路径指定模板
3. 重命名模板避免冲突

## 性能问题

### Q: 下载速度慢

**问题：** 模板下载速度很慢

**解决方案：**

1. 使用本地仓库
2. 使用代理：配置 `proxy` 选项
3. 使用缓存：首次下载后会缓存

### Q: 内存占用高

**问题：** CoCli 占用内存较高

**解决方案：**

1. 清理缓存：删除 `~/.cocli/cache`
2. 使用浅克隆：Git 仓库使用 `--depth 1`
3. 减少并发下载

## Hygen 问题

### Q: Hygen 未启动

**问题：** 创建项目后未进入 Hygen 交互模式

**解决方案：**

1. 检查模板是否配置了 Hygen
2. 检查 `meta.yaml` 中的 `hygen.enabled`
3. 手动运行：`npm run g`

### Q: Hygen 模板不存在

**问题：** `未找到 _templates 目录`

**解决方案：**

1. 检查模板中是否有 `_templates` 目录
2. 检查 `templatesDir` 配置
3. 手动创建模板目录

## 环境问题

### Q: Node.js 版本不兼容

**问题：** 某些功能需要特定 Node.js 版本

**解决方案：**

1. 升级 Node.js 到 18+
2. 使用 nvm 管理 Node.js 版本

### Q: 权限不足

**问题：** 文件操作权限不足

**解决方案：**

1. 检查文件/目录权限
2. 使用 sudo（Linux/Mac）
3. 以管理员身份运行（Windows）

## 获取帮助

如果以上方案无法解决问题，可以：

1. 查看日志：添加 `DEBUG=1` 环境变量
2. 查看 GitHub Issues：https://github.com/couriourc/cocli/issues
3. 提交 Issue：描述问题、环境、复现步骤

## 调试技巧

### 启用调试模式

```bash
DEBUG=1 cocli create my-app
```

### 查看配置

```bash
cocli config list
cocli config get repos
```

### 检查网络

```bash
# 测试 Git 仓库连接
git ls-remote https://github.com/user/repo

# 测试 FTP 连接
curl ftp://example.com/
```

### 清理缓存

```bash
rm -rf ~/.cocli/cache
```

