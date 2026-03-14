# 应用管理

应用是使用 CoCli 创建的项目。每个应用都有自己的 `.qclocal` 配置文件，用于管理项目特定的设置。

## 创建应用

使用 `cocli app create` 命令创建新应用：

```bash
cocli app create --template=<模板名> <项目名>
```

### 参数说明

- `--template`, `-t`: 模板名称（必需）
- `--addons`, `-a`: 插件列表，逗号分隔（可选）
- `<项目名>`: 项目目录名称（必需）

### 示例

```bash
# 创建 Vue 3 项目
cocli app create --template=vue3 my-vue-app

# 创建 React 项目并添加插件
cocli app create --template=react --addons=add,minus my-react-app

# 使用短选项
cocli app create -t vue2 -a vue2-funs my-vue2-app
```

## 列出应用

使用 `cocli app list` 列出当前工作区（或当前目录）下的所有应用：

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

## 应用配置 (.qclocal)

每个应用目录包含一个 `.qclocal` 文件，用于配置项目特定的设置：

```yaml
# 项目名称
project: my-app

# 使用的模板
template: vue3

# Addons 配置
addons:
  # 插件安装目录
  target_dir: ./addons
  
  # 需要同步的插件列表
  include:
    - vue3-funs
    - add

# 仓库配置（可选）
repos:
  - local:
      type: local
      url: /path/to/repo

# 是否继承父级配置
inherit: true
```

## 应用目录结构

创建应用后，典型的目录结构如下：

```
my-app/
  ├── .qclocal          # 应用配置文件
  ├── addons/           # 插件目录
  │   ├── vue3-funs/
  │   └── add/
  ├── src/              # 源代码目录
  ├── package.json      # 项目配置
  └── ...               # 其他文件
```

## 工作流程

### 1. 创建应用

```bash
cocli app create --template=vue3 my-app
```

### 2. 进入应用目录

```bash
cd my-app
```

### 3. 添加插件

```bash
cocli addons add vue3-funs .
```

### 4. 同步插件

```bash
cocli addons sync .
```

## 相关命令

- `cocli app create` - 创建新应用
- `cocli app list` - 列出应用
- `cocli addons add` - 添加插件
- `cocli addons sync` - 同步插件

## 注意事项

- ⚠️ `cocli create` 命令已废弃，请使用 `cocli app create`
- ⚠️ 应用目录必须包含 `.qclocal` 文件才能被 `cocli app list` 识别
- 💡 使用 `inherit: true` 可以让应用继承工作区的仓库配置

