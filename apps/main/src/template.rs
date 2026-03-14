use crate::config::{AddonConfig, Config, QcLocalConfig, QcLocalAddonsConfig, RepoConfig, TemplateRoot};
use crate::repo::RepoManager;
use anyhow::Context;
use std::path::{Path, PathBuf};
use std::fs;

pub struct TemplateManager;

impl TemplateManager {
    pub async fn create(
        template_name: &str,
        addons: &[String],
        project_name: &str,
        config: Option<Config>,
    ) -> anyhow::Result<()> {
        let config = config.ok_or_else(|| anyhow::anyhow!("未找到配置文件，请先配置 .qclrc 或 .qcl.yaml"))?;

        // 查找模板
        let mut found_template = None;
        let mut repo_url = None;
        let mut repo_config: Option<RepoConfig> = None;

        for repo in &config.repos {
            let url = match repo.get_url() {
                Some(url) => url,
                None => {
                    eprintln!("警告: 仓库配置缺少 URL，跳过");
                    continue;
                }
            };

            match RepoManager::fetch_meta(&url, repo, &config).await {
                Ok(meta) => {
                    if let Some(templates) = &meta.templates {
                        if templates.contains_key(template_name) {
                            found_template = Some(templates[template_name].clone());
                            repo_url = Some(url);
                            repo_config = Some(repo.clone());
                            break;
                        }
                    }
                }
                Err(e) => {
                    eprintln!("警告: 无法从 {} 获取元数据: {}", url, e);
                    continue;
                }
            }
        }

        let template_config = found_template
            .ok_or_else(|| {
                let mut error_msg = format!("❌ 未找到模板: {}", template_name);
                error_msg.push_str(&format!("\n\n💡 提示: 使用 `cocli template list` 查看所有可用模板"));
                anyhow::anyhow!(error_msg)
            })?;

        let repo_url = repo_url.ok_or_else(|| anyhow::anyhow!("未找到仓库 URL"))?;
        let repo_config = repo_config.ok_or_else(|| anyhow::anyhow!("未找到仓库配置"))?;

        // 获取模板路径
        let template_paths = match &template_config.root {
            TemplateRoot::Single(path) => vec![path.clone()],
            TemplateRoot::Multiple(paths) => paths.clone(),
        };

        // 创建项目目录
        let project_path = PathBuf::from(project_name);
        if project_path.exists() {
            anyhow::bail!("目录已存在: {}", project_name);
        }
        std::fs::create_dir_all(&project_path)?;

        // 下载模板
        println!("正在下载模板 {}...", template_name);
        RepoManager::download_template(
            &repo_url,
            &template_paths,
            &project_path,
            &repo_config,
            &config,
        ).await.context("下载模板失败")?;

        // 处理 addons
        if !addons.is_empty() {
            println!("正在处理 addons...");
            
            // 确定 addons 基础目录（默认 ./addons）
            let addons_base_dir = project_path.join("addons");
            fs::create_dir_all(&addons_base_dir)?;
            
            // 重新获取 meta 来查找 addons
            let meta = RepoManager::fetch_meta(&repo_url, &repo_config, &config).await?;
            
            if let Some(addons_config) = &meta.addons {
                for addon_name in addons {
                    if let Some(addon) = addons_config.get(addon_name) {
                        let addon_paths = match &addon.root {
                            TemplateRoot::Single(path) => vec![path.clone()],
                            TemplateRoot::Multiple(paths) => paths.clone(),
                        };
                        
                        // 每个 addon 安装到自己的子目录：{addons_base_dir}/{addon_name}/
                        let addon_target_dir = addons_base_dir.join(addon_name);
                        
                        println!("正在下载 addon {} 到 {}...", addon_name, addon_target_dir.display());
                        RepoManager::download_template(
                            &repo_url,
                            &addon_paths,
                            &addon_target_dir,
                            &repo_config,
                            &config,
                        ).await.with_context(|| format!("下载 addon {} 失败", addon_name))?;
                    } else {
                        eprintln!("警告: 未找到 addon: {}", addon_name);
                    }
                }
            } else {
                eprintln!("警告: 仓库中未定义 addons");
            }
        }

        // 创建或更新 .qclocal 文件
        Self::create_or_update_qclocal(
            &project_path,
            project_name,
            template_name,
            &addons,
            Some(vec![repo_config.clone()]),
        ).await?;

        println!("✅ 项目 {} 创建成功！", project_name);
        println!("💡 提示: 使用 `cd {}` 进入项目目录", project_name);
        if !addons.is_empty() {
            println!("💡 提示: 使用 `cocli addons list` 查看所有可用插件");
        }
        Ok(())
    }

    async fn create_or_update_qclocal(
        project_path: &Path,
        project_name: &str,
        template_name: &str,
        initial_addons: &[String],
        repos: Option<Vec<RepoConfig>>,
    ) -> anyhow::Result<()> {
        let qclocal_path = project_path.join(".qclocal");
        
        // 检查模板中是否已经包含 .qclocal 文件
        if qclocal_path.exists() {
            // 如果存在，读取并更新 addons.include
            let content = fs::read_to_string(&qclocal_path)?;
            let mut qclocal: QcLocalConfig = serde_yaml::from_str(&content)
                .context("解析 .qclocal 文件失败")?;
            
            // 更新项目名称（如果未设置）
            if qclocal.project.is_none() {
                qclocal.project = Some(project_name.to_string());
            }
            
            // 更新 repos（如果提供了新的 repos 配置）
            if let Some(new_repos) = repos {
                qclocal.repos = Some(new_repos);
            }
            
            // 合并初始 addons 到 include 列表
            for addon in initial_addons {
                if !qclocal.addons.include.contains(addon) {
                    qclocal.addons.include.push(addon.clone());
                }
            }
            
            // 保存更新后的配置
            let updated_content = serde_yaml::to_string(&qclocal)?;
            fs::write(&qclocal_path, updated_content)?;
        } else {
            // 如果不存在，创建默认的 .qclocal 文件
            let qclocal = QcLocalConfig {
                project: Some(project_name.to_string()),
                template: template_name.to_string(),
                addons: QcLocalAddonsConfig {
                    target_dir: "./addons".to_string(),
                    include: initial_addons.to_vec(),
                },
                repos,
                inherit: false, // 默认不继承，如果提供了 repos 则使用提供的
            };
            
            let content = serde_yaml::to_string(&qclocal)?;
            fs::write(&qclocal_path, content)?;
        }
        
        Ok(())
    }

    pub async fn list_templates(config: Option<Config>) -> anyhow::Result<()> {
        // 优先从当前目录的 .qclocal 读取配置
        let current_dir = std::env::current_dir().ok();
        let (repos_to_search, config_for_auth) = if let Some(dir) = current_dir {
            if let Ok(Some(qclocal)) = Config::load_qclocal_from_dir(&dir) {
                if let Some(ref repos) = qclocal.repos {
                    // .qclocal 中有 repos 配置，优先使用它
                    let global_config = config.or_else(|| Config::load().ok().flatten());
                    let auth_config = global_config.unwrap_or_else(|| Config {
                        username: None,
                        password: None,
                        token: None,
                        proxy: None,
                        repos: vec![],
                        ai: None,
                        workspace: None,
                    });
                    (repos.clone(), auth_config)
                } else {
                    // .qclocal 中没有 repos，使用传入的配置或查找父级配置
                    match config {
                        Some(cfg) => (cfg.repos.clone(), cfg),
                        None => {
                            match Config::load_from_parent(&dir)? {
                                Some(parent_config) => (parent_config.repos.clone(), parent_config),
                                None => {
                                    let cfg = Config::load()?
                                        .ok_or_else(|| anyhow::anyhow!("未找到配置文件，请先配置 .qclrc 或 .qcl.yaml"))?;
                                    (cfg.repos.clone(), cfg)
                                }
                            }
                        }
                    }
                }
            } else {
                // 没有 .qclocal，使用传入的配置或查找父级配置
                match config {
                    Some(cfg) => (cfg.repos.clone(), cfg),
                    None => {
                        match Config::load_from_parent(&dir)? {
                            Some(parent_config) => (parent_config.repos.clone(), parent_config),
                            None => {
                                let cfg = Config::load()?
                                    .ok_or_else(|| anyhow::anyhow!("未找到配置文件，请先配置 .qclrc 或 .qcl.yaml"))?;
                                (cfg.repos.clone(), cfg)
                            }
                        }
                    }
                }
            }
        } else {
            // 无法获取当前目录，使用传入的配置或全局配置
            let cfg = config.or_else(|| Config::load().ok().flatten())
                .ok_or_else(|| anyhow::anyhow!("未找到配置文件，请先配置 .qclrc 或 .qcl.yaml"))?;
            (cfg.repos.clone(), cfg)
        };

        let mut all_templates = std::collections::HashSet::new();

        for repo in &repos_to_search {
            let url = match repo.get_url() {
                Some(url) => url,
                None => {
                    eprintln!("警告: 仓库配置缺少 URL，跳过");
                    continue;
                }
            };

            match RepoManager::fetch_meta(&url, repo, &config_for_auth).await {
                Ok(meta) => {
                    if let Some(templates) = &meta.templates {
                        for template_name in templates.keys() {
                            all_templates.insert(template_name.clone());
                        }
                    }
                }
                Err(e) => {
                    eprintln!("警告: 无法从 {} 获取元数据: {}", url, e);
                    continue;
                }
            }
        }

        if all_templates.is_empty() {
            println!("未找到任何模板");
        } else {
            println!("可用的模板:");
            let mut sorted_templates: Vec<_> = all_templates.iter().collect();
            sorted_templates.sort();
            for template in sorted_templates {
                println!("  - {}", template);
            }
        }

        Ok(())
    }

    pub async fn list_addons(config: Option<Config>, verbose: bool) -> anyhow::Result<()> {
        // 优先从当前目录的 .qclocal 读取配置
        let current_dir = std::env::current_dir().ok();
        let (repos_to_search, config_for_auth) = if let Some(dir) = current_dir {
            if let Ok(Some(qclocal)) = Config::load_qclocal_from_dir(&dir) {
                if let Some(ref repos) = qclocal.repos {
                    // .qclocal 中有 repos 配置，优先使用它
                    let global_config = config.or_else(|| Config::load().ok().flatten());
                    let auth_config = global_config.unwrap_or_else(|| Config {
                        username: None,
                        password: None,
                        token: None,
                        proxy: None,
                        repos: vec![],
                        ai: None,
                        workspace: None,
                    });
                    (repos.clone(), auth_config)
                } else {
                    // .qclocal 中没有 repos，使用传入的配置或查找父级配置
                    match config {
                        Some(cfg) => (cfg.repos.clone(), cfg),
                        None => {
                            match Config::load_from_parent(&dir)? {
                                Some(parent_config) => (parent_config.repos.clone(), parent_config),
                                None => {
                                    let cfg = Config::load()?
                                        .ok_or_else(|| anyhow::anyhow!("未找到配置文件，请先配置 .qclrc 或 .qcl.yaml"))?;
                                    (cfg.repos.clone(), cfg)
                                }
                            }
                        }
                    }
                }
            } else {
                // 没有 .qclocal，使用传入的配置或查找父级配置
                match config {
                    Some(cfg) => (cfg.repos.clone(), cfg),
                    None => {
                        match Config::load_from_parent(&dir)? {
                            Some(parent_config) => (parent_config.repos.clone(), parent_config),
                            None => {
                                let cfg = Config::load()?
                                    .ok_or_else(|| anyhow::anyhow!("未找到配置文件，请先配置 .qclrc 或 .qcl.yaml"))?;
                                (cfg.repos.clone(), cfg)
                            }
                        }
                    }
                }
            }
        } else {
            // 无法获取当前目录，使用传入的配置或全局配置
            let cfg = config.or_else(|| Config::load().ok().flatten())
                .ok_or_else(|| anyhow::anyhow!("未找到配置文件，请先配置 .qclrc 或 .qcl.yaml"))?;
            (cfg.repos.clone(), cfg)
        };

        if verbose {
            // 详细模式：显示每个 addon 的详细信息
            let mut addon_details: Vec<(String, String, AddonConfig)> = Vec::new();

            for repo in &repos_to_search {
                let url = match repo.get_url() {
                    Some(url) => url,
                    None => {
                        eprintln!("警告: 仓库配置缺少 URL，跳过");
                        continue;
                    }
                };

                match RepoManager::fetch_meta(&url, repo, &config_for_auth).await {
                    Ok(meta) => {
                        if let Some(addons) = &meta.addons {
                            for (addon_name, addon_config) in addons {
                                addon_details.push((addon_name.clone(), url.clone(), addon_config.clone()));
                            }
                        }
                    }
                    Err(e) => {
                        eprintln!("警告: 无法从 {} 获取元数据: {}", url, e);
                        continue;
                    }
                }
            }

            if addon_details.is_empty() {
                println!("未找到任何 addons");
            } else {
                // 按 addon 名称排序
                addon_details.sort_by(|a, b| a.0.cmp(&b.0));
                
                println!("可用的 addons (详细信息):\n");
                for (addon_name, repo_url, addon_config) in &addon_details {
                    println!("{}", addon_name);
                    println!("  来源: {}", repo_url);
                    println!("  路径配置:");
                    match &addon_config.root {
                        TemplateRoot::Single(path) => {
                            println!("    - {}", path);
                        }
                        TemplateRoot::Multiple(paths) => {
                            for path in paths {
                                println!("    - {}", path);
                            }
                        }
                    }
                    
                    // 尝试读取 README.md
                    let readme_path = match &addon_config.root {
                        TemplateRoot::Single(path) => {
                            // 从路径中提取基础目录（去掉通配符）
                            let base_path = path.trim_end_matches("/**").trim_end_matches("/*");
                            format!("{}/README.md", base_path)
                        }
                        TemplateRoot::Multiple(paths) => {
                            // 使用第一个路径
                            if let Some(first_path) = paths.first() {
                                let base_path = first_path.trim_end_matches("/**").trim_end_matches("/*");
                                format!("{}/README.md", base_path)
                            } else {
                                continue;
                            }
                        }
                    };
                    
                    // 查找对应的 repo 配置
                    let repo_config = repos_to_search.iter()
                        .find(|r| r.get_url().as_ref().map(|u| u == repo_url).unwrap_or(false));
                    
                    if let Some(repo) = repo_config {
                        match RepoManager::read_file_from_repo(repo_url, &readme_path, repo, &config_for_auth).await {
                            Ok(Some(readme_content)) => {
                                // 过滤空行并显示 README 内容（限制行数，避免输出过长）
                                let non_empty_lines: Vec<&str> = readme_content.lines()
                                    .filter(|line| !line.trim().is_empty())
                                    .take(10)
                                    .collect();
                                if !non_empty_lines.is_empty() {
                                    println!("  详细信息:");
                                    for line in non_empty_lines {
                                        println!("    {}", line);
                                    }
                                    let total_non_empty_lines = readme_content.lines()
                                        .filter(|line| !line.trim().is_empty())
                                        .count();
                                    if total_non_empty_lines > 10 {
                                        println!("    ...");
                                    }
                                } else {
                                    println!("  详细信息: 暂无详细信息");
                                }
                            }
                            Ok(None) => {
                                println!("  详细信息: 暂无详细信息");
                            }
                            Err(_) => {
                                println!("  详细信息: 暂无详细信息");
                            }
                        }
                    } else {
                        println!("  详细信息: 暂无详细信息");
                    }
                    
                    println!();
                }
                println!("共找到 {} 个 addons", addon_details.len());
            }
        } else {
            // 简单模式：只显示 addon 名称列表
            let mut all_addons = std::collections::HashSet::new();

            for repo in &repos_to_search {
                let url = match repo.get_url() {
                    Some(url) => url,
                    None => {
                        eprintln!("警告: 仓库配置缺少 URL，跳过");
                        continue;
                    }
                };

                match RepoManager::fetch_meta(&url, repo, &config_for_auth).await {
                    Ok(meta) => {
                        if let Some(addons) = &meta.addons {
                            for addon_name in addons.keys() {
                                all_addons.insert(addon_name.clone());
                            }
                        }
                    }
                    Err(e) => {
                        eprintln!("警告: 无法从 {} 获取元数据: {}", url, e);
                        continue;
                    }
                }
            }

            if all_addons.is_empty() {
                println!("未找到任何 addons");
            } else {
                println!("可用的 addons:");
                let mut sorted_addons: Vec<_> = all_addons.iter().collect();
                sorted_addons.sort();
                for addon in sorted_addons {
                    println!("  - {}", addon);
                }
            }
        }

        Ok(())
    }

    pub async fn detail_addon(config: Option<Config>, addon_name: &str) -> anyhow::Result<()> {
        // 优先从当前目录的 .qclocal 读取配置
        let current_dir = std::env::current_dir().ok();
        let (repos_to_search, config_for_auth) = if let Some(dir) = current_dir {
            if let Ok(Some(qclocal)) = Config::load_qclocal_from_dir(&dir) {
                if let Some(ref repos) = qclocal.repos {
                    // .qclocal 中有 repos 配置，优先使用它
                    let global_config = config.or_else(|| Config::load().ok().flatten());
                    let auth_config = global_config.unwrap_or_else(|| Config {
                        username: None,
                        password: None,
                        token: None,
                        proxy: None,
                        repos: vec![],
                        ai: None,
                        workspace: None,
                    });
                    (repos.clone(), auth_config)
                } else {
                    // .qclocal 中没有 repos，使用传入的配置或查找父级配置
                    match config {
                        Some(cfg) => (cfg.repos.clone(), cfg),
                        None => {
                            match Config::load_from_parent(&dir)? {
                                Some(parent_config) => (parent_config.repos.clone(), parent_config),
                                None => {
                                    let cfg = Config::load()?
                                        .ok_or_else(|| anyhow::anyhow!("未找到配置文件，请先配置 .qclrc 或 .qcl.yaml"))?;
                                    (cfg.repos.clone(), cfg)
                                }
                            }
                        }
                    }
                }
            } else {
                // 没有 .qclocal，使用传入的配置或查找父级配置
                match config {
                    Some(cfg) => (cfg.repos.clone(), cfg),
                    None => {
                        match Config::load_from_parent(&dir)? {
                            Some(parent_config) => (parent_config.repos.clone(), parent_config),
                            None => {
                                let cfg = Config::load()?
                                    .ok_or_else(|| anyhow::anyhow!("未找到配置文件，请先配置 .qclrc 或 .qcl.yaml"))?;
                                (cfg.repos.clone(), cfg)
                            }
                        }
                    }
                }
            }
        } else {
            // 无法获取当前目录，使用传入的配置或全局配置
            let cfg = config.or_else(|| Config::load().ok().flatten())
                .ok_or_else(|| anyhow::anyhow!("未找到配置文件，请先配置 .qclrc 或 .qcl.yaml"))?;
            (cfg.repos.clone(), cfg)
        };

        // 查找指定的 addon
        let mut found_addon: Option<(String, String, AddonConfig)> = None;

        for repo in &repos_to_search {
            let url = match repo.get_url() {
                Some(url) => url,
                None => {
                    eprintln!("警告: 仓库配置缺少 URL，跳过");
                    continue;
                }
            };

            match RepoManager::fetch_meta(&url, repo, &config_for_auth).await {
                Ok(meta) => {
                    if let Some(addons) = &meta.addons {
                        if let Some(addon_config) = addons.get(addon_name) {
                            found_addon = Some((addon_name.to_string(), url.clone(), addon_config.clone()));
                            break;
                        }
                    }
                }
                Err(e) => {
                    eprintln!("警告: 无法从 {} 获取元数据: {}", url, e);
                    continue;
                }
            }
        }

        if let Some((addon_name, repo_url, addon_config)) = found_addon {
            println!("{}", addon_name);
            println!("  来源: {}", repo_url);
            println!("  路径配置:");
            match &addon_config.root {
                TemplateRoot::Single(path) => {
                    println!("    - {}", path);
                }
                TemplateRoot::Multiple(paths) => {
                    for path in paths {
                        println!("    - {}", path);
                    }
                }
            }
            
            // 尝试读取 README.md
            let readme_path = match &addon_config.root {
                TemplateRoot::Single(path) => {
                    // 从路径中提取基础目录（去掉通配符）
                    let base_path = path.trim_end_matches("/**").trim_end_matches("/*");
                    format!("{}/README.md", base_path)
                }
                TemplateRoot::Multiple(paths) => {
                    // 使用第一个路径
                    if let Some(first_path) = paths.first() {
                        let base_path = first_path.trim_end_matches("/**").trim_end_matches("/*");
                        format!("{}/README.md", base_path)
                    } else {
                        println!("  详细信息: 暂无详细信息");
                        return Ok(());
                    }
                }
            };
            
            // 查找对应的 repo 配置
            let repo_config = repos_to_search.iter()
                .find(|r| r.get_url().as_ref().map(|u| u == &repo_url).unwrap_or(false));
            
            if let Some(repo) = repo_config {
                match RepoManager::read_file_from_repo(&repo_url, &readme_path, repo, &config_for_auth).await {
                    Ok(Some(readme_content)) => {
                        // 显示完整的 README 内容（不限制行数）
                        let non_empty_lines: Vec<&str> = readme_content.lines()
                            .collect();
                        if !non_empty_lines.is_empty() {
                            println!("  详细信息:");
                            for line in non_empty_lines {
                                println!("    {}", line);
                            }
                        } else {
                            println!("  详细信息: 暂无详细信息");
                        }
                    }
                    Ok(None) => {
                        println!("  详细信息: 暂无详细信息");
                    }
                    Err(_) => {
                        println!("  详细信息: 暂无详细信息");
                    }
                }
            } else {
                println!("  详细信息: 暂无详细信息");
            }
        } else {
            // 尝试列出所有可用的 addons 作为建议
            let mut available_addons = Vec::new();
            for repo in &repos_to_search {
                if let Some(url) = repo.get_url() {
                    if let Ok(meta) = RepoManager::fetch_meta(&url, repo, &config_for_auth).await {
                        if let Some(addons) = &meta.addons {
                            for name in addons.keys() {
                                available_addons.push(name.clone());
                            }
                        }
                    }
                }
            }
            
            let mut error_msg = format!("❌ 未找到 addon: {}", addon_name);
            if !available_addons.is_empty() {
                error_msg.push_str(&format!("\n\n💡 可用的 addons:\n"));
                for addon in available_addons {
                    error_msg.push_str(&format!("  - {}\n", addon));
                }
                error_msg.push_str(&format!("\n💡 提示: 使用 `qcl addons list` 查看所有可用插件"));
            } else {
                error_msg.push_str(&format!("\n\n💡 提示: 使用 `qcl addons list` 查看所有可用插件"));
            }
            anyhow::bail!(error_msg);
        }

        Ok(())
    }

    pub async fn add_addons(addons: &[String], project_dir: &str) -> anyhow::Result<()> {
        // 解析项目目录路径
        let target_dir = if project_dir == "." || project_dir == "./" {
            std::env::current_dir()?
        } else {
            let path = PathBuf::from(project_dir);
            if path.is_absolute() {
                path
            } else {
                std::env::current_dir()?.join(project_dir)
            }
        };
        
        // 确保目标目录存在
        if !target_dir.exists() {
            anyhow::bail!("项目目录不存在: {}", target_dir.display());
        }
        
        if !target_dir.is_dir() {
            anyhow::bail!("指定的路径不是目录: {}", target_dir.display());
        }

        // 读取 .qclocal 文件（如果存在）
        let qclocal_path = target_dir.join(".qclocal");
        let qclocal: Option<QcLocalConfig> = if qclocal_path.exists() {
            let content = fs::read_to_string(&qclocal_path)?;
            Some(serde_yaml::from_str(&content).context("解析 .qclocal 文件失败")?)
        } else {
            None
        };

        // 确定要搜索的 repos 列表
        let (repos_to_search, config_for_auth) = if let Some(ref qclocal) = qclocal {
            if let Some(ref repos) = qclocal.repos {
                // .qclocal 中有 repos 配置，优先使用它
                // 尝试加载全局配置用于认证（可选）
                let global_config = Config::load().ok().flatten();
                let auth_config = global_config.unwrap_or_else(|| Config {
                    username: None,
                    password: None,
                    token: None,
                    proxy: None,
                    repos: vec![],
                    ai: None,
                    workspace: None,
                });
                (repos.clone(), auth_config)
            } else {
                // .qclocal 中没有 repos，向上查找父级目录的配置文件
                match Config::load_from_parent(&target_dir)? {
                    Some(parent_config) => {
                        (parent_config.repos.clone(), parent_config)
                    }
                    None => {
                        // 如果父级也没有，尝试全局配置
                        let config = Config::load()?
                            .ok_or_else(|| anyhow::anyhow!("未找到配置文件，请先配置 .qclrc 或 .qcl.yaml"))?;
                        (config.repos.clone(), config)
                    }
                }
            }
        } else {
            // 没有 .qclocal，向上查找父级目录的配置文件
            match Config::load_from_parent(&target_dir)? {
                Some(parent_config) => {
                    (parent_config.repos.clone(), parent_config)
                }
                None => {
                    // 如果父级也没有，尝试全局配置
                    let config = Config::load()?
                        .ok_or_else(|| anyhow::anyhow!("未找到配置文件，请先配置 .qclrc 或 .qcl.yaml"))?;
                    (config.repos.clone(), config)
                }
            }
        };
        
        let mut found_addons = std::collections::HashMap::new();
        let mut repo_url = None;
        let mut repo_config: Option<RepoConfig> = None;

        for repo in &repos_to_search {
            let url = match repo.get_url() {
                Some(url) => url,
                None => {
                    eprintln!("警告: 仓库配置缺少 URL，跳过");
                    continue;
                }
            };

            match RepoManager::fetch_meta(&url, repo, &config_for_auth).await {
                Ok(meta) => {
                    if let Some(addons_config) = &meta.addons {
                        for addon_name in addons {
                            if addons_config.contains_key(addon_name) {
                                found_addons.insert(addon_name.clone(), addons_config[addon_name].clone());
                                if repo_url.is_none() {
                                    repo_url = Some(url.clone());
                                    repo_config = Some(repo.clone());
                                }
                            }
                        }
                    }
                }
                Err(e) => {
                    eprintln!("警告: 无法从 {} 获取元数据: {}", url, e);
                    continue;
                }
            }
        }

        if found_addons.is_empty() {
            anyhow::bail!("未找到任何指定的 addons");
        }

        let repo_url = repo_url.ok_or_else(|| anyhow::anyhow!("未找到仓库 URL"))?;
        let repo_config = repo_config.ok_or_else(|| anyhow::anyhow!("未找到仓库配置"))?;

        // 确定 addons 基础目标目录（使用 .qclocal 中的 target_dir，如果存在）
        let addons_base_dir = if let Some(ref qclocal) = qclocal {
            target_dir.join(&qclocal.addons.target_dir.trim_start_matches("./"))
        } else {
            target_dir.join("addons")
        };

        // 确保基础目录存在
        fs::create_dir_all(&addons_base_dir)?;

        for addon_name in addons {
            if let Some(addon) = found_addons.get(addon_name) {
                let addon_paths = match &addon.root {
                    TemplateRoot::Single(path) => vec![path.clone()],
                    TemplateRoot::Multiple(paths) => paths.clone(),
                };
                
                // 每个 addon 安装到自己的子目录：{addons_base_dir}/{addon_name}/
                let addon_target_dir = addons_base_dir.join(addon_name);
                
                println!("正在下载 addon {} 到 {}...", addon_name, addon_target_dir.display());
                RepoManager::download_template(
                    &repo_url,
                    &addon_paths,
                    &addon_target_dir,
                    &repo_config,
                    &config_for_auth,
                ).await.with_context(|| format!("下载 addon {} 失败", addon_name))?;
            } else {
                eprintln!("警告: 未找到 addon: {}", addon_name);
            }
        }

        // 更新 .qclocal 文件
        Self::update_qclocal_addons(&target_dir, addons).await?;

        println!("✅ Addons 添加成功！");
        println!("💡 提示: 使用 `cocli addons sync` 同步所有配置的插件");
        Ok(())
    }

    pub async fn sync_addons(project_dir: &str) -> anyhow::Result<()> {
        // 解析项目目录路径
        let target_dir = if project_dir == "." || project_dir == "./" {
            std::env::current_dir()?
        } else {
            let path = PathBuf::from(project_dir);
            if path.is_absolute() {
                path
            } else {
                std::env::current_dir()?.join(project_dir)
            }
        };
        
        // 确保目标目录存在
        if !target_dir.exists() {
            anyhow::bail!("项目目录不存在: {}", target_dir.display());
        }
        
        if !target_dir.is_dir() {
            anyhow::bail!("指定的路径不是目录: {}", target_dir.display());
        }

        // 读取 .qclocal 文件（load_qclocal_from_dir 已处理 inherit 逻辑）
        let qclocal = Config::load_qclocal_from_dir(&target_dir)?
            .ok_or_else(|| anyhow::anyhow!("未找到 .qclocal 文件，请先创建项目"))?;

        if qclocal.addons.include.is_empty() {
            println!("没有需要同步的 addons");
            return Ok(());
        }

        // 确定要搜索的 repos 列表（load_qclocal_from_dir 已处理 inherit 逻辑）
        let (repos_to_search, config_for_auth) = if let Some(ref repos) = qclocal.repos {
            if !repos.is_empty() {
                // .qclocal 中有 repos 配置，优先使用它
                // 尝试加载全局配置用于认证（可选）
                let global_config = Config::load().ok().flatten();
                let auth_config = global_config.unwrap_or_else(|| Config {
                    username: None,
                    password: None,
                    token: None,
                    proxy: None,
                    repos: vec![],
                    ai: None,
                    workspace: None,
                });
                (repos.clone(), auth_config)
            } else {
                // repos 为空，继续向下查找
                match Config::load_from_parent(&target_dir)? {
                    Some(parent_config) => {
                        (parent_config.repos.clone(), parent_config)
                    }
                    None => {
                        // 如果父级也没有，尝试全局配置
                        let config = Config::load()?
                            .ok_or_else(|| anyhow::anyhow!("未找到配置文件，请先配置 .qclrc 或 .qcl.yaml"))?;
                        (config.repos.clone(), config)
                    }
                }
            }
        } else {
            // .qclocal 中没有 repos，向上查找父级目录的配置文件
            match Config::load_from_parent(&target_dir)? {
                Some(parent_config) => {
                    (parent_config.repos.clone(), parent_config)
                }
                None => {
                    // 如果父级也没有，尝试全局配置
                    let config = Config::load()?
                        .ok_or_else(|| anyhow::anyhow!("未找到配置文件，请先配置 .qclrc 或 .qcl.yaml"))?;
                    (config.repos.clone(), config)
                }
            }
        };

        // 查找包含这些 addons 的仓库
        let mut found_addons = std::collections::HashMap::new();
        let mut repo_url = None;
        let mut repo_config: Option<RepoConfig> = None;

        for repo in &repos_to_search {
            let url = match repo.get_url() {
                Some(url) => url,
                None => {
                    eprintln!("警告: 仓库配置缺少 URL，跳过");
                    continue;
                }
            };

            match RepoManager::fetch_meta(&url, repo, &config_for_auth).await {
                Ok(meta) => {
                    if let Some(addons_config) = &meta.addons {
                        for addon_name in &qclocal.addons.include {
                            if addons_config.contains_key(addon_name) {
                                found_addons.insert(addon_name.clone(), addons_config[addon_name].clone());
                                if repo_url.is_none() {
                                    repo_url = Some(url.clone());
                                    repo_config = Some(repo.clone());
                                }
                            }
                        }
                    }
                }
                Err(e) => {
                    eprintln!("警告: 无法从 {} 获取元数据: {}", url, e);
                    continue;
                }
            }
        }

        if found_addons.is_empty() {
            anyhow::bail!("未找到任何需要同步的 addons");
        }

        let repo_url = repo_url.ok_or_else(|| anyhow::anyhow!("未找到仓库 URL"))?;
        let repo_config = repo_config.ok_or_else(|| anyhow::anyhow!("未找到仓库配置"))?;

        // 确定 addons 基础目标目录
        let addons_base_dir = target_dir.join(&qclocal.addons.target_dir.trim_start_matches("./"));

        // 确保基础目录存在
        fs::create_dir_all(&addons_base_dir)?;

        // 同步每个 addon
        for addon_name in &qclocal.addons.include {
            if let Some(addon) = found_addons.get(addon_name) {
                let addon_paths = match &addon.root {
                    TemplateRoot::Single(path) => vec![path.clone()],
                    TemplateRoot::Multiple(paths) => paths.clone(),
                };
                
                // 每个 addon 同步到自己的子目录：{addons_base_dir}/{addon_name}/
                let addon_target_dir = addons_base_dir.join(addon_name);
                
                println!("正在同步 addon {} 到 {}...", addon_name, addon_target_dir.display());
                RepoManager::download_template(
                    &repo_url,
                    &addon_paths,
                    &addon_target_dir,
                    &repo_config,
                    &config_for_auth,
                ).await.with_context(|| format!("同步 addon {} 失败", addon_name))?;
            } else {
                eprintln!("警告: 未找到 addon: {}", addon_name);
            }
        }

        println!("✅ Addons 同步成功！");
        Ok(())
    }

    async fn update_qclocal_addons(
        project_dir: &Path,
        new_addons: &[String],
    ) -> anyhow::Result<()> {
        let qclocal_path = project_dir.join(".qclocal");
        
        if qclocal_path.exists() {
            // 读取现有配置
            let content = fs::read_to_string(&qclocal_path)?;
            let mut qclocal: QcLocalConfig = serde_yaml::from_str(&content)
                .context("解析 .qclocal 文件失败")?;
            
            // 添加新的 addons 到 include 列表
            for addon in new_addons {
                if !qclocal.addons.include.contains(addon) {
                    qclocal.addons.include.push(addon.clone());
                }
            }
            
            // 保存更新后的配置
            let updated_content = serde_yaml::to_string(&qclocal)?;
            fs::write(&qclocal_path, updated_content)?;
        } else {
            // 如果不存在，创建默认配置
            let qclocal = QcLocalConfig {
                project: None,
                template: "unknown".to_string(), // 无法确定模板名称
                addons: QcLocalAddonsConfig {
                    target_dir: "./addons".to_string(),
                    include: new_addons.to_vec(),
                },
                repos: None,
                inherit: false,
            };
            
            let content = serde_yaml::to_string(&qclocal)?;
            fs::write(&qclocal_path, content)?;
        }
        
        Ok(())
    }

    pub async fn show_help(
        addon_name: Option<String>,
        template_name: Option<String>,
    ) -> anyhow::Result<()> {
        let config = Config::load()?
            .ok_or_else(|| anyhow::anyhow!("未找到配置文件，请先配置 .qclrc 或 .qcl.yaml"))?;

        // 如果都没有指定，显示一般帮助信息
        if addon_name.is_none() && template_name.is_none() {
            println!("CoCli 脚手架工具");
            println!();
            println!("使用方法:");
            println!("  cocli create --template=<模板名> [--addons=<addon列表>] <项目名>");
            println!("  cocli template list");
            println!("  cocli addons list");
            println!("  cocli addons add <addon列表> [项目目录]");
            println!("  cocli addons sync [项目目录]");
            println!("  cocli help [--template=<模板名>] [--addons=<addon名>]");
            println!();
            println!("更多信息，请使用: cocli help --template <模板名> 或 cocli help --addons <addon名>");
            return Ok(());
        }

        // 查找模板或 addon 的详细信息
        for repo in &config.repos {
            let url = match repo.get_url() {
                Some(url) => url,
                None => {
                    eprintln!("警告: 仓库配置缺少 URL，跳过");
                    continue;
                }
            };

            match RepoManager::fetch_meta(&url, repo, &config).await {
                Ok(meta) => {
                    // 显示模板信息
                    if let Some(template) = &template_name {
                        if let Some(templates) = &meta.templates {
                            if let Some(template_config) = templates.get(template) {
                                println!("模板: {}", template);
                                println!("来源: {}", url);
                                println!();
                                println!("路径配置:");
                                match &template_config.root {
                                    TemplateRoot::Single(path) => {
                                        println!("  - {}", path);
                                    }
                                    TemplateRoot::Multiple(paths) => {
                                        for path in paths {
                                            println!("  - {}", path);
                                        }
                                    }
                                }
                                println!();
                                println!("使用方法:");
                                println!("  cocli create --template={} <项目名>", template);
                                return Ok(());
                            }
                        }
                    }

                    // 显示 addon 信息
                    if let Some(addon) = &addon_name {
                        if let Some(addons) = &meta.addons {
                            if let Some(addon_config) = addons.get(addon) {
                                println!("Addon: {}", addon);
                                println!("来源: {}", url);
                                println!();
                                println!("路径配置:");
                                match &addon_config.root {
                                    TemplateRoot::Single(path) => {
                                        println!("  - {}", path);
                                    }
                                    TemplateRoot::Multiple(paths) => {
                                        for path in paths {
                                            println!("  - {}", path);
                                        }
                                    }
                                }
                                println!();
                                println!("使用方法:");
                                println!("  qcl add --addons={}", addon);
                                return Ok(());
                            }
                        }
                    }
                }
                Err(e) => {
                    eprintln!("警告: 无法从 {} 获取元数据: {}", url, e);
                    continue;
                }
            }
        }

        // 如果找到了但没有匹配的，显示错误信息
        if let Some(template) = &template_name {
            anyhow::bail!("未找到模板: {}", template);
        }
        if let Some(addon) = &addon_name {
            anyhow::bail!("未找到 addon: {}", addon);
        }

        Ok(())
    }
}

