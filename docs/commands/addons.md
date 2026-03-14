# 插件管理命令

## qcl addons list

列出所有可用的插件。

### 语法

```bash
qcl addons list [-v|--verbose]
```

### 参数

| 参数 | 简写 | 说明 |
|------|------|------|
| `--verbose` | `-v` | 显示详细信息（包括来源、路径配置和 README.md 内容） |

### 示例

```bash
# 简单列表
qcl addons list

# 详细信息
qcl addons list -v
qcl addons list --verbose
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
  来源: D:/Projects/qcli/.test
  路径配置:
    - ./addons/add/**
  详细信息:
    # Add Addon
    提供加法相关的工具函数。
    ...
```

## qcl addons detail

查看指定插件的完整详细信息，包括 README.md 内容。

### 语法

```bash
qcl addons detail <插件名>
```

### 参数

| 参数 | 说明 |
|------|------|
| `<插件名>` | 插件名称（必需） |

### 示例

```bash
# 查看 add 插件的详细信息
qcl addons detail add

# 查看 vue3-funs 插件的详细信息
qcl addons detail vue3-funs
```

### 输出示例

```
add
  来源: D:/Projects/qcli/.test
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

## qcl addons add

向指定项目或当前目录添加插件。

### 语法

```bash
qcl addons add <插件列表> [项目目录]
```

### 参数

| 参数 | 说明 |
|------|------|
| `<插件列表>` | 插件名称列表，多个插件用逗号分隔（必需） |
| `[项目目录]` | 目标项目目录（可选，默认为当前目录 `.`） |

### 示例

```bash
# 向当前目录添加插件
qcl addons add add .
qcl addons add add,minus .

# 向指定项目目录添加插件
qcl addons add add my-project
qcl addons add add,minus,vue3-funs my-project
```

### 说明

- 插件会被安装到 `{项目目录}/{addons.target_dir}/{插件名}/` 目录下
- 如果项目目录中有 `.qclocal` 文件，会更新其中的 `addons.include` 列表
- 如果项目目录中没有 `.qclocal` 文件，会创建一个新的

## qcl addons sync

根据 `.qclocal` 文件中的 `addons.include` 配置，同步项目中的插件。

### 语法

```bash
qcl addons sync [项目目录]
```

### 参数

| 参数 | 说明 |
|------|------|
| `[项目目录]` | 目标项目目录（可选，默认为当前目录 `.`） |

### 示例

```bash
# 同步当前目录的插件
qcl addons sync .

# 同步指定项目的插件
qcl addons sync my-project
```

### 说明

- 读取项目目录中的 `.qclocal` 文件
- 根据 `addons.include` 列表同步所有插件
- 如果插件已存在，会更新到最新版本

