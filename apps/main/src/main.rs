mod config;
mod commands;
mod repo;
mod template;
mod suggest;
mod ai;
mod skills;

use anyhow::Result;
use clap::Parser;

#[tokio::main]
async fn main() -> Result<()> {
    // 使用自定义错误处理
    let cli = match commands::Cli::try_parse() {
        Ok(cli) => cli,
        Err(e) => {
            // 如果是帮助请求，直接使用 clap 的默认行为
            if e.kind() == clap::error::ErrorKind::DisplayHelp || e.kind() == clap::error::ErrorKind::DisplayHelpOnMissingArgumentOrSubcommand {
                e.print().unwrap();
                std::process::exit(0);
            }
            
            // 处理 clap 错误，提供智能建议
            let error_msg = e.to_string();
            
            // 检查是否是未知命令错误
            if error_msg.contains("unrecognized subcommand") || error_msg.contains("unexpected argument") {
                eprintln!("❌ {}", error_msg);
                
                // 尝试提取命令名称
                let args: Vec<String> = std::env::args().skip(1).collect();
                if let Some(first_arg) = args.first() {
                    let suggestion = suggest::SmartSuggest::suggest_command(first_arg);
                    if !suggestion.is_empty() {
                        eprintln!("{}", suggestion);
                    }
                }
                
                eprintln!("{}", suggest::SmartSuggest::generate_usage_hint());
            } else {
                eprintln!("❌ {}", error_msg);
                eprintln!("\n💡 提示: 使用 `cocli --help` 查看所有可用命令");
            }
            
            std::process::exit(1);
        }
    };

    // 检查配置
    if let Err(e) = check_configuration().await {
        eprintln!("⚠️  配置检查失败: {}", e);
        eprintln!("💡 提示: 请确保已创建配置文件 `.qclrc` 或 `.qcl.yaml`");
    }

    match cli.command {
        commands::Commands::Workspace(cmd) => {
            match cmd {
                commands::WorkspaceCommands::Create(args) => {
                    commands::handle_workspace_create(args).await?;
                }
                commands::WorkspaceCommands::List => {
                    commands::handle_workspace_list().await?;
                }
                commands::WorkspaceCommands::Use(args) => {
                    commands::handle_workspace_use(args).await?;
                }
                commands::WorkspaceCommands::Current => {
                    commands::handle_workspace_current().await?;
                }
                commands::WorkspaceCommands::Delete(args) => {
                    commands::handle_workspace_delete(args).await?;
                }
            }
        }
        commands::Commands::App(cmd) => {
            match cmd {
                commands::AppCommands::Create(args) => {
                    commands::handle_create(args).await?;
                }
                commands::AppCommands::List => {
                    commands::handle_app_list().await?;
                }
            }
        }
        commands::Commands::Template(cmd) => {
            match cmd {
                commands::TemplateCommands::List => {
                    commands::handle_template_list().await?;
                }
                commands::TemplateCommands::Create(args) => {
                    commands::handle_template_create(args).await?;
                }
            }
        }
        commands::Commands::Addons(cmd) => {
            match cmd {
                commands::AddonsCommands::List(args) => {
                    commands::handle_addons_list(args).await?;
                }
                commands::AddonsCommands::Detail(args) => {
                    commands::handle_addons_detail(args).await?;
                }
                commands::AddonsCommands::Add(args) => {
                    commands::handle_addons_add(args).await?;
                }
                commands::AddonsCommands::Sync(args) => {
                    commands::handle_addons_sync(args).await?;
                }
                commands::AddonsCommands::Create(args) => {
                    commands::handle_addons_create(args).await?;
                }
            }
        }
        commands::Commands::Config(cmd) => {
            match cmd {
                commands::ConfigCommands::Get(args) => {
                    commands::handle_config_get(args).await?;
                }
                commands::ConfigCommands::Set(args) => {
                    commands::handle_config_set(args).await?;
                }
                commands::ConfigCommands::List => {
                    commands::handle_config_list().await?;
                }
            }
        }
        commands::Commands::Ai(cmd) => {
            match cmd {
                commands::AiCommands::Chat(args) => {
                    commands::handle_ai_chat(args).await?;
                }
                commands::AiCommands::Suggest(args) => {
                    commands::handle_ai_suggest(args).await?;
                }
                commands::AiCommands::Tools => {
                    commands::handle_ai_tools().await?;
                }
                commands::AiCommands::Resources => {
                    commands::handle_ai_resources().await?;
                }
                commands::AiCommands::Skills(skills_cmd) => {
                    match skills_cmd {
                        commands::SkillsCommands::List => {
                            commands::handle_skills_list().await?;
                        }
                        commands::SkillsCommands::Show(args) => {
                            commands::handle_skills_show(args).await?;
                        }
                        commands::SkillsCommands::Execute(args) => {
                            commands::handle_skills_execute(args).await?;
                        }
                        commands::SkillsCommands::Create(args) => {
                            commands::handle_skills_create(args).await?;
                        }
                        commands::SkillsCommands::Delete(args) => {
                            commands::handle_skills_delete(args).await?;
                        }
                    }
                }
            }
        }
        commands::Commands::Repo(cmd) => {
            match cmd {
                commands::RepoCommands::Create(args) => {
                    commands::handle_repo_create(args).await?;
                }
                commands::RepoCommands::Init(args) => {
                    commands::handle_repo_init(args).await?;
                }
            }
        }
        commands::Commands::Init(args) => {
            commands::handle_init(args).await?;
        }
        commands::Commands::Help(args) => {
            commands::handle_help(args).await?;
        }
        commands::Commands::Create(args) => {
            // 向后兼容：显示警告并使用新的命令
            eprintln!("警告: `cocli create` 已废弃，请使用 `cocli app create`");
            commands::handle_create(args).await?;
        }
    }

    Ok(())
}

/// 检查配置并提供建议
async fn check_configuration() -> Result<()> {
    use crate::config::Config;
    
    // 尝试加载配置
    match Config::load() {
        Ok(Some(_)) => {
            // 配置存在，检查是否有效
            Ok(())
        }
        Ok(None) => {
            // 没有配置，但不一定是错误（某些命令可能不需要配置）
            Ok(())
        }
        Err(e) => {
            // 配置加载失败
            Err(e)
        }
    }
}
