//! Default Configuration
//!
//! Provides sensible default configuration values for the RWM Puppet Master.

use crate::types::*;
use std::collections::HashMap;
use std::path::PathBuf;

/// Create a default configuration
pub fn default_config() -> PuppetMasterConfig {
    PuppetMasterConfig {
        project: ProjectConfig {
            name: "default".to_string(),
            working_directory: std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")),
            description: None,
            version: "1.0.0".to_string(),
        },
        orchestrator: default_orchestrator(),
        platforms: default_platforms(),
        tiers: default_tiers(),
        paths: default_paths(),
        ui: default_ui(),
        branching: BranchingConfig::default(),
        verification: VerificationConfig::default(),
        memory: MemoryConfig::default(),
        budget: BudgetConfig::default(),
        logging: LoggingConfig::default(),
        escalation: None,
    }
}

fn default_orchestrator() -> OrchestratorConfig {
    OrchestratorConfig {
        max_depth: 3,
        max_iterations: 10,
        progress_file: "progress.txt".to_string(),
        prd_file: "prd.json".to_string(),
        session_prefix: "PM".to_string(),
    }
}

fn default_platforms() -> HashMap<String, PlatformConfig> {
    let mut platforms = HashMap::new();

    platforms.insert(
        "claude".to_string(),
        PlatformConfig {
            platform: Platform::Claude,
            model: "claude-3-5-sonnet-20241022".to_string(),
            name: "Claude".to_string(),
            executable: "claude".to_string(),
            reasoning_effort: None,
            plan_mode: false,
            cli_path: None,
            extra_args: Vec::new(),
            enabled: true,
            api_key_env: Some("ANTHROPIC_API_KEY".to_string()),
            max_tokens: Some(8192),
            temperature: Some(0.7),
            available: false,
            priority: 1,
            quota: None,
        },
    );

    platforms.insert(
        "openai".to_string(),
        PlatformConfig {
            platform: Platform::Codex,
            model: "gpt-4-turbo".to_string(),
            name: "OpenAI".to_string(),
            executable: "codex".to_string(),
            reasoning_effort: None,
            plan_mode: false,
            cli_path: None,
            extra_args: Vec::new(),
            enabled: true,
            api_key_env: Some("OPENAI_API_KEY".to_string()),
            max_tokens: Some(4096),
            temperature: Some(0.7),
            available: false,
            priority: 2,
            quota: None,
        },
    );

    platforms.insert(
        "cursor".to_string(),
        PlatformConfig {
            platform: Platform::Cursor,
            model: "claude-3-5-sonnet-20241022".to_string(),
            name: "Cursor".to_string(),
            executable: "cursor-agent".to_string(),
            reasoning_effort: None,
            plan_mode: false,
            cli_path: None,
            extra_args: Vec::new(),
            enabled: true,
            api_key_env: Some("CURSOR_API_KEY".to_string()),
            max_tokens: Some(8192),
            temperature: Some(0.7),
            available: false,
            priority: 3,
            quota: None,
        },
    );

    platforms.insert(
        "gemini".to_string(),
        PlatformConfig {
            platform: Platform::Gemini,
            model: "gemini-2.0-flash-exp".to_string(),
            name: "Gemini".to_string(),
            executable: "gemini".to_string(),
            reasoning_effort: None,
            plan_mode: false,
            cli_path: None,
            extra_args: Vec::new(),
            enabled: true,
            api_key_env: Some("GEMINI_API_KEY".to_string()),
            max_tokens: Some(8192),
            temperature: Some(0.7),
            available: false,
            priority: 4,
            quota: None,
        },
    );

    platforms.insert(
        "copilot".to_string(),
        PlatformConfig {
            platform: Platform::Copilot,
            model: "gpt-4".to_string(),
            name: "Copilot".to_string(),
            executable: "copilot".to_string(),
            reasoning_effort: None,
            plan_mode: false,
            cli_path: None,
            extra_args: Vec::new(),
            enabled: false,
            api_key_env: Some("GITHUB_TOKEN".to_string()),
            max_tokens: Some(4096),
            temperature: Some(0.7),
            available: false,
            priority: 5,
            quota: None,
        },
    );

    platforms
}

fn default_tiers() -> TierConfigs {
    TierConfigs {
        phase: TierConfig {
            platform: Platform::Claude,
            model: "claude-3-5-sonnet-20241022".to_string(),
            model_level: ModelLevel::Level2,
            reasoning_effort: None,
            plan_mode: false,
            task_failure_style: TaskFailureStyle::ContinueSameAgent,
            max_iterations: 10,
            escalation: None,
            timeout_ms: Some(600_000), // 10 minutes
            hard_timeout_ms: Some(900_000), // 15 minutes
            complexity: Complexity::Standard,
            task_types: vec![],
        },
        task: TierConfig {
            platform: Platform::Cursor,
            model: "claude-3-5-sonnet-20241022".to_string(),
            model_level: ModelLevel::Level2,
            reasoning_effort: None,
            plan_mode: false,
            task_failure_style: TaskFailureStyle::ContinueSameAgent,
            max_iterations: 20,
            escalation: Some(EscalationTarget::Phase),
            timeout_ms: Some(300_000), // 5 minutes
            hard_timeout_ms: Some(450_000), // 7.5 minutes
            complexity: Complexity::Standard,
            task_types: vec![],
        },
        subtask: TierConfig {
            platform: Platform::Cursor,
            model: "claude-3-5-sonnet-20241022".to_string(),
            model_level: ModelLevel::Level2,
            reasoning_effort: None,
            plan_mode: false,
            task_failure_style: TaskFailureStyle::ContinueSameAgent,
            max_iterations: 30,
            escalation: Some(EscalationTarget::Task),
            timeout_ms: Some(180_000), // 3 minutes
            hard_timeout_ms: Some(270_000), // 4.5 minutes
            complexity: Complexity::Simple,
            task_types: vec![],
        },
        iteration: TierConfig {
            platform: Platform::Cursor,
            model: "claude-3-5-sonnet-20241022".to_string(),
            model_level: ModelLevel::Level1,
            reasoning_effort: None,
            plan_mode: false,
            task_failure_style: TaskFailureStyle::ContinueSameAgent,
            max_iterations: 5,
            escalation: Some(EscalationTarget::Subtask),
            timeout_ms: Some(60_000), // 1 minute
            hard_timeout_ms: Some(90_000), // 1.5 minutes
            complexity: Complexity::Simple,
            task_types: vec![],
        },
    }
}

fn default_paths() -> PathConfig {
    let workspace = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));

    PathConfig {
        workspace: workspace.clone(),
        prd_path: workspace.join("prd.json"),
        progress_path: workspace.join("progress.txt"),
        agents_root: workspace.join(".puppet-master").join("agents"),
        evidence_root: workspace.join(".puppet-master").join("evidence"),
        usage_file: workspace
            .join(".puppet-master")
            .join("usage")
            .join("usage.jsonl"),
        event_db: workspace
            .join(".puppet-master")
            .join("events.db"),
    }
}

fn default_ui() -> UiConfig {
    UiConfig {
        theme: "dark".to_string(),
        auto_scroll: true,
        show_timestamps: true,
    }
}

/// Get default config for a specific platform
pub fn default_platform_config(platform: &str) -> Option<PlatformConfig> {
    let platforms = default_platforms();
    platforms.get(platform).cloned()
}

/// Get default tier configuration
pub fn default_tier_config(tier: &str) -> Option<TierConfig> {
    let tiers = default_tiers();
    match tier {
        "phase" => Some(tiers.phase),
        "task" => Some(tiers.task),
        "subtask" => Some(tiers.subtask),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = default_config();

        assert_eq!(config.orchestrator.session_prefix, "PM");
        assert_eq!(config.orchestrator.max_depth, 3);
        assert!(config.platforms.len() >= 4);
        assert!(config.platforms.contains_key("claude"));
        assert!(config.platforms.contains_key("openai"));
    }

    #[test]
    fn test_default_platforms() {
        let platforms = default_platforms();

        assert!(platforms.get("claude").unwrap().enabled);
        assert!(platforms.get("openai").unwrap().enabled);
        assert!(platforms.get("cursor").unwrap().enabled);
        assert!(!platforms.get("copilot").unwrap().enabled);
    }

    #[test]
    fn test_default_tiers() {
        let tiers = default_tiers();

        assert_eq!(tiers.phase.platform, Platform::Claude);
        assert_eq!(tiers.task.platform, Platform::Cursor);
        assert_eq!(tiers.subtask.platform, Platform::Cursor);

        assert!(tiers.phase.max_iterations > 0);
        assert!(tiers.task.max_iterations > 0);
        assert!(tiers.subtask.max_iterations > 0);
    }

    #[test]
    fn test_platform_timeouts() {
        let config = default_config();

        assert!(config.tiers.phase.timeout_ms.unwrap() > 0);
        assert!(config.tiers.task.timeout_ms.unwrap() > 0);
        assert!(config.tiers.subtask.timeout_ms.unwrap() > 0);

        // Phase should have longer timeout than subtasks
        assert!(config.tiers.phase.timeout_ms.unwrap() > config.tiers.subtask.timeout_ms.unwrap());
    }
}
