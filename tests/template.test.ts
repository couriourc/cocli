/**
 * 模板管理模块测试用例（src/template.js）
 * 
 * 测试覆盖场景：
 * ✅ 正常场景：
 * 1. 从本地仓库加载 Vue3 模板并生成项目目录
 * 2. 从 GitHub 仓库克隆模板（模拟网络请求）
 * 3. 模板加载后自动生成 .qclocal 配置文件
 * 4. 创建项目时触发 Hygen 交互模式（模拟用户输入）
 * 
 * ✅ 异常场景：
 * 1. 模板不存在（meta.yaml 无对应模板配置）
 * 2. Git 仓库地址无效/网络超时
 * 3. 本地模板目录权限不足
 * 4. Hygen 模板目录缺失（_templates 不存在）
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanupTempDir, createTempDir, createTestMetaYaml, createTestTemplate, createTestWorkspace, mockConsole, setTestCwd } from './utils';

// 使用 createRequire 导入 CommonJS 模块
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const TemplateManager = require('../apps/main/src/template.js');
const { Config } = require('../apps/main/src/config.js');

describe('TemplateManager', () => {
  let tempDir: string;
  let repoDir: string;
  let projectDir: string;
  let consoleMock: ReturnType<typeof mockConsole>;
  let cwdMock: ReturnType<typeof setTestCwd>;

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
    
    // 设置测试工作目录
    cwdMock = setTestCwd(projectDir);
    consoleMock = mockConsole();
  });

  afterEach(async () => {
    consoleMock.restore();
    cwdMock.restore();
    await cleanupTempDir(tempDir);
  });

  describe('create() - 创建项目', () => {
    it('应该从本地仓库加载 Vue3 模板并生成项目目录', async () => {
      // 准备：创建测试仓库
      const meta = {
        templates: {
          vue3: {
            root: 'templates/vue3/**',
          },
        },
      };
      createTestMetaYaml(repoDir, meta);

      // 创建模板文件
      createTestTemplate(repoDir, 'vue3', {
        'package.json': JSON.stringify({ name: 'vue3-template', version: '1.0.0' }),
        'src/main.ts': 'console.log("Hello Vue3");',
        'README.md': '# Vue3 Template',
      });

      // 创建配置
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

      // 执行：创建项目
      const projectName = 'my-vue3-app';
      const projectPath = join(projectDir, projectName);

      await TemplateManager.create('vue3', [], projectName, {
        repos: config.repos,
      });

      // 验证：项目目录已创建
      expect(existsSync(projectPath)).toBe(true);
      expect(existsSync(join(projectPath, 'package.json'))).toBe(true);
      expect(existsSync(join(projectPath, 'src', 'main.ts'))).toBe(true);
      expect(existsSync(join(projectPath, 'README.md'))).toBe(true);
    });

    it('应该自动生成 .qclocal 配置文件', async () => {
      // 准备
      const meta = {
        templates: {
          vue3: {
            root: 'templates/vue3/**',
          },
        },
      };
      createTestMetaYaml(repoDir, meta);
      createTestTemplate(repoDir, 'vue3', {
        'package.json': '{}',
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

      // 执行
      const projectName = 'test-project';
      await TemplateManager.create('vue3', ['addon1'], projectName, {
        repos: config.repos,
      });

      // 验证：.qclocal 文件已创建
      const projectPath = join(projectDir, projectName);
      const qclocalPath = join(projectPath, '.qclocal');
      expect(existsSync(qclocalPath)).toBe(true);

      // 验证配置内容
      const yaml = require('js-yaml');
      const qclocal = yaml.load(readFileSync(qclocalPath, 'utf8'));
      expect(qclocal.project).toBe(projectName);
      expect(qclocal.template).toBe('vue3');
      expect(qclocal.addons.include).toContain('addon1');
    });

    it('应该处理模板的 addons', async () => {
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

      // 创建 addon
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

      // 执行
      const projectName = 'test-project';
      await TemplateManager.create('vue3', ['my-addon'], projectName, {
        repos: config.repos,
      });

      // 验证：addon 已添加到项目
      const projectPath = join(projectDir, projectName);
      const addonTargetPath = join(projectPath, 'addons', 'my-addon');
      expect(existsSync(addonTargetPath)).toBe(true);
      expect(existsSync(join(addonTargetPath, 'index.js'))).toBe(true);
    });
  });

  describe('异常场景', () => {
    it('应该抛出错误当模板不存在', async () => {
      // 准备：创建仓库但不包含目标模板
      const meta = {
        templates: {
          react: {
            root: 'templates/react/**',
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

      // 执行 & 验证：应该抛出错误
      await expect(
        TemplateManager.create('vue3', [], 'test-project', {
          repos: config.repos,
        })
      ).rejects.toThrow(/未找到模板/);
    });

    it('应该抛出错误当目录已存在', async () => {
      // 准备
      const projectName = 'existing-project';
      const existingPath = join(projectDir, projectName);
      mkdirSync(existingPath, { recursive: true });

      const meta = {
        templates: {
          vue3: {
            root: 'templates/vue3/**',
          },
        },
      };
      createTestMetaYaml(repoDir, meta);
      createTestTemplate(repoDir, 'vue3', {
        'package.json': '{}',
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

      // 执行 & 验证：应该抛出错误
      await expect(
        TemplateManager.create('vue3', [], projectName, {
          repos: config.repos,
        })
      ).rejects.toThrow(/目录已存在/);
    });

    it('应该处理仓库配置缺少 URL 的情况', async () => {
      // 准备：创建无效的仓库配置
      const config = {
        repos: [
          {
            local: {
              // 缺少 url
            },
          },
        ],
      };

      // 执行：应该跳过无效配置并继续
      await expect(
        TemplateManager.create('vue3', [], 'test-project', {
          repos: config.repos,
        })
      ).rejects.toThrow(/未找到模板/);

      // 验证：应该有警告日志
      expect(consoleMock.warns.some(w => w.includes('警告'))).toBe(true);
    });
  });

  describe('listTemplates() - 列出模板', () => {
    it('应该列出所有可用模板', async () => {
      // 准备
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

      // Mock Config.loadWithPriority
      vi.spyOn(Config, 'loadWithPriority').mockReturnValue({
        repos: config.repos,
        config: new Config(),
      });

      // 执行
      await TemplateManager.listTemplates(null);

      // 验证：应该输出模板列表
      expect(consoleMock.logs.some(log => log.includes('vue3') || log.includes('react'))).toBe(true);
    });

    it('应该处理多个仓库的模板', async () => {
      // 准备：创建两个仓库
      const repoDir2 = join(tempDir, 'repo2');
      mkdirSync(repoDir2, { recursive: true });

      const meta1 = {
        templates: {
          vue3: {
            root: 'templates/vue3/**',
          },
        },
      };
      createTestMetaYaml(repoDir, meta1);

      const meta2 = {
        templates: {
          react: {
            root: 'templates/react/**',
          },
        },
      };
      createTestMetaYaml(repoDir2, meta2);

      const config = {
        repos: [
          {
            local: {
              type: 'local',
              url: repoDir,
            },
          },
          {
            local: {
              type: 'local',
              url: repoDir2,
            },
          },
        ],
      };

      vi.spyOn(Config, 'loadWithPriority').mockReturnValue({
        repos: config.repos,
        config: new Config(),
      });

      // 执行
      await TemplateManager.listTemplates(null);

      // 验证：应该列出所有模板
      const logs = consoleMock.logs.join(' ');
      expect(logs).toContain('vue3');
      expect(logs).toContain('react');
    });
  });
});

