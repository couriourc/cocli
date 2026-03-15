import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { vi } from 'vitest';

/**
 * 测试工具函数
 */

/**
 * 创建临时测试目录
 */
export async function createTempDir(prefix = 'cocli-test-'): Promise<string> {
  return await mkdtemp(join(tmpdir(), prefix));
}

/**
 * 清理临时目录
 */
export async function cleanupTempDir(dir: string): Promise<void> {
  if (existsSync(dir)) {
    await rm(dir, { recursive: true, force: true });
  }
}

/**
 * 创建测试用的配置文件
 */
export function createTestConfig(dir: string, config: any): string {
  const configPath = join(dir, '.qclrc');
  const yaml = require('js-yaml');
  // 确保包含 workspace 配置，以便 getCurrentDir 能识别为工作区
  if (!config.workspace) {
    config.workspace = {
      name: 'test-workspace',
    };
  }
  writeFileSync(configPath, yaml.dump(config), 'utf8');
  return configPath;
}

/**
 * 创建测试用的工作区配置（.qclrc）
 */
export function createTestWorkspace(dir: string, config: any = {}): string {
  const workspaceConfig = {
    workspace: {
      name: config.name || 'test-workspace',
      ...config.workspace,
    },
    repos: config.repos || [],
    ...config,
  };
  return createTestConfig(dir, workspaceConfig);
}

/**
 * 创建测试用的 cocli.json
 */
export function createTestCocliJson(dir: string, config: any): string {
  const configPath = join(dir, 'cocli.json');
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  return configPath;
}

/**
 * 创建测试用的 meta.yaml
 */
export function createTestMetaYaml(dir: string, meta: any): string {
  const metaPath = join(dir, 'meta.yaml');
  const yaml = require('js-yaml');
  writeFileSync(metaPath, yaml.dump(meta), 'utf8');
  return metaPath;
}

/**
 * 创建测试用的模板目录结构
 */
export function createTestTemplate(dir: string, templateName: string, files: Record<string, string>): string {
  const templateDir = join(dir, 'templates', templateName);
  mkdirSync(templateDir, { recursive: true });

  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = join(templateDir, filePath);
    const fileDir = require('path').dirname(fullPath);
    mkdirSync(fileDir, { recursive: true });
    writeFileSync(fullPath, content, 'utf8');
  }

  return templateDir;
}

/**
 * 创建测试用的原子化模板目录
 */
export function createTestAtomicTemplate(dir: string, itemName: string, files: Record<string, string>): string {
  const atomicDir = join(dir, 'atomic', itemName);
  mkdirSync(atomicDir, { recursive: true });

  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = join(atomicDir, filePath);
    const fileDir = require('path').dirname(fullPath);
    mkdirSync(fileDir, { recursive: true });
    writeFileSync(fullPath, content, 'utf8');
  }

  return atomicDir;
}

/**
 * 验证文件是否存在
 */
export function assertFileExists(filePath: string): void {
  if (!existsSync(filePath)) {
    throw new Error(`文件不存在: ${filePath}`);
  }
}

/**
 * 验证文件内容
 */
export function assertFileContent(filePath: string, expectedContent: string): void {
  assertFileExists(filePath);
  const content = readFileSync(filePath, 'utf8');
  if (content !== expectedContent) {
    throw new Error(`文件内容不匹配:\n期望:\n${expectedContent}\n实际:\n${content}`);
  }
}

/**
 * 验证目录是否存在
 */
export function assertDirExists(dirPath: string): void {
  if (!existsSync(dirPath)) {
    throw new Error(`目录不存在: ${dirPath}`);
  }
  const fs = require('fs');
  if (!fs.statSync(dirPath).isDirectory()) {
    throw new Error(`路径不是目录: ${dirPath}`);
  }
}

/**
 * Mock console 方法
 */
export function mockConsole() {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const logs: string[] = [];
  const warns: string[] = [];
  const errors: string[] = [];

  console.log = (...args: any[]) => {
    logs.push(args.join(' '));
    originalLog(...args);
  };

  console.warn = (...args: any[]) => {
    warns.push(args.join(' '));
    originalWarn(...args);
  };

  console.error = (...args: any[]) => {
    errors.push(args.join(' '));
    originalError(...args);
  };

  return {
    logs,
    warns,
    errors,
    restore: () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    },
  };
}

/**
 * 等待指定时间（用于异步测试）
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock process.exit（用于测试 CLI 命令）
 */
export function mockProcessExit() {
  const originalExit = process.exit;
  const exitCalls: number[] = [];

  process.exit = vi.fn((code?: number) => {
    exitCalls.push(code ?? 0);
    // 在测试中不真正退出，只记录调用
  }) as any;

  return {
    exitCalls,
    restore: () => {
      process.exit = originalExit;
    },
  };
}

/**
 * 设置测试工作目录（Mock process.cwd 和 INIT_CWD）
 */
export function setTestCwd(dir: string) {
  const originalCwd = process.cwd;
  const originalInitCwd = process.env.INIT_CWD;

  process.cwd = vi.fn(() => dir);
  process.env.INIT_CWD = dir;

  return {
    restore: () => {
      process.cwd = originalCwd;
      if (originalInitCwd) {
        process.env.INIT_CWD = originalInitCwd;
      } else {
        delete process.env.INIT_CWD;
      }
    },
  };
}

