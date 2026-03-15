/**
 * 默认配置和模板（对标 shadcn 的零配置启动）
 * 提供内置的常用模板，无需手动 init 即可使用
 */

const DEFAULT_REPOS = [
  {
    github: {
      type: 'git',
      repo: 'https://github.com/couriourc/cocli-repo',
    },
  },
];

const DEFAULT_TEMPLATES = {
  vue3: {
    name: 'vue3',
    description: 'Vue 3 + TypeScript + Vite 项目模板',
    type: 'template',
  },
  react: {
    name: 'react',
    description: 'React + TypeScript + Vite 项目模板',
    type: 'template',
  },
  'vue3-base': {
    name: 'vue3-base',
    description: 'Vue 3 基础模板（最小化）',
    type: 'template',
  },
};

/**
 * 获取默认配置
 */
function getDefaultConfig() {
  return {
    repos: DEFAULT_REPOS,
    templates: DEFAULT_TEMPLATES,
  };
}

/**
 * 检查是否可以使用默认配置
 * 如果用户没有配置文件，可以使用默认配置
 */
function canUseDefaults() {
  const fs = require('fs');
  const path = require('path');
  const currentDir = process.env.INIT_CWD || process.cwd();
  
  const configPaths = [
    path.join(currentDir, '.qclrc'),
    path.join(currentDir, '.qcl.yaml'),
    path.join(currentDir, '.qcl.yml'),
    path.join(require('os').homedir(), '.qclrc'),
    path.join(require('os').homedir(), '.qcl.yaml'),
    path.join(require('os').homedir(), '.qcl.yml'),
  ];

  // 如果任何配置文件存在，不使用默认配置
  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      return false;
    }
  }

  return true;
}

module.exports = {
  DEFAULT_REPOS,
  DEFAULT_TEMPLATES,
  getDefaultConfig,
  canUseDefaults,
};

