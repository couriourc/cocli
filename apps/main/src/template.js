const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const RepoManager = require('./repo');
const { Config } = require('./config');

class TemplateManager {
  static async create(templateName, addons, projectName, config) {
    if (!config) {
      throw new Error('未找到配置文件，请先配置 .qclrc 或 .qcl.yaml');
    }

    // 查找模板
    let foundTemplate = null;
    let repoUrl = null;
    let repoConfig = null;

    for (const repo of config.repos) {
      const url = this.getRepoUrl(repo);
      if (!url) {
        console.warn('警告: 仓库配置缺少 URL，跳过');
        continue;
      }

      try {
        const meta = await RepoManager.fetchMeta(url, repo, config);
        if (meta.templates && meta.templates[templateName]) {
          foundTemplate = meta.templates[templateName];
          repoUrl = url;
          repoConfig = repo;
          break;
        }
      } catch (error) {
        console.warn(`警告: 无法从 ${url} 获取元数据: ${error.message}`);
        continue;
      }
    }

    if (!foundTemplate) {
      throw new Error(`❌ 未找到模板: ${templateName}\n\n💡 提示: 使用 \`cocli template list\` 查看所有可用模板`);
    }

    // 获取模板路径
    const templatePaths = Array.isArray(foundTemplate.root)
      ? foundTemplate.root
      : [foundTemplate.root];

    // 创建项目目录
    const projectPath = path.resolve(projectName);
    if (fs.existsSync(projectPath)) {
      throw new Error(`目录已存在: ${projectName}`);
    }
    fs.mkdirSync(projectPath, { recursive: true });

    // 下载模板
    console.log(`正在下载模板 ${templateName}...`);
    await RepoManager.downloadTemplate(
      repoUrl,
      templatePaths,
      projectPath,
      repoConfig,
      config
    );

    // 检查是否需要设置 plop（重新获取 meta 以包含完整配置）
    try {
      const meta = await RepoManager.fetchMeta(repoUrl, repoConfig, config);
      if (meta.plop && meta.plop.enabled) {
        await this.setupPlop(projectPath, repoUrl, repoConfig, config, meta.plop);
      } else if (foundTemplate.plop) {
        // 模板级别的 plop 配置
        await this.setupPlop(projectPath, repoUrl, repoConfig, config, {
          plopfile: foundTemplate.plopfile || 'plopfile.js',
        });
      }
    } catch (error) {
      console.warn(`警告: 设置 plop 时出错: ${error.message}`);
    }

    // 处理 addons
    if (addons && addons.length > 0) {
      console.log('正在处理 addons...');
      
      const addonsBaseDir = path.join(projectPath, 'addons');
      fs.mkdirSync(addonsBaseDir, { recursive: true });
      
      const meta = await RepoManager.fetchMeta(repoUrl, repoConfig, config);
      
      if (meta.addons) {
        // 支持新的格式：addons.root 和 addons.target_dir
        if (meta.addons.root && !meta.addons[Object.keys(meta.addons)[0]]?.root) {
          // 新格式：addons 有 root 和 target_dir
          const addonsRoot = meta.addons.root;
          
          // 从 addons.root 目录中查找每个 addon
          for (const addonName of addons) {
            const addonPath = addonsRoot.replace(/\/$/, '') + '/' + addonName;
            const addonTargetDir = path.join(addonsBaseDir, addonName);
            
            console.log(`正在下载 addon ${addonName} 到 ${addonTargetDir}...`);
            await RepoManager.downloadTemplate(
              repoUrl,
              [`${addonPath}/**`],
              addonTargetDir,
              repoConfig,
              config
            );
          }
        } else {
          // 旧格式：addons 是一个 map
          for (const addonName of addons) {
            const addon = meta.addons[addonName];
            if (addon) {
              const addonPaths = Array.isArray(addon.root)
                ? addon.root
                : [addon.root];
              
              const addonTargetDir = path.join(addonsBaseDir, addonName);
              
              console.log(`正在下载 addon ${addonName} 到 ${addonTargetDir}...`);
              await RepoManager.downloadTemplate(
                repoUrl,
                addonPaths,
                addonTargetDir,
                repoConfig,
                config
              );
            } else {
              console.warn(`警告: 未找到 addon: ${addonName}`);
            }
          }
        }
      } else {
        console.warn('警告: 仓库中未定义 addons');
      }
    }

    // 创建或更新 .qclocal 文件
    await this.createOrUpdateQclocal(
      projectPath,
      projectName,
      templateName,
      addons || [],
      [repoConfig]
    );

    console.log(`✅ 项目 ${projectName} 创建成功！`);
    console.log(`💡 提示: 使用 \`cd ${projectName}\` 进入项目目录`);
    if (addons && addons.length > 0) {
      console.log('💡 提示: 使用 `cocli addons list` 查看所有可用插件');
    }
  }

  static async createOrUpdateQclocal(projectPath, projectName, templateName, initialAddons, repos) {
    const qclocalPath = path.join(projectPath, '.qclocal');
    
    if (fs.existsSync(qclocalPath)) {
      const content = fs.readFileSync(qclocalPath, 'utf8');
      const qclocal = yaml.load(content);
      
      if (!qclocal.project) {
        qclocal.project = projectName;
      }
      
      if (repos) {
        qclocal.repos = repos;
      }
      
      // 合并初始 addons 到 include 列表
      if (!qclocal.addons) {
        qclocal.addons = { target_dir: './addons', include: [] };
      }
      if (!qclocal.addons.include) {
        qclocal.addons.include = [];
      }
      
      for (const addon of initialAddons) {
        if (!qclocal.addons.include.includes(addon)) {
          qclocal.addons.include.push(addon);
        }
      }
      
      fs.writeFileSync(qclocalPath, yaml.dump(qclocal), 'utf8');
    } else {
      const qclocal = {
        project: projectName,
        template: templateName,
        addons: {
          target_dir: './addons',
          include: initialAddons,
        },
        repos,
        inherit: false,
      };
      
      fs.writeFileSync(qclocalPath, yaml.dump(qclocal), 'utf8');
    }
  }

  static async listTemplates(config) {
    // 优先使用用户执行命令时的实际工作目录（pnpm 会设置 INIT_CWD）
    const currentDir = process.env.INIT_CWD || process.cwd();
    const { repos, config: configForAuth } = Config.loadWithPriority(currentDir);

    const allTemplates = new Set();

    for (const repo of repos) {
      const url = this.getRepoUrl(repo);
      if (!url) {
        console.warn('警告: 仓库配置缺少 URL，跳过');
        continue;
      }

      try {
        const meta = await RepoManager.fetchMeta(url, repo, configForAuth);
        if (meta.templates) {
          for (const templateName of Object.keys(meta.templates)) {
            allTemplates.add(templateName);
          }
        }
      } catch (error) {
        console.warn(`警告: 无法从 ${url} 获取元数据: ${error.message}`);
        continue;
      }
    }

    if (allTemplates.size === 0) {
      console.log('未找到任何模板');
    } else {
      console.log('可用的模板:');
      const sortedTemplates = Array.from(allTemplates).sort();
      for (const template of sortedTemplates) {
        console.log(`  - ${template}`);
      }
    }
  }

  static async listAddons(config, verbose) {
    // 优先使用用户执行命令时的实际工作目录（pnpm 会设置 INIT_CWD）
    const currentDir = process.env.INIT_CWD || process.cwd();
    const { repos, config: configForAuth } = Config.loadWithPriority(currentDir);

    if (verbose) {
      const addonDetails = [];

      for (const repo of repos) {
        const url = this.getRepoUrl(repo);
        if (!url) {
          console.warn('警告: 仓库配置缺少 URL，跳过');
          continue;
        }

        try {
          const meta = await RepoManager.fetchMeta(url, repo, configForAuth);
          if (meta.addons) {
            // 支持新的格式：addons.root 和 addons.target_dir
            if (meta.addons.root && !meta.addons[Object.keys(meta.addons)[0]]?.root) {
              // 新格式：从 addons.root 目录中扫描 addons
              const addonsRoot = meta.addons.root;
              // 这里需要扫描目录，暂时跳过详细模式
              console.warn('警告: 新格式的 addons 在详细模式下暂不支持列出所有 addons');
            } else {
              // 旧格式：addons 是一个 map
              for (const [addonName, addonConfig] of Object.entries(meta.addons)) {
                addonDetails.push({ addonName, repoUrl: url, addonConfig });
              }
            }
          }
        } catch (error) {
          console.warn(`警告: 无法从 ${url} 获取元数据: ${error.message}`);
          continue;
        }
      }

      if (addonDetails.length === 0) {
        console.log('未找到任何 addons');
      } else {
        addonDetails.sort((a, b) => a.addonName.localeCompare(b.addonName));
        
        console.log('可用的 addons (详细信息):\n');
        for (const { addonName, repoUrl, addonConfig } of addonDetails) {
          console.log(addonName);
          console.log(`  来源: ${repoUrl}`);
          console.log('  路径配置:');
          const paths = Array.isArray(addonConfig.root) ? addonConfig.root : [addonConfig.root];
          for (const p of paths) {
            console.log(`    - ${p}`);
          }
          
          // 尝试读取 README.md
          const basePath = paths[0].replace(/\/\*\*$/, '').replace(/\/\*$/, '');
          const readmePath = `${basePath}/README.md`;
          
          try {
            const readmeContent = await RepoManager.readFileFromRepo(repoUrl, readmePath, repo, configForAuth);
            if (readmeContent) {
              const lines = readmeContent.split('\n').filter(l => l.trim()).slice(0, 10);
              if (lines.length > 0) {
                console.log('  详细信息:');
                for (const line of lines) {
                  console.log(`    ${line}`);
                }
              }
            }
          } catch (error) {
            // 忽略错误
          }
          
          console.log();
        }
        console.log(`共找到 ${addonDetails.length} 个 addons`);
      }
    } else {
      const allAddons = new Set();

      for (const repo of repos) {
        const url = this.getRepoUrl(repo);
        if (!url) {
          console.warn('警告: 仓库配置缺少 URL，跳过');
          continue;
        }

        try {
          const meta = await RepoManager.fetchMeta(url, repo, configForAuth);
          if (meta.addons) {
            // 支持新的格式：addons.root 和 addons.target_dir
            if (meta.addons.root && !meta.addons[Object.keys(meta.addons)[0]]?.root) {
              // 新格式：从 addons.root 目录中扫描 addons
              // 这里需要实际扫描目录，暂时跳过
              console.warn('警告: 新格式的 addons 暂不支持列出所有 addons');
            } else {
              // 旧格式：addons 是一个 map
              for (const addonName of Object.keys(meta.addons)) {
                allAddons.add(addonName);
              }
            }
          }
        } catch (error) {
          console.warn(`警告: 无法从 ${url} 获取元数据: ${error.message}`);
          continue;
        }
      }

      if (allAddons.size === 0) {
        console.log('未找到任何 addons');
      } else {
        console.log('可用的 addons:');
        const sortedAddons = Array.from(allAddons).sort();
        for (const addon of sortedAddons) {
          console.log(`  - ${addon}`);
        }
      }
    }
  }

  static async detailAddon(config, addonName) {
    const currentDir = process.cwd();
    const { repos, config: configForAuth } = Config.loadWithPriority(currentDir);

    let foundAddon = null;
    let repoUrl = null;

    for (const repo of repos) {
      const url = this.getRepoUrl(repo);
      if (!url) {
        console.warn('警告: 仓库配置缺少 URL，跳过');
        continue;
      }

      try {
        const meta = await RepoManager.fetchMeta(url, repo, configForAuth);
        if (meta.addons) {
          // 支持新的格式：addons.root 和 addons.target_dir
          if (meta.addons.root && !meta.addons[Object.keys(meta.addons)[0]]?.root) {
            // 新格式：从 addons.root 目录中查找 addon
            const addonsRoot = meta.addons.root;
            foundAddon = {
              root: `${addonsRoot.replace(/\/$/, '')}/${addonName}/**`,
            };
            repoUrl = url;
            break;
          } else if (meta.addons[addonName]) {
            // 旧格式：addons 是一个 map
            foundAddon = meta.addons[addonName];
            repoUrl = url;
            break;
          }
        }
      } catch (error) {
        console.warn(`警告: 无法从 ${url} 获取元数据: ${error.message}`);
        continue;
      }
    }

    if (!foundAddon) {
      throw new Error(`❌ 未找到 addon: ${addonName}\n\n💡 提示: 使用 \`cocli addons list\` 查看所有可用插件`);
    }

    console.log(addonName);
    console.log(`  来源: ${repoUrl}`);
    console.log('  路径配置:');
    const paths = Array.isArray(foundAddon.root) ? foundAddon.root : [foundAddon.root];
    for (const p of paths) {
      console.log(`    - ${p}`);
    }

    // 尝试读取 README.md
    const basePath = paths[0].replace(/\/\*\*$/, '').replace(/\/\*$/, '');
    const readmePath = `${basePath}/README.md`;
    
    // 查找对应的 repo 配置
    const repo = repos.find(r => {
      const url = this.getRepoUrl(r);
      return url === repoUrl;
    });
    
    if (repo) {
      try {
        const readmeContent = await RepoManager.readFileFromRepo(repoUrl, readmePath, repo, configForAuth);
        if (readmeContent) {
          console.log('  详细信息:');
          const lines = readmeContent.split('\n');
          for (const line of lines) {
            console.log(`    ${line}`);
          }
        }
      } catch (error) {
        console.log('  详细信息: 暂无详细信息');
      }
    } else {
      console.log('  详细信息: 暂无详细信息');
    }
  }

  static getRepoUrl(repo) {
    if (repo.local) return repo.local.url;
    if (repo.github) return repo.github.repo;
    if (repo.gitlab) return repo.gitlab.repo;
    if (repo.ftp) return repo.ftp.url;
    return null;
  }

  static async setupPlop(projectPath, repoUrl, repoConfig, config, plopConfig) {
    const plopfile = plopConfig.plopfile || 'plopfile.js';
    
    console.log('正在设置 plop...');
    
    // 从仓库中读取 plopfile.js
    const tempDir = await RepoManager.syncRepo(repoUrl, repoConfig, config);
    
    try {
      const plopfilePath = path.join(tempDir, plopfile);
      if (fs.existsSync(plopfilePath)) {
        // 复制 plopfile.js 到项目根目录
        fs.copyFileSync(plopfilePath, path.join(projectPath, plopfile));
        console.log(`✅ 已复制 ${plopfile}`);
        
        // 检查是否有 templates 目录需要复制
        const templatesDir = path.join(tempDir, 'templates');
        if (fs.existsSync(templatesDir) && fs.statSync(templatesDir).isDirectory()) {
          const projectTemplatesDir = path.join(projectPath, 'templates');
          if (!fs.existsSync(projectTemplatesDir)) {
            this.copyDirRecursive(templatesDir, projectTemplatesDir);
            console.log('✅ 已复制 templates 目录');
          }
        }
        
        // 更新 package.json，添加 plop 依赖和脚本
        await this.updatePackageJsonForPlop(projectPath);
      } else {
        console.warn(`警告: 未找到 ${plopfile}，跳过 plop 设置`);
      }
    } finally {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  }

  static copyDirRecursive(src, dst) {
    fs.mkdirSync(dst, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const dstPath = path.join(dst, entry.name);

      if (entry.isDirectory()) {
        this.copyDirRecursive(srcPath, dstPath);
      } else {
        fs.copyFileSync(srcPath, dstPath);
      }
    }
  }

  static async updatePackageJsonForPlop(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      // 如果不存在 package.json，创建一个基本的
      const packageJson = {
        name: path.basename(projectPath),
        version: '0.1.0',
        scripts: {
          g: 'plop',
          generate: 'plop',
        },
        devDependencies: {
          plop: '^4.0.5',
        },
      };
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('✅ 已创建 package.json 并添加 plop 配置');
    } else {
      // 更新现有的 package.json
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }
      if (!packageJson.scripts.g) {
        packageJson.scripts.g = 'plop';
      }
      if (!packageJson.scripts.generate) {
        packageJson.scripts.generate = 'plop';
      }
      
      if (!packageJson.devDependencies) {
        packageJson.devDependencies = {};
      }
      if (!packageJson.devDependencies.plop) {
        packageJson.devDependencies.plop = '^4.0.5';
      }
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('✅ 已更新 package.json 添加 plop 配置');
    }
  }

  static async runPlop(projectPath, generator) {
    const plopfilePath = path.join(projectPath, 'plopfile.js');
    
    if (!fs.existsSync(plopfilePath)) {
      throw new Error('未找到 plopfile.js，请确保项目已配置 plop');
    }

    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    try {
      // 检查是否安装了 plop
      await execAsync('npm list plop', { cwd: projectPath }).catch(() => {
        throw new Error('plop 未安装，请先运行: npm install 或 pnpm install');
      });

      // 运行 plop
      const command = generator 
        ? `npx plop ${generator}`
        : 'npx plop';
      
      console.log(`正在运行 plop${generator ? ` ${generator}` : ''}...`);
      const { stdout, stderr } = await execAsync(command, {
        cwd: projectPath,
        stdio: 'inherit',
      });
      
      if (stderr && !stderr.includes('plop')) {
        console.error(stderr);
      }
    } catch (error) {
      throw new Error(`运行 plop 失败: ${error.message}`);
    }
  }
}

module.exports = TemplateManager;

