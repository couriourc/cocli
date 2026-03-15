const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const readline = require('readline');
const { Config, WorkspaceManagerConfig } = require('./config');
const TemplateManager = require('./template');
const RepoManager = require('./repo');
const AtomicTemplateManager = require('./atomic');
const SimpleConfig = require('./config-simple');
const { getCurrentDir, resolvePathFromCurrentDir } = require('./util');
const { canUseDefaults, DEFAULT_TEMPLATES } = require('./defaults');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}


async function handleAppCreate(projectName, options) {
  // 零配置启动：如果没有配置且可以使用默认配置，使用默认模板
  let template = options.template;
  
  if (!template && canUseDefaults()) {
    // 使用默认模板（vue3）
    template = 'vue3';
    console.log('💡 使用默认模板: vue3（零配置启动）');
    console.log('💡 提示: 使用 --template 指定其他模板，或运行 cocli init 配置自定义仓库\n');
  }

  // 尝试加载配置
  let repos, configForAuth;
  try {
    const loaded = Config.loadWithPriority();
    repos = loaded.repos;
    configForAuth = loaded.config;
  } catch (error) {
    // 如果加载失败且可以使用默认配置，使用默认仓库
    if (canUseDefaults()) {
      const defaultConfig = require('./defaults').getDefaultConfig();
      repos = defaultConfig.repos;
      configForAuth = new Config();
    } else {
      throw new Error(
        `❌ 未找到配置文件\n\n` +
        `💡 解决方案:\n` +
        `  1. 运行 \`cocli init\` 初始化配置\n` +
        `  2. 或使用默认模板: \`cocli create ${projectName} --template=vue3\`\n`
      );
    }
  }

  // 如果没有指定模板，使用 vue3 作为默认
  if (!template) {
    template = 'vue3';
  }

  // 创建一个包含 repos 的配置对象
  const config = {
    ...configForAuth,
    repos: repos,
  };

  const addons = options.addons ? options.addons.split(',').filter(Boolean) : [];

  await TemplateManager.create(template, addons, projectName, config);

  // 提示无侵入特性
  const projectPath = path.resolve(projectName);
  console.log('\n✅ 项目创建成功！');
  console.log('💡 提示: 生成的项目不绑定 CoCli 依赖，可安全删除 .qclocal 文件');
  console.log(`💡 提示: 使用 \`cd ${projectName}\` 进入项目目录`);
  
  process.exit(0);
}

async function handleAppList() {
  // 获取当前工作区（通过当前目录的 .qclrc 文件）
  const currentWorkspace = getCurrentDir();
  const workspacePath = currentWorkspace ? currentWorkspace.path : process.cwd();

  if (!fs.existsSync(workspacePath)) {
    throw new Error(`工作区路径不存在: ${workspacePath}`);
  }

  const apps = [];
  if (fs.statSync(workspacePath).isDirectory()) {
    const entries = fs.readdirSync(workspacePath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const appPath = path.join(workspacePath, entry.name);
        const qclocalPath = path.join(appPath, '.qclocal');
        if (fs.existsSync(qclocalPath)) {
          const qclocal = Config.loadQclocal(appPath);
          if (qclocal) {
            apps.push({
              projectName: qclocal.project || entry.name,
              dirName: entry.name,
              template: qclocal.template,
            });
          }
        }
      }
    }
  }

  if (apps.length === 0) {
    console.log('当前目录下没有找到应用');
  } else {
    console.log('应用列表:');
    apps.sort((a, b) => a.projectName.localeCompare(b.projectName));
    for (const app of apps) {
      console.log(`  - ${app.projectName} (模板: ${app.template}, 目录: ${app.dirName})`);
    }
    console.log(`\n共找到 ${apps.length} 个应用`);
  }
}

async function handleTemplateList() {
  // TemplateManager.listTemplates 内部会使用 loadWithPriority，不需要传递 config
  await TemplateManager.listTemplates(null);
  process.exit(0);
}

async function handleTemplateCreate(name, options) {
  const repoDir = resolvePathFromCurrentDir(options.repoDir || '.');

  if (!fs.existsSync(repoDir)) {
    throw new Error(`仓库目录不存在: ${repoDir}`);
  }

  const templatePath = options.path || `templates/${name}`;
  const templateDir = path.join(repoDir, templatePath);

  if (fs.existsSync(templateDir)) {
    throw new Error(`模板目录已存在: ${templateDir}`);
  }

  fs.mkdirSync(templateDir, { recursive: true });
  console.log(`✅ 已创建模板目录: ${templateDir}`);

  // 创建基本的 README.md
  const readmePath = path.join(templateDir, 'README.md');
  if (!fs.existsSync(readmePath)) {
    const readmeContent = `# ${name}\n\n这是一个使用 CoCli 创建的模板。\n\n## 使用方法\n\n\`\`\`bash\ncocli app create --template=${name} <项目名>\n\`\`\`\n`;
    fs.writeFileSync(readmePath, readmeContent);
    console.log('✅ 已创建 README.md');
  }

  // 读取或创建 meta.yaml
  const metaPath = path.join(repoDir, 'meta.yaml');
  let meta = { templates: {}, addons: {} };

  if (fs.existsSync(metaPath)) {
    const content = fs.readFileSync(metaPath, 'utf8');
    meta = yaml.load(content) || meta;
  }

  if (!meta.templates) {
    meta.templates = {};
  }

  if (meta.templates[name]) {
    throw new Error(`模板 '${name}' 已在 meta.yaml 中存在`);
  }

  meta.templates[name] = {
    root: `${templatePath}/**`,
  };

  fs.writeFileSync(metaPath, yaml.dump(meta));
  console.log('✅ 已更新 meta.yaml');
  console.log(`\n✅ 模板 '${name}' 创建成功！`);
  process.exit(0);
}

async function handleAddonsList(options) {
  const config = Config.load();
  await TemplateManager.listAddons(config, options.verbose);
}

async function handleAddonsDetail(addon) {
  const config = Config.load();
  await TemplateManager.detailAddon(config, addon);
}

async function handleAddonsAdd(addons, projectDir) {
  const addonList = addons.split(',').filter(Boolean);
  const targetDir = resolvePathFromCurrentDir(projectDir || '.');

  if (!fs.existsSync(targetDir)) {
    throw new Error(`项目目录不存在: ${targetDir}`);
  }

  // 读取 .qclocal 文件
  const qclocal = Config.loadQclocalFromDir(targetDir);
  const { repos, config: configForAuth } = Config.loadWithPriority();

  const foundAddons = {};
  let repoUrl = null;
  let repoConfig = null;

  for (const repo of repos) {
    const url = TemplateManager.getRepoUrl(repo);
    if (!url) {
      console.warn('警告: 仓库配置缺少 URL，跳过');
      continue;
    }

    try {
      const meta = await RepoManager.fetchMeta(url, repo, configForAuth);
      if (meta.addons) {
        // 支持新的格式：addons.root 和 addons.target_dir
        if (meta.addons.root && !meta.addons[Object.keys(meta.addons)[0]]?.root) {
          // 新格式：从 addons.root 目录中查找 addons
          const addonsRoot = meta.addons.root;
          for (const addonName of addonList) {
            foundAddons[addonName] = {
              root: `${addonsRoot.replace(/\/$/, '')}/${addonName}/**`,
            };
            if (!repoUrl) {
              repoUrl = url;
              repoConfig = repo;
            }
          }
        } else {
          // 旧格式：addons 是一个 map
          for (const addonName of addonList) {
            if (meta.addons[addonName]) {
              foundAddons[addonName] = meta.addons[addonName];
              if (!repoUrl) {
                repoUrl = url;
                repoConfig = repo;
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn(`警告: 无法从 ${url} 获取元数据: ${error.message}`);
      continue;
    }
  }

  if (Object.keys(foundAddons).length === 0) {
    throw new Error('未找到任何指定的 addons');
  }

  // 确定 addons 基础目标目录
  const addonsBaseDir = qclocal && qclocal.addons && qclocal.addons.target_dir
    ? path.join(targetDir, qclocal.addons.target_dir.replace(/^\.\//, ''))
    : path.join(targetDir, 'addons');

  fs.mkdirSync(addonsBaseDir, { recursive: true });

  for (const addonName of addonList) {
    if (foundAddons[addonName]) {
      const addon = foundAddons[addonName];
      const addonPaths = Array.isArray(addon.root) ? addon.root : [addon.root];
      const addonTargetDir = path.join(addonsBaseDir, addonName);

      console.log(`正在下载 addon ${addonName} 到 ${addonTargetDir}...`);
      await RepoManager.downloadTemplate(
        repoUrl,
        addonPaths,
        addonTargetDir,
        repoConfig,
        configForAuth
      );
    } else {
      console.warn(`警告: 未找到 addon: ${addonName}`);
    }
  }

  // 更新 .qclocal 文件
  await TemplateManager.createOrUpdateQclocal(
    targetDir,
    qclocal?.project,
    qclocal?.template || 'unknown',
    addonList,
    qclocal?.repos
  );

  console.log('✅ Addons 添加成功！');
  console.log('💡 提示: 使用 `cocli addons sync` 同步所有配置的插件');
  process.exit(0);
}

async function handleAddonsSync(projectDir) {
  const targetDir = resolvePathFromCurrentDir(projectDir || '.');

  if (!fs.existsSync(targetDir)) {
    throw new Error(`项目目录不存在: ${targetDir}`);
  }

  const qclocal = Config.loadQclocalFromDir(targetDir);
  if (!qclocal) {
    throw new Error('未找到 .qclocal 文件，请先创建项目');
  }

  if (!qclocal.addons || !qclocal.addons.include || qclocal.addons.include.length === 0) {
    console.log('没有需要同步的 addons');
    return;
  }

  const { repos, config: configForAuth } = Config.loadWithPriority();

  const foundAddons = {};
  let repoUrl = null;
  let repoConfig = null;

  for (const repo of repos) {
    const url = TemplateManager.getRepoUrl(repo);
    if (!url) {
      console.warn('警告: 仓库配置缺少 URL，跳过');
      continue;
    }

    try {
      const meta = await RepoManager.fetchMeta(url, repo, configForAuth);
      if (meta.addons) {
        // 支持新的格式：addons.root 和 addons.target_dir
        if (meta.addons.root && !meta.addons[Object.keys(meta.addons)[0]]?.root) {
          // 新格式：从 addons.root 目录中查找 addons
          const addonsRoot = meta.addons.root;
          for (const addonName of qclocal.addons.include) {
            foundAddons[addonName] = {
              root: `${addonsRoot.replace(/\/$/, '')}/${addonName}/**`,
            };
            if (!repoUrl) {
              repoUrl = url;
              repoConfig = repo;
            }
          }
        } else {
          // 旧格式：addons 是一个 map
          for (const addonName of qclocal.addons.include) {
            if (meta.addons[addonName]) {
              foundAddons[addonName] = meta.addons[addonName];
              if (!repoUrl) {
                repoUrl = url;
                repoConfig = repo;
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn(`警告: 无法从 ${url} 获取元数据: ${error.message}`);
      continue;
    }
  }

  if (Object.keys(foundAddons).length === 0) {
    throw new Error('未找到任何需要同步的 addons');
  }

  const addonsBaseDir = path.join(targetDir, (qclocal.addons.target_dir || './addons').replace(/^\.\//, ''));

  fs.mkdirSync(addonsBaseDir, { recursive: true });

  for (const addonName of qclocal.addons.include) {
    if (foundAddons[addonName]) {
      const addon = foundAddons[addonName];
      const addonPaths = Array.isArray(addon.root) ? addon.root : [addon.root];
      const addonTargetDir = path.join(addonsBaseDir, addonName);

      console.log(`正在同步 addon ${addonName} 到 ${addonTargetDir}...`);
      await RepoManager.downloadTemplate(
        repoUrl,
        addonPaths,
        addonTargetDir,
        repoConfig,
        configForAuth
      );
    } else {
      console.warn(`警告: 未找到 addon: ${addonName}`);
    }
  }

  console.log('✅ Addons 同步成功！');
  process.exit(0);
}

async function handleAddonsCreate(name, options) {
  const repoDir = resolvePathFromCurrentDir(options.repoDir || '.');

  if (!fs.existsSync(repoDir)) {
    throw new Error(`仓库目录不存在: ${repoDir}`);
  }

  const addonPath = options.path || `addons/${name}`;
  const addonDir = path.join(repoDir, addonPath);

  if (fs.existsSync(addonDir)) {
    throw new Error(`插件目录已存在: ${addonDir}`);
  }

  fs.mkdirSync(addonDir, { recursive: true });
  console.log(`✅ 已创建插件目录: ${addonDir}`);

  // 创建基本的 README.md
  const readmePath = path.join(addonDir, 'README.md');
  if (!fs.existsSync(readmePath)) {
    const readmeContent = `# ${name}\n\n这是一个使用 CoCli 创建的插件。\n\n## 使用方法\n\n\`\`\`bash\ncocli addons add ${name} [项目目录]\n\`\`\`\n`;
    fs.writeFileSync(readmePath, readmeContent);
    console.log('✅ 已创建 README.md');
  }

  // 读取或创建 meta.yaml
  const metaPath = path.join(repoDir, 'meta.yaml');
  let meta = { templates: {}, addons: {} };

  if (fs.existsSync(metaPath)) {
    const content = fs.readFileSync(metaPath, 'utf8');
    meta = yaml.load(content) || meta;
  }

  if (!meta.addons) {
    meta.addons = {};
  }

  if (meta.addons[name]) {
    throw new Error(`插件 '${name}' 已在 meta.yaml 中存在`);
  }

  meta.addons[name] = {
    root: `${addonPath}/**`,
  };

  fs.writeFileSync(metaPath, yaml.dump(meta));
  console.log('✅ 已更新 meta.yaml');
  console.log(`\n✅ 插件 '${name}' 创建成功！`);
  process.exit(0);
}

async function handleWorkspaceCreate(name, workspacePath) {

  // 获取用户的实际工作目录（pnpm 会设置 INIT_CWD）
  const scriptCwd = process.cwd();
  const userCwd = process.env.INIT_CWD || scriptCwd;

  // 解析路径
  let resolvedPath;
  if (!workspacePath) {
    // 没有提供路径，在当前目录下创建名为 name 的目录
    resolvedPath = path.join(userCwd, name);
  } else if (workspacePath === '.') {
    // 提供的是 '.'，使用当前目录
    resolvedPath = userCwd;
  } else if (path.isAbsolute(workspacePath)) {
    // 绝对路径，直接使用
    resolvedPath = workspacePath;
  } else {
    // 相对路径，基于用户的实际工作目录解析
    resolvedPath = path.resolve(userCwd, workspacePath);
  }

  // 规范化路径
  resolvedPath = path.normalize(resolvedPath);

  // 如果目录不存在，自动创建
  if (!fs.existsSync(resolvedPath)) {
    fs.mkdirSync(resolvedPath, { recursive: true });
    console.log(`✅ 已创建目录: ${resolvedPath}`);
  }

  if (!fs.statSync(resolvedPath).isDirectory()) {
    throw new Error(`指定的路径不是目录: ${resolvedPath}`);
  }

  if (fs.existsSync(path.join(resolvedPath, '.qclocal'))) {
    throw new Error('该目录已包含应用配置，不能作为工作区根目录');
  }

  // 初始化工作区配置文件
  const configPath = path.join(resolvedPath, '.qclrc');
  let configCreated = false;

  if (!fs.existsSync(configPath)) {
    const globalConfig = Config.load() || new Config();
    const config = {
      repos: globalConfig.repos || [],
      workspace: {
        name,
      },
    };
    fs.writeFileSync(configPath, yaml.dump(config));
    configCreated = true;
  }

  // 工作区通过 .qclrc 文件标识，不需要额外存储
  console.log(`工作区 '${name}' 创建成功！`);
  console.log(`工作区路径: ${resolvedPath}`);
  if (configCreated) {
    console.log(`配置文件已初始化: ${configPath}`);
  }

  process.exit(0);
}

async function handleWorkspaceList() {
  // 获取用户的实际工作目录
  const userCwd = process.env.INIT_CWD || process.cwd();
  const workspaces = WorkspaceManagerConfig.scanWorkspaces(userCwd);
  const current = WorkspaceManagerConfig.getCurrent();

  if (workspaces.length === 0) {
    console.log('没有找到工作区');
    return;
  }

  console.log('工作区列表:');
  for (const ws of workspaces) {
    const currentMarker = current && current.name === ws.name ? ' (当前)' : '';
    console.log(`  - ${ws.name}${currentMarker}`);
    console.log(`    路径: ${ws.path}`);
    if (ws.config.workspace && ws.config.workspace.description) {
      console.log(`    描述: ${ws.config.workspace.description}`);
    }
  }
  console.log(`\n共找到 ${workspaces.length} 个工作区`);
  process.exit(0);
}

async function handleWorkspaceUse(name) {
  // 工作区通过当前目录的 .qclrc 文件自动识别，不需要手动切换
  // 用户需要 cd 到工作区目录才能使用该工作区
  const userCwd = process.env.INIT_CWD || process.cwd();
  const workspace = WorkspaceManagerConfig.findWorkspace(name, userCwd);

  if (!workspace) {
    throw new Error(`工作区 '${name}' 不存在`);
  }

  console.log(`工作区 '${name}' 位于: ${workspace.path}`);
  console.log(`💡 提示: 使用 \`cd ${workspace.path}\` 切换到该工作区`);
}

async function handleWorkspaceCurrent() {
  const workspace = WorkspaceManagerConfig.getCurrent();
  if (workspace) {
    console.log(`当前工作区: ${workspace.name}`);
    console.log(`路径: ${workspace.path}`);
  } else {
    console.log('当前目录不是工作区（未找到 .qclrc 文件）');
  }
}

async function handleWorkspaceDelete(name) {
  WorkspaceManagerConfig.removeWorkspace(name);
  console.log(`工作区 '${name}' 已删除`);
}

async function handleConfigGet(key) {
  const currentDir = process.cwd();
  const qclocal = Config.loadQclocal(currentDir);

  if (qclocal) {
    if (key === 'project' && qclocal.project) {
      console.log(qclocal.project);
      return;
    }
    if (key === 'template' && qclocal.template) {
      console.log(qclocal.template);
      return;
    }
  }

  const workspace = WorkspaceManagerConfig.getCurrent();

  if (workspace && workspace.config) {
    if (key === 'username' && workspace.config.username) {
      console.log(workspace.config.username);
      return;
    }
    if (key === 'repos') {
      console.log(yaml.dump(workspace.config.repos));
      return;
    }
  }

  const config = Config.load();
  if (config) {
    if (key === 'username' && config.username) {
      console.log(config.username);
      return;
    }
    if (key === 'repos') {
      console.log(yaml.dump(config.repos));
      return;
    }
  }

  console.error(`配置键 '${key}' 未找到`);
}

async function handleConfigSet(key, value) {
  console.error('配置设置功能暂未实现');
}

async function handleConfigList() {
  console.log('配置信息:');

  const workspace = WorkspaceManagerConfig.getCurrent();
  if (workspace) {
    console.log(`当前工作区: ${workspace.name}`);
  }

  const config = Config.load();
  if (config) {
    console.log('\n全局配置:');
    if (config.username) {
      console.log(`  username: ${config.username}`);
    }
    console.log(`  repos: ${config.repos.length} 个仓库`);
  }
}

async function handleInit(options) {
  const workingDir = process.cwd();
  const configPath = options.file
    ? (path.isAbsolute(options.file) ? options.file : path.join(workingDir, options.file))
    : path.join(workingDir, '.qclrc');

  if (fs.existsSync(configPath) && !options.yes) {
    const answer = await question(`配置文件 ${configPath} 已存在，是否覆盖？(y/N): `);
    if (answer.trim().toLowerCase() !== 'y' && answer.trim().toLowerCase() !== 'yes') {
      console.log('已取消');
      return;
    }
  }

  let config = {
    repos: [],
  };

  if (!options.yes) {
    console.log('🔧 初始化 CoCli 配置文件');
    console.log('按 Enter 跳过可选配置项\n');

    const username = await question('全局用户名（可选，按 Enter 跳过）: ');
    if (username.trim()) {
      config.username = username.trim();
    }

    const password = await question('全局密码（可选，按 Enter 跳过）: ');
    if (password.trim()) {
      config.password = password.trim();
    }

    const token = await question('全局 Token（可选，按 Enter 跳过）: ');
    if (token.trim()) {
      config.token = token.trim();
    }

    console.log('\n📦 配置仓库');
    console.log('添加仓库配置（输入 \'done\' 完成）:');

    while (true) {
      const repoType = await question('\n仓库类型 (local/github/gitlab/ftp，或 \'done\' 完成): ');
      const type = repoType.trim().toLowerCase();

      if (type === 'done' || !type) {
        break;
      }

      if (type === 'local') {
        const url = await question('本地路径: ');
        if (url.trim()) {
          config.repos.push({
            local: {
              type: 'local',
              url: url.trim(),
            },
          });
          console.log('✓ 已添加本地仓库');
        }
      } else if (type === 'github') {
        const repoUrl = await question('GitHub 仓库 URL: ');
        if (repoUrl.trim()) {
          const githubAuth = {
            type: 'git',
            repo: repoUrl.trim(),
          };

          const token = await question('GitHub Token（可选，按 Enter 跳过）: ');
          if (token.trim()) {
            githubAuth.token = token.trim();
          } else {
            const username = await question('GitHub 用户名（可选，按 Enter 跳过）: ');
            if (username.trim()) {
              githubAuth.username = username.trim();
              const password = await question('GitHub 密码（可选，按 Enter 跳过）: ');
              if (password.trim()) {
                githubAuth.password = password.trim();
              }
            }
          }

          config.repos.push({ github: githubAuth });
          console.log('✓ 已添加 GitHub 仓库');
        }
      } else if (type === 'gitlab') {
        const repoUrl = await question('GitLab 仓库 URL: ');
        if (repoUrl.trim()) {
          const gitlabAuth = {
            type: 'gitlab',
            repo: repoUrl.trim(),
          };

          const token = await question('GitLab Token（可选，按 Enter 跳过）: ');
          if (token.trim()) {
            gitlabAuth.token = token.trim();
          } else {
            const username = await question('GitLab 用户名（可选，按 Enter 跳过）: ');
            if (username.trim()) {
              gitlabAuth.username = username.trim();
              const password = await question('GitLab 密码（可选，按 Enter 跳过）: ');
              if (password.trim()) {
                gitlabAuth.password = password.trim();
              }
            }
          }

          config.repos.push({ gitlab: gitlabAuth });
          console.log('✓ 已添加 GitLab 仓库');
        }
      } else if (type === 'ftp') {
        const url = await question('FTP URL: ');
        if (url.trim()) {
          const ftpAuth = {
            type: 'ftp',
            url: url.trim(),
          };

          const username = await question('FTP 用户名（可选，按 Enter 跳过）: ');
          if (username.trim()) {
            ftpAuth.username = username.trim();
            const password = await question('FTP 密码（可选，按 Enter 跳过）: ');
            if (password.trim()) {
              ftpAuth.password = password.trim();
            }
          }

          config.repos.push({ ftp: ftpAuth });
          console.log('✓ 已添加 FTP 仓库');
        }
      } else {
        console.log(`⚠️  未知的仓库类型: ${type}，请使用 local/github/gitlab/ftp`);
      }
    }
  } else {
    console.log('🔧 使用默认配置创建配置文件');
  }

  if (config.repos.length === 0) {
    console.log('⚠️  未添加任何仓库，将创建空配置');
  }

  fs.writeFileSync(configPath, yaml.dump(config));
  console.log(`\n✅ 配置文件已创建: ${configPath}`);
  console.log('💡 提示: 你可以随时编辑此文件来修改配置');

  rl.close();
  process.exit(0);
}

async function handleRepoCreate(name, options) {
  const repoPath = resolvePathFromCurrentDir(options.path || '.');

  if (!fs.existsSync(repoPath)) {
    fs.mkdirSync(repoPath, { recursive: true });
    console.log(`✅ 已创建仓库目录: ${repoPath}`);
  }

  const templatesDir = path.join(repoPath, 'templates');
  const addonsDir = path.join(repoPath, 'addons');

  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
    console.log('✅ 已创建 templates 目录');
  }

  if (!fs.existsSync(addonsDir)) {
    fs.mkdirSync(addonsDir, { recursive: true });
    console.log('✅ 已创建 addons 目录');
  }

  const metaPath = path.join(repoPath, 'meta.yaml');
  if (!fs.existsSync(metaPath)) {
    const meta = {
      templates: {},
      addons: {},
    };
    fs.writeFileSync(metaPath, yaml.dump(meta));
    console.log('✅ 已创建 meta.yaml');
  } else {
    console.log('ℹ️  meta.yaml 已存在，跳过创建');
  }

  console.log(`\n✅ 仓库 '${name}' 创建成功！`);
  process.exit(0);
}

async function handleRepoInit(options) {
  // 重要：当通过 pnpm 执行时，process.cwd() 可能返回项目根目录
  // 我们需要从环境变量或命令行参数中获取实际的工作目录
  // 但更可靠的方法是：如果提供了相对路径 '.'，应该基于调用时的实际工作目录

  // 获取当前工作目录
  let cwd = process.cwd();

  // 检查是否通过 pnpm 执行（通过检查 process.env）
  // 如果 PWD 环境变量存在（Unix）或通过其他方式获取
  // 但最可靠的方法是：如果用户提供了 '.'，我们应该使用调用时的实际目录

  // 解析路径
  let repoPath;
  if (!options.path || options.path === '.') {
    // 没有提供路径或提供的是 '.'，使用当前工作目录
    // 但这里有个问题：通过 pnpm 执行时，cwd 可能是项目根目录
    // 我们需要检查是否有其他方式获取实际工作目录

    // pnpm 会设置 INIT_CWD 环境变量为用户执行命令时的实际工作目录
    // 这是最可靠的方法来获取用户的实际工作目录
    const actualCwd = process.env.INIT_CWD || cwd;
    repoPath = actualCwd;

    // 调试信息
    if (process.env.DEBUG) {
      console.log(`调试: process.cwd(): ${cwd}`);
      console.log(`调试: INIT_CWD: ${process.env.INIT_CWD || '(未设置)'}`);
      console.log(`调试: 使用的目录: ${repoPath}`);
    }
  } else if (path.isAbsolute(options.path)) {
    // 绝对路径，直接使用
    repoPath = options.path;
  } else {
    // 相对路径，基于当前工作区目录解析
    repoPath = resolvePathFromCurrentDir(options.path);
  }

  // 规范化路径（处理 .. 和 . 等）
  repoPath = path.normalize(repoPath);

  // 调试信息（可选，生产环境可以移除）
  if (process.env.DEBUG) {
    console.log(`调试: 当前工作目录: ${cwd}`);
    console.log(`调试: 提供的路径: ${options.path || '(未提供)'}`);
    console.log(`调试: 解析后的路径: ${repoPath}`);
  }

  // 如果目录不存在，自动创建
  if (!fs.existsSync(repoPath)) {
    fs.mkdirSync(repoPath, { recursive: true });
    console.log(`✅ 已创建目录: ${repoPath}`);
  } else if (!fs.statSync(repoPath).isDirectory()) {
    throw new Error(`路径不是目录: ${repoPath}`);
  }

  const metaPath = path.join(repoPath, 'meta.yaml');
  if (fs.existsSync(metaPath)) {
    console.log('ℹ️  meta.yaml 已存在，跳过初始化');
    process.exit(0);
    return;
  }

  const meta = {
    templates: {},
    addons: {},
  };
  fs.writeFileSync(metaPath, yaml.dump(meta));
  console.log('✅ 已创建 meta.yaml');

  const templatesDir = path.join(repoPath, 'templates');
  const addonsDir = path.join(repoPath, 'addons');

  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
    console.log('✅ 已创建 templates 目录');
  }

  if (!fs.existsSync(addonsDir)) {
    fs.mkdirSync(addonsDir, { recursive: true });
    console.log('✅ 已创建 addons 目录');
  }

  // 创建 README.md
  const readmePath = path.join(repoPath, 'README.md');
  if (!fs.existsSync(readmePath)) {
    const readmeContent = `# CoCli 仓库

这是一个 CoCli 模板和插件仓库。

## 目录结构

\`\`\`
.
├── meta.yaml          # 仓库元数据配置文件
├── templates/         # 模板目录
│   └── (在这里放置你的模板)
└── addons/           # 插件目录
    └── (在这里放置你的插件)
\`\`\`

## 使用方法

### 添加模板

1. 在 \`templates/\` 目录下创建模板目录，例如 \`templates/vue3/\`
2. 在模板目录中放置你的模板文件
3. 更新 \`meta.yaml\`，添加模板配置：

\`\`\`yaml
templates:
  vue3:
    root: templates/vue3/
\`\`\`

### 添加插件

#### 方式 1：统一管理（推荐）

在 \`meta.yaml\` 中配置：

\`\`\`yaml
addons:
  root: ./addons/
  target_dir: ./addons/
\`\`\`

然后在 \`addons/\` 目录下创建插件目录，例如 \`addons/my-addon/\`

#### 方式 2：单独配置

在 \`meta.yaml\` 中为每个插件单独配置：

\`\`\`yaml
addons:
  my-addon:
    root: ./addons/my-addon/**
\`\`\`

### 使用仓库

用户可以在他们的 \`.qclrc\` 配置文件中添加此仓库：

\`\`\`yaml
repos:
  - local:
      type: local
      url: /path/to/this/repo
\`\`\`

或者如果是 Git 仓库：

\`\`\`yaml
repos:
  - github:
      type: git
      repo: https://github.com/username/repo-name
\`\`\`

## 更多信息

查看 [CoCli 文档](https://github.com/couriourc/cocli) 了解更多关于模板和插件的配置选项。
`;
    fs.writeFileSync(readmePath, readmeContent, 'utf8');
    console.log('✅ 已创建 README.md');
  } else {
    console.log('ℹ️  README.md 已存在，跳过创建');
  }

  console.log(`\n✅ 仓库初始化成功！`);
  process.exit(0);
}

async function handleHelp(options) {
  const config = Config.load();
  if (!config) {
    throw new Error('未找到配置文件，请先配置 .qclrc 或 .qcl.yaml');
  }

  if (!options.addons && !options.template) {
    console.log('CoCli 脚手架工具');
    console.log();
    console.log('使用方法:');
    console.log('  cocli app create --template=<模板名> [--addons=<addon列表>] <项目名>');
    console.log('  cocli template list');
    console.log('  cocli addons list');
    console.log('  cocli addons add <addon列表> [项目目录]');
    console.log('  cocli addons sync [项目目录]');
    console.log('  cocli help [--template=<模板名>] [--addons=<addon名>]');
    console.log();
    console.log('更多信息，请使用: cocli help --template <模板名> 或 cocli help --addons <addon名>');
    return;
  }

  // 查找模板或 addon 的详细信息
  for (const repo of config.repos) {
    const url = TemplateManager.getRepoUrl(repo);
    if (!url) {
      console.warn('警告: 仓库配置缺少 URL，跳过');
      continue;
    }

    try {
      const meta = await RepoManager.fetchMeta(url, repo, config);

      if (options.template && meta.templates && meta.templates[options.template]) {
        const templateConfig = meta.templates[options.template];
        console.log(`模板: ${options.template}`);
        console.log(`来源: ${url}`);
        console.log();
        console.log('路径配置:');
        const paths = Array.isArray(templateConfig.root) ? templateConfig.root : [templateConfig.root];
        for (const p of paths) {
          console.log(`  - ${p}`);
        }
        console.log();
        console.log('使用方法:');
        console.log(`  cocli app create --template=${options.template} <项目名>`);
        return;
      }

      if (options.addons && meta.addons && meta.addons[options.addons]) {
        const addonConfig = meta.addons[options.addons];
        console.log(`Addon: ${options.addons}`);
        console.log(`来源: ${url}`);
        console.log();
        console.log('路径配置:');
        const paths = Array.isArray(addonConfig.root) ? addonConfig.root : [addonConfig.root];
        for (const p of paths) {
          console.log(`  - ${p}`);
        }
        console.log();
        console.log('使用方法:');
        console.log(`  cocli addons add ${options.addons}`);
        return;
      }
    } catch (error) {
      console.warn(`警告: 无法从 ${url} 获取元数据: ${error.message}`);
      continue;
    }
  }

  if (options.template) {
    throw new Error(`未找到模板: ${options.template}`);
  }
  if (options.addons) {
    throw new Error(`未找到 addon: ${options.addons}`);
  }
}

// 原子化模板命令（对标 shadcn）
async function handleAtomicAdd(itemName, projectDir, options) {
  const targetDir = projectDir || '.';
  await AtomicTemplateManager.add(itemName, targetDir, {
    version: options.version || null,
    interactive: options.interactive || false,
    force: options.force || false,
  });
  process.exit(0);
}

async function handleAtomicRemove(itemName, projectDir) {
  const targetDir = projectDir || '.';
  await AtomicTemplateManager.remove(itemName, targetDir);
  process.exit(0);
}

async function handleAtomicList(type) {
  await AtomicTemplateManager.list(type || null);
  process.exit(0);
}

// 简化配置命令
async function handleConfigEdit(projectDir) {
  const targetDir = projectDir || '.';
  await SimpleConfig.edit(targetDir);
  process.exit(0);
}

module.exports = {
  handleAppCreate,
  handleAppList,
  handleTemplateList,
  handleTemplateCreate,
  handleAddonsList,
  handleAddonsDetail,
  handleAddonsAdd,
  handleAddonsSync,
  handleAddonsCreate,
  handleWorkspaceCreate,
  handleWorkspaceList,
  handleWorkspaceUse,
  handleWorkspaceCurrent,
  handleWorkspaceDelete,
  handleConfigGet,
  handleConfigSet,
  handleConfigList,
  handleConfigEdit,
  handleInit,
  handleRepoCreate,
  handleRepoInit,
  handleHelp,
  // 原子化命令
  handleAtomicAdd,
  handleAtomicRemove,
  handleAtomicList,
};

