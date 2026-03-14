#!/usr/bin/env node

/**
 * Postinstall 脚本
 * 确保 cocli 命令可以在开发环境中使用
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 检查 bin 文件是否存在
const binPath = path.join(__dirname, '..', 'apps', 'main', 'bin', 'cocli.js');
if (!fs.existsSync(binPath)) {
  console.warn('警告: cocli bin 文件不存在:', binPath);
  process.exit(0);
}

// 确保 bin 文件有执行权限（Unix 系统）
if (process.platform !== 'win32') {
  try {
    fs.chmodSync(binPath, '755');
  } catch (error) {
    // 忽略权限错误
  }
}

// 检查 node_modules/.bin 目录
const nodeModulesBin = path.join(__dirname, '..', 'node_modules', '.bin');
if (fs.existsSync(nodeModulesBin)) {
  // 在 pnpm workspace 中，bin 链接会自动创建
  console.log('✅ cocli 命令已配置（通过 pnpm workspace）');
} else {
  console.log('✅ cocli 命令已配置');
}

