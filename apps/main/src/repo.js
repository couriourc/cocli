const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);
const https = require('https');
const http = require('http');
const url = require('url');

class RepoManager {
  static async fetchMeta(repoUrl, repoConfig, globalConfig) {
    const tempDir = await this.syncRepo(repoUrl, repoConfig, globalConfig);
    
    try {
      const metaPath = path.join(tempDir, 'meta.yaml');
      if (!fs.existsSync(metaPath)) {
        throw new Error('仓库中未找到 meta.yaml 文件');
      }

      const content = fs.readFileSync(metaPath, 'utf8');
      const meta = yaml.load(content);
      
      return meta;
    } finally {
      // 清理临时目录
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  }

  static async readFileFromRepo(repoUrl, filePath, repoConfig, globalConfig) {
    const tempDir = await this.syncRepo(repoUrl, repoConfig, globalConfig);
    
    try {
      const fileFullPath = path.join(tempDir, filePath.replace(/^\.\//, ''));
      if (fs.existsSync(fileFullPath)) {
        return fs.readFileSync(fileFullPath, 'utf8');
      }
      return null;
    } finally {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  }

  static async syncRepo(repoUrl, repoConfig, globalConfig) {
    const tempDir = path.join(
      require('os').tmpdir(),
      `qcl_repo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    );

    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });

    const repoType = this.getRepoType(repoConfig);
    
    switch (repoType) {
      case 'local':
        await this.syncLocal(repoUrl, tempDir);
        break;
      case 'git':
      case 'gitlab':
        await this.syncGit(repoUrl, tempDir, repoConfig, globalConfig);
        break;
      case 'ftp':
        await this.syncFtp(repoUrl, tempDir, repoConfig, globalConfig);
        break;
      default:
        throw new Error(`不支持的仓库类型: ${repoType}`);
    }

    return tempDir;
  }

  static getRepoType(repoConfig) {
    if (repoConfig.local) return 'local';
    if (repoConfig.github) return 'git';
    if (repoConfig.gitlab) return 'gitlab';
    if (repoConfig.ftp) return 'ftp';
    return null;
  }

  static async syncLocal(repoUrl, dest) {
    // 优先使用用户执行命令时的实际工作目录（pnpm 会设置 INIT_CWD）
    const userCwd = process.env.INIT_CWD || process.cwd();
    const localPath = path.isAbsolute(repoUrl)
      ? repoUrl
      : path.resolve(userCwd, repoUrl);

    if (!fs.existsSync(localPath)) {
      throw new Error(`本地路径不存在: ${localPath}`);
    }

    if (!fs.statSync(localPath).isDirectory()) {
      throw new Error(`本地路径不是目录: ${localPath}`);
    }

    this.copyDirRecursive(localPath, dest);

    // 验证 meta.yaml 是否被复制
    const metaCheck = path.join(dest, 'meta.yaml');
    if (!fs.existsSync(metaCheck)) {
      throw new Error(`复制后未找到 meta.yaml 文件`);
    }
  }

  /**
   * 需要忽略的目录和文件
   */
  static shouldIgnore(name) {
    const ignoreList = [
      'node_modules',
      '.git',
      '.svn',
      '.hg',
      '.DS_Store',
      'Thumbs.db',
      '.vscode',
      '.idea',
      'dist',
      'build',
      '.next',
      '.nuxt',
      '.cache',
      'coverage',
      '.nyc_output',
      '*.log',
    ];
    
    return ignoreList.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(name);
      }
      return name === pattern;
    });
  }

  static copyDirRecursive(src, dst) {
    fs.mkdirSync(dst, { recursive: true });
    
    try {
      const entries = fs.readdirSync(src, { withFileTypes: true });

      for (const entry of entries) {
        // 跳过需要忽略的目录和文件
        if (this.shouldIgnore(entry.name)) {
          continue;
        }

        const srcPath = path.join(src, entry.name);
        const dstPath = path.join(dst, entry.name);

        try {
          if (entry.isDirectory()) {
            this.copyDirRecursive(srcPath, dstPath);
          } else {
            fs.copyFileSync(srcPath, dstPath);
          }
        } catch (error) {
          // 如果遇到权限错误或其他错误，记录警告但继续处理其他文件
          if (error.code === 'EPERM' || error.code === 'EACCES') {
            console.warn(`警告: 跳过文件 ${srcPath}（权限不足）`);
            continue;
          }
          // 其他错误也记录但继续
          console.warn(`警告: 复制文件 ${srcPath} 时出错: ${error.message}`);
        }
      }
    } catch (error) {
      // 如果读取目录失败，抛出错误
      if (error.code === 'EPERM' || error.code === 'EACCES') {
        throw new Error(`无法访问目录 ${src}（权限不足）`);
      }
      throw error;
    }
  }

  static async syncGit(repoUrl, dest, repoConfig, globalConfig) {
    const auth = this.getGitAuth(repoConfig, globalConfig);
    let gitUrl = repoUrl;

    // 如果提供了认证信息，添加到 URL
    if (auth.token) {
      const parsed = new URL(repoUrl);
      parsed.username = auth.token;
      parsed.password = '';
      gitUrl = parsed.toString();
    } else if (auth.username && auth.password) {
      const parsed = new URL(repoUrl);
      parsed.username = auth.username;
      parsed.password = auth.password;
      gitUrl = parsed.toString();
    }

    try {
      await execAsync(`git clone --depth 1 "${gitUrl}" "${dest}"`, {
        stdio: 'inherit',
      });
    } catch (error) {
      throw new Error(`克隆仓库失败: ${error.message}`);
    }
  }

  static getGitAuth(repoConfig, globalConfig) {
    const config = repoConfig.github || repoConfig.gitlab || {};
    return {
      username: config.username || globalConfig?.username,
      password: config.password || globalConfig?.password,
      token: config.token || globalConfig?.token,
    };
  }

  static async syncFtp(repoUrl, dest, repoConfig, globalConfig) {
    // FTP 同步需要额外的库，这里先抛出错误提示
    throw new Error('FTP 同步功能暂未实现，请使用 Git 或本地仓库');
  }

  static async downloadTemplate(repoUrl, templatePaths, dest, repoConfig, globalConfig) {
    const tempDir = await this.syncRepo(repoUrl, repoConfig, globalConfig);

    try {
      for (const templatePath of templatePaths) {
        this.copyTemplatePath(tempDir, templatePath, dest);
      }
    } finally {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  }

  static copyTemplatePath(tempDir, templatePath, dest) {
    const normalizedPath = templatePath.replace(/^\.\//, '');
    
    // 处理 glob 模式（支持 ** 通配符）
    if (normalizedPath.includes('**')) {
      const basePath = normalizedPath.split('**')[0].replace(/\/$/, '');
      const baseDir = path.join(tempDir, basePath);
      
      if (fs.existsSync(baseDir) && fs.statSync(baseDir).isDirectory()) {
        this.copyDirContents(baseDir, dest);
      }
    } else {
      // 直接路径
      const source = path.join(tempDir, normalizedPath);
      if (fs.existsSync(source)) {
        if (fs.statSync(source).isDirectory()) {
          this.copyDirContents(source, dest);
        } else {
          fs.mkdirSync(dest, { recursive: true });
          const fileName = path.basename(source);
          fs.copyFileSync(source, path.join(dest, fileName));
        }
      } else {
        console.warn(`警告: 模板路径不存在: ${templatePath}`);
      }
    }
  }

  static copyDirContents(src, dst) {
    fs.mkdirSync(dst, { recursive: true });
    
    try {
      const entries = fs.readdirSync(src, { withFileTypes: true });

      for (const entry of entries) {
        // 跳过需要忽略的目录和文件
        if (this.shouldIgnore(entry.name)) {
          continue;
        }

        const srcPath = path.join(src, entry.name);
        const dstPath = path.join(dst, entry.name);

        try {
          if (entry.isDirectory()) {
            this.copyDirContents(srcPath, dstPath);
          } else {
            fs.copyFileSync(srcPath, dstPath);
          }
        } catch (error) {
          // 如果遇到权限错误或其他错误，记录警告但继续处理其他文件
          if (error.code === 'EPERM' || error.code === 'EACCES') {
            console.warn(`警告: 跳过文件 ${srcPath}（权限不足）`);
            continue;
          }
          // 其他错误也记录但继续
          console.warn(`警告: 复制文件 ${srcPath} 时出错: ${error.message}`);
        }
      }
    } catch (error) {
      // 如果读取目录失败，抛出错误
      if (error.code === 'EPERM' || error.code === 'EACCES') {
        throw new Error(`无法访问目录 ${src}（权限不足）`);
      }
      throw error;
    }
  }
}

module.exports = RepoManager;

