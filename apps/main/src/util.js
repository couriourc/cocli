const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
/**
 * 获取当前工作区
 * @returns {Object|null} 当前工作区对象，包含 name、path、config 属性
 * @returns {null} 如果当前目录没有 .qclrc 或 .qclocal，则返回 null
 */

function getCurrentDir() {
  const currentDir = process.env.INIT_CWD || process.cwd();
  const qclrcPath = path.join(currentDir, '.qclrc');
  const qclocalPath = path.join(currentDir, '.qclocal');
  console.warn('currentDir', currentDir);
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
 * 从当前工作区目录解析路径
 * @param {string} relativePath 相对路径
 * @returns {string} 解析后的路径
 */
function resolvePathFromCurrentDir(relativePath) {
  const currentDir = getCurrentDir();
  if (!currentDir) {
    throw new Error('当前目录不是工作区（未找到 .qclrc 文件）');
  }
  return path.resolve(currentDir.path, relativePath);
}
module.exports = {
  getCurrentDir,
  resolvePathFromCurrentDir
}
