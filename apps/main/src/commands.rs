use crate::config::{Config, WorkspaceConfig, WorkspaceManagerConfig};
use crate::template::TemplateManager;
use clap::{Args, Parser, Subcommand};
use std::path::PathBuf;
use std::fs;
use chrono::Utc;

#[derive(Parser)]
#[command(name = "cocli")]
#[command(about = "CoCli 脚手架工具", long_about = None)]
#[command(disable_help_subcommand = true)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    /// 工作区相关命令
    #[command(subcommand)]
    Workspace(WorkspaceCommands),
    /// 应用相关命令
    #[command(subcommand)]
    App(AppCommands),
    /// 模板相关命令
    #[command(subcommand)]
    Template(TemplateCommands),
    /// Addons 相关命令
    #[command(subcommand)]
    Addons(AddonsCommands),
    /// 配置管理命令
    #[command(subcommand)]
    Config(ConfigCommands),
    /// AI 相关命令
    #[command(subcommand)]
    Ai(AiCommands),
    /// 初始化配置文件
    Init(InitArgs),
    /// 显示帮助信息
    Help(HelpArgs),
    /// 创建新项目（已废弃，请使用 `cocli app create`）
    #[command(hide = true)]
    Create(CreateArgs),
}

#[derive(Subcommand)]
pub enum WorkspaceCommands {
    /// 创建新工作区
    Create(WorkspaceCreateArgs),
    /// 列出所有工作区
    List,
    /// 切换到指定工作区
    Use(WorkspaceUseArgs),
    /// 显示当前工作区
    Current,
    /// 删除工作区
    Delete(WorkspaceDeleteArgs),
}

#[derive(Args)]
pub struct WorkspaceCreateArgs {
    /// 工作区名称
    #[arg(value_name = "WORKSPACE_NAME")]
    pub name: String,
    
    /// 工作区路径（可选，如果未指定，将在当前目录下创建同名子目录）
    #[arg(value_name = "WORKSPACE_PATH")]
    pub path: Option<String>,
}

#[derive(Args)]
pub struct WorkspaceUseArgs {
    /// 工作区名称
    #[arg(value_name = "WORKSPACE_NAME")]
    pub name: String,
}

#[derive(Args)]
pub struct WorkspaceDeleteArgs {
    /// 工作区名称
    #[arg(value_name = "WORKSPACE_NAME")]
    pub name: String,
}

#[derive(Subcommand)]
pub enum AppCommands {
    /// 创建新项目
    Create(CreateArgs),
    /// 列出当前工作区的应用
    List,
}

#[derive(Subcommand)]
pub enum ConfigCommands {
    /// 获取配置值
    Get(ConfigGetArgs),
    /// 设置配置值
    Set(ConfigSetArgs),
    /// 列出所有配置
    List,
}

#[derive(Args)]
pub struct ConfigGetArgs {
    /// 配置键（如：repos, username）
    #[arg(value_name = "KEY")]
    pub key: String,
}

#[derive(Args)]
pub struct ConfigSetArgs {
    /// 配置键（如：repos, username）
    #[arg(value_name = "KEY")]
    pub key: String,
    
    /// 配置值
    #[arg(value_name = "VALUE")]
    pub value: String,
}

#[derive(Subcommand)]
pub enum TemplateCommands {
    /// 列出可用的模板
    List,
    /// 创建新模板
    Create(TemplateCreateArgs),
}

#[derive(Subcommand)]
pub enum AddonsCommands {
    /// 列出可用的 addons
    List(AddonsListArgs),
    /// 查看 addon 的详细信息
    Detail(AddonsDetailArgs),
    /// 添加 addons 到项目
    Add(AddonsAddArgs),
    /// 同步项目中的 addons（根据 .qclocal 配置）
    Sync(AddonsSyncArgs),
    /// 创建新插件
    Create(AddonsCreateArgs),
}

#[derive(Args)]
pub struct AddonsListArgs {
    /// 显示详细信息
    #[arg(short = 'v', long = "verbose")]
    pub verbose: bool,
}

#[derive(Args)]
pub struct AddonsDetailArgs {
    /// Addon 名称
    #[arg(value_name = "ADDON")]
    pub addon: String,
}

#[derive(Args)]
pub struct AddonsAddArgs {
    /// Addons 列表（逗号分隔）
    #[arg(value_name = "ADDONS", value_delimiter = ',', required = true)]
    pub addons: Vec<String>,
    
    /// 项目目录（可选，默认为当前目录）
    #[arg(value_name = "PROJECT_DIR", default_value = ".")]
    pub project_dir: String,
}

#[derive(Args)]
pub struct AddonsSyncArgs {
    /// 项目目录（可选，默认为当前目录）
    #[arg(value_name = "PROJECT_DIR", default_value = ".")]
    pub project_dir: String,
}

#[derive(Args)]
pub struct TemplateCreateArgs {
    /// 模板名称
    #[arg(value_name = "TEMPLATE_NAME")]
    pub name: String,
    
    /// 模板路径（可选，默认为 templates/<name>）
    #[arg(long, short = 'p', value_name = "PATH")]
    pub path: Option<String>,
    
    /// 仓库目录（可选，默认为当前目录）
    #[arg(long, short = 'r', value_name = "REPO_DIR", default_value = ".")]
    pub repo_dir: String,
}

#[derive(Args)]
pub struct AddonsCreateArgs {
    /// 插件名称
    #[arg(value_name = "ADDON_NAME")]
    pub name: String,
    
    /// 插件路径（可选，默认为 addons/<name>）
    #[arg(long, short = 'p', value_name = "PATH")]
    pub path: Option<String>,
    
    /// 仓库目录（可选，默认为当前目录）
    #[arg(long, short = 'r', value_name = "REPO_DIR", default_value = ".")]
    pub repo_dir: String,
}

#[derive(Args)]
pub struct CreateArgs {
    /// 项目名称
    #[arg(value_name = "PROJECT_NAME")]
    pub project_name: String,

    /// 模板名称
    #[arg(long, short = 't', value_name = "TEMPLATE")]
    pub template: String,

    /// Addons 列表（逗号分隔）
    #[arg(long, short = 'a', value_name = "ADDONS", value_delimiter = ',')]
    pub addons: Vec<String>,
}

#[derive(Args)]
pub struct InitArgs {
    /// 配置文件路径（可选，默认为当前目录的 .qclrc）
    #[arg(long, short = 'f', value_name = "FILE")]
    pub file: Option<String>,
    
    /// 非交互模式，使用默认配置
    #[arg(long, short = 'y')]
    pub yes: bool,
}

#[derive(Args)]
pub struct HelpArgs {
    /// 显示特定 addon 的帮助信息
    #[arg(long, value_name = "ADDON")]
    pub addons: Option<String>,
    
    /// 显示特定模板的帮助信息
    #[arg(long, value_name = "TEMPLATE")]
    pub template: Option<String>,
}

#[derive(Subcommand)]
pub enum AiCommands {
    /// 与 AI 对话
    Chat(AiChatArgs),
    /// 获取项目建议
    Suggest(AiSuggestArgs),
    /// 列出可用的 MCP 工具
    Tools,
    /// 列出可用的 MCP 资源
    Resources,
    /// Skills 管理
    #[command(subcommand)]
    Skills(SkillsCommands),
}

#[derive(Args)]
pub struct AiChatArgs {
    /// 对话内容
    #[arg(value_name = "MESSAGE")]
    pub message: String,
    
    /// 上下文信息（可选）
    #[arg(long, short = 'c', value_name = "CONTEXT")]
    pub context: Option<String>,
}

#[derive(Args)]
pub struct AiSuggestArgs {
    /// 项目路径（可选，默认为当前目录）
    #[arg(value_name = "PROJECT_PATH", default_value = ".")]
    pub project_path: String,
    
    /// 建议类型（可选）
    #[arg(long, short = 't', value_name = "TYPE")]
    pub suggestion_type: Option<String>,
}

#[derive(Subcommand)]
pub enum SkillsCommands {
    /// 列出所有可用的 Skills
    List,
    /// 查看 Skill 详情
    Show(SkillsShowArgs),
    /// 执行 Skill
    Execute(SkillsExecuteArgs),
    /// 创建新 Skill
    Create(SkillsCreateArgs),
    /// 删除 Skill
    Delete(SkillsDeleteArgs),
}

#[derive(Args)]
pub struct SkillsShowArgs {
    /// Skill 名称
    #[arg(value_name = "SKILL_NAME")]
    pub skill_name: String,
}

#[derive(Args)]
pub struct SkillsExecuteArgs {
    /// Skill 名称
    #[arg(value_name = "SKILL_NAME")]
    pub skill_name: String,
    
    /// 输入参数（JSON 格式）
    #[arg(long, short = 'i', value_name = "INPUTS")]
    pub inputs: Option<String>,
}

#[derive(Args)]
pub struct SkillsCreateArgs {
    /// Skill 名称
    #[arg(value_name = "SKILL_NAME")]
    pub skill_name: String,
    
    /// Skill 描述
    #[arg(long, short = 'd', value_name = "DESCRIPTION")]
    pub description: Option<String>,
    
    /// 使用内置模板
    #[arg(long, short = 't', value_name = "TEMPLATE")]
    pub template: Option<String>,
}

#[derive(Args)]
pub struct SkillsDeleteArgs {
    /// Skill 名称
    #[arg(value_name = "SKILL_NAME")]
    pub skill_name: String,
}

pub async fn handle_create(args: CreateArgs) -> anyhow::Result<()> {
    let config = Config::load()?;
    
    TemplateManager::create(
        &args.template,
        &args.addons,
        &args.project_name,
        config,
    ).await
}

pub async fn handle_template_list() -> anyhow::Result<()> {
    let config = Config::load()?;
    TemplateManager::list_templates(config).await
}

pub async fn handle_addons_list(args: AddonsListArgs) -> anyhow::Result<()> {
    let config = Config::load()?;
    TemplateManager::list_addons(config, args.verbose).await
}

pub async fn handle_addons_detail(args: AddonsDetailArgs) -> anyhow::Result<()> {
    let config = Config::load()?;
    TemplateManager::detail_addon(config, &args.addon).await
}

pub async fn handle_addons_add(args: AddonsAddArgs) -> anyhow::Result<()> {
    TemplateManager::add_addons(&args.addons, &args.project_dir).await
}

pub async fn handle_addons_sync(args: AddonsSyncArgs) -> anyhow::Result<()> {
    TemplateManager::sync_addons(&args.project_dir).await
}

pub async fn handle_init(args: InitArgs) -> anyhow::Result<()> {
    use crate::config::Config;
    use std::io::{self, Write};
    use std::path::PathBuf;
    
    // 确定配置文件路径
    let config_path = if let Some(file) = args.file {
        PathBuf::from(file)
    } else {
        std::env::current_dir()?.join(".qclrc")
    };
    
    // 检查文件是否已存在
    if config_path.exists() && !args.yes {
        print!("配置文件 {} 已存在，是否覆盖？(y/N): ", config_path.display());
        io::stdout().flush()?;
        let mut input = String::new();
        io::stdin().read_line(&mut input)?;
        if input.trim().to_lowercase() != "y" && input.trim().to_lowercase() != "yes" {
            println!("已取消");
            return Ok(());
        }
    }
    
    let mut config = Config {
        username: None,
        password: None,
        token: None,
        proxy: None,
        repos: vec![],
        ai: None,
        workspace: None,
    };
    
    if !args.yes {
        println!("🔧 初始化 CoCli 配置文件");
        println!("按 Enter 跳过可选配置项\n");
        
        // 询问全局认证信息
        print!("全局用户名（可选，按 Enter 跳过）: ");
        io::stdout().flush()?;
        let mut input = String::new();
        io::stdin().read_line(&mut input)?;
        let username = input.trim();
        if !username.is_empty() {
            config.username = Some(username.to_string());
        }
        
        print!("全局密码（可选，按 Enter 跳过）: ");
        io::stdout().flush()?;
        input.clear();
        io::stdin().read_line(&mut input)?;
        let password = input.trim();
        if !password.is_empty() {
            config.password = Some(password.to_string());
        }
        
        print!("全局 Token（可选，按 Enter 跳过）: ");
        io::stdout().flush()?;
        input.clear();
        io::stdin().read_line(&mut input)?;
        let token = input.trim();
        if !token.is_empty() {
            config.token = Some(token.to_string());
        }
        
        println!("\n📦 配置仓库");
        println!("添加仓库配置（输入 'done' 完成）:");
        
        loop {
            print!("\n仓库类型 (local/github/gitlab/ftp，或 'done' 完成): ");
            io::stdout().flush()?;
            input.clear();
            io::stdin().read_line(&mut input)?;
            let repo_type = input.trim().to_lowercase();
            
            if repo_type == "done" || repo_type.is_empty() {
                break;
            }
            
            match repo_type.as_str() {
                "local" => {
                    print!("本地路径: ");
                    io::stdout().flush()?;
                    input.clear();
                    io::stdin().read_line(&mut input)?;
                    let url = input.trim();
                    if !url.is_empty() {
                        config.repos.push(crate::config::RepoConfig::Local(
                            crate::config::LocalConfig {
                                local: crate::config::LocalAuth {
                                    r#type: Some("local".to_string()),
                                    url: url.to_string(),
                                },
                            },
                        ));
                        println!("✓ 已添加本地仓库");
                    }
                }
                "github" => {
                    print!("GitHub 仓库 URL: ");
                    io::stdout().flush()?;
                    input.clear();
                    io::stdin().read_line(&mut input)?;
                    let repo_url = input.trim();
                    if !repo_url.is_empty() {
                        let mut github_auth = crate::config::GitHubAuth {
                            r#type: Some("git".to_string()),
                            repo: Some(repo_url.to_string()),
                            username: None,
                            password: None,
                            token: None,
                        };
                        
                        print!("GitHub Token（可选，按 Enter 跳过）: ");
                        io::stdout().flush()?;
                        input.clear();
                        io::stdin().read_line(&mut input)?;
                        let token = input.trim();
                        if !token.is_empty() {
                            github_auth.token = Some(token.to_string());
                        } else {
                            print!("GitHub 用户名（可选，按 Enter 跳过）: ");
                            io::stdout().flush()?;
                            input.clear();
                            io::stdin().read_line(&mut input)?;
                            let username = input.trim();
                            if !username.is_empty() {
                                github_auth.username = Some(username.to_string());
                                
                                print!("GitHub 密码（可选，按 Enter 跳过）: ");
                                io::stdout().flush()?;
                                input.clear();
                                io::stdin().read_line(&mut input)?;
                                let password = input.trim();
                                if !password.is_empty() {
                                    github_auth.password = Some(password.to_string());
                                }
                            }
                        }
                        
                        config.repos.push(crate::config::RepoConfig::GitHub(
                            crate::config::GitHubConfig {
                                github: github_auth,
                            },
                        ));
                        println!("✓ 已添加 GitHub 仓库");
                    }
                }
                "gitlab" => {
                    print!("GitLab 仓库 URL: ");
                    io::stdout().flush()?;
                    input.clear();
                    io::stdin().read_line(&mut input)?;
                    let repo_url = input.trim();
                    if !repo_url.is_empty() {
                        let mut gitlab_auth = crate::config::GitLabAuth {
                            r#type: Some("gitlab".to_string()),
                            repo: Some(repo_url.to_string()),
                            username: None,
                            password: None,
                            token: None,
                            git_config: None,
                        };
                        
                        print!("GitLab Token（可选，按 Enter 跳过）: ");
                        io::stdout().flush()?;
                        input.clear();
                        io::stdin().read_line(&mut input)?;
                        let token = input.trim();
                        if !token.is_empty() {
                            gitlab_auth.token = Some(token.to_string());
                        } else {
                            print!("GitLab 用户名（可选，按 Enter 跳过）: ");
                            io::stdout().flush()?;
                            input.clear();
                            io::stdin().read_line(&mut input)?;
                            let username = input.trim();
                            if !username.is_empty() {
                                gitlab_auth.username = Some(username.to_string());
                                
                                print!("GitLab 密码（可选，按 Enter 跳过）: ");
                                io::stdout().flush()?;
                                input.clear();
                                io::stdin().read_line(&mut input)?;
                                let password = input.trim();
                                if !password.is_empty() {
                                    gitlab_auth.password = Some(password.to_string());
                                }
                            }
                        }
                        
                        config.repos.push(crate::config::RepoConfig::GitLab(
                            crate::config::GitLabConfig {
                                gitlab: gitlab_auth,
                            },
                        ));
                        println!("✓ 已添加 GitLab 仓库");
                    }
                }
                "ftp" => {
                    print!("FTP URL: ");
                    io::stdout().flush()?;
                    input.clear();
                    io::stdin().read_line(&mut input)?;
                    let url = input.trim();
                    if !url.is_empty() {
                        let mut ftp_auth = crate::config::FTPAuth {
                            r#type: Some("ftp".to_string()),
                            url: url.to_string(),
                            username: None,
                            password: None,
                        };
                        
                        print!("FTP 用户名（可选，按 Enter 跳过）: ");
                        io::stdout().flush()?;
                        input.clear();
                        io::stdin().read_line(&mut input)?;
                        let username = input.trim();
                        if !username.is_empty() {
                            ftp_auth.username = Some(username.to_string());
                            
                            print!("FTP 密码（可选，按 Enter 跳过）: ");
                            io::stdout().flush()?;
                            input.clear();
                            io::stdin().read_line(&mut input)?;
                            let password = input.trim();
                            if !password.is_empty() {
                                ftp_auth.password = Some(password.to_string());
                            }
                        }
                        
                        config.repos.push(crate::config::RepoConfig::FTP(
                            crate::config::FTPConfig {
                                ftp: ftp_auth,
                            },
                        ));
                        println!("✓ 已添加 FTP 仓库");
                    }
                }
                _ => {
                    println!("⚠️  未知的仓库类型: {}，请使用 local/github/gitlab/ftp", repo_type);
                }
            }
        }
    } else {
        // 非交互模式，使用默认配置
        println!("🔧 使用默认配置创建配置文件");
    }
    
    // 确保至少有一个仓库配置
    if config.repos.is_empty() {
        println!("⚠️  未添加任何仓库，将创建空配置");
    }
    
    // 写入配置文件
    let yaml_content = serde_yaml::to_string(&config)?;
    std::fs::write(&config_path, yaml_content)?;
    
    println!("\n✅ 配置文件已创建: {}", config_path.display());
    println!("💡 提示: 你可以随时编辑此文件来修改配置");
    
    Ok(())
}

pub async fn handle_help(args: HelpArgs) -> anyhow::Result<()> {
    TemplateManager::show_help(args.addons, args.template).await
}

pub async fn handle_workspace_create(args: WorkspaceCreateArgs) -> anyhow::Result<()> {
    let mut manager = WorkspaceManagerConfig::load()?;
    
    // 解析工作区路径
    let workspace_path = if let Some(path) = args.path {
        // 用户明确指定了路径
        if path == "." || path == "./" {
            std::env::current_dir()?
        } else {
            let path_buf = PathBuf::from(&path);
            if path_buf.is_absolute() {
                path_buf
            } else {
                std::env::current_dir()?.join(&path)
            }
        }
    } else {
        // 用户未指定路径，在当前目录下创建同名子目录
        std::env::current_dir()?.join(&args.name)
    };
    
    if !workspace_path.exists() {
        std::fs::create_dir_all(&workspace_path)?;
    }
    
    if !workspace_path.is_dir() {
        anyhow::bail!("指定的路径不是目录: {}", workspace_path.display());
    }
    
    // 检查是否已有 .qclocal 文件（表示这是一个应用目录）
    if workspace_path.join(".qclocal").exists() {
        anyhow::bail!("该目录已包含应用配置，不能作为工作区根目录");
    }
    
    // 初始化工作区配置文件（如果不存在）
    let config_path = workspace_path.join(".qclrc");
    let config_created = if !config_path.exists() {
        // 尝试从全局配置继承 repos（如果存在）
        let mut config = crate::config::Config {
            username: None,
            password: None,
            token: None,
            proxy: None,
            repos: vec![],
            ai: None,
            workspace: Some(crate::config::WorkspaceInfo {
                name: args.name.clone(),
                description: None,
            }),
        };
        
        // 尝试加载全局配置，继承 repos
        if let Ok(Some(global_config)) = crate::config::Config::load() {
            config.repos = global_config.repos.clone();
        }
        
        // 写入配置文件
        let yaml_content = serde_yaml::to_string(&config)?;
        std::fs::write(&config_path, yaml_content)?;
        true
    } else {
        // 如果配置文件已存在，更新工作区信息
        if let Ok(content) = std::fs::read_to_string(&config_path) {
            if let Ok(mut config) = serde_yaml::from_str::<crate::config::Config>(&content) {
                config.workspace = Some(crate::config::WorkspaceInfo {
                    name: args.name.clone(),
                    description: None,
                });
                let yaml_content = serde_yaml::to_string(&config)?;
                std::fs::write(&config_path, yaml_content)?;
            }
        }
        false
    };
    
    let workspace = WorkspaceConfig {
        name: args.name.clone(),
        path: workspace_path.to_string_lossy().to_string(),
        config: None,
        created_at: Some(Utc::now().to_rfc3339()),
    };
    
    manager.add_workspace(workspace)?;
    println!("工作区 '{}' 创建成功！", args.name);
    println!("工作区路径: {}", workspace_path.display());
    
    if config_created {
        println!("配置文件已初始化: {}", config_path.display());
    }
    
    Ok(())
}

pub async fn handle_workspace_list() -> anyhow::Result<()> {
    use std::fs;
    
    // 扫描当前目录下的所有子目录，查找包含 .qclrc 的目录
    let current_dir = std::env::current_dir()?;
    let mut workspaces = Vec::new();
    
    if current_dir.is_dir() {
        for entry in fs::read_dir(&current_dir)? {
            let entry = entry?;
            let path = entry.path();
            
            // 只检查目录
            if !path.is_dir() {
                continue;
            }
            
            // 检查是否包含 .qclrc 文件
            let qclrc_path = path.join(".qclrc");
            if !qclrc_path.exists() {
                continue;
            }
            
            // 检查是否包含 .qclocal 文件（如果是应用目录，则跳过）
            if path.join(".qclocal").exists() {
                continue;
            }
            
            // 读取 .qclrc 文件
            if let Ok(content) = fs::read_to_string(&qclrc_path) {
                if let Ok(config) = serde_yaml::from_str::<crate::config::Config>(&content) {
                    if let Some(workspace_info) = config.workspace {
                        let dir_name = path.file_name()
                            .and_then(|n| n.to_str())
                            .unwrap_or("unknown")
                            .to_string();
                        
                        workspaces.push((dir_name, path, workspace_info));
                    }
                }
            }
        }
    }
    
    if workspaces.is_empty() {
        println!("没有找到工作区");
        return Ok(());
    }
    
    // 获取当前工作区（如果存在）
    let manager = WorkspaceManagerConfig::load().ok();
    let current_workspace_name = manager
        .as_ref()
        .and_then(|m| m.current_workspace.as_ref());
    
    println!("工作区列表:");
    for (_dir_name, workspace_path, workspace_info) in &workspaces {
        let current_marker = if current_workspace_name.map(|s| s.as_str()) == Some(&workspace_info.name) {
            " (当前)"
        } else {
            ""
        };
        println!("  - {}{}", workspace_info.name, current_marker);
        println!("    路径: {}", workspace_path.display());
        if let Some(description) = &workspace_info.description {
            println!("    描述: {}", description);
        }
    }
    
    println!("\n共找到 {} 个工作区", workspaces.len());
    
    Ok(())
}

pub async fn handle_workspace_use(args: WorkspaceUseArgs) -> anyhow::Result<()> {
    let mut manager = WorkspaceManagerConfig::load()?;
    manager.set_current(&args.name)?;
    println!("已切换到工作区: {}", args.name);
    Ok(())
}

pub async fn handle_workspace_current() -> anyhow::Result<()> {
    let manager = WorkspaceManagerConfig::load()?;
    
    if let Some(workspace) = manager.get_current() {
        println!("当前工作区: {}", workspace.name);
        println!("路径: {}", workspace.path);
    } else {
        println!("未设置当前工作区");
    }
    
    Ok(())
}

pub async fn handle_workspace_delete(args: WorkspaceDeleteArgs) -> anyhow::Result<()> {
    let mut manager = WorkspaceManagerConfig::load()?;
    manager.remove_workspace(&args.name)?;
    println!("工作区 '{}' 已删除", args.name);
    Ok(())
}

pub async fn handle_app_list() -> anyhow::Result<()> {
    let manager = WorkspaceManagerConfig::load()?;
    
    let workspace_path = if let Some(workspace) = manager.get_current() {
        PathBuf::from(&workspace.path)
    } else {
        // 如果没有当前工作区，使用当前目录
        std::env::current_dir()?
    };
    
    if !workspace_path.exists() {
        anyhow::bail!("工作区路径不存在: {}", workspace_path.display());
    }
    
    // 查找所有包含 .qclocal 的子目录，并读取项目信息
    struct AppInfo {
        project_name: String,
        dir_name: String,
        template: String,
    }
    
    let mut apps = Vec::new();
    if workspace_path.is_dir() {
        for entry in fs::read_dir(&workspace_path)? {
            let entry = entry?;
            let path = entry.path();
            if path.is_dir() && path.join(".qclocal").exists() {
                // 读取 .qclocal 文件获取项目信息
                if let Ok(Some(qclocal)) = Config::load_qclocal_from_dir(&path) {
                    let project_name = qclocal.project
                        .unwrap_or_else(|| {
                            path.file_name()
                                .and_then(|n| n.to_str())
                                .unwrap_or("unknown")
                                .to_string()
                        });
                    
                    let dir_name = path.file_name()
                        .and_then(|n| n.to_str())
                        .unwrap_or("unknown")
                        .to_string();
                    
                    apps.push(AppInfo {
                        project_name,
                        dir_name,
                        template: qclocal.template,
                    });
                }
            }
        }
    }
    
    if apps.is_empty() {
        println!("当前目录下没有找到应用");
    } else {
        println!("应用列表:");
        // 按项目名称排序
        apps.sort_by(|a, b| a.project_name.cmp(&b.project_name));
        
        for app in &apps {
            println!("  - {} (模板: {}, 目录: {})", 
                app.project_name, 
                app.template,
                app.dir_name
            );
        }
        println!("\n共找到 {} 个应用", apps.len());
    }
    
    Ok(())
}

pub async fn handle_config_get(args: ConfigGetArgs) -> anyhow::Result<()> {
    // 优先从当前目录的 .qclocal 读取
    let current_dir = std::env::current_dir().ok();
    if let Some(dir) = current_dir {
        if let Ok(Some(qclocal)) = Config::load_qclocal_from_dir(&dir) {
            match args.key.as_str() {
                "project" => {
                    if let Some(project) = qclocal.project {
                        println!("{}", project);
                        return Ok(());
                    }
                }
                "template" => {
                    println!("{}", qclocal.template);
                    return Ok(());
                }
                _ => {}
            }
        }
    }
    
    // 从工作区配置读取
    let manager = WorkspaceManagerConfig::load()?;
    if let Some(workspace) = manager.get_current() {
        if let Some(ref config) = workspace.config {
            match args.key.as_str() {
                "username" => {
                    if let Some(ref username) = config.username {
                        println!("{}", username);
                        return Ok(());
                    }
                }
                "repos" => {
                    println!("{}", serde_yaml::to_string(&config.repos)?);
                    return Ok(());
                }
                _ => {}
            }
        }
    }
    
    // 从全局配置读取
    if let Some(config) = Config::load()? {
        match args.key.as_str() {
            "username" => {
                if let Some(ref username) = config.username {
                    println!("{}", username);
                    return Ok(());
                }
            }
            "repos" => {
                println!("{}", serde_yaml::to_string(&config.repos)?);
                return Ok(());
            }
            _ => {}
        }
    }
    
    eprintln!("配置键 '{}' 未找到", args.key);
    Ok(())
}

pub async fn handle_config_set(_args: ConfigSetArgs) -> anyhow::Result<()> {
    eprintln!("配置设置功能暂未实现");
    Ok(())
}

pub async fn handle_config_list() -> anyhow::Result<()> {
    println!("配置信息:");
    
    // 显示当前工作区
    let manager = WorkspaceManagerConfig::load()?;
    if let Some(workspace) = manager.get_current() {
        println!("当前工作区: {}", workspace.name);
    }
    
    // 显示全局配置
    if let Some(config) = Config::load()? {
        println!("\n全局配置:");
        if let Some(ref username) = config.username {
            println!("  username: {}", username);
        }
        println!("  repos: {} 个仓库", config.repos.len());
    }
    
    Ok(())
}

// AI 命令处理函数
pub async fn handle_ai_chat(args: AiChatArgs) -> anyhow::Result<()> {
    use crate::ai::AIAssistant;
    use crate::config::Config;
    
    let config = Config::load()?;
    let ai_config = config.and_then(|c| c.ai);
    
    if let Some(ai_config) = ai_config {
        let assistant = AIAssistant::new(ai_config.into())?;
        let response = assistant.suggest(&args.message, args.context.as_deref()).await?;
        println!("{}", response);
    } else {
        eprintln!("⚠️  AI 功能未配置。请在配置文件中添加 AI 配置。");
        eprintln!("💡 提示: 使用 `cocli config set ai.mcp.server_url <URL>` 配置 MCP 服务器");
    }
    
    Ok(())
}

pub async fn handle_ai_suggest(args: AiSuggestArgs) -> anyhow::Result<()> {
    use crate::ai::AIAssistant;
    use crate::config::Config;
    use std::path::PathBuf;
    
    let config = Config::load()?;
    let ai_config = config.and_then(|c| c.ai);
    
    if let Some(ai_config) = ai_config {
        let assistant = AIAssistant::new(ai_config.into())?;
        let project_path = PathBuf::from(&args.project_path);
        let suggestions = assistant.analyze_project(&project_path).await?;
        println!("📋 项目建议:");
        println!("{}", suggestions);
    } else {
        eprintln!("⚠️  AI 功能未配置。请在配置文件中添加 AI 配置。");
    }
    
    Ok(())
}

pub async fn handle_ai_tools() -> anyhow::Result<()> {
    use crate::ai::AIAssistant;
    use crate::config::Config;
    
    let config = Config::load()?;
    let ai_config = config.and_then(|c| c.ai);
    
    if let Some(ai_config) = ai_config {
        let assistant = AIAssistant::new(ai_config.into())?;
        let tools = assistant.list_mcp_tools().await?;
        
        if tools.is_empty() {
            println!("没有可用的 MCP 工具");
        } else {
            println!("可用的 MCP 工具:");
            for tool in &tools {
                println!("  - {}: {}", tool.name, tool.description);
            }
        }
    } else {
        eprintln!("⚠️  AI 功能未配置");
    }
    
    Ok(())
}

pub async fn handle_ai_resources() -> anyhow::Result<()> {
    use crate::ai::AIAssistant;
    use crate::config::Config;
    
    let config = Config::load()?;
    let ai_config = config.and_then(|c| c.ai);
    
    if let Some(ai_config) = ai_config {
        let assistant = AIAssistant::new(ai_config.into())?;
        let resources = assistant.list_mcp_resources().await?;
        
        if resources.is_empty() {
            println!("没有可用的 MCP 资源");
        } else {
            println!("可用的 MCP 资源:");
            for resource in resources {
                println!("  - {} ({})", resource.name, resource.uri);
                if let Some(desc) = resource.description {
                    println!("    {}", desc);
                }
            }
        }
    } else {
        eprintln!("⚠️  AI 功能未配置");
    }
    
    Ok(())
}

// Skills 命令处理函数
pub async fn handle_skills_list() -> anyhow::Result<()> {
    use crate::skills::SkillsManager;
    
    let manager = SkillsManager::new(None)?;
    let skills = manager.list_skills()?;
    
    if skills.is_empty() {
        println!("没有可用的 Skills");
        println!("💡 提示: 使用 `cocli ai skills create <name>` 创建新 Skill");
    } else {
        println!("可用的 Skills:");
        for skill in skills {
            println!("  - {}", skill);
        }
    }
    
    Ok(())
}

pub async fn handle_skills_show(args: SkillsShowArgs) -> anyhow::Result<()> {
    use crate::skills::SkillsManager;
    
    let manager = SkillsManager::new(None)?;
    let skill = manager.get_skill_info(&args.skill_name)?;
    
    println!("Skill: {}", skill.name);
    if let Some(desc) = skill.description {
        println!("描述: {}", desc);
    }
    if let Some(version) = skill.version {
        println!("版本: {}", version);
    }
    
    if let Some(ref inputs) = skill.inputs {
        println!("\n输入参数:");
        for (name, def) in inputs {
            let required = if def.required.unwrap_or(false) { "必需" } else { "可选" };
            println!("  - {} ({}, {})", name, def.r#type, required);
            if let Some(desc) = &def.description {
                println!("    {}", desc);
            }
        }
    }
    
    if let Some(ref outputs) = skill.outputs {
        println!("\n输出:");
        for (name, def) in outputs {
            println!("  - {} ({})", name, def.r#type);
            if let Some(desc) = &def.description {
                println!("    {}", desc);
            }
        }
    }
    
    Ok(())
}

pub async fn handle_skills_execute(args: SkillsExecuteArgs) -> anyhow::Result<()> {
    use crate::skills::SkillsManager;
    use std::collections::HashMap;
    
    let manager = SkillsManager::new(None)?;
    
    let inputs = if let Some(inputs_str) = args.inputs {
        serde_json::from_str::<HashMap<String, serde_json::Value>>(&inputs_str)?
    } else {
        HashMap::new()
    };
    
    let outputs = manager.execute_skill(&args.skill_name, inputs).await?;
    
    println!("Skill 执行完成:");
    for (key, value) in outputs {
        println!("  {}: {}", key, value);
    }
    
    Ok(())
}

pub async fn handle_skills_create(args: SkillsCreateArgs) -> anyhow::Result<()> {
    use crate::skills::{SkillsManager, builtin};
    
    let manager = SkillsManager::new(None)?;
    
    let skill = if let Some(template) = args.template {
        match template.as_str() {
            "project_suggestion" => builtin::create_project_suggestion_skill(),
            "template_selection" => builtin::create_template_selection_skill(),
            _ => {
                anyhow::bail!("未知的模板: {}。可用模板: project_suggestion, template_selection", template);
            }
        }
    } else {
        // 创建基本 Skill
        crate::skills::SkillConfig {
            name: args.skill_name.clone(),
            description: args.description,
            version: Some("1.0.0".to_string()),
            prompt_template: None,
            workflow: None,
            inputs: None,
            outputs: None,
            metadata: std::collections::HashMap::new(),
        }
    };
    
    manager.save_skill(&skill)?;
    println!("✅ Skill '{}' 创建成功", args.skill_name);
    
    Ok(())
}

pub async fn handle_skills_delete(args: SkillsDeleteArgs) -> anyhow::Result<()> {
    use crate::skills::SkillsManager;
    
    let manager = SkillsManager::new(None)?;
    manager.delete_skill(&args.skill_name)?;
    println!("✅ Skill '{}' 已删除", args.skill_name);
    
    Ok(())
}

pub async fn handle_template_create(args: TemplateCreateArgs) -> anyhow::Result<()> {
    use crate::config::Meta;
    use std::path::PathBuf;
    use std::collections::HashMap;
    use anyhow::Context;
    
    // 解析仓库目录
    let repo_dir = if args.repo_dir == "." || args.repo_dir == "./" {
        std::env::current_dir()?
    } else {
        let path = PathBuf::from(&args.repo_dir);
        if path.is_absolute() {
            path
        } else {
            std::env::current_dir()?.join(&args.repo_dir)
        }
    };
    
    if !repo_dir.exists() {
        anyhow::bail!("仓库目录不存在: {}", repo_dir.display());
    }
    
    if !repo_dir.is_dir() {
        anyhow::bail!("指定的路径不是目录: {}", repo_dir.display());
    }
    
    // 确定模板路径
    let template_path = if let Some(path) = args.path {
        path
    } else {
        format!("templates/{}", args.name)
    };
    
    // 创建模板目录
    let template_dir = repo_dir.join(&template_path);
    if template_dir.exists() {
        anyhow::bail!("模板目录已存在: {}", template_dir.display());
    }
    
    fs::create_dir_all(&template_dir)?;
    println!("✅ 已创建模板目录: {}", template_dir.display());
    
    // 创建基本的 README.md
    let readme_path = template_dir.join("README.md");
    if !readme_path.exists() {
        let readme_content = format!("# {}\n\n这是一个使用 CoCli 创建的模板。\n\n## 使用方法\n\n```bash\ncocli app create --template={} <项目名>\n```\n", 
            args.name, args.name);
        fs::write(&readme_path, readme_content)?;
        println!("✅ 已创建 README.md");
    }
    
    // 读取或创建 meta.yaml
    let meta_path = repo_dir.join("meta.yaml");
    let mut meta = if meta_path.exists() {
        let content = fs::read_to_string(&meta_path)?;
        serde_yaml::from_str::<Meta>(&content)
            .context("解析 meta.yaml 失败")?
    } else {
        Meta {
            templates: None,
            addons: None,
        }
    };
    
    // 更新模板配置
    let template_config = crate::config::TemplateConfig {
        root: crate::config::TemplateRoot::Single(format!("{}/**", template_path)),
    };
    
    if meta.templates.is_none() {
        meta.templates = Some(HashMap::new());
    }
    
    if let Some(ref mut templates) = meta.templates {
        if templates.contains_key(&args.name) {
            anyhow::bail!("模板 '{}' 已在 meta.yaml 中存在", args.name);
        }
        templates.insert(args.name.clone(), template_config);
    }
    
    // 保存 meta.yaml
    let yaml_content = serde_yaml::to_string(&meta)?;
    fs::write(&meta_path, yaml_content)?;
    println!("✅ 已更新 meta.yaml");
    
    println!("\n✅ 模板 '{}' 创建成功！", args.name);
    println!("💡 提示: 模板路径: {}", template_dir.display());
    println!("💡 提示: 使用 `cocli template list` 查看所有模板");
    
    Ok(())
}

pub async fn handle_addons_create(args: AddonsCreateArgs) -> anyhow::Result<()> {
    use crate::config::Meta;
    use std::path::PathBuf;
    use std::collections::HashMap;
    use anyhow::Context;
    
    // 解析仓库目录
    let repo_dir = if args.repo_dir == "." || args.repo_dir == "./" {
        std::env::current_dir()?
    } else {
        let path = PathBuf::from(&args.repo_dir);
        if path.is_absolute() {
            path
        } else {
            std::env::current_dir()?.join(&args.repo_dir)
        }
    };
    
    if !repo_dir.exists() {
        anyhow::bail!("仓库目录不存在: {}", repo_dir.display());
    }
    
    if !repo_dir.is_dir() {
        anyhow::bail!("指定的路径不是目录: {}", repo_dir.display());
    }
    
    // 确定插件路径
    let addon_path = if let Some(path) = args.path {
        path
    } else {
        format!("addons/{}", args.name)
    };
    
    // 创建插件目录
    let addon_dir = repo_dir.join(&addon_path);
    if addon_dir.exists() {
        anyhow::bail!("插件目录已存在: {}", addon_dir.display());
    }
    
    fs::create_dir_all(&addon_dir)?;
    println!("✅ 已创建插件目录: {}", addon_dir.display());
    
    // 创建基本的 README.md
    let readme_path = addon_dir.join("README.md");
    if !readme_path.exists() {
        let readme_content = format!("# {}\n\n这是一个使用 CoCli 创建的插件。\n\n## 使用方法\n\n```bash\ncocli addons add {} [项目目录]\n```\n", 
            args.name, args.name);
        fs::write(&readme_path, readme_content)?;
        println!("✅ 已创建 README.md");
    }
    
    // 读取或创建 meta.yaml
    let meta_path = repo_dir.join("meta.yaml");
    let mut meta = if meta_path.exists() {
        let content = fs::read_to_string(&meta_path)?;
        serde_yaml::from_str::<Meta>(&content)
            .context("解析 meta.yaml 失败")?
    } else {
        Meta {
            templates: None,
            addons: None,
        }
    };
    
    // 更新插件配置
    let addon_config = crate::config::AddonConfig {
        root: crate::config::TemplateRoot::Single(format!("{}/**", addon_path)),
    };
    
    if meta.addons.is_none() {
        meta.addons = Some(HashMap::new());
    }
    
    if let Some(ref mut addons) = meta.addons {
        if addons.contains_key(&args.name) {
            anyhow::bail!("插件 '{}' 已在 meta.yaml 中存在", args.name);
        }
        addons.insert(args.name.clone(), addon_config);
    }
    
    // 保存 meta.yaml
    let yaml_content = serde_yaml::to_string(&meta)?;
    fs::write(&meta_path, yaml_content)?;
    println!("✅ 已更新 meta.yaml");
    
    println!("\n✅ 插件 '{}' 创建成功！", args.name);
    println!("💡 提示: 插件路径: {}", addon_dir.display());
    println!("💡 提示: 使用 `cocli addons list` 查看所有插件");
    
    Ok(())
}
