# 高级用法

本章介绍 CoCli 的高级功能和使用技巧。

## 自定义模板开发

### 创建模板结构

```bash
cocli template create my-template
```

### 模板元数据

在 `meta.yaml` 中配置模板：

```yaml
templates:
  my-template:
    root: templates/my-template/**
    description: 我的自定义模板
    version: 1.0.0
    hygen: true
    templatesDir: _templates
```

### Hygen 集成

创建 Hygen 模板：

```
_templates/
└── component/
    └── new/
        ├── prompt.js
        ├── component.vue.ejs.t
        └── index.ts.ejs.t
```

**prompt.js：**

```javascript
module.exports = {
  prompt: ({ inquirer }) => {
    const questions = [
      {
        type: 'input',
        name: 'name',
        message: '组件名称：',
      },
    ];
    return inquirer.prompt(questions);
  },
};
```

## 原子化模板开发

### 创建原子化模板

```yaml
atomic:
  my-component:
    type: component
    description: 我的组件
    version: 1.0.0
    root: atomic/my-component/**
    target: src/components/ui
    dependencies:
      - base-component
```

### 依赖管理

原子化模板支持依赖关系：

```yaml
atomic:
  table:
    type: component
    dependencies:
      - button
      - input
```

添加 `table` 时会自动安装 `button` 和 `input`。

## 插件开发

### 插件结构

```
addons/
└── my-plugin/
    ├── index.js
    ├── package.json
    └── README.md
```

### 插件入口

**index.js：**

```javascript
export default {
  name: 'my-plugin',
  version: '1.0.0',
  install(app, options) {
    // 插件安装逻辑
  },
  uninstall() {
    // 插件卸载逻辑
  },
};
```

### 插件配置

在 `meta.yaml` 中配置：

```yaml
addons:
  my-plugin:
    root: addons/my-plugin/**
    description: 我的插件
    version: 1.0.0
    dependencies:
      - base-plugin
```

## 环境变量配置

### 支持的变量

- `COCLI_REPO`：仓库配置（JSON 格式）
- `COCLI_USERNAME`：全局用户名
- `COCLI_TOKEN`：全局 Token
- `COCLI_NO_CONFIG`：不创建配置文件（无侵入模式）

### 使用示例

```bash
export COCLI_REPO='[{"github":{"type":"git","repo":"https://github.com/user/repo"}}]'
export COCLI_TOKEN=ghp_xxxxxxxxxxxx
cocli create my-app
```

## 配置优先级

配置加载优先级（从高到低）：

1. 环境变量
2. 项目级配置（`.qclocal`）
3. 工作区配置（`.qclrc`）
4. 全局配置（`~/.qclrc`）
5. 默认配置

## CI/CD 集成

### GitHub Actions

```yaml
name: Create Project

on:
  workflow_dispatch:

jobs:
  create:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g cocli
      - run: cocli create my-project --template=vue3
        env:
          COCLI_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### GitLab CI

```yaml
create-project:
  script:
    - npm install -g cocli
    - cocli create my-project --template=vue3
  variables:
    COCLI_TOKEN: $CI_JOB_TOKEN
```

## 离线模式

CoCli 支持离线模式，首次使用后会缓存模板：

```bash
# 首次使用（在线）
cocli add button

# 后续使用（离线）
cocli add button  # 自动使用缓存
```

缓存位置：`~/.cocli/cache`

## 版本管理

### 锁定版本

```bash
cocli add button --version=1.0.0
```

### 版本配置

在 `meta.yaml` 中配置版本：

```yaml
atomic:
  button:
    version: 1.0.0
    root: atomic/button/v1.0.0/**
```

## 性能优化

### 使用本地仓库

优先使用本地仓库，避免网络请求：

```yaml
repos:
  - local:
      type: local
      url: ./templates  # 本地优先
  - github:
      type: git
      repo: https://github.com/user/repo
```

### 缓存管理

清理过期缓存：

```bash
# 手动清理（需要实现）
rm -rf ~/.cocli/cache
```

## 调试技巧

### 启用调试模式

```bash
DEBUG=1 cocli create my-app
```

### 查看配置

```bash
cocli config list
cocli config get repos
```

### 查看日志

检查控制台输出和错误信息。

## 最佳实践

1. **模板版本化**：生产环境锁定版本
2. **配置管理**：使用环境变量存储敏感信息
3. **仓库组织**：按团队/项目组织仓库
4. **文档完善**：为模板和插件添加文档
5. **测试覆盖**：为自定义模板编写测试

## 常见问题

### Q: 如何自定义模板路径？

A: 在 `meta.yaml` 中使用 `root` 配置：

```yaml
templates:
  my-template:
    root: custom/path/to/template/**
```

### Q: 如何实现模板变量替换？

A: 使用 Hygen 模板引擎（EJS）：

```ejs
<%= name %> Component
```

### Q: 如何共享模板给团队？

A: 使用 Git 仓库或本地共享目录。

