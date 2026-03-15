# CoCli 测试用例说明

## 测试结构

```
tests/
├── utils.ts              # 测试工具函数
├── template.test.ts      # 模板管理模块测试
├── atomic.test.ts        # 原子化模板系统测试
├── commands.test.ts      # CLI 命令集成测试
├── config.test.ts        # 配置管理测试
└── cache.test.ts         # 缓存管理测试
```

## 运行测试

### 运行所有测试
```bash
pnpm test
```

### 运行特定测试文件
```bash
# 模板管理测试
pnpm test template

# 原子化模板测试
pnpm test atomic

# CLI 命令测试
pnpm test commands

# 配置管理测试
pnpm test config

# 缓存管理测试
pnpm test cache
```

### 运行测试并查看 UI
```bash
pnpm test:ui
```

### 运行测试（单次，不监听）
```bash
pnpm test:run
```

## 测试覆盖场景

### 1. template.test.ts - 模板管理模块

**正常场景：**
- ✅ 从本地仓库加载 Vue3 模板并生成项目目录
- ✅ 自动生成 .qclocal 配置文件
- ✅ 处理模板的 addons
- ✅ 列出所有可用模板
- ✅ 处理多个仓库的模板

**异常场景：**
- ✅ 模板不存在
- ✅ 目录已存在
- ✅ 仓库配置缺少 URL

### 2. atomic.test.ts - 原子化模板系统

**正常场景：**
- ✅ 添加单个原子化模板项（button）
- ✅ 自动安装依赖项（table 依赖 button）
- ✅ 指定版本添加模板项
- ✅ 列出所有可用项
- ✅ 按类型过滤列出项
- ✅ 移除已安装的模板项

**异常场景：**
- ✅ 模板项不存在
- ✅ 项目目录不存在
- ✅ 尝试移除未安装的项

### 3. commands.test.ts - CLI 命令集成测试

**正常场景：**
- ✅ 使用默认模板创建项目（零配置启动）
- ✅ 使用指定模板创建项目
- ✅ 处理 addons 参数
- ✅ 添加原子化模板项
- ✅ 指定版本添加
- ✅ 列出所有可用的原子化模板项
- ✅ 按类型过滤列出项

**异常场景：**
- ✅ 模板不存在

### 4. config.test.ts - 配置管理

**正常场景：**
- ✅ 从 .qclrc 加载配置
- ✅ 优先使用应用级配置（.qclocal）
- ✅ 回退到全局配置
- ✅ 从 cocli.json 加载配置
- ✅ 环境变量覆盖配置
- ✅ 使用默认配置
- ✅ 保存配置到 cocli.json
- ✅ 获取配置值
- ✅ 设置配置值

**异常场景：**
- ✅ 配置文件不存在
- ✅ 配置文件格式错误

### 5. cache.test.ts - 缓存管理

**正常场景：**
- ✅ 缓存模板项到本地
- ✅ 检查模板项是否已缓存
- ✅ 从缓存加载模板项
- ✅ 从缓存复制到项目目录
- ✅ 清理过期缓存

## 测试工具函数（utils.ts）

提供以下工具函数：

- `createTempDir()` - 创建临时测试目录
- `cleanupTempDir()` - 清理临时目录
- `createTestConfig()` - 创建测试用的 .qclrc 配置文件
- `createTestCocliJson()` - 创建测试用的 cocli.json
- `createTestMetaYaml()` - 创建测试用的 meta.yaml
- `createTestTemplate()` - 创建测试用的模板目录结构
- `createTestAtomicTemplate()` - 创建测试用的原子化模板目录
- `assertFileExists()` - 验证文件是否存在
- `assertFileContent()` - 验证文件内容
- `assertDirExists()` - 验证目录是否存在
- `mockConsole()` - Mock console 方法
- `wait()` - 等待指定时间

## Mock 说明

### 文件系统 Mock
- 使用临时目录避免污染本地环境
- 测试完成后自动清理临时文件

### 网络请求 Mock
- Git 仓库操作使用本地文件系统模拟
- 避免真实网络请求

### 配置加载 Mock
- Mock `Config.loadWithPriority()` 返回测试配置
- Mock `process.cwd()` 和 `process.env.INIT_CWD` 控制工作目录

### Console Mock
- 捕获 console.log/warn/error 输出
- 用于验证 CLI 输出

## 注意事项

1. **CommonJS 模块导入**：由于源码使用 CommonJS，测试中使用 `createRequire` 导入模块
2. **路径处理**：注意 Windows 和 Unix 系统的路径差异
3. **异步测试**：所有异步操作使用 `async/await` 处理
4. **清理资源**：每个测试用例完成后清理临时文件和目录
5. **环境变量**：测试前保存原始环境变量，测试后恢复

## 添加新测试

添加新测试用例时，请遵循以下规范：

1. 使用 `describe` 和 `it` 组织测试结构
2. 每个测试用例包含清晰的描述
3. 使用 `beforeEach` 和 `afterEach` 设置和清理
4. 包含正常场景和异常场景测试
5. 使用临时目录避免污染本地环境
6. Mock 外部依赖（文件系统、网络、配置等）

## 示例：添加新测试用例

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTempDir, cleanupTempDir } from './utils';

describe('NewModule', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir();
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  it('应该执行某个功能', async () => {
    // 准备
    // ...

    // 执行
    // ...

    // 验证
    expect(...).toBe(...);
  });
});
```

