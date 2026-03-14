# 创建 Vue 项目示例

本示例演示如何使用 QCli 创建一个 Vue 3 项目并添加插件。

## 步骤 1：初始化配置

首先，初始化 QCli 配置：

```bash
qcl init
```

交互式配置：

```
🔧 初始化 QCli 配置文件
按 Enter 跳过可选配置项

全局用户名（可选，按 Enter 跳过）: 
全局密码（可选，按 Enter 跳过）: 
全局 Token（可选，按 Enter 跳过）: 

📦 配置仓库
添加仓库配置（输入 'done' 完成）:

仓库类型 (local/github/gitlab/ftp，或 'done' 完成): local
本地路径: D:/Projects/qcli/.test
✓ 已添加本地仓库

仓库类型 (local/github/gitlab/ftp，或 'done' 完成): done

✅ 配置文件已创建: D:\Projects\qcli\.qclrc
```

## 步骤 2：查看可用模板

```bash
qcl template list
```

输出：

```
可用的模板:
  - vue3
```

## 步骤 3：创建项目

```bash
qcl app create --template=vue3 my-vue-app
```

输出：

```
正在下载模板 vue3...
✅ 项目 my-vue-app 创建成功！
💡 提示: 使用 `cd my-vue-app` 进入项目目录
```

## 步骤 4：查看可用插件

```bash
cd my-vue-app
qcl addons list
```

输出：

```
可用的 addons:
  - add
  - minus
  - vue2-funs
  - vue3-funs
```

## 步骤 5：查看插件详情

```bash
qcl addons detail vue3-funs
```

输出：

```
vue3-funs
  来源: D:/Projects/qcli/.test
  路径配置:
    - ./addons/vue3-funs/**
  详细信息:
    # Vue3 Funs Addon
    
    提供 Vue 3 相关的组合式函数。
    
    ## 使用方法
    
    ```javascript
    import { useCounter } from './composables/useCounter'
    
    export default {
      setup() {
        const { count, increment, decrement, reset } = useCounter(0)
        return {
          count,
          increment,
          decrement,
          reset
        }
      }
    }
    ```
```

## 步骤 6：添加插件

```bash
qcl addons add vue3-funs .
```

输出：

```
正在下载 addon vue3-funs 到 D:\Projects\qcli\my-vue-app\addons\vue3-funs...
✅ Addons 添加成功！
💡 提示: 使用 `qcl addons sync` 同步所有配置的插件
```

## 步骤 7：查看项目结构

```bash
tree my-vue-app
```

输出：

```
my-vue-app/
  ├── .qclocal
  ├── addons/
  │   └── vue3-funs/
  │       ├── README.md
  │       └── composables/
  ├── src/
  ├── package.json
  └── ...
```

## 步骤 8：同步插件

编辑 `.qclocal` 文件，添加插件到 `include` 列表：

```yaml
project: my-vue-app
template: vue3
addons:
  target_dir: ./addons
  include:
    - vue3-funs
```

然后同步：

```bash
qcl addons sync .
```

## 完成！

现在你已经成功创建了一个 Vue 3 项目并添加了插件。可以开始开发了！

## 下一步

- 📖 了解 [工作区管理](/guide/workspace)
- 🔌 学习 [插件管理](/guide/addons)
- ⚙️ 查看 [配置文档](/config/)

