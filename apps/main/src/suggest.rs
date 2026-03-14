use std::collections::HashMap;

/// 计算两个字符串的编辑距离（Levenshtein distance）
fn levenshtein_distance(s1: &str, s2: &str) -> usize {
    let s1_chars: Vec<char> = s1.chars().collect();
    let s2_chars: Vec<char> = s2.chars().collect();
    let s1_len = s1_chars.len();
    let s2_len = s2_chars.len();

    if s1_len == 0 {
        return s2_len;
    }
    if s2_len == 0 {
        return s1_len;
    }

    let mut matrix = vec![vec![0; s2_len + 1]; s1_len + 1];

    for i in 0..=s1_len {
        matrix[i][0] = i;
    }
    for j in 0..=s2_len {
        matrix[0][j] = j;
    }

    for i in 1..=s1_len {
        for j in 1..=s2_len {
            let cost = if s1_chars[i - 1] == s2_chars[j - 1] { 0 } else { 1 };
            matrix[i][j] = (matrix[i - 1][j] + 1)
                .min(matrix[i][j - 1] + 1)
                .min(matrix[i - 1][j - 1] + cost);
        }
    }

    matrix[s1_len][s2_len]
}

/// 查找最相似的建议
pub fn find_similar_commands(input: &str, commands: &[&str]) -> Vec<String> {
    let mut suggestions: Vec<(usize, String)> = commands
        .iter()
        .map(|cmd| (levenshtein_distance(input, cmd), cmd.to_string()))
        .collect();

    suggestions.sort_by_key(|(dist, _)| *dist);
    
    suggestions
        .into_iter()
        .take(3)
        .filter(|(dist, _)| *dist <= 3 && *dist < input.len())
        .map(|(_, cmd)| cmd)
        .collect()
}

/// 提供智能建议
pub struct SmartSuggest;

impl SmartSuggest {
    /// 获取所有可用命令
    pub fn get_all_commands() -> Vec<&'static str> {
        vec![
            "app", "template", "addons", "workspace", "config",
            "create", "list", "add", "sync", "detail",
        ]
    }

    /// 获取子命令映射
    pub fn get_subcommands() -> HashMap<&'static str, Vec<&'static str>> {
        let mut map = HashMap::new();
        map.insert("app", vec!["create", "list"]);
        map.insert("template", vec!["list"]);
        map.insert("addons", vec!["list", "detail", "add", "sync"]);
        map.insert("workspace", vec!["create", "list", "use", "current", "delete"]);
        map.insert("config", vec!["get", "set", "list"]);
        map
    }

    /// 生成命令建议
    pub fn suggest_command(input: &str) -> String {
        let all_commands = Self::get_all_commands();
        let suggestions = find_similar_commands(input, &all_commands);
        
        if suggestions.is_empty() {
            String::new()
        } else {
            format!("\n提示: 您是否想要使用以下命令？\n  {}", 
                suggestions.join("\n  "))
        }
    }

    /// 生成子命令建议
    pub fn suggest_subcommand(parent: &str, input: &str) -> String {
        let subcommands = Self::get_subcommands();
        if let Some(subs) = subcommands.get(parent) {
            let suggestions = find_similar_commands(input, subs);
            if suggestions.is_empty() {
                String::new()
            } else {
                format!("\n提示: `cocli {}` 的子命令可能是：\n  {}", 
                    parent,
                    suggestions.iter().map(|s| format!("cocli {} {}", parent, s)).collect::<Vec<_>>().join("\n  "))
            }
        } else {
            String::new()
        }
    }

    /// 生成完整的使用建议
    pub fn generate_usage_hint() -> String {
        r#"
常用命令：
  cocli app create --template=<模板名> <项目名>  创建新项目
  cocli app list                                 列出应用
  cocli template list                           列出模板
  cocli addons list [-v]                         列出插件
  cocli addons detail <插件名>                   查看插件详情
  cocli addons add <插件列表> [项目目录]         添加插件
  cocli workspace create <名称> [路径]           创建工作区
  cocli workspace list                            列出工作区

更多信息请使用: cocli --help
"#.to_string()
    }
}

