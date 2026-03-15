const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const RepoManager = require('./repo');
const { Config } = require('./config');
const CacheManager = require('./cache');

/**
 * 原子化模板管理器（对标 shadcn 的组件按需添加）
 * 支持按需添加/移除单个模板片段，而非全量模板
 */
class AtomicTemplateManager {
  /**
   * 添加原子化模板片段到项目
   * @param {string} itemName - 模板项名称（如 'button', 'api-module'）
   * @param {string} projectPath - 项目路径
   * @param {Object} options - 选项 { version, interactive, force }
   */
  static async add(itemName, projectPath = '.', options = {}) {
    const { repos, config: configForAuth } = Config.loadWithPriority();
    const resolvedPath = path.resolve(projectPath);
    
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`项目目录不存在: ${resolvedPath}`);
    }

    // 查找原子化模板
    const atomicItem = await this.findAtomicItem(itemName, repos, configForAuth, options.version);
    
    if (!atomicItem) {
      // 尝试模糊搜索
      const suggestions = await this.fuzzySearch(itemName, repos, configForAuth);
      if (suggestions.length > 0) {
        throw new Error(
          `❌ 未找到模板项: ${itemName}\n\n` +
          `💡 相似项:\n${suggestions.map(s => `  - ${s}`).join('\n')}\n\n` +
          `💡 提示: 使用 \`cocli list\` 查看所有可用项`
        );
      }
      throw new Error(`❌ 未找到模板项: ${itemName}`);
    }

    // 解析依赖
    const dependencies = await this.resolveDependencies(atomicItem, repos, configForAuth);
    
    // 检查是否已存在
    if (!options.force && this.isItemInstalled(itemName, resolvedPath, atomicItem)) {
      throw new Error(`模板项 ${itemName} 已存在，使用 --force 强制覆盖`);
    }

    // 安装依赖项
    for (const dep of dependencies) {
      if (!this.isItemInstalled(dep.name, resolvedPath, dep)) {
        console.log(`📦 安装依赖: ${dep.name}`);
        await this.installItem(dep, resolvedPath, repos, configForAuth);
      }
    }

    // 安装主项
    console.log(`✨ 添加 ${itemName}...`);
    await this.installItem(atomicItem, resolvedPath, repos, configForAuth);

    // 更新项目配置
    await this.updateProjectConfig(resolvedPath, itemName, atomicItem, 'add');

    console.log(`✅ ${itemName} 添加成功！`);
  }

  /**
   * 移除原子化模板片段
   * @param {string} itemName - 模板项名称
   * @param {string} projectPath - 项目路径
   */
  static async remove(itemName, projectPath = '.') {
    const resolvedPath = path.resolve(projectPath);
    
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`项目目录不存在: ${resolvedPath}`);
    }

    // 读取项目配置
    const projectConfig = this.loadProjectConfig(resolvedPath);
    if (!projectConfig || !projectConfig.items || !projectConfig.items.includes(itemName)) {
      throw new Error(`模板项 ${itemName} 未安装`);
    }

    // 查找模板配置以确定要删除的文件
    const { repos, config: configForAuth } = Config.loadWithPriority();
    const atomicItem = await this.findAtomicItem(itemName, repos, configForAuth);
    
    if (atomicItem) {
      await this.uninstallItem(atomicItem, resolvedPath);
    }

    // 更新项目配置
    await this.updateProjectConfig(resolvedPath, itemName, null, 'remove');

    console.log(`✅ ${itemName} 已移除！`);
  }

  /**
   * 列出所有可用的原子化模板项
   * @param {string} type - 类型过滤（'component', 'module', 'template' 等）
   */
  static async list(type = null) {
    const { repos, config: configForAuth } = Config.loadWithPriority();
    const allItems = new Map();

    for (const repo of repos) {
      const url = this.getRepoUrl(repo);
      if (!url) continue;

      try {
        const meta = await RepoManager.fetchMeta(url, repo, configForAuth);
        
        // 支持新的原子化格式
        if (meta.atomic) {
          for (const [itemName, itemConfig] of Object.entries(meta.atomic)) {
            if (type && itemConfig.type !== type) continue;
            
            if (!allItems.has(itemName)) {
              allItems.set(itemName, {
                name: itemName,
                type: itemConfig.type || 'template',
                description: itemConfig.description || '',
                version: itemConfig.version || 'latest',
                repo: url,
              });
            }
          }
        }

        // 兼容旧格式：templates 和 addons 也可以作为原子化项
        if (meta.templates) {
          for (const [itemName, itemConfig] of Object.entries(meta.templates)) {
            if (type && type !== 'template') continue;
            
            if (!allItems.has(itemName)) {
              allItems.set(itemName, {
                name: itemName,
                type: 'template',
                description: itemConfig.description || '',
                version: itemConfig.version || 'latest',
                repo: url,
              });
            }
          }
        }

        if (meta.addons) {
          for (const [itemName, itemConfig] of Object.entries(meta.addons)) {
            if (type && type !== 'addon') continue;
            
            if (!allItems.has(itemName)) {
              allItems.set(itemName, {
                name: itemName,
                type: 'addon',
                description: itemConfig.description || '',
                version: itemConfig.version || 'latest',
                repo: url,
              });
            }
          }
        }
      } catch (error) {
        console.warn(`警告: 无法从 ${url} 获取元数据: ${error.message}`);
      }
    }

    if (allItems.size === 0) {
      console.log('未找到任何可用项');
      return;
    }

    // 按类型分组显示
    const itemsByType = new Map();
    for (const item of allItems.values()) {
      if (!itemsByType.has(item.type)) {
        itemsByType.set(item.type, []);
      }
      itemsByType.get(item.type).push(item);
    }

    console.log('可用的模板项:\n');
    for (const [itemType, items] of itemsByType.entries()) {
      console.log(`${itemType}:`);
      items.sort((a, b) => a.name.localeCompare(b.name));
      for (const item of items) {
        const desc = item.description ? ` - ${item.description}` : '';
        console.log(`  - ${item.name}${desc}`);
      }
      console.log();
    }
  }

  /**
   * 查找原子化模板项
   */
  static async findAtomicItem(itemName, repos, configForAuth, version = null) {
    for (const repo of repos) {
      const url = this.getRepoUrl(repo);
      if (!url) continue;

      try {
        const meta = await RepoManager.fetchMeta(url, repo, configForAuth);
        
        // 优先查找 atomic 配置
        if (meta.atomic && meta.atomic[itemName]) {
          const item = meta.atomic[itemName];
          // 版本检查
          if (version && item.version !== version) {
            continue;
          }
          return {
            name: itemName,
            type: item.type || 'template',
            root: item.root,
            dependencies: item.dependencies || [],
            target: item.target || null,
            version: item.version || 'latest',
            repoUrl: url,
            repoConfig: repo,
          };
        }

        // 兼容旧格式
        if (meta.templates && meta.templates[itemName]) {
          const item = meta.templates[itemName];
          return {
            name: itemName,
            type: 'template',
            root: item.root,
            dependencies: item.dependencies || [],
            target: null,
            version: item.version || 'latest',
            repoUrl: url,
            repoConfig: repo,
          };
        }

        if (meta.addons && meta.addons[itemName]) {
          const item = meta.addons[itemName];
          return {
            name: itemName,
            type: 'addon',
            root: item.root,
            dependencies: item.dependencies || [],
            target: item.target || null,
            version: item.version || 'latest',
            repoUrl: url,
            repoConfig: repo,
          };
        }
      } catch (error) {
        continue;
      }
    }

    return null;
  }

  /**
   * 模糊搜索相似项
   */
  static async fuzzySearch(query, repos, configForAuth) {
    const suggestions = [];
    const queryLower = query.toLowerCase();

    for (const repo of repos) {
      const url = this.getRepoUrl(repo);
      if (!url) continue;

      try {
        const meta = await RepoManager.fetchMeta(url, repo, configForAuth);
        
        const allItems = [
          ...(meta.atomic ? Object.keys(meta.atomic) : []),
          ...(meta.templates ? Object.keys(meta.templates) : []),
          ...(meta.addons ? Object.keys(meta.addons) : []),
        ];

        for (const itemName of allItems) {
          if (itemName.toLowerCase().includes(queryLower) && !suggestions.includes(itemName)) {
            suggestions.push(itemName);
          }
        }
      } catch (error) {
        continue;
      }
    }

    return suggestions.slice(0, 5); // 返回前5个
  }

  /**
   * 解析依赖项
   */
  static async resolveDependencies(item, repos, configForAuth, visited = new Set()) {
    if (visited.has(item.name)) {
      return []; // 避免循环依赖
    }
    visited.add(item.name);

    const dependencies = [];
    
    for (const depName of item.dependencies || []) {
      const dep = await this.findAtomicItem(depName, repos, configForAuth);
      if (dep) {
        dependencies.push(dep);
        // 递归解析依赖的依赖
        const subDeps = await this.resolveDependencies(dep, repos, configForAuth, visited);
        dependencies.push(...subDeps);
      }
    }

    return dependencies;
  }

  /**
   * 检查项是否已安装
   */
  static isItemInstalled(itemName, projectPath, itemConfig) {
    const projectConfig = this.loadProjectConfig(projectPath);
    return projectConfig && projectConfig.items && projectConfig.items.includes(itemName);
  }

  /**
   * 安装模板项（支持离线缓存）
   */
  static async installItem(item, projectPath, repos, configForAuth) {
    const targetPath = item.target 
      ? path.join(projectPath, item.target)
      : projectPath;

    // 尝试从缓存加载
    const cached = CacheManager.loadItemFromCache(
      item.name,
      item.version,
      item.repoUrl
    );

    if (cached) {
      console.log(`📦 从缓存加载: ${item.name}@${item.version}`);
      CacheManager.copyFromCache(cached.cachePath, targetPath);
    } else {
      // 从仓库下载并缓存
      try {
        const rootPaths = Array.isArray(item.root) ? item.root : [item.root];
        
        await RepoManager.downloadTemplate(
          item.repoUrl,
          rootPaths,
          targetPath,
          item.repoConfig,
          configForAuth
        );

        // 缓存模板项
        await CacheManager.cacheItem(
          item.name,
          item,
          item.repoUrl,
          item.repoConfig,
          configForAuth
        );
      } catch (error) {
        // 如果下载失败，尝试使用缓存
        const fallbackCache = CacheManager.loadItemFromCache(
          item.name,
          'latest',
          item.repoUrl
        );
        if (fallbackCache) {
          console.log(`⚠️  网络错误，使用缓存: ${item.name}`);
          CacheManager.copyFromCache(fallbackCache.cachePath, targetPath);
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * 卸载模板项
   */
  static async uninstallItem(item, projectPath) {
    // 这里需要根据 item.root 配置删除对应文件
    // 简化实现：只更新配置，实际文件删除由用户手动处理
    // 或者可以读取 item.root 的文件列表并删除
    console.log(`🗑️  移除 ${item.name} 的文件...`);
    // TODO: 实现文件删除逻辑
  }

  /**
   * 更新项目配置
   */
  static async updateProjectConfig(projectPath, itemName, itemConfig, action) {
    const configPath = path.join(projectPath, 'cocli.json');
    let config = { items: [] };

    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(content);
        if (!config.items) {
          config.items = [];
        }
      } catch (error) {
        config = { items: [] };
      }
    }

    if (action === 'add') {
      if (!config.items.includes(itemName)) {
        config.items.push(itemName);
      }
    } else if (action === 'remove') {
      config.items = config.items.filter(name => name !== itemName);
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  }

  /**
   * 加载项目配置
   */
  static loadProjectConfig(projectPath) {
    const configPath = path.join(projectPath, 'cocli.json');
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(content);
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  /**
   * 获取仓库 URL
   */
  static getRepoUrl(repo) {
    if (repo.local) return repo.local.url;
    if (repo.github) return repo.github.repo;
    if (repo.gitlab) return repo.gitlab.repo;
    if (repo.ftp) return repo.ftp.url;
    return null;
  }
}

module.exports = AtomicTemplateManager;

