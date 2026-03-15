# 团队协作示例

本示例展示如何在团队中使用 CoCli 进行协作。

## 场景设置

假设你是一个前端团队的负责人，需要：

1. 统一团队的项目模板
2. 共享组件库和工具函数
3. 管理多个项目
4. 保持项目一致性

## 步骤 1：创建工作区

```bash
cocli workspace init team-workspace
```

**输出：**

```
✅ 已创建目录: ./team-workspace
✅ 已创建配置文件: ./team-workspace/.qclrc
工作区 'team-workspace' 创建成功！
```

## 步骤 2：配置共享仓库

编辑 `team-workspace/.qclrc`：

```yaml
workspace:
  name: team-workspace
  description: 团队工作区

repos:
  # 团队共享模板仓库
  - github:
      type: git
      repo: https://github.com/team/shared-templates
      token: ${GITHUB_TOKEN}
  
  # 团队组件库
  - github:
      type: git
      repo: https://github.com/team/component-library
  
  # 本地共享模板
  - local:
      type: local
      url: ./shared-templates
```

## 步骤 3：切换到工作区

```bash
cd team-workspace
```

## 步骤 4：创建项目

### 项目 1：管理后台

```bash
cocli create admin-panel --template=vue3-admin
```

### 项目 2：用户端

```bash
cocli create user-app --template=vue3-user
```

### 项目 3：移动端

```bash
cocli create mobile-app --template=vue3-mobile
```

## 步骤 5：添加共享组件

在各个项目中添加团队共享组件：

```bash
# 在 admin-panel 项目中
cd admin-panel
cocli add team-button team-table team-form

# 在 user-app 项目中
cd ../user-app
cocli add team-button team-card team-list
```

## 工作区结构

```
team-workspace/
├── .qclrc                    # 工作区配置
├── admin-panel/              # 管理后台项目
│   ├── .qclocal
│   ├── cocli.json
│   └── src/
├── user-app/                 # 用户端项目
│   ├── .qclocal
│   ├── cocli.json
│   └── src/
└── mobile-app/               # 移动端项目
    ├── .qclocal
    ├── cocli.json
    └── src/
```

## 项目配置示例

### admin-panel/.qclocal

```yaml
project: admin-panel
template: vue3-admin
inherit: true  # 继承工作区配置

addons:
  target_dir: ./addons
  include:
    - team-button
    - team-table
    - team-form
```

### user-app/.qclocal

```yaml
project: user-app
template: vue3-user
inherit: true

addons:
  target_dir: ./addons
  include:
    - team-button
    - team-card
    - team-list
```

## 共享模板开发

### 创建团队模板

```bash
cd shared-templates
cocli template create vue3-admin
```

### 配置模板

**shared-templates/meta.yaml：**

```yaml
templates:
  vue3-admin:
    root: templates/vue3-admin/**
    description: Vue3 管理后台模板
    version: 1.0.0

  vue3-user:
    root: templates/vue3-user/**
    description: Vue3 用户端模板
    version: 1.0.0

atomic:
  team-button:
    type: component
    description: 团队按钮组件
    root: atomic/team-button/**
    target: src/components/team
    version: 1.0.0

  team-table:
    type: component
    description: 团队表格组件
    root: atomic/team-table/**
    target: src/components/team
    dependencies:
      - team-button
    version: 1.0.0
```

## 版本管理

### 锁定版本

在各个项目的 `.qclocal` 中锁定版本：

```yaml
project: admin-panel
template: vue3-admin
version: 1.0.0  # 锁定模板版本
```

### 更新策略

1. **开发环境**：使用 `latest` 版本
2. **测试环境**：锁定小版本（如 `1.0.x`）
3. **生产环境**：锁定完整版本（如 `1.0.0`）

## 团队协作流程

### 1. 新成员加入

```bash
# 1. 克隆工作区配置
git clone https://github.com/team/workspace-config.git team-workspace

# 2. 安装 CoCli
npm install -g cocli

# 3. 配置认证
export COCLI_TOKEN=${GITHUB_TOKEN}

# 4. 创建项目
cd team-workspace
cocli create my-project --template=vue3-admin
```

### 2. 添加新组件

```bash
# 1. 在共享仓库中添加组件
cd shared-templates
cocli addons create new-component

# 2. 更新 meta.yaml

# 3. 推送到仓库
git add .
git commit -m "Add new-component"
git push

# 4. 在各个项目中使用
cd team-workspace/admin-panel
cocli addons add new-component
```

### 3. 更新组件

```bash
# 1. 更新共享仓库中的组件

# 2. 更新版本号

# 3. 在各个项目中更新
cocli addons sync
```

## 最佳实践

1. **统一配置**：在工作区级别统一配置模板源
2. **版本控制**：将工作区配置纳入版本控制
3. **文档完善**：为模板和组件添加文档
4. **定期同步**：定期同步共享组件和模板
5. **代码审查**：对模板和组件变更进行代码审查

## 常见问题

### Q: 如何确保团队成员使用相同的模板？

A: 在工作区配置中统一配置模板源，团队成员继承工作区配置。

### Q: 如何管理模板版本？

A: 使用语义化版本号，并在项目中锁定版本。

### Q: 如何共享自定义组件？

A: 在共享仓库中创建原子化模板，团队成员按需添加。

