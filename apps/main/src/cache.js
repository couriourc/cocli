const fs = require('fs');
const path = require('path');
const os = require('os');
const yaml = require('js-yaml');
const RepoManager = require('./repo');

/**
 * 离线缓存管理器（对标 shadcn 的无网络依赖特性）
 * 首次使用缓存模板/插件，断网时自动使用本地缓存
 */
class CacheManager {
  static getCacheDir() {
    const cacheBase = path.join(os.homedir(), '.cocli', 'cache');
    return cacheBase;
  }

  /**
   * 获取模板项的缓存路径
   */
  static getItemCachePath(itemName, version = 'latest', repoUrl) {
    const cacheDir = this.getCacheDir();
    // 使用仓库 URL 的哈希作为目录名，避免路径问题
    const repoHash = this.hashString(repoUrl);
    const versionDir = version === 'latest' ? 'latest' : version;
    return path.join(cacheDir, repoHash, 'atomic', itemName, versionDir);
  }

  /**
   * 检查模板项是否已缓存
   */
  static isItemCached(itemName, version, repoUrl) {
    const cachePath = this.getItemCachePath(itemName, version, repoUrl);
    return fs.existsSync(cachePath) && fs.existsSync(path.join(cachePath, 'meta.json'));
  }

  /**
   * 缓存模板项
   */
  static async cacheItem(itemName, itemConfig, repoUrl, repoConfig, globalConfig) {
    const cachePath = this.getItemCachePath(itemName, itemConfig.version || 'latest', repoUrl);
    fs.mkdirSync(cachePath, { recursive: true });

    // 下载模板文件到缓存目录
    try {
      const rootPaths = Array.isArray(itemConfig.root) ? itemConfig.root : [itemConfig.root];
      await RepoManager.downloadTemplate(
        repoUrl,
        rootPaths,
        cachePath,
        repoConfig,
        globalConfig
      );

      // 保存元数据
      const metaPath = path.join(cachePath, 'meta.json');
      fs.writeFileSync(metaPath, JSON.stringify({
        name: itemName,
        version: itemConfig.version || 'latest',
        repoUrl,
        cachedAt: new Date().toISOString(),
        config: itemConfig,
      }, null, 2));

      console.log(`💾 已缓存: ${itemName}@${itemConfig.version || 'latest'}`);
    } catch (error) {
      // 如果下载失败，清理缓存目录
      if (fs.existsSync(cachePath)) {
        fs.rmSync(cachePath, { recursive: true, force: true });
      }
      throw error;
    }
  }

  /**
   * 从缓存加载模板项
   */
  static loadItemFromCache(itemName, version, repoUrl) {
    const cachePath = this.getItemCachePath(itemName, version, repoUrl);
    const metaPath = path.join(cachePath, 'meta.json');

    if (!fs.existsSync(metaPath)) {
      return null;
    }

    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      return {
        cachePath,
        meta,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * 从缓存复制到项目
   */
  static copyFromCache(cachePath, targetPath) {
    if (!fs.existsSync(cachePath)) {
      throw new Error('缓存路径不存在');
    }

    this.copyDirRecursive(cachePath, targetPath, ['meta.json']); // 排除 meta.json
  }

  /**
   * 清理过期缓存（超过30天的缓存）
   */
  static cleanExpiredCache() {
    const cacheDir = this.getCacheDir();
    if (!fs.existsSync(cacheDir)) {
      return;
    }

    const now = Date.now();
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30天

    this.cleanDir(cacheDir, now, maxAge);
  }

  /**
   * 清理目录中的过期文件
   */
  static cleanDir(dir, now, maxAge) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const entryPath = path.join(dir, entry.name);
        const stat = fs.statSync(entryPath);

        if (entry.isDirectory()) {
          this.cleanDir(entryPath, now, maxAge);
          // 如果目录为空，删除它
          try {
            const remaining = fs.readdirSync(entryPath);
            if (remaining.length === 0) {
              fs.rmdirSync(entryPath);
            }
          } catch (error) {
            // 忽略错误
          }
        } else if (entry.isFile()) {
          if (now - stat.mtimeMs > maxAge) {
            fs.unlinkSync(entryPath);
          }
        }
      }
    } catch (error) {
      // 忽略错误
    }
  }

  /**
   * 复制目录（递归）
   */
  static copyDirRecursive(src, dst, exclude = []) {
    fs.mkdirSync(dst, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      if (exclude.includes(entry.name)) {
        continue;
      }

      const srcPath = path.join(src, entry.name);
      const dstPath = path.join(dst, entry.name);

      if (entry.isDirectory()) {
        this.copyDirRecursive(srcPath, dstPath, exclude);
      } else {
        fs.copyFileSync(srcPath, dstPath);
      }
    }
  }

  /**
   * 字符串哈希（简单实现）
   */
  static hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

module.exports = CacheManager;

