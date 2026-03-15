# 快速开始

本指南将帮助你快速上手 CoCli，从安装到创建第一个项目。

## 安装

### 使用 npm

```bash
npm install -g cocli
```

### 使用 pnpm（推荐）

```bash
pnpm add -g cocli
```

### 使用 yarn

```bash
yarn global add cocli
```

### 验证安装

安装完成后，运行以下命令验证安装是否成功：

```bash
cocli --version
```

如果看到版本号输出，说明安装成功。

## 初始化配置（可选）

CoCli 支持零配置启动，但如果你需要自定义配置，可以运行：

```bash
cocli init
```

这将创建一个 `.qclrc` 配置文件，你可以配置：

- 全局用户名和密码
- 仓库源（Git、FTP、本地）
- 工作区设置

## 创建第一个项目

### 方式一：零配置启动（推荐）

无需任何配置，直接创建项目：

```bash
cocli create my-app
```

这将使用默认的 Vue3 模板创建项目。

### 方式二：指定模板

```bash
cocli create my-app --template=vue3
```

### 方式三：添加插件

```bash
cocli create my-app --template=vue3 --addons=my-plugin
```

## 添加组件

创建项目后，你可以按需添加组件：

```bash
cd my-app

# 添加单个组件
cocli add button

# 添加多个组件
cocli add button table form

# 指定版本
cocli add button --version=1.0.0
```

## 列出可用项

查看所有可用的模板和组件：

```bash
# 列出所有项
cocli list

# 按类型列出
cocli list component
cocli list module
```

## 下一步

- 📖 [了解命令参考](/guide/commands)
- 🧩 [学习模板系统](/guide/templates)
- 🔌 [探索插件系统](/guide/addons)
- 🏢 [管理工作区](/guide/workspace)

