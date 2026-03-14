use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    /// 全局用户名信息
    #[serde(default)]
    pub username: Option<String>,
    /// 全局密码
    #[serde(default)]
    pub password: Option<String>,
    /// 全局 token
    #[serde(default)]
    pub token: Option<String>,
    /// 代理配置
    #[serde(default)]
    pub proxy: Option<ProxyConfig>,
    /// 仓库列表
    pub repos: Vec<RepoConfig>,
    /// AI 配置
    #[serde(default)]
    pub ai: Option<AIConfig>,
}

/// AI 配置（从 ai 模块导入，避免循环依赖）
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIConfig {
    /// MCP 配置
    pub mcp: Option<MCPConfig>,
    /// 默认 AI 模型
    pub default_model: Option<String>,
    /// API 端点
    pub api_endpoint: Option<String>,
}

/// MCP 配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MCPConfig {
    /// MCP 服务器地址
    pub server_url: Option<String>,
    /// MCP 服务器命令（用于启动本地服务器）
    pub server_command: Option<String>,
    /// API Key（如果需要）
    pub api_key: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProxyConfig {
    pub url: Option<String>,
    pub host: Option<String>,
    pub port: Option<u16>,
    pub username: Option<String>,
    pub password: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum RepoConfig {
    FTP(FTPConfig),
    Local(LocalConfig),
    GitHub(GitHubConfig),
    GitLab(GitLabConfig),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FTPConfig {
    pub ftp: FTPAuth,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FTPAuth {
    #[serde(default)]
    pub r#type: Option<String>,
    pub url: String,
    #[serde(default)]
    pub username: Option<String>,
    #[serde(default)]
    pub password: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocalConfig {
    pub local: LocalAuth,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocalAuth {
    #[serde(default)]
    pub r#type: Option<String>,
    pub url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitHubConfig {
    pub github: GitHubAuth,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitHubAuth {
    #[serde(default)]
    pub r#type: Option<String>,
    /// 仓库 URL（新格式使用 repo，旧格式使用 repos 以保持兼容）
    #[serde(alias = "repos")]
    pub repo: Option<String>,
    #[serde(default)]
    pub username: Option<String>,
    #[serde(default)]
    pub password: Option<String>,
    #[serde(default)]
    pub token: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitLabConfig {
    pub gitlab: GitLabAuth,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitLabAuth {
    #[serde(default)]
    pub r#type: Option<String>,
    /// 仓库 URL（新格式使用 repo，旧格式使用 repos 以保持兼容）
    #[serde(alias = "repos")]
    pub repo: Option<String>,
    #[serde(rename = "git-config", default)]
    pub git_config: Option<GitConfig>,
    #[serde(default)]
    pub username: Option<String>,
    #[serde(default)]
    pub password: Option<String>,
    #[serde(default)]
    pub token: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitConfig {
    #[serde(default)]
    pub username: Option<String>,
    #[serde(default)]
    pub password: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Meta {
    pub templates: Option<HashMap<String, TemplateConfig>>,
    pub addons: Option<HashMap<String, AddonConfig>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplateConfig {
    pub root: TemplateRoot,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum TemplateRoot {
    Single(String),
    Multiple(Vec<String>),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AddonConfig {
    pub root: TemplateRoot,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QcLocalConfig {
    /// 当前创建的项目名
    #[serde(default)]
    pub project: Option<String>,
    /// 使用的模板名称
    pub template: String,
    /// Addons 配置
    pub addons: QcLocalAddonsConfig,
    /// 主包的基础信息，本目录的插件就是从这里面找了，而不是从主包
    #[serde(default)]
    pub repos: Option<Vec<RepoConfig>>,
    /// 是否从父级目录继承配置（当 repos 为空时自动继承）
    #[serde(default)]
    pub inherit: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QcLocalAddonsConfig {
    /// Addons 存放目录
    #[serde(default = "default_addons_target_dir")]
    pub target_dir: String,
    /// 包含的 addon 列表（执行 sync 时使用）
    #[serde(default)]
    pub include: Vec<String>,
}

fn default_addons_target_dir() -> String {
    "./addons".to_string()
}

/// 工作区配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceConfig {
    /// 工作区名称
    pub name: String,
    /// 工作区路径
    pub path: String,
    /// 工作区级别的配置（可选）
    #[serde(default)]
    pub config: Option<Config>,
    /// 创建时间
    #[serde(default)]
    pub created_at: Option<String>,
}

/// 工作区管理器配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceManagerConfig {
    /// 当前使用的工作区名称
    #[serde(default)]
    pub current_workspace: Option<String>,
    /// 所有工作区列表
    #[serde(default)]
    pub workspaces: Vec<WorkspaceConfig>,
}

impl Config {
    pub fn load() -> anyhow::Result<Option<Config>> {
        // 首先尝试从当前工作目录查找
        let current_dir = std::env::current_dir().ok();
        let home_dir = dirs::home_dir();
        
        let mut paths = Vec::new();
        
        // 添加当前目录的配置文件路径
        if let Some(dir) = &current_dir {
            paths.push(dir.join(".qclrc"));
            paths.push(dir.join(".qcl.yaml"));
            paths.push(dir.join(".qcl.yml"));
        }
        
        // 添加用户主目录的配置文件路径
        if let Some(dir) = &home_dir {
            paths.push(dir.join(".qclrc"));
            paths.push(dir.join(".qcl.yaml"));
            paths.push(dir.join(".qcl.yml"));
        }

        for path in paths {
            if path.exists() {
                let content = std::fs::read_to_string(&path)?;
                let config: Config = serde_yaml::from_str(&content)?;
                return Ok(Some(config));
            }
        }

        Ok(None)
    }

    /// 从指定目录开始向上查找父级目录的配置文件
    pub fn load_from_parent(start_dir: &Path) -> anyhow::Result<Option<Config>> {
        let mut current = start_dir.to_path_buf();
        
        loop {
            // 检查当前目录的配置文件
            let paths = vec![
                current.join(".qclrc"),
                current.join(".qcl.yaml"),
                current.join(".qcl.yml"),
            ];
            
            for path in paths {
                if path.exists() {
                    let content = std::fs::read_to_string(&path)?;
                    let config: Config = serde_yaml::from_str(&content)?;
                    return Ok(Some(config));
                }
            }
            
            // 向上移动到父目录
            match current.parent() {
                Some(parent) => current = parent.to_path_buf(),
                None => break, // 已到达根目录
            }
        }
        
        Ok(None)
    }

    /// 从当前工作目录加载 .qclocal 文件
    pub fn load_qclocal() -> anyhow::Result<Option<QcLocalConfig>> {
        let current_dir = std::env::current_dir().ok();
        if let Some(dir) = current_dir {
            let qclocal_path = dir.join(".qclocal");
            if qclocal_path.exists() {
                let content = std::fs::read_to_string(&qclocal_path)?;
                let qclocal: QcLocalConfig = serde_yaml::from_str(&content)?;
                return Ok(Some(qclocal));
            }
        }
        Ok(None)
    }

    /// 从指定目录加载 .qclocal 文件，并处理继承逻辑
    pub fn load_qclocal_from_dir(dir: &Path) -> anyhow::Result<Option<QcLocalConfig>> {
        let qclocal_path = dir.join(".qclocal");
        if qclocal_path.exists() {
            let content = std::fs::read_to_string(&qclocal_path)?;
            let mut qclocal: QcLocalConfig = serde_yaml::from_str(&content)?;
            
            // 如果设置了 inherit 且 repos 为空，从父级目录继承
            if qclocal.inherit && qclocal.repos.is_none() {
                if let Some(parent_config) = Self::load_from_parent(dir)? {
                    qclocal.repos = Some(parent_config.repos);
                }
            }
            
            return Ok(Some(qclocal));
        }
        Ok(None)
    }
}

impl WorkspaceManagerConfig {
    /// 加载工作区管理器配置
    pub fn load() -> anyhow::Result<WorkspaceManagerConfig> {
        let config_dir = Self::get_config_dir()?;
        let config_path = config_dir.join("workspaces.yaml");
        
        if config_path.exists() {
            let content = std::fs::read_to_string(&config_path)?;
            let config: WorkspaceManagerConfig = serde_yaml::from_str(&content)?;
            return Ok(config);
        }
        
        Ok(WorkspaceManagerConfig {
            current_workspace: None,
            workspaces: vec![],
        })
    }

    /// 保存工作区管理器配置
    pub fn save(&self) -> anyhow::Result<()> {
        let config_dir = Self::get_config_dir()?;
        std::fs::create_dir_all(&config_dir)?;
        let config_path = config_dir.join("workspaces.yaml");
        let content = serde_yaml::to_string(self)?;
        std::fs::write(&config_path, content)?;
        Ok(())
    }

    /// 获取配置目录
    fn get_config_dir() -> anyhow::Result<std::path::PathBuf> {
        let home_dir = dirs::home_dir()
            .ok_or_else(|| anyhow::anyhow!("无法获取用户主目录"))?;
        Ok(home_dir.join(".qcl"))
    }

    /// 添加工作区
    pub fn add_workspace(&mut self, workspace: WorkspaceConfig) -> anyhow::Result<()> {
        // 检查是否已存在同名工作区
        if self.workspaces.iter().any(|w| w.name == workspace.name) {
            anyhow::bail!("工作区 '{}' 已存在", workspace.name);
        }
        self.workspaces.push(workspace);
        self.save()?;
        Ok(())
    }

    /// 设置当前工作区
    pub fn set_current(&mut self, name: &str) -> anyhow::Result<()> {
        if !self.workspaces.iter().any(|w| w.name == name) {
            anyhow::bail!("工作区 '{}' 不存在", name);
        }
        self.current_workspace = Some(name.to_string());
        self.save()?;
        Ok(())
    }

    /// 获取当前工作区
    pub fn get_current(&self) -> Option<&WorkspaceConfig> {
        self.current_workspace.as_ref().and_then(|name| {
            self.workspaces.iter().find(|w| w.name == *name)
        })
    }

    /// 删除工作区
    pub fn remove_workspace(&mut self, name: &str) -> anyhow::Result<()> {
        let index = self.workspaces.iter().position(|w| w.name == name)
            .ok_or_else(|| anyhow::anyhow!("工作区 '{}' 不存在", name))?;
        
        // 如果删除的是当前工作区，清除当前工作区设置
        if self.current_workspace.as_ref().map(|s| s.as_str()) == Some(name) {
            self.current_workspace = None;
        }
        
        self.workspaces.remove(index);
        self.save()?;
        Ok(())
    }
}

impl Config {
    /// 获取全局用户名（如果仓库配置中没有指定）
    pub fn get_global_username(&self) -> Option<&String> {
        self.username.as_ref()
    }

    /// 获取全局密码（如果仓库配置中没有指定）
    pub fn get_global_password(&self) -> Option<&String> {
        self.password.as_ref()
    }

    /// 获取全局 token（如果仓库配置中没有指定）
    pub fn get_global_token(&self) -> Option<&String> {
        self.token.as_ref()
    }

    /// 按优先级加载配置：应用级 .qclocal > 工作区配置 > 父级目录配置 > 全局配置
    /// 返回 (repos列表, 用于认证的配置)
    pub fn load_with_priority(dir: Option<&Path>) -> anyhow::Result<(Vec<RepoConfig>, Config)> {
        let current_dir = dir.map(|p| p.to_path_buf())
            .or_else(|| std::env::current_dir().ok());
        
        // 1. 优先从应用级 .qclocal 读取（load_qclocal_from_dir 已处理 inherit 逻辑）
        if let Some(ref dir) = current_dir {
            if let Ok(Some(qclocal)) = Self::load_qclocal_from_dir(dir) {
                if let Some(ref repos) = qclocal.repos {
                    if !repos.is_empty() {
                        // 使用工作区或全局配置用于认证
                        let auth_config = Self::load_for_auth()?;
                        return Ok((repos.clone(), auth_config));
                    }
                }
                // 如果 inherit 为 true 但父级没有配置，继续向下查找
            }
        }

        // 2. 尝试从工作区配置读取
        if let Ok(manager) = WorkspaceManagerConfig::load() {
            if let Some(workspace) = manager.get_current() {
                if let Some(ref config) = workspace.config {
                    if !config.repos.is_empty() {
                        return Ok((config.repos.clone(), config.clone()));
                    }
                }
            }
        }

        // 3. 从父级目录配置读取
        if let Some(ref dir) = current_dir {
            if let Some(parent_config) = Self::load_from_parent(dir)? {
                return Ok((parent_config.repos.clone(), parent_config));
            }
        }

        // 4. 从全局配置读取
        let global_config = Self::load()?
            .ok_or_else(|| anyhow::anyhow!("未找到配置文件，请先配置 .qclrc 或 .qcl.yaml"))?;
        Ok((global_config.repos.clone(), global_config))
    }

    /// 加载用于认证的配置（工作区 > 全局）
    fn load_for_auth() -> anyhow::Result<Config> {
        // 优先从工作区配置读取认证信息
        if let Ok(manager) = WorkspaceManagerConfig::load() {
            if let Some(workspace) = manager.get_current() {
                if let Some(ref config) = workspace.config {
                    return Ok(config.clone());
                }
            }
        }

        // 从全局配置读取，如果没有则返回空配置
        Ok(Self::load()?.unwrap_or_else(|| Config {
            username: None,
            password: None,
            token: None,
            proxy: None,
            repos: vec![],
            ai: None,
        }))
    }
}

impl RepoConfig {
    /// 获取仓库 URL
    pub fn get_url(&self) -> Option<String> {
        match self {
            RepoConfig::FTP(ftp) => Some(ftp.ftp.url.clone()),
            RepoConfig::Local(local) => Some(local.local.url.clone()),
            RepoConfig::GitHub(github) => github.github.repo.clone(),
            RepoConfig::GitLab(gitlab) => gitlab.gitlab.repo.clone(),
        }
    }

    /// 获取仓库类型
    pub fn get_type(&self) -> &str {
        match self {
            RepoConfig::FTP(_) => "ftp",
            RepoConfig::Local(_) => "local",
            RepoConfig::GitHub(_) => "git",
            RepoConfig::GitLab(_) => "gitlab",
        }
    }

    /// 获取用户名（优先使用仓库配置，否则使用全局配置）
    pub fn get_username(&self, global_username: Option<&String>) -> Option<String> {
        match self {
            RepoConfig::FTP(ftp) => {
                ftp.ftp.username.clone()
                    .or_else(|| global_username.cloned())
            }
            RepoConfig::Local(_) => None,
            RepoConfig::GitHub(github) => {
                github.github.username.clone()
                    .or_else(|| global_username.cloned())
            }
            RepoConfig::GitLab(gitlab) => {
                gitlab.gitlab.username.clone()
                    .or_else(|| global_username.cloned())
            }
        }
    }

    /// 获取密码（优先使用仓库配置，否则使用全局配置）
    pub fn get_password(&self, global_password: Option<&String>) -> Option<String> {
        match self {
            RepoConfig::FTP(ftp) => {
                ftp.ftp.password.clone()
                    .or_else(|| global_password.cloned())
            }
            RepoConfig::Local(_) => None,
            RepoConfig::GitHub(github) => {
                github.github.password.clone()
                    .or_else(|| global_password.cloned())
            }
            RepoConfig::GitLab(gitlab) => {
                gitlab.gitlab.password.clone()
                    .or_else(|| global_password.cloned())
            }
        }
    }

    /// 获取 token（优先使用仓库配置，否则使用全局配置）
    pub fn get_token(&self, global_token: Option<&String>) -> Option<String> {
        match self {
            RepoConfig::FTP(_) => None,
            RepoConfig::Local(_) => None,
            RepoConfig::GitHub(github) => {
                github.github.token.clone()
                    .or_else(|| global_token.cloned())
            }
            RepoConfig::GitLab(gitlab) => {
                gitlab.gitlab.token.clone()
                    .or_else(|| global_token.cloned())
            }
        }
    }
}
