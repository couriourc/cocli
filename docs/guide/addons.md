# 插件系统

CoCli 的插件系统允许你扩展项目功能，支持添加、同步、移除插件。

## 什么是插件

插件是可重用的功能模块，可以添加到项目中以扩展功能。插件可以是：

- UI 组件库
- 工具函数库
- 配置文件
- 构建脚本
- 其他功能模块

## 添加插件

### 创建项目时添加

在创建项目时添加插件：

```bash
cocli create my-app --template=vue3 --addons=my-plugin
```

### 添加到现有项目

在现有项目中添加插件：

```bash
# 添加单个插件
cocli addons add my-plugin

# 添加多个插件
cocli addons add plugin1,plugin2,plugin3

# 指定项目目录
cocli addons add my-plugin ./my-project
```

**输出：**

```
正在下载 addon my-plugin 到 ./addons/my-plugin...
✅ Addons 添加成功！
💡 提示: 使用 `cocli addons sync` 同步所有配置的插件
```

## 列出插件

### 列出所有可用插件

```bash
cocli addons list
```

**输出：**

```
可用的 addons:
  - my-plugin
  - another-plugin
  - utility-plugin
```

### 显示详细信息

```bash
cocli addons list --verbose
```

**输出：**

```
可用的 addons (详细信息):

my-plugin
  来源: https://github.com/user/repo
  路径配置:
    - addons/my-plugin/**
  详细信息:
    # My Plugin
    
    这是一个功能强大的插件...
```

### 查看插件详情

```bash
cocli addons detail my-plugin
```

## 同步插件

同步项目中配置的所有插件：

```bash
cocli addons sync
```

这会根据 `.qclocal` 文件中的配置同步所有插件。

## 移除插件

插件文件需要手动删除，但可以从配置中移除：

编辑 `.qclocal` 文件，从 `addons.include` 中移除插件名称。

## 插件配置

### 统一管理（推荐）

在 `meta.yaml` 中统一配置：

```yaml
addons:
  root: ./addons/
  target_dir: ./addons/
```

然后在 `addons/` 目录下创建插件目录。

### 单独配置

为每个插件单独配置：

```yaml
addons:
  my-plugin:
    root: ./addons/my-plugin/**
    description: 我的插件
```

## 插件结构

### 基本结构

```
addons/
└── my-plugin/
    ├── index.js
    ├── README.md
    └── package.json
```

### 复杂结构

```
addons/
└── my-plugin/
    ├── src/
    │   ├── components/
    │   ├── utils/
    │   └── index.ts
    ├── styles/
    │   └── main.css
    ├── README.md
    └── package.json
```

## 创建插件

### 使用命令创建

```bash
cocli addons create my-plugin
```

这会创建插件目录结构和基本文件。

### 手动创建

1. 在仓库的 `addons/` 目录下创建插件目录
2. 添加插件文件
3. 在 `meta.yaml` 中配置插件

**示例：**

```yaml
addons:
  my-plugin:
    root: addons/my-plugin/**
    description: 我的自定义插件
```

## 插件开发

### 基本要求

1. **README.md**：插件说明文档
2. **入口文件**：插件的入口文件（index.js/index.ts）
3. **配置**：在 `meta.yaml` 中配置插件

### 示例插件

**addons/my-plugin/index.js：**

```javascript
export default {
  name: 'my-plugin',
  version: '1.0.0',
  install(app) {
    // 插件安装逻辑
    console.log('My Plugin installed!');
  },
};
```

**addons/my-plugin/README.md：**

```markdown
# My Plugin

这是一个功能强大的插件。

## 使用方法

```javascript
import MyPlugin from './addons/my-plugin';
```
```

## 插件依赖

插件可以依赖其他插件，在配置中声明：

```yaml
addons:
  my-plugin:
    root: addons/my-plugin/**
    dependencies:
      - base-plugin
```

## 最佳实践

1. **命名规范**：使用 kebab-case 命名插件
2. **文档完善**：为插件添加清晰的 README
3. **版本管理**：使用语义化版本号
4. **依赖管理**：明确声明插件依赖
5. **测试覆盖**：为插件编写测试用例

## 常见问题

### Q: 插件添加失败怎么办？

A: 检查以下几点：
1. 插件名称是否正确
2. 仓库配置是否正确
3. 网络连接是否正常

### Q: 如何更新插件？

A: 删除插件目录，然后重新添加：

```bash
rm -rf addons/my-plugin
cocli addons add my-plugin
```

### Q: 插件可以嵌套吗？

A: 可以，但建议保持扁平结构，避免过度嵌套。

