# Vue3 项目完整示例

本示例展示如何使用 CoCli 创建一个完整的 Vue3 项目。

## 项目需求

创建一个包含以下功能的 Vue3 项目：

- Vue 3 + TypeScript + Vite
- 路由（Vue Router）
- 状态管理（Pinia）
- UI 组件（Button、Table、Form）
- API 模块

## 步骤 1：创建项目

```bash
cocli create vue3-project --template=vue3
```

**输出：**

```
💡 使用默认模板: vue3（零配置启动）
正在下载模板 vue3...
✅ 项目 vue3-project 创建成功！
💡 提示: 使用 `cd vue3-project` 进入项目目录
```

## 步骤 2：进入项目目录

```bash
cd vue3-project
```

## 步骤 3：添加基础组件

```bash
# 添加按钮组件
cocli add button

# 添加表格组件
cocli add table

# 添加表单组件
cocli add form
```

**输出：**

```
✨ 添加 button...
📦 安装依赖: base
✅ button 添加成功！

✨ 添加 table...
📦 安装依赖: button
✅ table 添加成功！

✨ 添加 form...
✅ form 添加成功！
```

## 步骤 4：添加模块

```bash
# 添加 API 模块
cocli add api-module

# 添加认证模块
cocli add auth-module
```

## 步骤 5：查看项目结构

```bash
tree -L 3
```

**项目结构：**

```
vue3-project/
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── button.vue
│   │       ├── table.vue
│   │       └── form.vue
│   ├── modules/
│   │   ├── api/
│   │   └── auth/
│   └── main.ts
├── cocli.json
└── package.json
```

**cocli.json：**

```json
{
  "items": [
    "button",
    "table",
    "form",
    "api-module",
    "auth-module"
  ]
}
```

## 步骤 6：使用 Hygen 生成代码

如果模板启用了 Hygen，可以生成更多代码：

```bash
npm run g
```

**交互示例：**

```
? 请选择生成器类型：component
? 组件名称：user-card
? 是否使用 TypeScript：Yes
✔ 组件创建成功：src/components/user-card.vue
```

## 步骤 7：安装依赖

```bash
npm install
# 或
pnpm install
```

## 步骤 8：启动项目

```bash
npm run dev
# 或
pnpm dev
```

## 完整命令序列

```bash
# 1. 创建项目
cocli create vue3-project --template=vue3

# 2. 进入项目
cd vue3-project

# 3. 添加组件
cocli add button table form

# 4. 添加模块
cocli add api-module auth-module

# 5. 安装依赖
pnpm install

# 6. 启动开发服务器
pnpm dev
```

## 项目配置

### package.json

```json
{
  "name": "vue3-project",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "g": "hygen"
  },
  "dependencies": {
    "vue": "^3.3.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0"
  }
}
```

### cocli.json

```json
{
  "items": [
    "button",
    "table",
    "form",
    "api-module",
    "auth-module"
  ]
}
```

## 使用组件

### Button 组件

```vue
<template>
  <Button>点击我</Button>
</template>

<script setup>
import Button from '@/components/ui/button.vue'
</script>
```

### Table 组件

```vue
<template>
  <Table :data="tableData" :columns="columns" />
</template>

<script setup>
import Table from '@/components/ui/table.vue'

const tableData = [
  { id: 1, name: 'John', age: 30 },
  { id: 2, name: 'Jane', age: 25 },
]

const columns = [
  { key: 'name', label: '姓名' },
  { key: 'age', label: '年龄' },
]
</script>
```

## 使用模块

### API 模块

```typescript
import { api } from '@/modules/api'

// 获取用户列表
const users = await api.get('/users')

// 创建用户
const user = await api.post('/users', {
  name: 'John',
  age: 30,
})
```

### 认证模块

```typescript
import { auth } from '@/modules/auth'

// 登录
await auth.login('username', 'password')

// 登出
auth.logout()

// 检查登录状态
if (auth.isAuthenticated()) {
  // 已登录
}
```

## 最佳实践

1. **版本锁定**：生产环境锁定组件版本
2. **依赖管理**：合理使用依赖关系
3. **代码组织**：按功能模块组织代码
4. **文档完善**：为组件和模块添加文档

## 常见问题

### Q: 如何更新组件？

A: 使用 `--force` 参数强制更新：

```bash
cocli add button --force
```

### Q: 如何移除不需要的组件？

A: 使用 `remove` 命令：

```bash
cocli remove button
```

### Q: 组件依赖如何处理？

A: CoCli 会自动安装依赖，无需手动处理。

