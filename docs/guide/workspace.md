# 工作区管理

工作区是 CoCli 中用于组织和管理多个项目的概念。每个工作区可以有自己的配置和模板源。

## 什么是工作区

工作区是一个包含 `.qclrc` 配置文件的目录。工作区可以：

- 隔离不同项目的配置
- 统一管理多个项目
- 共享模板和插件源

## 创建工作区

### 使用命令创建

```bash
cocli workspace init my-workspace
```

**输出：**

```
✅ 已创建目录: ./my-workspace
✅ 已创建配置文件: ./my-workspace/.qclrc
工作区 'my-workspace' 创建成功！
工作区路径: ./my-workspace
```

### 在指定路径创建

```bash
cocli workspace init my-workspace ./workspaces
```

### 在当前目录创建

```bash
cocli workspace init my-workspace .
```

## 列出工作区

查看所有工作区：

```bash
cocli workspace list
```

**输出：**

```
工作区列表:
  - my-workspace (当前)
    路径: ./my-workspace
    描述: 我的工作区
  - another-workspace
    路径: ./another-workspace

共找到 2 个工作区
```

## 查看当前工作区

```bash
cocli workspace current
```

**输出：**

```
当前工作区: my-workspace
路径: ./my-workspace
```

## 切换工作区

工作区通过当前目录自动识别，切换到工作区目录即可：

```bash
cd my-workspace
```

## 工作区配置

工作区配置文件 `.qclrc`：

```yaml
workspace:
  name: my-workspace
  description: 我的工作区

repos:
  - local:
      type: local
      url: ./templates
  - github:
      type: git
      repo: https://github.com/user/repo
```

## 工作区结构

```
my-workspace/
├── .qclrc              # 工作区配置
├── project1/           # 项目1
│   └── .qclocal
├── project2/           # 项目2
│   └── .qclocal
└── project3/           # 项目3
    └── .qclocal
```

## 工作区 vs 项目

### 工作区

- 包含 `.qclrc` 文件
- 用于管理多个项目
- 共享配置和模板源

### 项目

- 包含 `.qclocal` 文件
- 独立的项目目录
- 继承工作区配置

## 配置继承

项目可以继承工作区的配置：

**工作区配置（.qclrc）：**

```yaml
workspace:
  name: my-workspace

repos:
  - github:
      type: git
      repo: https://github.com/user/repo
```

**项目配置（.qclocal）：**

```yaml
project: my-project
template: vue3
inherit: true  # 继承工作区配置
```

## 删除工作区

删除工作区配置：

```bash
cocli workspace delete my-workspace
```

**注意**：这只会删除 `.qclrc` 文件，不会删除工作区目录和项目。

## 最佳实践

1. **按团队/项目组织**：为不同团队或项目创建独立工作区
2. **配置统一**：在工作区级别统一配置模板源
3. **项目隔离**：每个项目使用独立的 `.qclocal` 配置
4. **版本控制**：将工作区配置纳入版本控制

## 常见问题

### Q: 如何在工作区中创建项目？

A: 切换到工作区目录，然后创建项目：

```bash
cd my-workspace
cocli create my-project
```

### Q: 工作区和项目配置有什么区别？

A: 工作区配置（`.qclrc`）用于管理多个项目，项目配置（`.qclocal`）用于单个项目。

### Q: 可以嵌套工作区吗？

A: 不建议嵌套工作区，保持扁平结构更清晰。

