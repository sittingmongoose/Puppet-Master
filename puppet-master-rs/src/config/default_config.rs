//! Default Configuration
//!
//! Provides sensible default configuration values for Puppet Master.

use crate::platforms::platform_specs;
use crate::types::*;
use std::collections::HashMap;
use std::path::PathBuf;

// DRY:FN:default_workspace_dir
/// Get the default workspace directory for the current platform.
pub fn default_workspace_dir() -> PathBuf {
    // When installed system-wide (Program Files on Windows, /usr/bin on Linux),
    // use user's local data directory to avoid permission issues.
    // On macOS and when running from source, use current directory.

    if cfg!(windows) {
        // Windows: Use %LOCALAPPDATA%\puppetmaster\Puppet Master
        if let Some(proj_dirs) = directories::ProjectDirs::from("com", "puppetmaster", "Puppet Master") {
            let path = proj_dirs.data_local_dir().to_path_buf();
            // Ensure directory exists
            let _ = std::fs::create_dir_all(&path);
            path
        } else if let Some(base_dirs) = directories::BaseDirs::new() {
            let path = base_dirs.data_local_dir().join("Puppet Master");
            let _ = std::fs::create_dir_all(&path);
            path
        } else if let Some(home) = directories::BaseDirs::new().map(|b| b.home_dir().to_path_buf())
        {
            let path = home.join(".puppet-master");
            let _ = std::fs::create_dir_all(&path);
            path
        } else {
            // Last resort: temp directory
            let path = std::env::temp_dir().join("puppetmaster");
            let _ = std::fs::create_dir_all(&path);
            path
        }
    } else if cfg!(target_os = "linux") {
        // Linux: Prefer XDG_DATA_HOME or ~/.local/share
        if let Ok(xdg_data) = std::env::var("XDG_DATA_HOME") {
            let path = PathBuf::from(xdg_data).join("puppetmaster");
            if std::fs::create_dir_all(&path).is_ok() {
                return path;
            }
        }

        // Check if we're running from a system install (/usr/bin)
        // If so, use ~/.local/share/puppetmaster (Puppet Master app data)
        if let Ok(exe_path) = std::env::current_exe() {
            if exe_path.starts_with("/usr/bin") || exe_path.starts_with("/usr/local/bin") {
                // System-wide install, use user data directory
                if let Some(proj_dirs) =
                    directories::ProjectDirs::from("com", "puppetmaster", "Puppet Master")
                {
                    let path = proj_dirs.data_local_dir().to_path_buf();
                    if std::fs::create_dir_all(&path).is_ok() {
                        return path;
                    }
                }
                if let Some(base_dirs) = directories::BaseDirs::new() {
                    let path = base_dirs.data_local_dir().join("puppetmaster");
                    if std::fs::create_dir_all(&path).is_ok() {
                        return path;
                    }
                }
            }
        }

        // Try home directory
        if let Some(base_dirs) = directories::BaseDirs::new() {
            let path = base_dirs.home_dir().join(".puppet-master");
            if std::fs::create_dir_all(&path).is_ok() {
                return path;
            }
        }

        // Running from source or local install, try current directory
        if let Ok(current) = std::env::current_dir() {
            // Only use current dir if it's writable
            let test_file = current.join("pm-write-probe");
            if std::fs::write(&test_file, "test").is_ok() {
                let _ = std::fs::remove_file(&test_file);
                return current;
            }
        }

        // Last resort: temp directory
        let path = std::env::temp_dir().join("puppetmaster");
        let _ = std::fs::create_dir_all(&path);
        path
    } else if cfg!(target_os = "macos") {
        // macOS: Use ~/Library/Application Support/Puppet Master
        if let Some(proj_dirs) = directories::ProjectDirs::from("com", "puppetmaster", "Puppet Master") {
            let path = proj_dirs.data_local_dir().to_path_buf();
            if std::fs::create_dir_all(&path).is_ok() {
                return path;
            }
        }

        // Fallback to home directory
        if let Some(base_dirs) = directories::BaseDirs::new() {
            let path = base_dirs.home_dir().join(".puppet-master");
            if std::fs::create_dir_all(&path).is_ok() {
                return path;
            }
        }

        // Try current directory if writable
        if let Ok(current) = std::env::current_dir() {
            let test_file = current.join("pm-write-probe");
            if std::fs::write(&test_file, "test").is_ok() {
                let _ = std::fs::remove_file(&test_file);
                return current;
            }
        }

        // Last resort: temp directory
        let path = std::env::temp_dir().join("puppetmaster");
        let _ = std::fs::create_dir_all(&path);
        path
    } else {
        // Other platforms: try home, then current, then temp
        if let Some(base_dirs) = directories::BaseDirs::new() {
            let path = base_dirs.home_dir().join(".puppet-master");
            if std::fs::create_dir_all(&path).is_ok() {
                return path;
            }
        }

        if let Ok(current) = std::env::current_dir() {
            let test_file = current.join("pm-write-probe");
            if std::fs::write(&test_file, "test").is_ok() {
                let _ = std::fs::remove_file(&test_file);
                return current;
            }
        }

        let path = std::env::temp_dir().join("puppetmaster");
        let _ = std::fs::create_dir_all(&path);
        path
    }
}

// DRY:FN:default_config
/// Create a default configuration
pub fn default_config() -> PuppetMasterConfig {
    // Use platform-appropriate working directory
    let working_directory = default_workspace_dir();

    PuppetMasterConfig {
        project: ProjectConfig {
            name: "default".to_string(),
            working_directory: working_directory.clone(),
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
        interview: InterviewConfig::default(),
        gui_automation: crate::types::GuiAutomationConfig::default(),
    }
}

fn default_orchestrator() -> OrchestratorConfig {
    OrchestratorConfig {
        max_depth: 3,
        max_iterations: 10,
        progress_file: "progress.txt".to_string(),
        prd_file: "prd.json".to_string(),
        session_prefix: "PM".to_string(),
        enable_git: true,
        enable_verification: true,
        enable_parallel_execution: false,
        enable_platform_router: true,
        enable_subagents: false,
    }
}

fn default_platforms() -> HashMap<String, PlatformConfig> {
    let mut platforms = HashMap::new();
    // DRY:FN:platform_default_config_from_specs — Build platform defaults from platform_specs.
    let mk =
        |platform: Platform, enabled: bool, priority: u32, max_tokens: u32, temperature: f32| {
            PlatformConfig {
                platform,
                model: String::new(),
                name: platform_specs::display_name_for(platform).to_string(),
                executable: platform_specs::cli_binary_names(platform)
                    .first()
                    .copied()
                    .unwrap_or_else(|| platform.default_cli_name())
                    .to_string(),
                reasoning_effort: None,
                plan_mode: false,
                cli_path: None,
                extra_args: Vec::new(),
                enabled,
                api_key_env: None,
                max_tokens: Some(max_tokens),
                temperature: Some(temperature),
                available: false,
                priority,
                quota: None,
            }
        };

    platforms.insert(
        Platform::Claude.to_string(),
        mk(Platform::Claude, true, 1, 8192, 0.7),
    );
    platforms.insert(
        Platform::Codex.to_string(),
        mk(Platform::Codex, true, 2, 4096, 0.7),
    );
    platforms.insert(
        Platform::Cursor.to_string(),
        mk(Platform::Cursor, true, 3, 8192, 0.7),
    );
    platforms.insert(
        Platform::Gemini.to_string(),
        mk(Platform::Gemini, true, 4, 8192, 0.7),
    );
    platforms.insert(
        Platform::Copilot.to_string(),
        mk(Platform::Copilot, false, 5, 4096, 0.7),
    );

    platforms
}

fn default_tiers() -> TierConfigs {
    TierConfigs {
        phase: TierConfig {
            platform: Platform::Claude,
            model: String::new(),
            model_level: ModelLevel::Level2,
            reasoning_effort: None,
            plan_mode: false,
            task_failure_style: TaskFailureStyle::ContinueSameAgent,
            max_iterations: 10,
            escalation: None,
            timeout_ms: Some(600_000),      // 10 minutes
            hard_timeout_ms: Some(900_000), // 15 minutes
            complexity: Complexity::Standard,
            task_types: vec![],
        },
        task: TierConfig {
            platform: Platform::Cursor,
            model: String::new(),
            model_level: ModelLevel::Level2,
            reasoning_effort: None,
            plan_mode: false,
            task_failure_style: TaskFailureStyle::ContinueSameAgent,
            max_iterations: 20,
            escalation: Some(EscalationTarget::Phase),
            timeout_ms: Some(300_000),      // 5 minutes
            hard_timeout_ms: Some(450_000), // 7.5 minutes
            complexity: Complexity::Standard,
            task_types: vec![],
        },
        subtask: TierConfig {
            platform: Platform::Cursor,
            model: String::new(),
            model_level: ModelLevel::Level2,
            reasoning_effort: None,
            plan_mode: false,
            task_failure_style: TaskFailureStyle::ContinueSameAgent,
            max_iterations: 30,
            escalation: Some(EscalationTarget::Task),
            timeout_ms: Some(180_000),      // 3 minutes
            hard_timeout_ms: Some(270_000), // 4.5 minutes
            complexity: Complexity::Simple,
            task_types: vec![],
        },
        iteration: TierConfig {
            platform: Platform::Cursor,
            model: String::new(),
            model_level: ModelLevel::Level1,
            reasoning_effort: None,
            plan_mode: false,
            task_failure_style: TaskFailureStyle::ContinueSameAgent,
            max_iterations: 5,
            escalation: Some(EscalationTarget::Subtask),
            timeout_ms: Some(60_000),      // 1 minute
            hard_timeout_ms: Some(90_000), // 1.5 minutes
            complexity: Complexity::Simple,
            task_types: vec![],
        },
    }
}

fn default_paths() -> PathConfig {
    let workspace = default_workspace_dir();

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
        event_db: workspace.join(".puppet-master").join("events.db"),
    }
}

fn default_ui() -> UiConfig {
    UiConfig {
        theme: "dark".to_string(),
        auto_scroll: true,
        show_timestamps: true,
    }
}

// DRY:FN:default_platform_config
/// Get default config for a specific platform
pub fn default_platform_config(platform: &str) -> Option<PlatformConfig> {
    let platforms = default_platforms();
    platforms.get(platform).cloned()
}

// DRY:FN:default_tier_config
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
        assert!(config.platforms.contains_key("codex"));
    }

    #[test]
    fn test_default_platforms() {
        let platforms = default_platforms();

        assert!(platforms.get("claude").unwrap().enabled);
        assert!(platforms.get("codex").unwrap().enabled);
        assert!(platforms.get("cursor").unwrap().enabled);
        assert!(!platforms.get("copilot").unwrap().enabled);
        assert!(platforms.values().all(|cfg| cfg.api_key_env.is_none()));
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

    #[test]
    fn test_default_workspace_dir_exists() {
        let workspace = default_workspace_dir();
        assert!(workspace.exists());
        assert!(workspace.is_dir());
    }
}
