# 添加插件示例

本示例演示如何添加和管理项目插件。

## 场景

假设你有一个 Vue 3 项目，需要添加多个插件来扩展功能。

## 步骤 1：查看可用插件

```bash
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

## 步骤 2：查看插件详情

在添加插件前，先查看插件详情：

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
    ...
```

## 步骤 3：添加单个插件

```bash
cd my-app
qcl addons add vue3-funs .
```

输出：

```
正在下载 addon vue3-funs 到 D:\Projects\qcli\my-app\addons\vue3-funs...
✅ Addons 添加成功！
```

## 步骤 4：添加多个插件

```bash
qcl addons add vue3-funs,add,minus .
```

这会一次性添加三个插件。

## 步骤 5：查看项目结构

```bash
tree addons
```

输出：

```
addons/
  ├── vue3-funs/
  │   ├── README.md
  │   └── composables/
  ├── add/
  │   ├── README.md
  │   └── utils/
  └── minus/
      ├── README.md
      └── utils/
```

## 步骤 6：配置自动同步

编辑 `.qclocal` 文件：

```yaml
project: my-app
template: vue3
addons:
  target_dir: ./addons
  include:
    - vue3-funs
    - add
    - minus
```

## 步骤 7：同步插件

使用 `qcl addons sync` 同步所有配置的插件：

```bash
qcl addons sync .
```

输出：

```
正在同步 addon vue3-funs 到 D:\Projects\qcli\my-app\addons\vue3-funs...
正在同步 addon add 到 D:\Projects\qcli\my-app\addons\add...
正在同步 addon minus 到 D:\Projects\qcli\my-app\addons\minus...
✅ Addons 同步成功！
```

## 步骤 8：使用插件

在项目中使用插件：

```javascript
// 使用 vue3-funs
import { useCounter } from './addons/vue3-funs/composables/useCounter'

// 使用 add
import { add, addMultiple } from './addons/add/utils/math'

// 使用 minus
import { minus, subtractMultiple } from './addons/minus/utils/math'
```

## 插件管理最佳实践

1. **查看详情** - 添加前先查看插件详情
2. **配置同步** - 在 `.qclocal` 中配置需要同步的插件
3. **定期同步** - 使用 `qcl addons sync` 更新插件
4. **版本控制** - 将 `.qclocal` 添加到版本控制，但不要提交插件目录

## 相关命令

```bash
# 列出插件
qcl addons list

# 查看详情
qcl addons detail <插件名>

# 添加插件
qcl addons add <插件列表> [项目目录]

# 同步插件
qcl addons sync [项目目录]
```

