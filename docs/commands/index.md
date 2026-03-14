# 命令参考

QCli 提供了丰富的命令行工具来管理项目、模板、插件和工作区。

## 命令概览

### 应用管理

- [`qcl app create`](./app#create) - 创建新项目
- [`qcl app list`](./app#list) - 列出应用

### 模板管理

- [`qcl template list`](./template) - 列出可用模板

### 插件管理

- [`qcl addons list`](./addons#list) - 列出可用插件
- [`qcl addons detail`](./addons#detail) - 查看插件详情
- [`qcl addons add`](./addons#add) - 添加插件
- [`qcl addons sync`](./addons#sync) - 同步插件

### 工作区管理

- [`qcl workspace create`](./workspace#create) - 创建工作区
- [`qcl workspace list`](./workspace#list) - 列出工作区
- [`qcl workspace use`](./workspace#use) - 切换工作区
- [`qcl workspace current`](./workspace#current) - 查看当前工作区
- [`qcl workspace delete`](./workspace#delete) - 删除工作区

### 配置管理

- [`qcl config get`](./config#get) - 获取配置值
- [`qcl config set`](./config#set) - 设置配置值
- [`qcl config list`](./config#list) - 列出配置

### 初始化

- [`qcl init`](./init) - 初始化配置文件

## 获取帮助

查看命令帮助：

```bash
# 查看所有命令
qcl --help

# 查看特定命令帮助
qcl app --help
qcl addons --help
```

## 智能提示

QCli 提供了智能错误提示和建议：

- 当输入错误命令时，会自动建议相似命令
- 当找不到模板或插件时，会列出所有可用选项
- 提供友好的错误信息和下一步建议

## 快速参考

```bash
# 初始化配置
qcl init

# 创建项目
qcl app create --template=vue3 my-app

# 查看应用
qcl app list

# 添加插件
qcl addons add vue3-funs .

# 同步插件
qcl addons sync .

# 管理工作区
qcl workspace create my-workspace .
qcl workspace use my-workspace
```

