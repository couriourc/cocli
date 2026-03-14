# 模板管理命令

## cocli template list

列出所有可用的模板。

### 语法

```bash
cocli template list
```

### 示例

```bash
cocli template list
```

### 输出示例

```
可用的模板:
  - react
  - vue2
  - vue3
```

### 说明

- 从所有配置的仓库中搜索模板
- 显示所有可用模板的名称
- 模板定义在仓库的 `meta.yaml` 文件中

## cocli template create

创建新模板。此命令用于在仓库中创建模板的目录结构，并自动更新 `meta.yaml` 文件。

### 语法

```bash
cocli template create <模板名> [选项]
```

### 参数

| 参数 | 简写 | 说明 |
|------|------|------|
| `<模板名>` | - | 模板名称（必需） |
| `--path <PATH>` | `-p` | 模板路径（可选，默认为 `templates/<模板名>`） |
| `--repo-dir <REPO_DIR>` | `-r` | 仓库目录（可选，默认为当前目录 `.`） |

### 示例

```bash
# 在当前目录创建模板（默认路径为 templates/vue3）
cocli template create vue3

# 指定模板路径
cocli template create react --path packages/react

# 指定仓库目录
cocli template create my-template --repo-dir /path/to/repo

# 组合使用
cocli template create vue3 -p packages/vue3 -r /path/to/repo
```

### 功能说明

1. **创建模板目录**：在指定的仓库目录中创建模板目录结构
2. **生成 README.md**：自动创建包含基本使用说明的 README.md 文件
3. **更新 meta.yaml**：
   - 如果 `meta.yaml` 不存在，会创建新文件
   - 如果 `meta.yaml` 已存在，会读取并更新，添加新模板配置
   - 自动检查重复名称，防止冲突

### 输出示例

```
✅ 已创建模板目录: D:\Projects\repo\templates\vue3
✅ 已创建 README.md
✅ 已更新 meta.yaml

✅ 模板 'vue3' 创建成功！
💡 提示: 模板路径: D:\Projects\repo\templates\vue3
💡 提示: 使用 `cocli template list` 查看所有模板
```

### 注意事项

- 模板名称不能与现有模板重复
- 如果模板目录已存在，命令会失败并提示错误
- 路径支持相对路径和绝对路径
- 建议在仓库根目录下执行此命令，以确保 `meta.yaml` 文件位置正确

### 创建后的目录结构

```
repo/
├── meta.yaml              # 自动更新
└── templates/
    └── vue3/              # 新创建的模板目录
        ├── README.md       # 自动生成
        └── ...            # 你可以在这里添加模板文件
```

### 相关命令

- `cocli template list` - 列出所有模板
- `cocli app create` - 使用模板创建项目

