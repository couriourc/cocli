# 插件 (Addons)

插件是可重用的代码模块，可以添加到项目中以扩展功能。QCli 提供了强大的插件管理系统。

## 查看可用插件

### 简单列表

```bash
qcl addons list
```

输出示例：

```
可用的 addons:
  - add
  - minus
  - vue2-funs
  - vue3-funs
```

### 详细信息

使用 `-v` 或 `--verbose` 查看详细信息：

```bash
qcl addons list -v
```

输出包括：
- 插件来源
- 路径配置
- README.md 内容

## 查看插件详情

使用 `qcl addons detail` 查看特定插件的完整信息：

```bash
qcl addons detail vue3-funs
```

## 添加插件

使用 `qcl addons add` 添加插件到项目：

```bash
# 添加到当前目录
qcl addons add vue3-funs .

# 添加到指定项目
qcl addons add vue3-funs my-project

# 添加多个插件
qcl addons add vue3-funs,add,minus .
```

### 插件安装位置

插件会被安装到 `{项目目录}/{addons.target_dir}/{插件名}/` 目录下。

例如，如果 `addons.target_dir` 为 `./addons`，插件会安装在：

```
my-app/
  └── addons/
      ├── vue3-funs/
      ├── add/
      └── minus/
```

## 同步插件

使用 `qcl addons sync` 根据 `.qclocal` 配置同步插件：

```bash
qcl addons sync .
```

这会根据 `.qclocal` 文件中的 `addons.include` 列表同步所有配置的插件。

## 插件配置

在 `.qclocal` 文件中配置插件：

```yaml
addons:
  # 插件安装目录
  target_dir: ./addons
  
  # 需要同步的插件列表
  include:
    - vue3-funs
    - add
    - minus
```

## 插件定义

插件在仓库的 `meta.yaml` 文件中定义：

```yaml
addons:
  vue3-funs:
    root: ./addons/vue3-funs/**
  
  add:
    root: ./addons/add/**
```

## 创建自定义插件

### 1. 准备插件文件

创建插件目录结构：

```
my-addons/
  ├── meta.yaml
  └── addons/
      └── my-plugin/
          ├── README.md
          ├── src/
          └── ...
```

### 2. 添加 README.md

在插件目录中添加 `README.md` 文件，描述插件的功能和使用方法：

```markdown
# My Plugin

提供 XXX 功能。

## 使用方法

\`\`\`javascript
import { feature } from './my-plugin'
\`\`\`
```

### 3. 定义 meta.yaml

```yaml
addons:
  my-plugin:
    root: ./addons/my-plugin/**
```

### 4. 配置仓库

在 `.qclrc` 中添加仓库配置。

### 5. 使用插件

```bash
qcl addons add my-plugin .
```

## 插件开发最佳实践

1. **添加 README.md** - 帮助用户了解插件功能
2. **使用清晰的目录结构** - 便于维护
3. **提供示例代码** - 在 README 中包含使用示例
4. **版本管理** - 使用 Git 管理插件版本

## 相关命令

- `qcl addons list` - 列出可用插件
- `qcl addons detail` - 查看插件详情
- `qcl addons add` - 添加插件
- `qcl addons sync` - 同步插件

## 常见问题

### Q: 插件安装在哪里？

A: 插件会安装到 `{项目目录}/{addons.target_dir}/{插件名}/` 目录下。

### Q: 如何更新插件？

A: 使用 `qcl addons sync` 可以更新所有配置的插件。

### Q: 如何移除插件？

A: 手动删除插件目录，并从 `.qclocal` 的 `addons.include` 中移除插件名称。

