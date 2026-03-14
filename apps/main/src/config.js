const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const os = require('os');

class Config {
  constructor() {
    this.username = null;
    this.password = null;
    this.token = null;
    this.proxy = null;
    this.repos = [];
    this.ai = null;
    this.workspace = null;
  }

  static load() {
    // 优先使用用户执行命令时的实际工作目录（pnpm 会设置 INIT_CWD）
    const currentDir = process.env.INIT_CWD || process.cwd();
    const homeDir = os.homedir();

    const paths = [
      path.join(currentDir, '.qclrc'),
      path.join(currentDir, '.qcl.yaml'),
      path.join(currentDir, '.qcl.yml'),
      path.join(homeDir, '.qclrc'),
      path.join(homeDir, '.qcl.yaml'),
      path.join(homeDir, '.qcl.yml'),
    ];

    for (const configPath of paths) {
      if (fs.existsSync(configPath)) {
        try {
          const content = fs.readFileSync(configPath, 'utf8');
          const config = yaml.load(content);
          return new Config().fromObject(config);
        } catch (error) {
          throw new Error(`解析配置文件失败 ${configPath}: ${error.message}`);
        }
      }
    }

    return null;
  }

  static loadFromParent(startDir) {
    let current = path.resolve(startDir);

    while (current !== path.dirname(current)) {
      const paths = [
        path.join(current, '.qclrc'),
        path.join(current, '.qcl.yaml'),
        path.join(current, '.qcl.yml'),
      ];

      for (const configPath of paths) {
        if (fs.existsSync(configPath)) {
          try {
            const content = fs.readFileSync(configPath, 'utf8');
            const config = yaml.load(content);
            return new Config().fromObject(config);
          } catch (error) {
            // 继续查找
          }
        }
      }

      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }

    return null;
  }

  static loadQclocal(dir) {
    const qclocalPath = path.join(dir, '.qclocal');
    if (fs.existsSync(qclocalPath)) {
      try {
        const content = fs.readFileSync(qclocalPath, 'utf8');
        return yaml.load(content);
      } catch (error) {
        throw new Error(`解析 .qclocal 文件失败: ${error.message}`);
      }
    }
    return null;
  }

  static loadQclocalFromDir(dir) {
    const qclocal = Config.loadQclocal(dir);
    if (!qclocal) return null;

    // 如果设置了 inherit 且 repos 为空，从父级目录继承
    if (qclocal.inherit && (!qclocal.repos || qclocal.repos.length === 0)) {
      const parentConfig = Config.loadFromParent(dir);
      if (parentConfig) {
        qclocal.repos = parentConfig.repos;
      }
    }

    return qclocal;
  }

  static loadWithPriority(dir) {
    // 优先使用用户执行命令时的实际工作目录（pnpm 会设置 INIT_CWD）
    const currentDir = dir || (process.env.INIT_CWD || process.cwd());

    // 1. 优先从应用级 .qclocal 读取
    const qclocal = Config.loadQclocalFromDir(currentDir);
    if (qclocal && qclocal.repos && qclocal.repos.length > 0) {
      const authConfig = Config.load() || new Config();
      return { repos: qclocal.repos, config: authConfig };
    }

    // 2. 尝试从工作区配置读取（当前目录的 .qclrc）
    const currentWorkspace = WorkspaceManagerConfig.getCurrent();
    if (currentWorkspace && currentWorkspace.config) {
      // 检查 repos 是否存在且是数组
      if (currentWorkspace.config.repos) {
        // 如果 repos 是数组，直接使用
        if (Array.isArray(currentWorkspace.config.repos) && currentWorkspace.config.repos.length > 0) {
          return { repos: currentWorkspace.config.repos, config: currentWorkspace.config };
        }
        // 如果 repos 是对象（旧格式），转换为数组
        if (typeof currentWorkspace.config.repos === 'object' && !Array.isArray(currentWorkspace.config.repos)) {
          const reposArray = Object.entries(currentWorkspace.config.repos).map(([key, value]) => {
            return { [key]: value };
          });
          if (reposArray.length > 0) {
            return { repos: reposArray, config: currentWorkspace.config };
          }
        }
      }
    }

    // 3. 从父级目录配置读取
    const parentConfig = Config.loadFromParent(currentDir);
    if (parentConfig && parentConfig.repos) {
      // 处理 repos 格式：如果是对象，转换为数组
      let repos = parentConfig.repos;
      if (typeof repos === 'object' && !Array.isArray(repos)) {
        repos = Object.entries(repos).map(([key, value]) => {
          return { [key]: value };
        });
      }
      if (Array.isArray(repos) && repos.length > 0) {
        return { repos: repos, config: parentConfig };
      }
    }

    // 4. 从全局配置读取
    const globalConfig = Config.load();
    if (!globalConfig) {
      throw new Error('未找到配置文件，请先配置 .qclrc 或 .qcl.yaml');
    }
    
    // 处理 repos 格式：如果是对象，转换为数组
    let repos = globalConfig.repos;
    if (repos && typeof repos === 'object' && !Array.isArray(repos)) {
      repos = Object.entries(repos).map(([key, value]) => {
        return { [key]: value };
      });
    }
    
    if (!repos || repos.length === 0) {
      throw new Error('配置文件中未找到 repos 配置');
    }
    
    return { repos: repos, config: globalConfig };
  }

  fromObject(obj) {
    if (obj.username) this.username = obj.username;
    if (obj.password) this.password = obj.password;
    if (obj.token) this.token = obj.token;
    if (obj.proxy) this.proxy = obj.proxy;
    if (obj.repos) this.repos = obj.repos;
    if (obj.ai) this.ai = obj.ai;
    if (obj.workspace) this.workspace = obj.workspace;
    return this;
  }

  getGlobalUsername() {
    return this.username;
  }

  getGlobalPassword() {
    return this.password;
  }

  getGlobalToken() {
    return this.token;
  }
}

class WorkspaceManagerConfig {
  /**
   * 扫描目录，查找所有工作区（包含 .qclrc 且不包含 .qclocal 的目录）
   */
  static scanWorkspaces(searchDir) {
    const workspaces = [];
    const dir = searchDir || (process.env.INIT_CWD || process.cwd());

    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
      return workspaces;
    }

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const workspacePath = path.join(dir, entry.name);
          const qclrcPath = path.join(workspacePath, '.qclrc');
          const qclocalPath = path.join(workspacePath, '.qclocal');
          
          // 如果存在 .qclrc 且不存在 .qclocal，则认为是工作区
          if (fs.existsSync(qclrcPath) && !fs.existsSync(qclocalPath)) {
            try {
              const content = fs.readFileSync(qclrcPath, 'utf8');
              const config = yaml.load(content);
              if (config.workspace) {
                workspaces.push({
                  name: config.workspace.name || entry.name,
                  path: workspacePath,
                  config: config,
                });
              }
            } catch (error) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      // 忽略读取错误
    }

    return workspaces;
  }

  /**
   * 获取当前工作区（通过检查当前目录的 .qclrc）
   */
  static getCurrent() {
    const currentDir = process.env.INIT_CWD || process.cwd();
    const qclrcPath = path.join(currentDir, '.qclrc');
    const qclocalPath = path.join(currentDir, '.qclocal');

    // 如果当前目录有 .qclrc 且没有 .qclocal，则认为是工作区
    if (fs.existsSync(qclrcPath) && !fs.existsSync(qclocalPath)) {
      try {
        const content = fs.readFileSync(qclrcPath, 'utf8');
        const config = yaml.load(content);
        if (config.workspace) {
          return {
            name: config.workspace.name || path.basename(currentDir),
            path: currentDir,
            config: config,
          };
        }
      } catch (error) {
        // 忽略解析错误
      }
    }

    return null;
  }

  /**
   * 查找指定名称的工作区
   */
  static findWorkspace(name, searchDir) {
    const workspaces = WorkspaceManagerConfig.scanWorkspaces(searchDir);
    return workspaces.find(w => w.name === name);
  }

  /**
   * 兼容性方法：load() 返回工作区列表和当前工作区
   */
  static load() {
    const searchDir = process.env.INIT_CWD || process.cwd();
    const workspaces = WorkspaceManagerConfig.scanWorkspaces(searchDir);
    const current = WorkspaceManagerConfig.getCurrent();

    return {
      workspaces: workspaces,
      current_workspace: current ? current.name : null,
      getCurrent: () => current, // 兼容性方法
    };
  }

  /**
   * 兼容性方法：addWorkspace() - 实际上不需要保存，因为工作区通过 .qclrc 文件识别
   */
  static addWorkspace(workspace) {
    // 工作区已经通过创建 .qclrc 文件来标识，不需要额外存储
    // 这个方法保留是为了兼容性，实际上不做任何事情
  }

  /**
   * 兼容性方法：setCurrent() - 实际上不需要，当前工作区通过当前目录的 .qclrc 判断
   */
  static setCurrent(name) {
    // 当前工作区通过当前目录的 .qclrc 文件自动识别，不需要设置
    // 这个方法保留是为了兼容性，实际上不做任何事情
    console.log(`提示: 当前工作区由当前目录的 .qclrc 文件自动识别`);
  }

  /**
   * 兼容性方法：removeWorkspace() - 删除工作区目录或 .qclrc 文件
   */
  static removeWorkspace(name) {
    const searchDir = process.env.INIT_CWD || process.cwd();
    const workspace = WorkspaceManagerConfig.findWorkspace(name, searchDir);
    
    if (!workspace) {
      throw new Error(`工作区 '${name}' 不存在`);
    }

    // 可以选择删除整个目录或只删除 .qclrc 文件
    // 这里我们只删除 .qclrc 文件，保留目录
    const qclrcPath = path.join(workspace.path, '.qclrc');
    if (fs.existsSync(qclrcPath)) {
      fs.unlinkSync(qclrcPath);
      console.log(`✅ 已删除工作区 '${name}' 的配置文件`);
    }
  }
}

module.exports = { Config, WorkspaceManagerConfig };

