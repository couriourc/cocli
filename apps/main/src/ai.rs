use anyhow::Result;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::path::PathBuf;
use crate::config::{Config, AIConfig as ConfigAIConfig, MCPConfig as ConfigMCPConfig};

/// MCP 客户端配置（内部使用）
#[derive(Debug, Clone)]
pub struct MCPConfig {
    /// MCP 服务器地址
    pub server_url: Option<String>,
    /// MCP 服务器命令（用于启动本地服务器）
    pub server_command: Option<String>,
    /// API Key（如果需要）
    pub api_key: Option<String>,
}

impl From<ConfigMCPConfig> for MCPConfig {
    fn from(config: ConfigMCPConfig) -> Self {
        Self {
            server_url: config.server_url,
            server_command: config.server_command,
            api_key: config.api_key,
        }
    }
}

/// AI 服务配置（内部使用）
#[derive(Debug, Clone)]
pub struct AIConfig {
    /// MCP 配置
    pub mcp: Option<MCPConfig>,
    /// 默认 AI 模型
    pub default_model: Option<String>,
    /// API 端点
    pub api_endpoint: Option<String>,
}

impl From<ConfigAIConfig> for AIConfig {
    fn from(config: ConfigAIConfig) -> Self {
        Self {
            mcp: config.mcp.map(Into::into),
            default_model: config.default_model,
            api_endpoint: config.api_endpoint,
        }
    }
}

/// MCP 工具定义
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MCPTool {
    pub name: String,
    pub description: String,
    pub input_schema: Value,
}

/// MCP 资源定义
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MCPResource {
    pub uri: String,
    pub name: String,
    pub description: Option<String>,
    pub mime_type: Option<String>,
}

/// MCP 客户端
pub struct MCPClient {
    config: MCPConfig,
    client: reqwest::Client,
}

impl MCPClient {
    /// 创建新的 MCP 客户端
    pub fn new(config: MCPConfig) -> Result<Self> {
        let client = reqwest::Client::builder()
            .build()?;
        
        Ok(Self { config, client })
    }

    /// 调用 MCP 工具
    pub async fn call_tool(&self, tool_name: &str, arguments: Value) -> Result<Value> {
        // 这里实现 MCP 协议的工具调用
        // MCP 使用 JSON-RPC 2.0 协议
        let request = serde_json::json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": arguments
            }
        });

        if let Some(ref server_url) = self.config.server_url {
            let response = self.client
                .post(server_url)
                .json(&request)
                .send()
                .await?;
            
            let result: Value = response.json().await?;
            Ok(result)
        } else {
            anyhow::bail!("MCP 服务器地址未配置")
        }
    }

    /// 列出可用的工具
    pub async fn list_tools(&self) -> Result<Vec<MCPTool>> {
        let request = serde_json::json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/list"
        });

        if let Some(ref server_url) = self.config.server_url {
            let response = self.client
                .post(server_url)
                .json(&request)
                .send()
                .await?;
            
            let result: Value = response.json().await?;
            
            if let Some(tools) = result.get("result").and_then(|r| r.get("tools")) {
                let tools: Vec<MCPTool> = serde_json::from_value(tools.clone())?;
                Ok(tools)
            } else {
                Ok(vec![])
            }
        } else {
            anyhow::bail!("MCP 服务器地址未配置")
        }
    }

    /// 列出可用的资源
    pub async fn list_resources(&self) -> Result<Vec<MCPResource>> {
        let request = serde_json::json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "resources/list"
        });

        if let Some(ref server_url) = self.config.server_url {
            let response = self.client
                .post(server_url)
                .json(&request)
                .send()
                .await?;
            
            let result: Value = response.json().await?;
            
            if let Some(resources) = result.get("result").and_then(|r| r.get("resources")) {
                let resources: Vec<MCPResource> = serde_json::from_value(resources.clone())?;
                Ok(resources)
            } else {
                Ok(vec![])
            }
        } else {
            anyhow::bail!("MCP 服务器地址未配置")
        }
    }

    /// 获取资源内容
    pub async fn get_resource(&self, uri: &str) -> Result<Value> {
        let request = serde_json::json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "resources/read",
            "params": {
                "uri": uri
            }
        });

        if let Some(ref server_url) = self.config.server_url {
            let response = self.client
                .post(server_url)
                .json(&request)
                .send()
                .await?;
            
            let result: Value = response.json().await?;
            Ok(result)
        } else {
            anyhow::bail!("MCP 服务器地址未配置")
        }
    }
}

/// AI 助手，用于与 AI 模型交互
pub struct AIAssistant {
    config: AIConfig,
    mcp_client: Option<MCPClient>,
}

impl AIAssistant {
    /// 创建新的 AI 助手
    pub fn new(config: AIConfig) -> Result<Self> {
        let mcp_client = if let Some(ref mcp_config) = config.mcp {
            Some(MCPClient::new(mcp_config.clone())?)
        } else {
            None
        };

        Ok(Self { config, mcp_client })
    }

    /// 从配置加载 AI 助手
    pub fn from_config(config: &Config) -> Result<Option<Self>> {
        if let Some(ref ai_config) = config.ai {
            Ok(Some(Self::new(ai_config.clone().into())?))
        } else {
            Ok(None)
        }
    }

    /// 使用 AI 生成建议
    pub async fn suggest(&self, prompt: &str, context: Option<&str>) -> Result<String> {
        // 如果有 MCP 客户端，可以使用 MCP 工具
        if let Some(ref mcp_client) = self.mcp_client {
            // 尝试使用 MCP 工具进行 AI 交互
            let arguments = serde_json::json!({
                "prompt": prompt,
                "context": context.unwrap_or("")
            });
            
            // 这里假设有一个 "ai/chat" 工具
            match mcp_client.call_tool("ai/chat", arguments).await {
                Ok(result) => {
                    if let Some(content) = result.get("result").and_then(|r| r.get("content")) {
                        return Ok(content.as_str().unwrap_or("").to_string());
                    }
                }
                Err(_) => {
                    // MCP 调用失败，继续使用其他方式
                }
            }
        }

        // 如果没有 MCP 或调用失败，返回提示信息
        Ok(format!("AI 功能需要配置 MCP 服务器。提示: {}", prompt))
    }

    /// 使用 AI 分析项目结构并生成建议
    pub async fn analyze_project(&self, project_path: &PathBuf) -> Result<String> {
        // 分析项目结构
        let context = format!("分析项目路径: {}", project_path.display());
        
        self.suggest("请分析这个项目结构并提供改进建议", Some(&context)).await
    }

    /// 列出可用的 MCP 工具
    pub async fn list_mcp_tools(&self) -> Result<Vec<MCPTool>> {
        if let Some(ref mcp_client) = self.mcp_client {
            mcp_client.list_tools().await
        } else {
            anyhow::bail!("MCP 客户端未配置")
        }
    }

    /// 列出可用的 MCP 资源
    pub async fn list_mcp_resources(&self) -> Result<Vec<MCPResource>> {
        if let Some(ref mcp_client) = self.mcp_client {
            mcp_client.list_resources().await
        } else {
            anyhow::bail!("MCP 客户端未配置")
        }
    }
}

