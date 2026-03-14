# 插件管理命令

## cocli addons list

列出所有可用的插件。

### 语法

```bash
cocli addons list [-v|--verbose]
```

### 参数

| 参数 | 简写 | 说明 |
|------|------|------|
| `--verbose` | `-v` | 显示详细信息（包括来源、路径配置和 README.md 内容） |

### 示例

```bash
# 简单列表
cocli addons list

# 详细信息
cocli addons list -v
cocli addons list --verbose
```

### 输出示例（简单模式）

```
可用的 addons:
  - add
  - minus
  - vue2-funs
  - vue3-funs
```

### 输出示例（详细模式）

```
可用的 addons (详细信息):

add
  来源: D:/Projects/cocli/.test
  路径配置:
    - ./addons/add/**
  详细信息:
    # Add Addon
    提供加法相关的工具函数。
    ...
```

## cocli addons detail

查看指定插件的完整详细信息，包括 README.md 内容。

### 语法

```bash
cocli addons detail <插件名>
```

### 参数

| 参数 | 说明 |
|------|------|
| `<插件名>` | 插件名称（必需） |

### 示例

```bash
# 查看 add 插件的详细信息
cocli addons detail add

# 查看 vue3-funs 插件的详细信息
cocli addons detail vue3-funs
```

### 输出示例

```
add
  来源: D:/Projects/cocli/.test
  路径配置:
    - ./addons/add/**
  详细信息:
    # Add Addon
    
    提供加法相关的工具函数。
    
    ## 使用方法
    
    ```javascript
    import { add, addMultiple } from './utils/math'
    
    const result = add(1, 2) // 3
    const sum = addMultiple(1, 2, 3, 4) // 10
    ```
```

### 说明

- 如果插件不存在，会列出所有可用插件作为建议
- 显示完整的 README.md 内容（不限制行数）

## cocli addons add

向指定项目或当前目录添加插件。

### 语法

```bash
cocli addons add <插件列表> [项目目录]
```

### 参数

| 参数 | 说明 |
|------|------|
| `<插件列表>` | 插件名称列表，多个插件用逗号分隔（必需） |
| `[项目目录]` | 目标项目目录（可选，默认为当前目录 `.`） |

### 示例

```bash
# 向当前目录添加插件
cocli addons add add .
cocli addons add add,minus .

# 向指定项目目录添加插件
cocli addons add add my-project
cocli addons add add,minus,vue3-funs my-project
```

### 说明

- 插件会被安装到 `{项目目录}/{addons.target_dir}/{插件名}/` 目录下
- 如果项目目录中有 `.qclocal` 文件，会更新其中的 `addons.include` 列表
- 如果项目目录中没有 `.qclocal` 文件，会创建一个新的

## cocli addons sync

根据 `.qclocal` 文件中的 `addons.include` 配置，同步项目中的插件。

### 语法

```bash
cocli addons sync [项目目录]
```

### 参数

| 参数 | 说明 |
|------|------|
| `[项目目录]` | 目标项目目录（可选，默认为当前目录 `.`） |

### 示例

```bash
# 同步当前目录的插件
cocli addons sync .

# 同步指定项目的插件
cocli addons sync my-project
```

### 说明

- 读取项目目录中的 `.qclocal` 文件
- 根据 `addons.include` 列表同步所有插件
- 如果插件已存在，会更新到最新版本

## cocli addons create

创建新插件。此命令用于在仓库中创建插件的目录结构，并自动更新 `meta.yaml` 文件。

### 语法

```bash
cocli addons create <插件名> [选项]
```

### 参数

| 参数 | 简写 | 说明 |
|------|------|------|
| `<插件名>` | - | 插件名称（必需） |
| `--path <PATH>` | `-p` | 插件路径（可选，默认为 `addons/<插件名>`） |
| `--repo-dir <REPO_DIR>` | `-r` | 仓库目录（可选，默认为当前目录 `.`） |

### 示例

```bash
# 在当前目录创建插件（默认路径为 addons/my-addon）
cocli addons create my-addon

# 指定插件路径
cocli addons create vue3-utils --path addons/vue3-utils

# 指定仓库目录
cocli addons create my-plugin --repo-dir /path/to/repo

# 组合使用
cocli addons create vue3-utils -p addons/vue3-utils -r /path/to/repo
```

### 功能说明

1. **创建插件目录**：在指定的仓库目录中创建插件目录结构
2. **生成 README.md**：自动创建包含基本使用说明的 README.md 文件
3. **更新 meta.yaml**：
   - 如果 `meta.yaml` 不存在，会创建新文件
   - 如果 `meta.yaml` 已存在，会读取并更新，添加新插件配置
   - 自动检查重复名称，防止冲突

### 输出示例

```
✅ 已创建插件目录: D:\Projects\repo\addons\my-addon
✅ 已创建 README.md
✅ 已更新 meta.yaml

✅ 插件 'my-addon' 创建成功！
💡 提示: 插件路径: D:\Projects\repo\addons\my-addon
💡 提示: 使用 `cocli addons list` 查看所有插件
```

### 注意事项

- 插件名称不能与现有插件重复
- 如果插件目录已存在，命令会失败并提示错误
- 路径支持相对路径和绝对路径
- 建议在仓库根目录下执行此命令，以确保 `meta.yaml` 文件位置正确
- 建议在插件的 README.md 中添加详细的使用说明和示例

### 创建后的目录结构

```
repo/
├── meta.yaml              # 自动更新
└── addons/
    └── my-addon/          # 新创建的插件目录
        ├── README.md       # 自动生成
        └── ...            # 你可以在这里添加插件文件
```

### 相关命令

- `cocli addons list` - 列出所有插件
- `cocli addons detail` - 查看插件详情
- `cocli addons add` - 添加插件到项目

