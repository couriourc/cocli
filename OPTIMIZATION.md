# CoCli 优化方案（对标 shadcn）

本文档说明 CoCli 对标 shadcn 设计理念的优化实现。

## 核心优化特性

### 1. 零配置启动 ✅

**特性说明**：默认内置常用模板，无需手动 `init`，`cocli create my-app` 直接生成项目。

**实现方式**：
- 内置默认仓库配置（`src/defaults.js`）
- 检测到无配置文件时自动使用默认模板（vue3）
- 仅在需要自定义时触发交互

**使用示例**：
```bash
# 零配置创建项目（使用默认 vue3 模板）
cocli create my-app

# 指定模板
cocli create my-app --template=react

# 需要自定义配置时
cocli init
```

### 2. 原子化模板系统 ✅

**特性说明**：将模板拆分为最小可复用单元，支持 `cocli add button` 按需添加，而非全量模板引入。

**实现方式**：
- 新增 `AtomicTemplateManager` 类（`src/atomic.js`）
- 支持 `meta.yaml` 中的 `atomic` 配置段
- 自动解析依赖关系

**使用示例**：
```bash
# 添加单个组件
cocli add button

# 添加模块（自动安装依赖）
cocli add table  # 自动安装 button 依赖

# 指定版本
cocli add button --version=1.0.0

# 列出所有可用项
cocli list

# 按类型列出
cocli list component
cocli list module

# 移除项
cocli remove button
```

**meta.yaml 配置示例**：
```yaml
atomic:
  button:
    type: component
    description: 按钮组件
    version: 1.0.0
    root: components/button/**
    target: src/components/ui
    dependencies: []

  table:
    type: component
    description: 表格组件
    version: 1.0.0
    root: components/table/**
    target: src/components/ui
    dependencies:
      - button  # 自动安装依赖
```

### 3. 简化配置系统 ✅

**特性说明**：简化为单文件 `cocli.json` + 环境变量覆盖，支持 `cocli config edit` 可视化编辑。

**实现方式**：
- 新增 `SimpleConfig` 类（`src/config-simple.js`）
- 优先级：环境变量 > cocli.json > .qclrc > 默认配置
- 支持可视化编辑

**使用示例**：
```bash
# 查看配置
cocli config list

# 获取配置值
cocli config get repos

# 设置配置值
cocli config set repos '[{"github":{"repo":"..."}}]'

# 可视化编辑
cocli config edit
```

**配置文件格式**：
```json
{
  "repos": [
    {
      "github": {
        "type": "git",
        "repo": "https://github.com/user/repo"
      }
    }
  ],
  "items": ["button", "table"]
}
```

**环境变量支持**：
```bash
export COCLI_REPO='[{"github":{"repo":"..."}}]'
export COCLI_USERNAME="your-username"
export COCLI_TOKEN="your-token"
```

### 4. 无侵入集成 ✅

**特性说明**：生成的项目不绑定 CoCli 依赖，配置文件可一键移除。

**实现方式**：
- 生成的项目不包含 CoCli 运行时依赖
- `.qclocal` 文件可选创建（通过环境变量控制）
- 提示用户可安全删除配置文件

**使用示例**：
```bash
# 创建项目（不创建配置文件）
COCLI_NO_CONFIG=true cocli create my-app

# 创建后提示
# 💡 提示: 项目不绑定 CoCli 依赖，可安全删除 .qclocal 文件
```

### 5. 模板版本化和离线缓存 ✅

**特性说明**：支持版本指定，首次使用缓存模板，断网时自动使用本地缓存。

**实现方式**：
- `CacheManager` 类（`src/cache.js`）
- 缓存目录：`~/.cocli/cache`
- 自动缓存和回退机制

**使用示例**：
```bash
# 指定版本
cocli add button --version=1.0.0

# 离线模式（自动使用缓存）
# 网络失败时自动从缓存加载
cocli add button
```

**缓存管理**：
- 缓存位置：`~/.cocli/cache`
- 自动清理：超过 30 天的缓存会被清理
- 版本隔离：不同版本分别缓存

### 6. 优化 CLI 交互 ✅

**特性说明**：支持模糊搜索、快捷键操作、默认选项一键确认。

**实现方式**：
- `InteractiveCLI` 类（`src/interactive.js`）
- 支持 inquirer.js（可选，有降级方案）
- 模糊搜索和自动补全

**使用示例**：
```bash
# 模糊搜索（交互式）
cocli add bu  # 自动匹配 button

# 快捷键支持（需要 inquirer）
# 上下键选择，回车确认，ESC 退出
```

### 7. 简化命令体系 ✅

**特性说明**：对标 shadcn 的极简命令。

**命令对比**：

| 功能 | 旧命令 | 新命令（对标 shadcn） |
|------|--------|---------------------|
| 创建项目 | `cocli app create` | `cocli create` |
| 添加项 | `cocli addons add` | `cocli add` |
| 移除项 | - | `cocli remove` |
| 列出项 | `cocli template list` | `cocli list` |
| 初始化 | `cocli init` | `cocli init`（可选） |

**完整命令列表**：
```bash
# 核心命令
cocli init          # 初始化配置（可选）
cocli create <name> # 创建项目（零配置启动）
cocli add <item>    # 添加模板/插件/组件
cocli remove <item> # 移除模板/插件/组件
cocli list [type]   # 列出可用项

# 配置命令
cocli config list   # 列出配置
cocli config get <key>    # 获取配置值
cocli config set <key> <value>  # 设置配置值
cocli config edit   # 可视化编辑配置

# 兼容旧命令（向后兼容）
cocli app create    # 等同于 cocli create
cocli template list # 等同于 cocli list
cocli addons add    # 等同于 cocli add
```

## 技术实现

### 新增文件

1. **src/atomic.js** - 原子化模板管理器
2. **src/defaults.js** - 默认配置和模板
3. **src/config-simple.js** - 简化配置系统
4. **src/cache.js** - 离线缓存管理器
5. **src/interactive.js** - 交互式 CLI 工具

### 修改文件

1. **src/commands.js** - 添加原子化命令处理
2. **src/index.js** - 添加新命令注册
3. **src/template.js** - 支持无侵入模式

### 配置扩展

1. **repo/meta-atomic.yaml.example** - 原子化配置示例

## 迁移指南

### 从旧版本迁移

1. **配置文件迁移**：
   - 旧格式：`.qclrc` (YAML)
   - 新格式：`cocli.json` (JSON，可选)
   - 旧格式仍然支持，无需强制迁移

2. **命令迁移**：
   ```bash
   # 旧命令仍然可用（向后兼容）
   cocli app create my-app --template=vue3
   
   # 新命令（推荐）
   cocli create my-app --template=vue3
   ```

3. **模板仓库迁移**：
   - 在 `meta.yaml` 中添加 `atomic` 配置段
   - 参考 `repo/meta-atomic.yaml.example`

## 最佳实践

1. **零配置启动**：优先使用默认模板，减少配置负担
2. **原子化添加**：按需添加组件/模块，避免全量引入
3. **版本锁定**：生产环境指定版本，避免更新导致兼容问题
4. **无侵入集成**：生成的项目独立运行，不依赖 CoCli

## 对比 shadcn

| 特性 | shadcn | CoCli（优化后） |
|------|--------|----------------|
| 零配置启动 | ✅ | ✅ |
| 原子化添加 | ✅ | ✅ |
| 无侵入 | ✅ | ✅ |
| 版本化 | ✅ | ✅ |
| 离线缓存 | ✅ | ✅ |
| 简化配置 | ✅ | ✅ |
| 交互优化 | ✅ | ✅ |

## 后续优化方向

1. **TypeScript 全量覆盖**：逐步迁移到 TypeScript
2. **社区模板库**：建立官方模板仓库
3. **插件系统**：支持第三方插件扩展
4. **可视化界面**：Web UI 管理模板和配置

