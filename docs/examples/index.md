# 示例

这里提供了一些实用的示例，帮助你快速上手 QCli。

## 快速开始示例

- [创建 Vue 项目](./vue-project) - 使用 Vue 3 模板创建项目
- [使用工作区](./workspace) - 管理工作区的完整示例
- [添加插件](./addons) - 添加和管理插件
- [配置继承](./inherit) - 使用配置继承功能

## 常见场景

### 场景 1：创建新项目

```bash
# 1. 初始化配置
qcl init

# 2. 查看可用模板
qcl template list

# 3. 创建项目
qcl app create --template=vue3 my-app

# 4. 进入项目
cd my-app

# 5. 添加插件
qcl addons add vue3-funs .
```

### 场景 2：管理工作区

```bash
# 1. 创建工作区
qcl workspace create frontend-workspace ./frontend

# 2. 切换到工作区
qcl workspace use frontend-workspace

# 3. 创建多个项目
qcl app create --template=vue3 admin-panel
qcl app create --template=react dashboard

# 4. 查看所有项目
qcl app list
```

### 场景 3：配置继承

在工作区根目录配置 `.qclrc`，项目使用 `inherit: true` 继承配置。

查看 [配置继承示例](./inherit) 了解详情。

