# AI 命令

CoCli 集成了 MCP (Model Context Protocol) 和 Skills 功能，提供强大的 AI 能力来辅助项目开发。

## 目录

- [配置 AI](#配置-ai)
- [AI 对话](#ai-对话)
- [项目建议](#项目建议)
- [MCP 工具和资源](#mcp-工具和资源)
- [Skills 管理](#skills-管理)

## 配置 AI

在使用 AI 功能之前，需要在配置文件中添加 AI 配置。

### 配置文件示例

在 `.qclrc` 或 `.qcl.yaml` 中添加：

```yaml
ai:
  mcp:
    server_url: "http://localhost:3000"  # MCP 服务器地址
    server_command: "node mcp-server.js"  # 可选：启动本地 MCP 服务器的命令
    api_key: "your-api-key"  # 可选：API 密钥
  default_model: "gpt-4"  # 可选：默认 AI 模型
  api_endpoint: "https://api.openai.com/v1"  # 可选：API 端点
```

## AI 对话

使用 `cocli ai chat` 命令与 AI 进行对话。

### 基本用法

```bash
cocli ai chat "如何创建一个 Vue 3 项目？"
```

### 带上下文的对话

```bash
cocli ai chat "优化这个项目的结构" --context "当前项目是一个 React 应用"
```

## 项目建议

使用 `cocli ai suggest` 命令获取项目改进建议。

### 基本用法

```bash
# 分析当前目录的项目
cocli ai suggest

# 分析指定路径的项目
cocli ai suggest /path/to/project

# 指定建议类型
cocli ai suggest --type architecture
```

## MCP 工具和资源

### 列出可用的 MCP 工具

```bash
cocli ai tools
```

这将显示所有可用的 MCP 工具及其描述。

### 列出可用的 MCP 资源

```bash
cocli ai resources
```

这将显示所有可用的 MCP 资源（如文件、数据库等）。

## Skills 管理

Skills 是预定义的工作流程和提示词模板，用于标准化 AI 任务执行。

### 列出所有 Skills

```bash
cocli ai skills list
```

### 查看 Skill 详情

```bash
cocli ai skills show project_suggestion
```

### 执行 Skill

```bash
# 使用默认输入执行
cocli ai skills execute project_suggestion

# 使用自定义输入执行
cocli ai skills execute project_suggestion --inputs '{"project_type":"web","project_name":"my-app","requirements":"需要支持 SSR"}'
```

### 创建新 Skill

```bash
# 创建基本 Skill
cocli ai skills create my_skill --description "我的自定义 Skill"

# 使用内置模板创建
cocli ai skills create project_suggestion --template project_suggestion
```

可用的内置模板：
- `project_suggestion`: 项目创建建议 Skill
- `template_selection`: 模板选择建议 Skill

### 删除 Skill

```bash
cocli ai skills delete my_skill
```

## Skills 配置格式

Skills 使用 YAML 格式配置，存储在 `~/.qcl/skills/` 目录下。

### 示例 Skill 配置

```yaml
name: project_suggestion
description: 为项目创建提供 AI 建议
version: "1.0.0"
prompt_template: |
  基于以下信息，为项目创建提供建议：
  项目类型: {{{project_type}}}
  项目名称: {{{project_name}}}
  需求描述: {{{requirements}}}
  请提供详细的建议，包括技术栈选择、项目结构建议等。
workflow:
  - name: analyze_requirements
    description: 分析项目需求
    step_type: prompt
  - name: generate_suggestions
    description: 生成项目建议
    step_type: prompt
inputs:
  project_type:
    type: string
    description: 项目类型
    required: true
  project_name:
    type: string
    description: 项目名称
    required: true
  requirements:
    type: string
    description: 需求描述
    required: false
outputs:
  suggestions:
    type: string
    description: 项目建议
```

## 使用场景

### 场景 1: 获取项目创建建议

```bash
# 1. 执行项目建议 Skill
cocli ai skills execute project_suggestion --inputs '{"project_type":"web","project_name":"my-blog","requirements":"需要支持 Markdown 和评论功能"}'

# 2. 或直接使用 AI 对话
cocli ai chat "我想创建一个博客项目，需要支持 Markdown 和评论功能，请给我建议"
```

### 场景 2: 选择最合适的模板

```bash
# 执行模板选择 Skill
cocli ai skills execute template_selection --inputs '{"project_type":"web","tech_stack":"Vue 3","project_scale":"small"}'
```

### 场景 3: 分析现有项目

```bash
# 分析当前项目并提供改进建议
cocli ai suggest .
```

## 故障排除

### AI 功能未配置

如果看到 "AI 功能未配置" 的错误：

1. 检查配置文件是否存在（`.qclrc` 或 `.qcl.yaml`）
2. 确保配置文件中包含 `ai` 字段
3. 确保 MCP 服务器地址正确

### MCP 服务器连接失败

如果无法连接到 MCP 服务器：

1. 检查 MCP 服务器是否正在运行
2. 验证 `server_url` 配置是否正确
3. 检查网络连接和防火墙设置

### Skills 执行失败

如果 Skills 执行失败：

1. 检查 Skill 配置文件格式是否正确
2. 确保所有必需的输入参数都已提供
3. 查看错误消息以获取更多信息

## 相关命令

- `cocli config get ai` - 获取 AI 配置
- `cocli config set ai.mcp.server_url <URL>` - 设置 MCP 服务器地址
- `cocli --help` - 查看所有可用命令

