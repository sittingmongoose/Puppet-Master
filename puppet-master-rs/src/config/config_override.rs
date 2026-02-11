//! Configuration Overrides
//!
//! Allows dynamic configuration overrides for testing and special execution modes.
//! Supports overriding steps, prompts, validators, platforms, tiers, and budgets.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::types::{PuppetMasterConfig, Platform};

/// Start chain override configuration
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct StartChainOverride {
    /// Steps to skip during execution
    #[serde(default)]
    pub steps_to_skip: Vec<String>,

    /// Custom prompts to inject
    #[serde(default)]
    pub custom_prompts: HashMap<String, String>,

    /// Custom validators to use
    #[serde(default)]
    pub custom_validators: Vec<ValidatorOverride>,

    /// Force specific step order
    #[serde(skip_serializing_if = "Option::is_none")]
    pub force_step_order: Option<Vec<String>>,
}

/// Validator override specification
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidatorOverride {
    /// Step ID this validator applies to
    pub step_id: String,

    /// Validator type (command, file, regex, script, ai, browser)
    pub validator_type: String,

    /// Validator configuration as JSON
    pub config: serde_json::Value,
}

/// Configuration override for runtime modifications
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ConfigOverride {
    /// Platform-specific overrides
    #[serde(skip_serializing_if = "Option::is_none")]
    pub platform_overrides: Option<PlatformOverride>,

    /// Tier configuration overrides
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tier_overrides: Option<TierOverride>,

    /// Budget overrides
    #[serde(skip_serializing_if = "Option::is_none")]
    pub budget_overrides: Option<BudgetOverride>,

    /// Logging overrides
    #[serde(skip_serializing_if = "Option::is_none")]
    pub logging_overrides: Option<LoggingOverride>,

    /// Verification overrides
    #[serde(skip_serializing_if = "Option::is_none")]
    pub verification_overrides: Option<VerificationOverride>,

    /// Path overrides
    #[serde(skip_serializing_if = "Option::is_none")]
    pub path_overrides: Option<HashMap<String, String>>,
}

/// Platform-specific configuration overrides
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlatformOverride {
    /// Force specific platform
    #[serde(skip_serializing_if = "Option::is_none")]
    pub force_platform: Option<Platform>,

    /// Override model for platform
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model: Option<String>,

    /// Override temperature
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f64>,

    /// Override max tokens
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<u32>,

    /// Override timeout
    #[serde(skip_serializing_if = "Option::is_none")]
    pub timeout_seconds: Option<u32>,
}

/// Tier configuration overrides
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TierOverride {
    /// Override max iterations for phase tier
    #[serde(skip_serializing_if = "Option::is_none")]
    pub phase_max_iterations: Option<u32>,

    /// Override max iterations for task tier
    #[serde(skip_serializing_if = "Option::is_none")]
    pub task_max_iterations: Option<u32>,

    /// Override max iterations for subtask tier
    #[serde(skip_serializing_if = "Option::is_none")]
    pub subtask_max_iterations: Option<u32>,

    /// Override timeout for all tiers (milliseconds)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub global_timeout_ms: Option<u64>,
}

/// Budget configuration overrides
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BudgetOverride {
    /// Override daily budget
    #[serde(skip_serializing_if = "Option::is_none")]
    pub daily_budget: Option<f64>,

    /// Override monthly budget
    #[serde(skip_serializing_if = "Option::is_none")]
    pub monthly_budget: Option<f64>,

    /// Override per-iteration budget
    #[serde(skip_serializing_if = "Option::is_none")]
    pub per_iteration_budget: Option<f64>,

    /// Disable budget enforcement
    #[serde(default)]
    pub disable_enforcement: bool,
}

/// Logging configuration overrides
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoggingOverride {
    /// Override log level
    #[serde(skip_serializing_if = "Option::is_none")]
    pub level: Option<String>,

    /// Enable/disable intensive logging
    #[serde(skip_serializing_if = "Option::is_none")]
    pub intensive: Option<bool>,

    /// Override retention days
    #[serde(skip_serializing_if = "Option::is_none")]
    pub retention_days: Option<u32>,
}

/// Verification configuration overrides
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerificationOverride {
    /// Skip all verification
    #[serde(default)]
    pub skip_verification: bool,

    /// Skip specific gate types
    #[serde(default)]
    pub skip_gates: Vec<String>,

    /// Override verification timeout (seconds)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub timeout_seconds: Option<u32>,
}

/// Apply configuration overrides to a base configuration
///
/// Modifies the base configuration in-place with the specified overrides.
pub fn apply_overrides(base_config: &mut PuppetMasterConfig, overrides: &ConfigOverride) {
    // Apply platform overrides
    if let Some(platform_override) = &overrides.platform_overrides {
        apply_platform_overrides(base_config, platform_override);
    }

    // Apply tier overrides
    if let Some(tier_override) = &overrides.tier_overrides {
        apply_tier_overrides(base_config, tier_override);
    }

    // Apply budget overrides
    if let Some(budget_override) = &overrides.budget_overrides {
        apply_budget_overrides(base_config, budget_override);
    }

    // Apply logging overrides
    if let Some(logging_override) = &overrides.logging_overrides {
        apply_logging_overrides(base_config, logging_override);
    }

    // Apply verification overrides
    if let Some(verification_override) = &overrides.verification_overrides {
        apply_verification_overrides(base_config, verification_override);
    }

    // Apply path overrides
    if let Some(path_overrides) = &overrides.path_overrides {
        apply_path_overrides(base_config, path_overrides);
    }
}

fn apply_platform_overrides(config: &mut PuppetMasterConfig, overrides: &PlatformOverride) {
    // Platform overrides would need access to active platform selection
    // This is a simplified version that updates platform configs
    for (_name, platform_config) in config.platforms.iter_mut() {
        if let Some(model) = &overrides.model {
            platform_config.model = model.clone();
        }
        // Note: temperature, max_tokens, and timeout_seconds are not directly in PlatformConfig
        // These would need to be handled through platform-specific configuration
    }
}

fn apply_tier_overrides(config: &mut PuppetMasterConfig, overrides: &TierOverride) {
    if let Some(max_iter) = overrides.phase_max_iterations {
        config.tiers.phase.max_iterations = max_iter;
    }
    if let Some(max_iter) = overrides.task_max_iterations {
        config.tiers.task.max_iterations = max_iter;
    }
    if let Some(max_iter) = overrides.subtask_max_iterations {
        config.tiers.subtask.max_iterations = max_iter;
    }
    if let Some(timeout) = overrides.global_timeout_ms {
        config.tiers.phase.timeout_ms = Some(timeout);
        config.tiers.task.timeout_ms = Some(timeout);
        config.tiers.subtask.timeout_ms = Some(timeout);
    }
}

fn apply_budget_overrides(config: &mut PuppetMasterConfig, overrides: &BudgetOverride) {
    // Note: BudgetConfig uses max_calls and max_tokens fields, not daily/monthly budgets
    // These would need to be mapped appropriately
    if overrides.disable_enforcement {
        // Set warn percentage to 100% effectively disabling enforcement warnings
        config.budget.enforcement.warn_at_percentage = 100;
        config.budget.enforcement.soft_limit_percent = 100;
        config.budget.enforcement.hard_limit_percent = 100;
    }
}

fn apply_logging_overrides(config: &mut PuppetMasterConfig, overrides: &LoggingOverride) {
    if let Some(level) = &overrides.level {
        config.logging.level = level.clone();
    }
    if let Some(intensive) = overrides.intensive {
        config.logging.intensive = intensive;
    }
    if let Some(retention) = overrides.retention_days {
        config.logging.retention_days = retention;
    }
}

fn apply_verification_overrides(
    config: &mut PuppetMasterConfig,
    overrides: &VerificationOverride,
) {
    if overrides.skip_verification {
        config.verification.strict_mode = false;
    }
    // Note: timeout_seconds and enabled are not in VerificationConfig
    // The actual struct has browser_adapter, screenshot_on_failure, evidence_directory, strict_mode
}

fn apply_path_overrides(config: &mut PuppetMasterConfig, overrides: &HashMap<String, String>) {
    use std::path::PathBuf;

    for (key, value) in overrides {
        let path_value = PathBuf::from(value);
        match key.as_str() {
            "workspace" => config.paths.workspace = path_value,
            "prd_path" => config.paths.prd_path = path_value,
            "progress_path" => config.paths.progress_path = path_value,
            "agents_root" => config.paths.agents_root = path_value,
            "evidence_root" => config.paths.evidence_root = path_value,
            "usage_file" => config.paths.usage_file = path_value,
            "event_db" => config.paths.event_db = path_value,
            _ => {
                log::warn!("Unknown path override key: {}", key);
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{
        BudgetConfig, BudgetEnforcementConfig, EscalationTarget, LoggingConfig, TierConfig,
        TierConfigs, VerificationConfig,
    };

    fn create_test_config() -> PuppetMasterConfig {
        use crate::types::{ProjectConfig, OrchestratorConfig, PathConfig, UiConfig, BranchingConfig, MemoryConfig, Platform, ModelLevel, TaskFailureStyle};
        use crate::types::config::LimitAction;
        use std::path::PathBuf;

        PuppetMasterConfig {
            project: ProjectConfig {
                name: "test".to_string(),
                working_directory: PathBuf::from("/test"),
                description: None,
                version: "1.0.0".to_string(),
            },
            tiers: TierConfigs {
                phase: TierConfig {
                    platform: Platform::Cursor,
                    model: "gpt-4".to_string(),
                    model_level: ModelLevel::Level2,
                    reasoning_effort: None,
                    plan_mode: false,
                    task_failure_style: TaskFailureStyle::default(),
                    max_iterations: 5,
                    escalation: None,
                    timeout_ms: Some(10000),
                    hard_timeout_ms: None,
                    complexity: crate::types::Complexity::Standard,
                    task_types: vec![],
                },
                task: TierConfig {
                    platform: Platform::Cursor,
                    model: "gpt-4".to_string(),
                    model_level: ModelLevel::Level2,
                    reasoning_effort: None,
                    plan_mode: false,
                    task_failure_style: TaskFailureStyle::default(),
                    max_iterations: 10,
                    escalation: Some(EscalationTarget::Phase),
                    timeout_ms: Some(5000),
                    hard_timeout_ms: None,
                    complexity: crate::types::Complexity::Standard,
                    task_types: vec![],
                },
                subtask: TierConfig {
                    platform: Platform::Cursor,
                    model: "gpt-4".to_string(),
                    model_level: ModelLevel::Level2,
                    reasoning_effort: None,
                    plan_mode: false,
                    task_failure_style: TaskFailureStyle::default(),
                    max_iterations: 15,
                    escalation: Some(EscalationTarget::Task),
                    timeout_ms: Some(3000),
                    hard_timeout_ms: None,
                    complexity: crate::types::Complexity::Standard,
                    task_types: vec![],
                },
                iteration: TierConfig {
                    platform: Platform::Cursor,
                    model: "gpt-4".to_string(),
                    model_level: ModelLevel::Level2,
                    reasoning_effort: None,
                    plan_mode: false,
                    task_failure_style: TaskFailureStyle::default(),
                    max_iterations: 3,
                    escalation: Some(EscalationTarget::Subtask),
                    timeout_ms: Some(2000),
                    hard_timeout_ms: None,
                    complexity: crate::types::Complexity::Simple,
                    task_types: vec![],
                },
            },
            branching: BranchingConfig::default(),
            verification: VerificationConfig::default(),
            memory: MemoryConfig::default(),
            budget: BudgetConfig {
                max_calls_per_run: Some(100),
                max_calls_per_hour: Some(1000),
                max_calls_per_day: Some(10000),
                max_tokens_per_run: Some(100000),
                max_tokens_per_hour: Some(1000000),
                max_tokens_per_day: Some(10000000),
                cooldown_hours: 1,
                fallback_platform: None,
                enforcement: BudgetEnforcementConfig {
                    on_limit_reached: LimitAction::default(),
                    warn_at_percentage: 75,
                    soft_limit_percent: 85,
                    hard_limit_percent: 95,
                },
            },
            logging: LoggingConfig {
                level: "info".to_string(),
                retention_days: 7,
                intensive: false,
                log_file: None,
            },
            escalation: None,
            orchestrator: OrchestratorConfig::default(),
            platforms: HashMap::new(),
            paths: PathConfig::default(),
            ui: UiConfig::default(),
        }
    }

    #[test]
    fn test_apply_tier_overrides() {
        let mut config = create_test_config();
        let overrides = ConfigOverride {
            tier_overrides: Some(TierOverride {
                phase_max_iterations: Some(20),
                task_max_iterations: Some(30),
                subtask_max_iterations: Some(40),
                global_timeout_ms: Some(60000),
            }),
            ..Default::default()
        };

        apply_overrides(&mut config, &overrides);

        assert_eq!(config.tiers.phase.max_iterations, 20);
        assert_eq!(config.tiers.task.max_iterations, 30);
        assert_eq!(config.tiers.subtask.max_iterations, 40);
        assert_eq!(config.tiers.phase.timeout_ms, Some(60000));
        assert_eq!(config.tiers.task.timeout_ms, Some(60000));
        assert_eq!(config.tiers.subtask.timeout_ms, Some(60000));
    }

    #[test]
    fn test_apply_budget_overrides() {
        let mut config = create_test_config();
        let overrides = ConfigOverride {
            budget_overrides: Some(BudgetOverride {
                daily_budget: Some(50.0),
                monthly_budget: Some(500.0),
                per_iteration_budget: Some(5.0),
                disable_enforcement: true,
            }),
            ..Default::default()
        };

        apply_overrides(&mut config, &overrides);

        // Note: The actual BudgetConfig doesn't have daily/monthly budgets
        // This test verifies that disable_enforcement sets percentages to 100
        assert_eq!(config.budget.enforcement.warn_at_percentage, 100);
        assert_eq!(config.budget.enforcement.soft_limit_percent, 100);
        assert_eq!(config.budget.enforcement.hard_limit_percent, 100);
    }

    #[test]
    fn test_apply_logging_overrides() {
        let mut config = create_test_config();
        let overrides = ConfigOverride {
            logging_overrides: Some(LoggingOverride {
                level: Some("debug".to_string()),
                intensive: Some(true),
                retention_days: Some(30),
            }),
            ..Default::default()
        };

        apply_overrides(&mut config, &overrides);

        assert_eq!(config.logging.level, "debug");
        assert!(config.logging.intensive);
        assert_eq!(config.logging.retention_days, 30);
    }

    #[test]
    fn test_apply_verification_overrides() {
        let mut config = create_test_config();
        config.verification.strict_mode = true;

        let overrides = ConfigOverride {
            verification_overrides: Some(VerificationOverride {
                skip_verification: true,
                skip_gates: vec!["test_gate".to_string()],
                timeout_seconds: Some(120),
            }),
            ..Default::default()
        };

        apply_overrides(&mut config, &overrides);

        // Note: The actual VerificationConfig doesn't have enabled/timeout_seconds
        // This test verifies that skip_verification affects strict_mode
        assert!(!config.verification.strict_mode);
    }

    #[test]
    fn test_start_chain_override() {
        let override_config = StartChainOverride {
            steps_to_skip: vec!["step1".to_string(), "step2".to_string()],
            custom_prompts: {
                let mut map = HashMap::new();
                map.insert("step3".to_string(), "Custom prompt".to_string());
                map
            },
            custom_validators: vec![ValidatorOverride {
                step_id: "step4".to_string(),
                validator_type: "command".to_string(),
                config: serde_json::json!({"command": "echo test"}),
            }],
            force_step_order: Some(vec!["step1".to_string(), "step3".to_string()]),
        };

        assert_eq!(override_config.steps_to_skip.len(), 2);
        assert_eq!(override_config.custom_prompts.len(), 1);
        assert_eq!(override_config.custom_validators.len(), 1);
        assert!(override_config.force_step_order.is_some());
    }

    #[test]
    fn test_empty_overrides() {
        let mut config = create_test_config();
        let original_max_iter = config.tiers.phase.max_iterations;
        let original_level = config.logging.level.clone();
        let overrides = ConfigOverride::default();

        apply_overrides(&mut config, &overrides);

        // Config should remain unchanged
        assert_eq!(config.tiers.phase.max_iterations, original_max_iter);
        assert_eq!(config.logging.level, original_level);
    }
}
