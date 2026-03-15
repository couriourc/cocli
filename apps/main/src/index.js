#!/usr/bin/env node

const { program } = require('commander');
const { version } = require('../package.json');
const commands = require('./commands');

program
  .name('cocli')
  .description('CoCli 脚手架工具')
  .version(version);

function wrapper(fn) {
  return (...args)=>Promise.resolve(fn(...args))
  .catch(err=>{
    console.error(err);
  }).finally(() => {
    process.exit(0);
  });
}

// 工作区命令
const workspaceCmd = program.command('workspace');
workspaceCmd
  .command('init <name> [path]')
  .description('初始化新工作区')
  .action(wrapper(commands.handleWorkspaceCreate));

workspaceCmd
  .command('list')
  .description('列出所有工作区')
  .action(wrapper(commands.handleWorkspaceList));

workspaceCmd
  .command('use <name>')
  .description('切换到指定工作区')
  .action(wrapper(commands.handleWorkspaceUse));

workspaceCmd
  .command('current')
  .description('显示当前工作区')
  .action(wrapper(commands.handleWorkspaceCurrent));

workspaceCmd
  .command('delete <name>')
  .description('删除工作区')
  .action(wrapper(commands.handleWorkspaceDelete));

// 应用命令
const appCmd = program.command('app');
appCmd
  .command('create <projectName>')
  .option('-t, --template <template>', '模板名称', '')
  .option('-a, --addons <addons>', '插件列表（逗号分隔）', '')
  .description('创建新项目')
  .action(wrapper(commands.handleAppCreate));

appCmd
  .command('list')
  .description('列出当前工作区的应用')
  .action(wrapper(commands.handleAppList));

// 模板命令
const templateCmd = program.command('template');
templateCmd
  .command('list')
  .description('列出可用的模板')
  .action(wrapper(commands.handleTemplateList));

templateCmd
  .command('create <name>')
  .option('-p, --path <path>', '模板路径')
  .option('-r, --repo-dir <dir>', '仓库目录', '.')
  .description('创建新模板')
  .action(wrapper(commands.handleTemplateCreate));

// Addons 命令
const addonsCmd = program.command('addons');
addonsCmd
  .command('list')
  .option('-v, --verbose', '显示详细信息')
  .description('列出可用的 addons')
  .action(wrapper(commands.handleAddonsList));

addonsCmd
  .command('detail <addon>')
  .description('查看 addon 的详细信息')
  .action(wrapper(commands.handleAddonsDetail));

addonsCmd
  .command('add <addons> [projectDir]')
  .description('添加 addons 到项目')
  .action(wrapper(commands.handleAddonsAdd));

addonsCmd
  .command('sync [projectDir]')
  .description('同步项目中的 addons')
  .action(wrapper(commands.handleAddonsSync));

addonsCmd
  .command('create <name>')
  .option('-p, --path <path>', '插件路径')
  .option('-r, --repo-dir <dir>', '仓库目录', '.')
  .description('创建新插件')
  .action(wrapper(commands.handleAddonsCreate));

// 配置命令
const configCmd = program.command('config');
configCmd
  .command('get <key>')
  .description('获取配置值')
  .action(wrapper(commands.handleConfigGet));

configCmd
  .command('set <key> <value>')
  .description('设置配置值')
  .action(wrapper(commands.handleConfigSet));

configCmd
  .command('list')
  .description('列出所有配置')
  .action(wrapper(commands.handleConfigList));

configCmd
  .command('edit [projectDir]')
  .description('可视化编辑配置文件（cocli.json）')
  .action(wrapper(commands.handleConfigEdit));

// 初始化命令
program
  .command('init')
  .option('-f, --file <file>', '配置文件路径')
  .option('-y, --yes', '非交互模式，使用默认配置')
  .description('初始化配置文件')
  .action(wrapper(commands.handleInit));

// 仓库命令
const repoCmd = program.command('repo');
repoCmd
  .command('create <name>')
  .option('-p, --path <path>', '仓库路径', '.')
  .option('-t, --repo-type <type>', '仓库类型')
  .description('创建新仓库')
  .action(wrapper(commands.handleRepoCreate));

repoCmd
  .command('init [path]')
  .option('-p, --path <path>', '仓库路径（如果提供了位置参数则忽略此选项）')
  .description('初始化仓库（在当前目录或指定目录创建 meta.yaml）')
  .action((positionalPath, options) => {
    // 优先使用位置参数，如果没有则使用选项，最后默认当前目录
    // 保存实际的工作目录到环境变量，以便在 handleRepoInit 中使用
    // pnpm 会设置 INIT_CWD 环境变量为实际的工作目录
    const targetPath = positionalPath || options.path || '.';
    wrapper(commands.handleRepoInit)({ path: targetPath });
  });

// 原子化模板命令（对标 shadcn，极简命令）
program
  .command('add <item> [projectDir]')
  .option('-v, --version <version>', '指定版本')
  .option('-f, --force', '强制覆盖已存在的项')
  .option('-i, --interactive', '交互模式')
  .description('添加原子化模板片段（对标 shadcn）')
  .action((item, projectDir, options) => {
    wrapper(commands.handleAtomicAdd)(item, projectDir, options);
  });

program
  .command('remove <item> [projectDir]')
  .description('移除原子化模板片段')
  .action((item, projectDir) => {
    wrapper(commands.handleAtomicRemove)(item, projectDir);
  });

program
  .command('list [type]')
  .description('列出所有可用的模板项（component/module/template/addon）')
  .action((type) => {
    wrapper(commands.handleAtomicList)(type);
  });

// 向后兼容：create 命令（已废弃）
program
  .command('create <projectName>')
  .option('-t, --template <template>', '模板名称', '')
  .option('-a, --addons <addons>', '插件列表（逗号分隔）', '')
  .description('创建新项目（已废弃，请使用 cocli app create）')
  .action((projectName, options) => {
    console.warn('警告: `cocli create` 已废弃，请使用 `cocli app create`');
    wrapper(commands.handleAppCreate)(projectName, options);
  });

// 帮助命令
program
  .command('help')
  .option('--addons <addon>', '显示特定 addon 的帮助信息')
  .option('--template <template>', '显示特定模板的帮助信息')
  .description('显示帮助信息')
  .action(wrapper(commands.handleHelp));

program.parse(process.argv);

// 确保命令执行完成后进程正常退出
// 如果命令是异步的，需要确保所有异步操作完成后调用 process.exit(0)
// 对于同步命令，commander.js 会自动退出

