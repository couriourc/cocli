const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { getDefaultConfig, canUseDefaults } = require('./defaults');

/**
 * 简化的配置系统（对标 shadcn）
 * 支持单文件 cocli.json + 环境变量覆盖
 */
class SimpleConfig {
  /**
   * 加载配置（优先级：环境变量 > cocli.json > .qclrc > 默认配置）
   */
  static load() {
    const currentDir = process.env.INIT_CWD || process.cwd();
    
    // 1. 尝试加载 cocli.json（新格式）
    const cocliJsonPath = path.join(currentDir, 'cocli.json');
    let config = null;
    
    if (fs.existsSync(cocliJsonPath)) {
      try {
        const content = fs.readFileSync(cocliJsonPath, 'utf8');
        config = JSON.parse(content);
      } catch (error) {
        console.warn(`警告: 解析 cocli.json 失败: ${error.message}`);
      }
    }

    // 2. 如果没有 cocli.json，尝试加载 .qclrc（兼容旧格式）
    if (!config) {
      const qclrcPath = path.join(currentDir, '.qclrc');
      if (fs.existsSync(qclrcPath)) {
        try {
          const content = fs.readFileSync(qclrcPath, 'utf8');
          config = yaml.parse(content);
        } catch (error) {
          console.warn(`警告: 解析 .qclrc 失败: ${error.message}`);
        }
      }
    }

    // 3. 如果都没有，尝试使用默认配置（零配置启动）
    if (!config && canUseDefaults()) {
      config = getDefaultConfig();
    }

    // 4. 应用环境变量覆盖
    if (config) {
      config = this.applyEnvOverrides(config);
    }

    return config;
  }

  /**
   * 应用环境变量覆盖
   */
  static applyEnvOverrides(config) {
    const overrides = { ...config };

    // 支持环境变量覆盖仓库配置
    if (process.env.COCLI_REPO) {
      try {
        const repoConfig = JSON.parse(process.env.COCLI_REPO);
        if (Array.isArray(repoConfig)) {
          overrides.repos = repoConfig;
        } else {
          overrides.repos = [repoConfig];
        }
      } catch (error) {
        console.warn('警告: 环境变量 COCLI_REPO 格式错误');
      }
    }

    // 支持环境变量覆盖其他配置
    if (process.env.COCLI_USERNAME) {
      overrides.username = process.env.COCLI_USERNAME;
    }
    if (process.env.COCLI_TOKEN) {
      overrides.token = process.env.COCLI_TOKEN;
    }

    return overrides;
  }

  /**
   * 保存配置到 cocli.json
   */
  static save(config, projectPath = '.') {
    const resolvedPath = path.resolve(projectPath);
    const configPath = path.join(resolvedPath, 'cocli.json');
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    console.log(`✅ 配置已保存到: ${configPath}`);
  }

  /**
   * 编辑配置（可视化编辑）
   */
  static async edit(projectPath = '.') {
    const resolvedPath = path.resolve(projectPath);
    const configPath = path.join(resolvedPath, 'cocli.json');
    
    // 尝试使用系统默认编辑器
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    const editor = process.env.EDITOR || process.env.VISUAL || 'code';
    
    try {
      await execAsync(`${editor} "${configPath}"`, {
        cwd: resolvedPath,
      });
      console.log(`✅ 已在 ${editor} 中打开配置文件`);
    } catch (error) {
      console.log(`配置文件路径: ${configPath}`);
      console.log(`💡 提示: 使用你喜欢的编辑器打开此文件进行编辑`);
    }
  }

  /**
   * 获取配置值
   */
  static get(key, projectPath = '.') {
    const config = this.load();
    if (!config) {
      return null;
    }

    const keys = key.split('.');
    let value = config;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return null;
      }
    }

    return value;
  }

  /**
   * 设置配置值
   */
  static set(key, value, projectPath = '.') {
    const resolvedPath = path.resolve(projectPath);
    const configPath = path.join(resolvedPath, 'cocli.json');
    
    let config = {};
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(content);
      } catch (error) {
        console.warn('警告: 解析现有配置失败，将创建新配置');
      }
    }

    const keys = key.split('.');
    let current = config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current) || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }

    current[keys[keys.length - 1]] = value;
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    console.log(`✅ 配置已更新: ${key} = ${JSON.stringify(value)}`);
  }
}

module.exports = SimpleConfig;

