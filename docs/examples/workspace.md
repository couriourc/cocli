# 工作区管理示例

本示例演示如何使用工作区管理多个相关项目。

## 场景

假设你需要开发一个前端项目组，包含：
- 管理后台（Vue 3）
- 用户门户（Vue 3）
- 数据看板（React）

## 步骤 1：创建工作区

```bash
# 创建 frontend 目录
mkdir frontend
cd frontend

# 创建工作区
qcl workspace create frontend-workspace .
```

## 步骤 2：配置工作区

在工作区根目录创建 `.qclrc`：

```yaml
repos:
  - local:
      type: local
      url: D:/Projects/qcli/.test
```

## 步骤 3：创建项目

```bash
# 创建管理后台
qcl app create --template=vue3 admin-panel

# 创建用户门户
qcl app create --template=vue3 user-portal

# 创建数据看板
qcl app create --template=react dashboard
```

## 步骤 4：配置项目继承

编辑每个项目的 `.qclocal`，添加 `inherit: true`：

**admin-panel/.qclocal:**

```yaml
project: admin-panel
template: vue3
addons:
  target_dir: ./addons
  include:
    - vue3-funs
inherit: true
```

**user-portal/.qclocal:**

```yaml
project: user-portal
template: vue3
addons:
  target_dir: ./addons
  include:
    - vue3-funs
inherit: true
```

**dashboard/.qclocal:**

```yaml
project: dashboard
template: react
addons:
  target_dir: ./addons
  include:
    - add
inherit: true
```

## 步骤 5：切换工作区

```bash
qcl workspace use frontend-workspace
```

## 步骤 6：查看所有项目

```bash
qcl app list
```

输出：

```
应用列表:
  - admin-panel (模板: vue3, 目录: admin-panel)
  - dashboard (模板: react, 目录: dashboard)
  - user-portal (模板: vue3, 目录: user-portal)

共找到 3 个应用
```

## 步骤 7：查看当前工作区

```bash
qcl workspace current
```

输出：

```
当前工作区: frontend-workspace
路径: D:/Projects/qcli/frontend
```

## 最终结构

```
frontend/
  ├── .qclrc                    # 工作区配置
  ├── admin-panel/
  │   ├── .qclocal              # inherit: true
  │   └── addons/
  ├── user-portal/
  │   ├── .qclocal              # inherit: true
  │   └── addons/
  └── dashboard/
      ├── .qclocal              # inherit: true
      └── addons/
```

## 优势

使用工作区管理的好处：

1. **统一配置** - 所有项目共享工作区的仓库配置
2. **集中管理** - 使用 `qcl app list` 查看所有项目
3. **配置继承** - 项目自动继承工作区配置
4. **团队协作** - 团队成员使用相同的工作区配置

## 相关命令

```bash
# 创建工作区
qcl workspace create <名称> <路径>

# 切换工作区
qcl workspace use <名称>

# 查看所有工作区
qcl workspace list

# 查看当前工作区
qcl workspace current

# 删除工作区
qcl workspace delete <名称>
```

