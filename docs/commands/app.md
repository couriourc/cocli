# 应用管理命令

## cocli app create

从模板创建新项目。

### 语法

```bash
cocli app create --template=<模板名> [--addons=<插件列表>] <项目名>
```

### 参数

| 参数 | 简写 | 必需 | 说明 |
|------|------|------|------|
| `--template` | `-t` | 是 | 模板名称 |
| `--addons` | `-a` | 否 | 插件列表，逗号分隔 |
| `<项目名>` | - | 是 | 项目目录名称 |

### 示例

```bash
# 创建 Vue 3 项目
cocli app create --template=vue3 my-vue-app

# 创建 React 项目并添加插件
cocli app create --template=react --addons=add,minus my-react-app

# 使用短选项
cocli app create -t vue2 -a vue2-funs my-vue2-app
```

### 说明

- 创建项目后会自动生成 `.qclocal` 配置文件
- 如果模板内已存在 `.qclocal`，会直接使用
- 可以同时添加多个插件

## cocli app list

列出当前工作区（或当前目录）下的所有应用。

### 语法

```bash
cocli app list
```

### 示例

```bash
cocli app list
```

### 输出示例

```
应用列表:
  - my-app (模板: vue3, 目录: my-app)
  - another-app (模板: react, 目录: another-app)

共找到 2 个应用
```

### 说明

- 扫描当前工作区目录（如果设置了工作区）或当前目录
- 查找包含 `.qclocal` 文件的子目录
- 显示项目名称、模板和目录名称

