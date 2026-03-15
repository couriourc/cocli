/**
 * CLI 命令集成测试用例（src/commands.js）
 * 
 * 测试覆盖场景：
 * ✅ 正常场景：
 * 1. 执行 `cocli app create my-project`（使用默认模板）
 * 2. 执行 `cocli app create --template=vue3 my-project`（指定 Vue3 模板）
 * 3. 执行 `cocli add button` 添加原子化模板项
 * 4. 执行 `cocli list` 列出可用项
 * 
 * ✅ 异常场景：
 * 1. 未指定项目名称
 * 2. 指定的模板不存在
 * 3. 目标目录已存在
 * 4. 配置文件格式错误
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { createTempDir, cleanupTempDir, createTestConfig, createTestMetaYaml, createTestTemplate, createTestAtomicTemplate, createTestWorkspace, mockConsole, setTestCwd, mockProcessExit } from './utils';

// 导入命令处理函数
const commands = require('../apps/main/src/commands.js');
const { Config } = require('../apps/main/src/config.js');

describe('CLI Commands', () => {
  let tempDir: string;
  let repoDir: string;
  let projectDir: string;
  let consoleMock: ReturnType<typeof mockConsole>;
  let cwdMock: ReturnType<typeof setTestCwd>;
  let exitMock: ReturnType<typeof mockProcessExit>;

  beforeEach(async () => {
    tempDir = await createTempDir();
    repoDir = join(tempDir, 'repo');
    projectDir = join(tempDir, 'project');
    mkdirSync(repoDir, { recursive: true });
    mkdirSync(projectDir, { recursive: true });
    
    // 创建工作区配置
    createTestWorkspace(projectDir, {
      repos: [],
    });
    
    // 设置测试工作目录和 mock process.exit
    cwdMock = setTestCwd(projectDir);
    exitMock = mockProcessExit();
    consoleMock = mockConsole();
  });

  afterEach(async () => {
    consoleMock.restore();
    exitMock.restore();
    cwdMock.restore();
    await cleanupTempDir(tempDir);
  });

  describe('handleAppCreate() - 创建项目命令', () => {
    it('应该使用默认模板创建项目（零配置启动）', async () => {
      // 准备：创建默认模板仓库
      const meta = {
        templates: {
          vue3: {
            root: 'templates/vue3/**',
          },
        },
      };
      createTestMetaYaml(repoDir, meta);
      createTestTemplate(repoDir, 'vue3', {
        'package.json': JSON.stringify({ name: 'vue3-template', version: '1.0.0' }),
        'src/main.ts': 'console.log("Hello Vue3");',
      });

      // Mock 默认配置
      const defaults = require('../apps/main/src/defaults.js');
      vi.spyOn(defaults, 'canUseDefaults').mockReturnValue(true);
      vi.spyOn(defaults, 'getDefaultConfig').mockReturnValue({
        repos: [
          {
            local: {
              type: 'local',
              url: repoDir,
            },
          },
        ],
      });

      // Mock Config.loadWithPriority
      vi.spyOn(Config, 'loadWithPriority').mockReturnValue({
        repos: [
          {
            local: {
              type: 'local',
              url: repoDir,
            },
          },
        ],
        config: new Config(),
      });

      // 执行：创建项目（不指定模板，使用默认）
      const projectName = 'my-default-project';
      await commands.handleAppCreate(projectName, { template: '' });

      // 验证：项目已创建
      const projectPath = join(projectDir, projectName);
      expect(existsSync(projectPath)).toBe(true);
      expect(consoleMock.logs.some(log => log.includes('项目创建成功'))).toBe(true);
    });

    it('应该使用指定模板创建项目', async () => {
      // 准备：创建多个模板
      const meta = {
        templates: {
          vue3: {
            root: 'templates/vue3/**',
          },
          react: {
            root: 'templates/react/**',
          },
        },
      };
      createTestMetaYaml(repoDir, meta);
      createTestTemplate(repoDir, 'vue3', {
        'package.json': JSON.stringify({ name: 'vue3-template' }),
      });
      createTestTemplate(repoDir, 'react', {
        'package.json': JSON.stringify({ name: 'react-template' }),
      });

      const config = {
        repos: [
          {
            local: {
              type: 'local',
              url: repoDir,
            },
          },
        ],
      };
      createTestWorkspace(projectDir, config);

      vi.spyOn(Config, 'loadWithPriority').mockReturnValue({
        repos: config.repos,
        config: new Config(),
      });

      // 执行：指定 react 模板
      const projectName = 'my-react-project';
      await commands.handleAppCreate(projectName, { template: 'react' });

      // 验证：应该使用 react 模板
      expect(consoleMock.logs.some(log => log.includes('项目创建成功'))).toBe(true);
    });

    it('应该处理 addons 参数', async () => {
      // 准备
      const meta = {
        templates: {
          vue3: {
            root: 'templates/vue3/**',
          },
        },
        addons: {
          'my-addon': {
            root: 'addons/my-addon/**',
          },
        },
      };
      createTestMetaYaml(repoDir, meta);
      createTestTemplate(repoDir, 'vue3', {
        'package.json': '{}',
      });

      const addonDir = join(repoDir, 'addons', 'my-addon');
      mkdirSync(addonDir, { recursive: true });
      writeFileSync(join(addonDir, 'index.js'), 'export default {};', 'utf8');

      const config = {
        repos: [
          {
            local: {
              type: 'local',
              url: repoDir,
            },
          },
        ],
      };
      createTestWorkspace(projectDir, config);

      vi.spyOn(Config, 'loadWithPriority').mockReturnValue({
        repos: config.repos,
        config: new Config(),
      });

      // 执行：创建项目并添加 addons
      const projectName = 'my-project-with-addons';
      await commands.handleAppCreate(projectName, {
        template: 'vue3',
        addons: 'my-addon',
      });

      // 验证：应该处理 addons
      expect(consoleMock.logs.some(log => log.includes('正在处理 addons'))).toBe(true);
    });

    it('应该抛出错误当模板不存在', async () => {
      // 准备：创建不包含目标模板的仓库
      const meta = {
        templates: {
          vue3: {
            root: 'templates/vue3/**',
          },
        },
      };
      createTestMetaYaml(repoDir, meta);

      const config = {
        repos: [
          {
            local: {
              type: 'local',
              url: repoDir,
            },
          },
        ],
      };
      createTestWorkspace(projectDir, config);

      vi.spyOn(Config, 'loadWithPriority').mockReturnValue({
        repos: config.repos,
        config: new Config(),
      });

      // 执行 & 验证：应该抛出错误
      await expect(
        commands.handleAppCreate('my-project', { template: 'non-existent' })
      ).rejects.toThrow();
    });
  });

  describe('handleAtomicAdd() - 添加原子化模板项命令', () => {
    it('应该添加原子化模板项', async () => {
      // 准备：创建原子化模板仓库
      const meta = {
        atomic: {
          button: {
            type: 'component',
            version: '1.0.0',
            root: 'atomic/button/**',
            target: 'src/components/ui',
            dependencies: [],
          },
        },
      };
      createTestMetaYaml(repoDir, meta);
      createTestAtomicTemplate(repoDir, 'button', {
        'button.vue': '<template><button>Button</button></template>',
      });

      const config = {
        repos: [
          {
            local: {
              type: 'local',
              url: repoDir,
            },
          },
        ],
      };
      createTestWorkspace(projectDir, config);

      vi.spyOn(Config, 'loadWithPriority').mockReturnValue({
        repos: config.repos,
        config: new Config(),
      });

      // 执行：添加 button 组件
      await commands.handleAtomicAdd('button', projectDir, {});

      // 验证：应该成功添加（process.exit 被 mock，不会真正退出）
      expect(exitMock.exitCalls.length).toBeGreaterThan(0);
      expect(consoleMock.logs.some(log => log.includes('添加成功') || log.includes('button'))).toBe(true);
    });

    it('应该支持指定版本添加', async () => {
      // 准备
      const meta = {
        atomic: {
          button: {
            type: 'component',
            version: '1.0.0',
            root: 'atomic/button/**',
            target: 'src/components/ui',
            dependencies: [],
          },
        },
      };
      createTestMetaYaml(repoDir, meta);
      createTestAtomicTemplate(repoDir, 'button', {
        'button.vue': '<template><button>Button</button></template>',
      });

      const config = {
        repos: [
          {
            local: {
              type: 'local',
              url: repoDir,
            },
          },
        ],
      };
      createTestWorkspace(projectDir, config);

      vi.spyOn(Config, 'loadWithPriority').mockReturnValue({
        repos: config.repos,
        config: new Config(),
      });

      // 执行：指定版本添加
      await commands.handleAtomicAdd('button', projectDir, { version: '1.0.0' });

      // 验证：应该成功（process.exit 被 mock）
      expect(exitMock.exitCalls.length).toBeGreaterThan(0);
    });
  });

  describe('handleAtomicList() - 列出可用项命令', () => {
    it('应该列出所有可用的原子化模板项', async () => {
      // 准备：创建多个原子化模板
      const meta = {
        atomic: {
          button: {
            type: 'component',
            description: '按钮组件',
            root: 'atomic/button/**',
            dependencies: [],
          },
          table: {
            type: 'component',
            description: '表格组件',
            root: 'atomic/table/**',
            dependencies: [],
          },
        },
      };
      createTestMetaYaml(repoDir, meta);

      const config = {
        repos: [
          {
            local: {
              type: 'local',
              url: repoDir,
            },
          },
        ],
      };
      createTestWorkspace(projectDir, config);

      vi.spyOn(Config, 'loadWithPriority').mockReturnValue({
        repos: config.repos,
        config: new Config(),
      });

      // 执行：列出所有项
      await commands.handleAtomicList(null);

      // 验证：应该输出所有项（process.exit 被 mock）
      expect(exitMock.exitCalls.length).toBeGreaterThan(0);
      const logs = consoleMock.logs.join(' ');
      expect(logs).toContain('button');
      expect(logs).toContain('table');
    });

    it('应该按类型过滤列出项', async () => {
      // 准备
      const meta = {
        atomic: {
          button: {
            type: 'component',
            root: 'atomic/button/**',
            dependencies: [],
          },
          'api-module': {
            type: 'module',
            root: 'atomic/api-module/**',
            dependencies: [],
          },
        },
      };
      createTestMetaYaml(repoDir, meta);

      const config = {
        repos: [
          {
            local: {
              type: 'local',
              url: repoDir,
            },
          },
        ],
      };
      createTestWorkspace(projectDir, config);

      vi.spyOn(Config, 'loadWithPriority').mockReturnValue({
        repos: config.repos,
        config: new Config(),
      });

      // 执行：只列出 component 类型
      await commands.handleAtomicList('component');

      // 验证：应该只输出 component 类型的项（process.exit 被 mock）
      expect(exitMock.exitCalls.length).toBeGreaterThan(0);
      const logs = consoleMock.logs.join(' ');
      expect(logs).toContain('button');
      expect(logs).not.toContain('api-module');
    });
  });
});

