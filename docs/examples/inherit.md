# 配置继承示例

本示例演示如何使用配置继承功能，让项目自动继承工作区的仓库配置。

## 场景

假设你有一个工作区，包含多个项目。你希望所有项目共享相同的仓库配置，而不需要在每个项目中重复配置。

## 目录结构

```
workspace/
  ├── .qclrc              # 工作区配置文件
  ├── project1/
  │   └── .qclocal        # inherit: true
  ├── project2/
  │   └── .qclocal        # inherit: true
  └── project3/
      └── .qclocal        # 自己的 repos 配置
```

## 步骤 1：创建工作区配置

在工作区根目录创建 `.qclrc`：

```yaml
repos:
  - local:
      type: local
      url: D:/Projects/cocli/.test
  
  - github:
      type: git
      repo: https://github.com/username/templates.git
      token: ghp_xxxxxxxxxxxxx
```

## 步骤 2：创建项目并配置继承

### Project 1

创建项目：

```bash
cd workspace
qcl app create --template=vue3 project1
```

编辑 `project1/.qclocal`：

```yaml
project: project1
template: vue3
addons:
  target_dir: ./addons
  include:
    - vue3-funs
inherit: true  # 继承父级配置
```

### Project 2

创建项目：

```bash
qcl app create --template=react project2
```

编辑 `project2/.qclocal`：

```yaml
project: project2
template: react
addons:
  target_dir: ./addons
  include:
    - add
inherit: true  # 继承父级配置
```

### Project 3（不使用继承）

创建项目：

```bash
qcl app create --template=vue3 project3
```

编辑 `project3/.qclocal`：

```yaml
project: project3
template: vue3
addons:
  target_dir: ./addons
  include: []
repos:  # 使用自己的配置
  - local:
      type: local
      url: /path/to/other/repo
inherit: false
```

## 配置优先级

### Project 1 和 Project 2

由于设置了 `inherit: true` 且 `repos` 为空：

1. 首先查找项目自己的 `repos`（为空）
2. 向上查找父级目录的 `.qclrc`
3. 找到 `workspace/.qclrc`，使用其 `repos` 配置

### Project 3

由于明确配置了 `repos`：

1. 使用项目自己的 `repos` 配置
2. 不会继承父级配置

## 验证配置

在项目目录下运行命令，验证配置是否正确：

```bash
# 在 project1 目录下
cd project1
qcl addons list  # 使用继承的 repos 配置

# 在 project3 目录下
cd ../project3
qcl addons list  # 使用自己的 repos 配置
```

## 优势

使用配置继承的好处：

1. **减少重复配置** - 不需要在每个项目中重复配置仓库
2. **统一管理** - 在工作区级别统一管理仓库配置
3. **灵活覆盖** - 项目可以随时覆盖继承的配置
4. **团队协作** - 团队成员共享相同的仓库配置

## 最佳实践

1. **工作区配置** - 在工作区根目录配置 `.qclrc`
2. **项目继承** - 项目使用 `inherit: true` 继承配置
3. **特殊覆盖** - 特殊项目可以覆盖继承的配置
4. **文档说明** - 在 README 中说明配置继承关系

## 相关文档

- [`.qclocal` 配置](/config/qclocal)
- [工作区管理](/guide/workspace)
- [配置优先级](/config/)

