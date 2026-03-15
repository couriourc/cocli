# 基础示例

本章提供 CoCli 的基础使用示例。

## 快速开始

### 1. 安装 CoCli

```bash
npm install -g cocli
```

### 2. 创建项目

```bash
cocli create my-app
```

**输出：**

```
💡 使用默认模板: vue3（零配置启动）
正在下载模板 vue3...
✅ 项目 my-app 创建成功！
💡 提示: 使用 `cd my-app` 进入项目目录
```

### 3. 添加组件

```bash
cd my-app
cocli add button
```

**输出：**

```
✨ 添加 button...
✅ button 添加成功！
```

## 完整示例

### 创建 Vue3 项目

```bash
# 1. 创建项目
cocli create vue3-app --template=vue3

# 2. 进入项目目录
cd vue3-app

# 3. 添加组件
cocli add button
cocli add table

# 4. 查看已添加的项
cat cocli.json
```

**cocli.json：**

```json
{
  "items": ["button", "table"]
}
```

### 使用指定版本

```bash
cocli add button --version=1.0.0
```

### 强制覆盖

```bash
cocli add button --force
```

## 列出可用项

```bash
# 列出所有项
cocli list

# 按类型列出
cocli list component
cocli list module
```

**输出：**

```
可用的模板项:

component:
  - button - 按钮组件
  - table - 表格组件

module:
  - api-module - API 模块
```

## 移除项

```bash
cocli remove button
```

**输出：**

```
🗑️  移除 button 的文件...
✅ button 已移除！
```

## 配置管理

### 查看配置

```bash
cocli config list
```

**输出：**

```
配置信息:
当前工作区: my-workspace

全局配置:
  username: my-user
  repos: 2 个仓库
```

### 获取配置值

```bash
cocli config get username
cocli config get repos
```

### 设置配置值

```bash
cocli config set username my-user
```

### 编辑配置

```bash
cocli config edit
```

## 工作区管理

### 创建工作区

```bash
cocli workspace init my-workspace
```

### 列出工作区

```bash
cocli workspace list
```

### 查看当前工作区

```bash
cocli workspace current
```

## 常见场景

### 场景 1：快速创建项目

```bash
# 零配置启动
cocli create my-app
cd my-app
cocli add button table form
```

### 场景 2：使用自定义模板

```bash
# 1. 配置仓库
cocli init

# 2. 创建项目
cocli create my-app --template=custom-template
```

### 场景 3：团队协作

```bash
# 1. 创建工作区
cocli workspace init team-workspace

# 2. 配置共享仓库
# 编辑 .qclrc

# 3. 创建项目
cocli create project1
cocli create project2
```

## 注意事项

1. **零配置启动**：无需先运行 `cocli init`，直接创建项目
2. **版本锁定**：生产环境建议指定版本
3. **依赖管理**：添加项时会自动安装依赖
4. **配置优先级**：环境变量 > 项目配置 > 工作区配置 > 全局配置

