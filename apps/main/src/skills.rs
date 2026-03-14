use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::fs;

/// Skills 配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillConfig {
    /// Skill 名称
    pub name: String,
    /// Skill 描述
    pub description: Option<String>,
    /// Skill 版本
    pub version: Option<String>,
    /// Skill 的提示词模板
    pub prompt_template: Option<String>,
    /// Skill 的工作流程步骤
    pub workflow: Option<Vec<WorkflowStep>>,
    /// Skill 的输入参数定义
    pub inputs: Option<HashMap<String, InputDefinition>>,
    /// Skill 的输出定义
    pub outputs: Option<HashMap<String, OutputDefinition>>,
    /// 其他元数据
    #[serde(flatten)]
    pub metadata: HashMap<String, serde_json::Value>,
}

/// 工作流程步骤
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowStep {
    /// 步骤名称
    pub name: String,
    /// 步骤描述
    pub description: Option<String>,
    /// 步骤类型（如：prompt, tool_call, condition 等）
    pub step_type: Option<String>,
    /// 步骤配置
    pub config: Option<serde_json::Value>,
}

/// 输入参数定义
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InputDefinition {
    /// 参数类型
    pub r#type: String,
    /// 参数描述
    pub description: Option<String>,
    /// 是否必需
    pub required: Option<bool>,
    /// 默认值
    pub default: Option<serde_json::Value>,
}

/// 输出定义
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OutputDefinition {
    /// 输出类型
    pub r#type: String,
    /// 输出描述
    pub description: Option<String>,
}

/// Skills 管理器
pub struct SkillsManager {
    skills_dir: PathBuf,
}

impl SkillsManager {
    /// 创建新的 Skills 管理器
    pub fn new(skills_dir: Option<PathBuf>) -> Result<Self> {
        let skills_dir = if let Some(dir) = skills_dir {
            dir
        } else {
            // 默认使用 ~/.qcl/skills
            let home_dir = dirs::home_dir()
                .ok_or_else(|| anyhow::anyhow!("无法获取用户主目录"))?;
            home_dir.join(".qcl").join("skills")
        };

        // 确保目录存在
        if !skills_dir.exists() {
            fs::create_dir_all(&skills_dir)?;
        }

        Ok(Self { skills_dir })
    }

    /// 加载 Skill 配置
    pub fn load_skill(&self, skill_name: &str) -> Result<SkillConfig> {
        let skill_path = self.skills_dir.join(format!("{}.yaml", skill_name));
        
        if !skill_path.exists() {
            anyhow::bail!("Skill '{}' 不存在", skill_name);
        }

        let content = fs::read_to_string(&skill_path)?;
        let skill: SkillConfig = serde_yaml::from_str(&content)?;
        Ok(skill)
    }

    /// 列出所有可用的 Skills
    pub fn list_skills(&self) -> Result<Vec<String>> {
        let mut skills = Vec::new();

        if !self.skills_dir.exists() {
            return Ok(skills);
        }

        for entry in fs::read_dir(&self.skills_dir)? {
            let entry = entry?;
            let path = entry.path();
            
            if path.is_file() {
                if let Some(ext) = path.extension() {
                    if ext == "yaml" || ext == "yml" {
                        if let Some(name) = path.file_stem() {
                            skills.push(name.to_string_lossy().to_string());
                        }
                    }
                }
            }
        }

        Ok(skills)
    }

    /// 保存 Skill 配置
    pub fn save_skill(&self, skill: &SkillConfig) -> Result<()> {
        let skill_path = self.skills_dir.join(format!("{}.yaml", skill.name));
        let content = serde_yaml::to_string(skill)?;
        fs::write(&skill_path, content)?;
        Ok(())
    }

    /// 删除 Skill
    pub fn delete_skill(&self, skill_name: &str) -> Result<()> {
        let skill_path = self.skills_dir.join(format!("{}.yaml", skill_name));
        
        if !skill_path.exists() {
            anyhow::bail!("Skill '{}' 不存在", skill_name);
        }

        fs::remove_file(&skill_path)?;
        Ok(())
    }

    /// 执行 Skill
    pub async fn execute_skill(
        &self,
        skill_name: &str,
        inputs: HashMap<String, serde_json::Value>,
    ) -> Result<HashMap<String, serde_json::Value>> {
        let skill = self.load_skill(skill_name)?;

        // 验证输入
        if let Some(ref input_defs) = skill.inputs {
            for (key, def) in input_defs {
                if def.required.unwrap_or(false) {
                    if !inputs.contains_key(key) {
                        anyhow::bail!("缺少必需的输入参数: {}", key);
                    }
                }
            }
        }

        // 执行工作流程
        let mut outputs = HashMap::new();

        if let Some(ref workflow) = skill.workflow {
            for step in workflow {
                match step.step_type.as_deref() {
                    Some("prompt") => {
                        // 处理提示词步骤
                        if let Some(ref prompt_template) = skill.prompt_template {
                            let mut prompt = prompt_template.clone();
                            
                            // 替换输入变量
                            for (key, value) in &inputs {
                                let placeholder = format!("{{{{{}}}}}", key);
                                let value_str = match value {
                                    serde_json::Value::String(s) => s.clone(),
                                    _ => value.to_string(),
                                };
                                prompt = prompt.replace(&placeholder, &value_str);
                            }
                            
                            outputs.insert("prompt".to_string(), serde_json::Value::String(prompt));
                        }
                    }
                    Some("tool_call") => {
                        // 处理工具调用步骤
                        if let Some(ref config) = step.config {
                            // 这里可以调用 MCP 工具或其他工具
                            outputs.insert(
                                format!("step_{}", step.name),
                                config.clone()
                            );
                        }
                    }
                    _ => {
                        // 其他类型的步骤
                        outputs.insert(
                            format!("step_{}", step.name),
                            serde_json::json!({"status": "completed"})
                        );
                    }
                }
            }
        }

        Ok(outputs)
    }

    /// 获取 Skill 的详细信息
    pub fn get_skill_info(&self, skill_name: &str) -> Result<SkillConfig> {
        self.load_skill(skill_name)
    }
}

/// 内置的 Skills
pub mod builtin {
    use super::*;

    /// 创建项目建议 Skill
    pub fn create_project_suggestion_skill() -> SkillConfig {
        SkillConfig {
            name: "project_suggestion".to_string(),
            description: Some("为项目创建提供 AI 建议".to_string()),
            version: Some("1.0.0".to_string()),
            prompt_template: Some(
                "基于以下信息，为项目创建提供建议：\n\
                项目类型: {{{project_type}}}\n\
                项目名称: {{{project_name}}}\n\
                需求描述: {{{requirements}}}\n\
                请提供详细的建议，包括技术栈选择、项目结构建议等。".to_string()
            ),
            workflow: Some(vec![
                WorkflowStep {
                    name: "analyze_requirements".to_string(),
                    description: Some("分析项目需求".to_string()),
                    step_type: Some("prompt".to_string()),
                    config: None,
                },
                WorkflowStep {
                    name: "generate_suggestions".to_string(),
                    description: Some("生成项目建议".to_string()),
                    step_type: Some("prompt".to_string()),
                    config: None,
                },
            ]),
            inputs: Some({
                let mut inputs = HashMap::new();
                inputs.insert("project_type".to_string(), InputDefinition {
                    r#type: "string".to_string(),
                    description: Some("项目类型".to_string()),
                    required: Some(true),
                    default: None,
                });
                inputs.insert("project_name".to_string(), InputDefinition {
                    r#type: "string".to_string(),
                    description: Some("项目名称".to_string()),
                    required: Some(true),
                    default: None,
                });
                inputs.insert("requirements".to_string(), InputDefinition {
                    r#type: "string".to_string(),
                    description: Some("需求描述".to_string()),
                    required: Some(false),
                    default: None,
                });
                inputs
            }),
            outputs: Some({
                let mut outputs = HashMap::new();
                outputs.insert("suggestions".to_string(), OutputDefinition {
                    r#type: "string".to_string(),
                    description: Some("项目建议".to_string()),
                });
                outputs
            }),
            metadata: HashMap::new(),
        }
    }

    /// 模板选择建议 Skill
    pub fn create_template_selection_skill() -> SkillConfig {
        SkillConfig {
            name: "template_selection".to_string(),
            description: Some("为项目选择最合适的模板".to_string()),
            version: Some("1.0.0".to_string()),
            prompt_template: Some(
                "基于以下信息，推荐最合适的项目模板：\n\
                项目类型: {{{project_type}}}\n\
                技术栈偏好: {{{tech_stack}}}\n\
                项目规模: {{{project_scale}}}\n\
                请推荐最合适的模板并说明理由。".to_string()
            ),
            workflow: Some(vec![
                WorkflowStep {
                    name: "analyze_requirements".to_string(),
                    description: Some("分析项目需求".to_string()),
                    step_type: Some("prompt".to_string()),
                    config: None,
                },
                WorkflowStep {
                    name: "match_templates".to_string(),
                    description: Some("匹配可用模板".to_string()),
                    step_type: Some("tool_call".to_string()),
                    config: Some(serde_json::json!({
                        "tool": "template/list"
                    })),
                },
            ]),
            inputs: Some({
                let mut inputs = HashMap::new();
                inputs.insert("project_type".to_string(), InputDefinition {
                    r#type: "string".to_string(),
                    description: Some("项目类型".to_string()),
                    required: Some(true),
                    default: None,
                });
                inputs.insert("tech_stack".to_string(), InputDefinition {
                    r#type: "string".to_string(),
                    description: Some("技术栈偏好".to_string()),
                    required: Some(false),
                    default: None,
                });
                inputs.insert("project_scale".to_string(), InputDefinition {
                    r#type: "string".to_string(),
                    description: Some("项目规模".to_string()),
                    required: Some(false),
                    default: Some(serde_json::Value::String("medium".to_string())),
                });
                inputs
            }),
            outputs: Some({
                let mut outputs = HashMap::new();
                outputs.insert("recommended_template".to_string(), OutputDefinition {
                    r#type: "string".to_string(),
                    description: Some("推荐的模板名称".to_string()),
                });
                outputs.insert("reason".to_string(), OutputDefinition {
                    r#type: "string".to_string(),
                    description: Some("推荐理由".to_string()),
                });
                outputs
            }),
            metadata: HashMap::new(),
        }
    }
}

