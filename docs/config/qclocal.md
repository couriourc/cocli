# .qclocal 配置文件

`.qclocal` 是项目本地的配置文件，用于配置项目特定的设置。每个项目目录可以包含一个 `.qclocal` 文件。

## 文件位置

`.qclocal` 文件位于项目根目录：

```
my-app/
  ├── .qclocal      # 项目配置文件
  ├── src/
  ├── package.json
  └── ...
```

## 配置格式

```yaml
# 当前创建的项目名
project: my-app

# 使用的模板名称
template: vue3

# Addons 配置
addons:
  # 插件安装目录（默认：./addons）
  target_dir: ./addons
  
  # 当执行 qcl addons sync 时自动同步的插件列表
  include:
    - addon-name
    - another-addon

# 仓库配置（可选，用于覆盖全局配置）
repos:
  - local:
      type: local
      url: /path/to/local/repo

# 是否从父级目录继承配置（如果 repos 为空）
inherit: true
```

## 配置字段说明

### project

项目名称（可选）。

```yaml
project: my-app
```

如果不指定，`qcl app list` 会使用目录名称作为项目名称。

### template

使用的模板名称（必需）。

```yaml
template: vue3
```

### addons

插件配置。

#### target_dir

插件安装目录，默认为 `./addons`。

```yaml
addons:
  target_dir: ./addons
```

每个插件会安装到 `{target_dir}/{addon_name}/` 目录下。

#### include

需要同步的插件列表。

```yaml
addons:
  include:
    - vue3-funs
    - add
    - minus
```

执行 `qcl addons sync` 时会自动同步这些插件。

### repos

项目特定的仓库配置（可选）。

```yaml
repos:
  - local:
      type: local
      url: /path/to/local/repo
```

如果未设置，将从父级目录或全局配置中查找。

### inherit

是否从父级目录继承配置。

```yaml
inherit: true
```

如果设置为 `true` 且 `repos` 为空，工具会自动从父级目录的 `.qclrc` 文件中查找 `repos` 配置。

## 配置继承示例

假设目录结构如下：

```
workspace/
  .qclrc          # 包含 repos 配置
  project1/
    .qclocal      # inherit: true, repos 为空
  project2/
    .qclocal      # 包含自己的 repos 配置
```

- `project1` 会继承 `workspace/.qclrc` 中的 `repos` 配置
- `project2` 使用自己的 `repos` 配置

## 自动创建

创建项目时，QCli 会自动创建 `.qclocal` 文件：

```bash
qcl app create --template=vue3 my-app
```

生成的 `.qclocal` 文件：

```yaml
project: my-app
template: vue3
addons:
  target_dir: ./addons
  include: []
repos: null
inherit: false
```

## 手动编辑

你可以随时手动编辑 `.qclocal` 文件来修改配置：

```yaml
project: my-app
template: vue3
addons:
  target_dir: ./addons
  include:
    - vue3-funs
    - add
inherit: true
```

## 相关文档

- [`.qclrc` 配置](./qclrc)
- [配置继承示例](/examples/inherit)
- [应用管理](/guide/app)

