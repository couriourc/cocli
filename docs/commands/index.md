# 命令参考

CoCli 提供了丰富的命令行工具来管理项目、模板、插件和工作区。

## 命令概览

### 应用管理

- [`cocli app create`](./app#create) - 创建新项目
- [`cocli app list`](./app#list) - 列出应用

### 模板管理

- [`cocli template list`](./template#list) - 列出可用模板
- [`cocli template create`](./template#create) - 创建新模板

### 插件管理

- [`cocli addons list`](./addons#list) - 列出可用插件
- [`cocli addons detail`](./addons#detail) - 查看插件详情
- [`cocli addons create`](./addons#create) - 创建新插件
- [`cocli addons add`](./addons#add) - 添加插件
- [`cocli addons sync`](./addons#sync) - 同步插件

### 工作区管理

- [`cocli workspace create`](./workspace#create) - 创建工作区
- [`cocli workspace list`](./workspace#list) - 列出工作区
- [`cocli workspace use`](./workspace#use) - 切换工作区
- [`cocli workspace current`](./workspace#current) - 查看当前工作区
- [`cocli workspace delete`](./workspace#delete) - 删除工作区

### 配置管理

- [`cocli config get`](./config#get) - 获取配置值
- [`cocli config set`](./config#set) - 设置配置值
- [`cocli config list`](./config#list) - 列出配置

### 初始化

- [`cocli init`](./init) - 初始化配置文件

## 获取帮助

查看命令帮助：

```bash
# 查看所有命令
cocli --help

# 查看特定命令帮助
cocli app --help
cocli addons --help
```

## 智能提示

CoCli 提供了智能错误提示和建议：

- 当输入错误命令时，会自动建议相似命令
- 当找不到模板或插件时，会列出所有可用选项
- 提供友好的错误信息和下一步建议

## 快速参考

```bash
# 初始化配置
cocli init

# 创建项目
cocli app create --template=vue3 my-app

# 查看应用
cocli app list

# 创建模板和插件
cocli template create vue3
cocli addons create my-plugin

# 添加插件
cocli addons add vue3-funs .

# 同步插件
cocli addons sync .

# 管理工作区
cocli workspace create my-workspace .
cocli workspace use my-workspace
```

