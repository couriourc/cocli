# 命令参考

CoCli 提供了丰富的 CLI 命令，帮助你高效管理项目和模板。

## 核心命令

### `cocli create <projectName>`

创建新项目。

**用法：**

```bash
cocli create <projectName> [options]
```

**参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `projectName` | string | ✅ | - | 项目名称 |
| `--template, -t` | string | ❌ | `vue3` | 模板名称 |
| `--addons, -a` | string | ❌ | - | 插件列表（逗号分隔） |

**示例：**

```bash
# 使用默认模板创建项目
cocli create my-app

# 指定模板
cocli create my-app --template=vue3

# 添加插件
cocli create my-app --template=vue3 --addons=my-plugin,another-plugin
```

**输出：**

```
💡 使用默认模板: vue3（零配置启动）
正在下载模板 vue3...
✅ 项目 my-app 创建成功！
💡 提示: 使用 `cd my-app` 进入项目目录
```

### `cocli add <item>`

添加原子化模板项到项目。

**用法：**

```bash
cocli add <item> [projectDir] [options]
```

**参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `item` | string | ✅ | - | 模板项名称 |
| `projectDir` | string | ❌ | `.` | 项目目录 |
| `--version, -v` | string | ❌ | `latest` | 指定版本 |
| `--force, -f` | boolean | ❌ | `false` | 强制覆盖已存在的项 |
| `--interactive, -i` | boolean | ❌ | `false` | 交互模式 |

**示例：**

```bash
# 添加单个组件
cocli add button

# 指定版本
cocli add button --version=1.0.0

# 强制覆盖
cocli add button --force

# 指定项目目录
cocli add button ./my-project
```

**输出：**

```
✨ 添加 button...
📦 安装依赖: base
✅ button 添加成功！
```

### `cocli remove <item>`

移除已安装的模板项。

**用法：**

```bash
cocli remove <item> [projectDir]
```

**参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `item` | string | ✅ | - | 模板项名称 |
| `projectDir` | string | ❌ | `.` | 项目目录 |

**示例：**

```bash
cocli remove button
```

**输出：**

```
🗑️  移除 button 的文件...
✅ button 已移除！
```

### `cocli list [type]`

列出所有可用的模板项。

**用法：**

```bash
cocli list [type]
```

**参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `type` | string | ❌ | - | 类型过滤（component/module/template/addon） |

**示例：**

```bash
# 列出所有项
cocli list

# 按类型列出
cocli list component
cocli list module
```

**输出：**

```
可用的模板项:

component:
  - button - 按钮组件
  - table - 表格组件

module:
  - api-module - API 模块
```

## 配置命令

### `cocli init`

初始化配置文件。

**用法：**

```bash
cocli init [options]
```

**参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--file, -f` | string | ❌ | `.qclrc` | 配置文件路径 |
| `--yes, -y` | boolean | ❌ | `false` | 非交互模式，使用默认配置 |

**示例：**

```bash
# 交互式初始化
cocli init

# 非交互模式
cocli init --yes

# 指定配置文件路径
cocli init --file=.qclrc.custom
```

### `cocli config list`

列出所有配置。

**用法：**

```bash
cocli config list
```

**输出：**

```
配置信息:
当前工作区: my-workspace

全局配置:
  username: my-user
  repos: 2 个仓库
```

### `cocli config get <key>`

获取配置值。

**用法：**

```bash
cocli config get <key>
```

**示例：**

```bash
cocli config get username
cocli config get repos
```

### `cocli config set <key> <value>`

设置配置值。

**用法：**

```bash
cocli config set <key> <value>
```

**示例：**

```bash
cocli config set username my-user
```

### `cocli config edit`

可视化编辑配置文件。

**用法：**

```bash
cocli config edit [projectDir]
```

**示例：**

```bash
cocli config edit
```

## 工作区命令

### `cocli workspace init <name> [path]`

初始化新工作区。

**用法：**

```bash
cocli workspace init <name> [path]
```

**参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `name` | string | ✅ | - | 工作区名称 |
| `path` | string | ❌ | `.` | 工作区路径 |

**示例：**

```bash
cocli workspace init my-workspace
cocli workspace init my-workspace ./workspaces
```

### `cocli workspace list`

列出所有工作区。

**用法：**

```bash
cocli workspace list
```

### `cocli workspace current`

显示当前工作区。

**用法：**

```bash
cocli workspace current
```

## 模板命令

### `cocli template list`

列出所有可用的模板。

**用法：**

```bash
cocli template list
```

### `cocli template create <name>`

创建新模板。

**用法：**

```bash
cocli template create <name> [options]
```

**参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `name` | string | ✅ | - | 模板名称 |
| `--path, -p` | string | ❌ | `templates/<name>` | 模板路径 |
| `--repo-dir, -r` | string | ❌ | `.` | 仓库目录 |

## 插件命令

### `cocli addons list`

列出所有可用的插件。

**用法：**

```bash
cocli addons list [options]
```

**参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--verbose, -v` | boolean | ❌ | `false` | 显示详细信息 |

### `cocli addons add <addons> [projectDir]`

添加插件到项目。

**用法：**

```bash
cocli addons add <addons> [projectDir]
```

**参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `addons` | string | ✅ | - | 插件列表（逗号分隔） |
| `projectDir` | string | ❌ | `.` | 项目目录 |

**示例：**

```bash
cocli addons add my-plugin
cocli addons add plugin1,plugin2
```

### `cocli addons sync [projectDir]`

同步项目中的插件。

**用法：**

```bash
cocli addons sync [projectDir]
```

## 仓库命令

### `cocli repo init [path]`

初始化仓库。

**用法：**

```bash
cocli repo init [path]
```

**参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `path` | string | ❌ | `.` | 仓库路径 |

## 注意事项

1. **零配置启动**：`cocli create` 命令支持零配置启动，无需先运行 `cocli init`
2. **原子化添加**：`cocli add` 命令会自动安装依赖项
3. **版本管理**：使用 `--version` 参数可以锁定特定版本，避免更新导致兼容问题
4. **工作区识别**：工作区通过 `.qclrc` 文件自动识别，无需手动切换

## 常见问题

### Q: 如何查看命令帮助？

A: 使用 `--help` 参数：

```bash
cocli --help
cocli create --help
```

### Q: 命令执行失败怎么办？

A: 检查以下几点：
1. 配置文件是否存在且格式正确
2. 网络连接是否正常（Git 仓库）
3. 权限是否足够（文件读写）

### Q: 如何更新 CoCli？

A: 使用包管理器更新：

```bash
npm update -g cocli
# 或
pnpm update -g cocli
```

