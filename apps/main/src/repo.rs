use crate::config::{Config, Meta, RepoConfig};
use anyhow::Context;
use git2::{Cred, RemoteCallbacks};
use std::path::{Path, PathBuf};
use std::fs;
use url::Url;
use glob::Pattern;

pub struct RepoManager;

impl RepoManager {
    pub async fn fetch_meta(repo_url: &str, config: &RepoConfig, global_config: &Config) -> anyhow::Result<Meta> {
        // 同步仓库到临时目录
        use std::time::{SystemTime, UNIX_EPOCH};
        let timestamp = SystemTime::now().duration_since(UNIX_EPOCH)?.as_nanos();
        let temp_dir = std::env::temp_dir().join(format!("qcl_repo_{}", timestamp));
        
        if temp_dir.exists() {
            fs::remove_dir_all(&temp_dir)?;
        }
        fs::create_dir_all(&temp_dir)?;

        // 同步仓库
        Self::sync_repo(repo_url, &temp_dir, config, global_config).await?;

        // 读取 meta.yaml
        let meta_path = temp_dir.join("meta.yaml");
        if !meta_path.exists() {
            anyhow::bail!("仓库中未找到 meta.yaml 文件");
        }

        let content = fs::read_to_string(&meta_path)?;
        let meta: Meta = serde_yaml::from_str(&content)
            .context("解析 meta.yaml 失败")?;

        // 清理临时目录
        let _ = fs::remove_dir_all(&temp_dir);

        Ok(meta)
    }

    /// 从仓库中读取文件内容（用于读取 README.md 等）
    pub async fn read_file_from_repo(
        repo_url: &str,
        file_path: &str,
        config: &RepoConfig,
        global_config: &Config,
    ) -> anyhow::Result<Option<String>> {
        // 同步仓库到临时目录
        use std::time::{SystemTime, UNIX_EPOCH};
        let timestamp = SystemTime::now().duration_since(UNIX_EPOCH)?.as_nanos();
        let temp_dir = std::env::temp_dir().join(format!("qcl_repo_{}", timestamp));
        
        if temp_dir.exists() {
            fs::remove_dir_all(&temp_dir)?;
        }
        fs::create_dir_all(&temp_dir)?;

        // 同步仓库
        Self::sync_repo(repo_url, &temp_dir, config, global_config).await?;

        // 读取文件
        let file_full_path = temp_dir.join(file_path.trim_start_matches("./"));
        let result = if file_full_path.exists() {
            match fs::read_to_string(&file_full_path) {
                Ok(content) => Some(content),
                Err(_) => None,
            }
        } else {
            None
        };

        // 清理临时目录
        let _ = fs::remove_dir_all(&temp_dir);

        Ok(result)
    }

    async fn sync_repo(
        repo_url: &str,
        dest: &Path,
        config: &RepoConfig,
        global_config: &Config,
    ) -> anyhow::Result<()> {
        match config {
            RepoConfig::FTP(_) => {
                Self::sync_ftp(repo_url, dest, config, global_config).await
            }
            RepoConfig::Local(_) => {
                Self::sync_local(repo_url, dest, config).await
            }
            RepoConfig::GitHub(_) | RepoConfig::GitLab(_) => {
                Self::sync_git(repo_url, dest, config, global_config)
            }
        }
    }

    async fn sync_ftp(
        repo_url: &str,
        dest: &Path,
        config: &RepoConfig,
        global_config: &Config,
    ) -> anyhow::Result<()> {
        use suppaftp::FtpStream;
        
        let url = Url::parse(repo_url)
            .context("无效的 FTP URL")?;
        
        let host = url.host_str()
            .ok_or_else(|| anyhow::anyhow!("FTP URL 缺少主机名"))?;
        let port = url.port().unwrap_or(21);
        
        // 连接 FTP 服务器
        let mut ftp_stream = FtpStream::connect(format!("{}:{}", host, port))
            .context("连接 FTP 服务器失败")?;
        
        // 登录
        let username = config.get_username(global_config.get_global_username())
            .unwrap_or_else(|| "anonymous".to_string());
        let password = config.get_password(global_config.get_global_password())
            .unwrap_or_else(|| "anonymous@".to_string());
        
        ftp_stream.login(&username, &password)
            .context("FTP 登录失败")?;
        
        // 切换到被动模式（suppaftp 默认使用被动模式，但显式设置）
        ftp_stream.set_mode(suppaftp::types::Mode::Passive);
        
        // 下载整个目录（递归）
        let remote_path = url.path().trim_start_matches('/');
        Self::download_ftp_dir(&mut ftp_stream, remote_path, dest)
            .context("下载 FTP 目录失败")?;
        
        ftp_stream.quit()?;
        Ok(())
    }

    fn download_ftp_dir(
        ftp_stream: &mut suppaftp::FtpStream,
        remote_path: &str,
        local_path: &Path,
    ) -> anyhow::Result<()> {
        // 创建本地目录
        fs::create_dir_all(local_path)?;
        
        // 列出远程目录内容
        let files = ftp_stream.list(Some(remote_path))?;
        
        for file_info in files {
            let parts: Vec<&str> = file_info.split_whitespace().collect();
            if parts.len() < 9 {
                continue;
            }
            
            let file_name = parts[8..].join(" ");
            let is_dir = parts[0].starts_with('d');
            
            let remote_file_path = if remote_path.is_empty() {
                file_name.clone()
            } else {
                format!("{}/{}", remote_path.trim_end_matches('/'), file_name)
            };
            
            let local_file_path = local_path.join(&file_name);
            
            if is_dir {
                // 递归下载目录
                Self::download_ftp_dir(ftp_stream, &remote_file_path, &local_file_path)?;
            } else {
                // 下载文件
                let mut reader = ftp_stream.retr_as_stream(&remote_file_path)?;
                let mut file = fs::File::create(&local_file_path)?;
                std::io::copy(&mut reader, &mut file)?;
            }
        }
        
        Ok(())
    }

    async fn sync_local(
        repo_url: &str,
        dest: &Path,
        _config: &RepoConfig,
    ) -> anyhow::Result<()> {
        // 解析本地路径（支持相对路径）
        let local_path = if Path::new(repo_url).is_absolute() {
            PathBuf::from(repo_url)
        } else {
            // 相对路径：相对于当前工作目录或可执行文件位置
            let exe_path = std::env::current_exe()
                .ok()
                .and_then(|p| p.parent().map(|p| p.to_path_buf()));
            
            if let Some(exe_dir) = exe_path {
                exe_dir.join(repo_url)
            } else {
                std::env::current_dir()?.join(repo_url)
            }
        };
        
        if !local_path.exists() {
            anyhow::bail!("本地路径不存在: {}", local_path.display());
        }
        
        if !local_path.is_dir() {
            anyhow::bail!("本地路径不是目录: {}", local_path.display());
        }
        
        // 复制整个目录
        // 使用递归方式复制所有文件和目录
        Self::copy_dir_recursive(&local_path, dest)
            .context(format!("复制本地目录失败: {} -> {}", local_path.display(), dest.display()))?;
        
        // 验证 meta.yaml 是否被复制
        let meta_check = dest.join("meta.yaml");
        if !meta_check.exists() {
            anyhow::bail!("复制后未找到 meta.yaml 文件。源路径: {}, 目标路径: {}", 
                local_path.join("meta.yaml").display(), meta_check.display());
        }
        
        Ok(())
    }
    
    fn copy_dir_recursive(src: &Path, dst: &Path) -> anyhow::Result<()> {
        // 确保目标目录存在
        fs::create_dir_all(dst)?;
        
        // 遍历源目录的所有条目
        for entry in fs::read_dir(src)? {
            let entry = entry?;
            let path = entry.path();
            let file_name = entry.file_name();
            let dst_path = dst.join(&file_name);
            
            if path.is_dir() {
                // 递归复制子目录
                Self::copy_dir_recursive(&path, &dst_path)?;
            } else {
                // 复制文件
                fs::copy(&path, &dst_path)
                    .context(format!("复制文件失败: {} -> {}", path.display(), dst_path.display()))?;
            }
        }
        
        Ok(())
    }

    fn sync_git(
        repo_url: &str,
        dest: &Path,
        config: &RepoConfig,
        global_config: &Config,
    ) -> anyhow::Result<()> {
        let mut callbacks = RemoteCallbacks::new();
        
        let username = config.get_username(global_config.get_global_username());
        let password = config.get_password(global_config.get_global_password());
        let token = config.get_token(global_config.get_global_token());
        
        // 克隆字符串以便在闭包中使用
        let token_clone = token.clone();
        let username_clone = username.clone();
        let password_clone = password.clone();
        
        match config {
            RepoConfig::GitHub(_) => {
                if let Some(token) = token_clone {
                    let token = token.clone();
                    callbacks.credentials(move |_url, username_from_url, _allowed_types| {
                        Cred::userpass_plaintext(username_from_url.unwrap_or("git"), &token)
                    });
                } else if let (Some(username), Some(password)) = (username_clone, password_clone) {
                    let username = username.clone();
                    let password = password.clone();
                    callbacks.credentials(move |_url, _username, _allowed_types| {
                        Cred::userpass_plaintext(&username, &password)
                    });
                }
            }
            RepoConfig::GitLab(_) => {
                if let Some(token) = token_clone {
                    let token = token.clone();
                    callbacks.credentials(move |_url, username_from_url, _allowed_types| {
                        Cred::userpass_plaintext(username_from_url.unwrap_or("git"), &token)
                    });
                } else if let (Some(username), Some(password)) = (username_clone, password_clone) {
                    let username = username.clone();
                    let password = password.clone();
                    callbacks.credentials(move |_url, _username, _allowed_types| {
                        Cred::userpass_plaintext(&username, &password)
                    });
                }
            }
            _ => {}
        }

        let mut fetch_options = git2::FetchOptions::new();
        fetch_options.remote_callbacks(callbacks);

        let mut builder = git2::build::RepoBuilder::new();
        builder.fetch_options(fetch_options);

        // 转换 URL 格式
        let git_url = if repo_url.starts_with("http") {
            repo_url.to_string()
        } else {
            format!("https://{}", repo_url)
        };

        builder.clone(&git_url, dest)
            .context("克隆仓库失败")?;

        Ok(())
    }

    pub async fn download_template(
        repo_url: &str,
        template_paths: &[String],
        dest: &Path,
        config: &RepoConfig,
        global_config: &Config,
    ) -> anyhow::Result<()> {
        use std::time::{SystemTime, UNIX_EPOCH};
        let timestamp = SystemTime::now().duration_since(UNIX_EPOCH)?.as_nanos();
        let temp_dir = std::env::temp_dir().join(format!("qcl_template_{}", timestamp));
        
        if temp_dir.exists() {
            fs::remove_dir_all(&temp_dir)?;
        }
        fs::create_dir_all(&temp_dir)?;

        // 同步仓库
        Self::sync_repo(repo_url, &temp_dir, config, global_config).await?;

        // 复制模板文件
        for template_path in template_paths {
            Self::copy_template_path(&temp_dir, template_path, dest)?;
        }

        // 清理临时目录
        let _ = fs::remove_dir_all(&temp_dir);

        Ok(())
    }

    fn copy_template_path(
        temp_dir: &Path,
        template_path: &str,
        dest: &Path,
    ) -> anyhow::Result<()> {
        let normalized_path = template_path.trim_start_matches("./");
        
        // 处理 glob 模式（支持 ** 通配符）
        if normalized_path.contains("**") {
            // 提取基础路径
            let base_path = normalized_path.split("**").next().unwrap_or("");
            let base_dir = temp_dir.join(base_path.trim_end_matches('/'));
            
            if base_dir.exists() && base_dir.is_dir() {
                // 递归复制目录内容到目标目录（不包括源目录本身）
                Self::copy_dir_contents(&base_dir, dest)?;
            }
        } else {
            // 尝试 glob 匹配
            let pattern = Pattern::new(normalized_path)
                .context("无效的 glob 模式")?;
            
            let mut matched = false;
            for entry in glob::glob(&format!("{}/*", temp_dir.display()))
                .context("glob 匹配失败")? {
                let entry = entry?;
                let relative_path = entry.strip_prefix(temp_dir)
                    .context("路径处理失败")?;
                
                if pattern.matches_path(relative_path) {
                    matched = true;
                    if entry.is_dir() {
                        // 复制目录内容到目标目录（不包括目录本身）
                        Self::copy_dir_contents(&entry, dest)?;
                    } else {
                        fs::create_dir_all(dest)?;
                        let file_name = entry.file_name().unwrap();
                        fs::copy(&entry, dest.join(file_name))?;
                    }
                }
            }
            
            // 如果没有匹配到，尝试直接路径
            if !matched {
                let source = temp_dir.join(normalized_path);
                if source.exists() {
                    if source.is_dir() {
                        // 复制目录内容到目标目录（不包括目录本身）
                        Self::copy_dir_contents(&source, dest)?;
                    } else {
                        fs::create_dir_all(dest)?;
                        let file_name = source.file_name().unwrap();
                        fs::copy(&source, dest.join(file_name))?;
                    }
                } else {
                    eprintln!("警告: 模板路径不存在: {}", template_path);
                }
            }
        }
        
        Ok(())
    }
    
    /// 复制目录内容到目标目录（不包括源目录本身）
    fn copy_dir_contents(src: &Path, dst: &Path) -> anyhow::Result<()> {
        // 确保目标目录存在
        fs::create_dir_all(dst)?;
        
        // 遍历源目录的所有条目并复制到目标目录
        for entry in fs::read_dir(src)? {
            let entry = entry?;
            let src_path = entry.path();
            let file_name = entry.file_name();
            let dst_path = dst.join(&file_name);
            
            if src_path.is_dir() {
                // 递归复制子目录
                Self::copy_dir_contents(&src_path, &dst_path)?;
            } else {
                // 复制文件
                fs::copy(&src_path, &dst_path)
                    .context(format!("复制文件失败: {} -> {}", src_path.display(), dst_path.display()))?;
            }
        }
        
        Ok(())
    }
}
