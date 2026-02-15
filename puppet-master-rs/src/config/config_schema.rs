//! Configuration Schema Validation
//!
//! Validate configuration values:
//! - Required fields
//! - Value ranges
//! - Path existence
//! - Platform availability

use crate::types::{PuppetMasterConfig, ValidationError};

// DRY:FN:validate_config
/// Validate a configuration
pub fn validate_config(config: &PuppetMasterConfig) -> Vec<ValidationError> {
    let mut errors = Vec::new();

    // Validate orchestrator config
    validate_orchestrator(&config.orchestrator, &mut errors);

    // Validate tier configs
    validate_tiers(&config.tiers, &mut errors);

    // Validate interview config
    validate_interview(&config.interview, &mut errors);

    // Validate paths
    validate_paths(&config.paths, &mut errors);

    // Validate platforms
    validate_platforms(&config.platforms, &mut errors);

    errors
}

fn validate_orchestrator(
    config: &crate::types::OrchestratorConfig,
    errors: &mut Vec<ValidationError>,
) {
    if config.max_depth == 0 {
        errors.push(ValidationError::InvalidValue {
            field: "orchestrator.max_depth".to_string(),
            message: "max_depth must be greater than 0".to_string(),
        });
    }

    if config.max_depth > 10 {
        errors.push(ValidationError::InvalidValue {
            field: "orchestrator.max_depth".to_string(),
            message: "max_depth should not exceed 10 for performance reasons".to_string(),
        });
    }

    if config.session_prefix.is_empty() {
        errors.push(ValidationError::InvalidValue {
            field: "orchestrator.session_prefix".to_string(),
            message: "session_prefix cannot be empty".to_string(),
        });
    }

    if config.prd_file.is_empty() {
        errors.push(ValidationError::InvalidValue {
            field: "orchestrator.prd_file".to_string(),
            message: "prd_file cannot be empty".to_string(),
        });
    }

    if config.progress_file.is_empty() {
        errors.push(ValidationError::InvalidValue {
            field: "orchestrator.progress_file".to_string(),
            message: "progress_file cannot be empty".to_string(),
        });
    }
}

fn validate_tiers(config: &crate::types::TierConfigs, errors: &mut Vec<ValidationError>) {
    validate_tier_config("phase", &config.phase, errors);
    validate_tier_config("task", &config.task, errors);
    validate_tier_config("subtask", &config.subtask, errors);
}

fn validate_tier_config(
    name: &str,
    config: &crate::types::TierConfig,
    errors: &mut Vec<ValidationError>,
) {
    if config.max_iterations == 0 {
        errors.push(ValidationError::InvalidValue {
            field: format!("tiers.{}.max_iterations", name),
            message: "max_iterations must be greater than 0".to_string(),
        });
    }

    if config.max_iterations > 100 {
        errors.push(ValidationError::InvalidValue {
            field: format!("tiers.{}.max_iterations", name),
            message: "max_iterations should not exceed 100".to_string(),
        });
    }

    if let Some(timeout_ms) = config.timeout_ms {
        if timeout_ms == 0 {
            errors.push(ValidationError::InvalidValue {
                field: format!("tiers.{}.timeout_ms", name),
                message: "timeout_ms must be greater than 0".to_string(),
            });
        }

        if timeout_ms > 3_600_000 {
            errors.push(ValidationError::InvalidValue {
                field: format!("tiers.{}.timeout_ms", name),
                message: "timeout_ms should not exceed 3600000 (1 hour)".to_string(),
            });
        }
    }
}

fn validate_interview(config: &crate::types::InterviewConfig, errors: &mut Vec<ValidationError>) {
    if config.platform.trim().is_empty() {
        errors.push(ValidationError::InvalidValue {
            field: "interview.platform".to_string(),
            message: "platform cannot be empty".to_string(),
        });
    }

    if config.model.trim().is_empty() {
        errors.push(ValidationError::InvalidValue {
            field: "interview.model".to_string(),
            message: "model cannot be empty".to_string(),
        });
    }

    if config.output_dir.trim().is_empty() {
        errors.push(ValidationError::InvalidValue {
            field: "interview.output_dir".to_string(),
            message: "output_dir cannot be empty".to_string(),
        });
    }

    if !(3..=15).contains(&config.max_questions_per_phase) {
        errors.push(ValidationError::InvalidValue {
            field: "interview.max_questions_per_phase".to_string(),
            message: "max_questions_per_phase must be between 3 and 15".to_string(),
        });
    }

    let reasoning_level = config.reasoning_level.as_str();
    if !["low", "medium", "high", "max"].contains(&reasoning_level) {
        errors.push(ValidationError::InvalidValue {
            field: "interview.reasoning_level".to_string(),
            message: "reasoning_level must be low, medium, high, or max".to_string(),
        });
    }

    let interaction_mode = config.interaction_mode.as_str();
    if !["expert", "eli5"].contains(&interaction_mode) {
        errors.push(ValidationError::InvalidValue {
            field: "interview.interaction_mode".to_string(),
            message: "interaction_mode must be expert or eli5".to_string(),
        });
    }

    for (index, backup) in config.backup_platforms.iter().enumerate() {
        if backup.platform.trim().is_empty() {
            errors.push(ValidationError::InvalidValue {
                field: format!("interview.backup_platforms[{index}].platform"),
                message: "backup platform cannot be empty".to_string(),
            });
        }
        if backup.model.trim().is_empty() {
            errors.push(ValidationError::InvalidValue {
                field: format!("interview.backup_platforms[{index}].model"),
                message: "backup model cannot be empty".to_string(),
            });
        }
    }
}

fn validate_paths(config: &crate::types::PathConfig, errors: &mut Vec<ValidationError>) {
    // Check if paths are absolute
    if config.workspace.as_os_str().is_empty() {
        errors.push(ValidationError::InvalidValue {
            field: "paths.workspace".to_string(),
            message: "workspace path cannot be empty".to_string(),
        });
    }

    // Validate parent directories exist (we'll create the files themselves)
    if let Some(parent) = config.prd_path.parent() {
        if !parent.as_os_str().is_empty() && !parent.exists() {
            errors.push(ValidationError::InvalidValue {
                field: "paths.prd_path".to_string(),
                message: format!("parent directory does not exist: {}", parent.display()),
            });
        }
    }

    if let Some(parent) = config.progress_path.parent() {
        if !parent.as_os_str().is_empty() && !parent.exists() {
            errors.push(ValidationError::InvalidValue {
                field: "paths.progress_path".to_string(),
                message: format!("parent directory does not exist: {}", parent.display()),
            });
        }
    }
}

fn validate_platforms(
    platforms: &std::collections::HashMap<String, crate::types::PlatformConfig>,
    errors: &mut Vec<ValidationError>,
) {
    for (name, config) in platforms {
        if config.enabled {
            if let Some(max_tokens) = config.max_tokens {
                if max_tokens == 0 {
                    errors.push(ValidationError::InvalidValue {
                        field: format!("platforms.{}.max_tokens", name),
                        message: "max_tokens must be greater than 0".to_string(),
                    });
                }

                if max_tokens > 1_000_000 {
                    errors.push(ValidationError::InvalidValue {
                        field: format!("platforms.{}.max_tokens", name),
                        message: "max_tokens exceeds reasonable limit (1,000,000)".to_string(),
                    });
                }
            }

            if let Some(temperature) = config.temperature {
                if !(0.0..=2.0).contains(&temperature) {
                    errors.push(ValidationError::InvalidValue {
                        field: format!("platforms.{}.temperature", name),
                        message: "temperature must be between 0.0 and 2.0".to_string(),
                    });
                }
            }
        }
    }

    // Ensure at least one platform is enabled
    if !platforms.values().any(|p| p.enabled) {
        errors.push(ValidationError::InvalidValue {
            field: "platforms".to_string(),
            message: "at least one platform must be enabled".to_string(),
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::default_config::default_config;

    #[test]
    fn test_valid_config() {
        let config = default_config();
        let errors = validate_config(&config);
        assert!(errors.is_empty(), "Default config should be valid");
    }

    #[test]
    fn test_invalid_max_depth() {
        let mut config = default_config();
        config.orchestrator.max_depth = 0;

        let errors = validate_config(&config);
        assert!(!errors.is_empty());
        assert!(errors.iter().any(|e| match e {
            ValidationError::InvalidValue { field, .. } => field.contains("max_depth"),
            _ => false,
        }));
    }

    #[test]
    fn test_invalid_max_iterations() {
        let mut config = default_config();
        config.tiers.phase.max_iterations = 0;

        let errors = validate_config(&config);
        assert!(!errors.is_empty());
        assert!(errors.iter().any(|e| match e {
            ValidationError::InvalidValue { field, .. } => field.contains("max_iterations"),
            _ => false,
        }));
    }

    #[test]
    fn test_invalid_temperature() {
        let mut config = default_config();

        if let Some(platform_config) = config.platforms.get_mut("claude") {
            platform_config.temperature = Some(3.0); // Invalid
        }

        let errors = validate_config(&config);
        assert!(!errors.is_empty());
        assert!(errors.iter().any(|e| match e {
            ValidationError::InvalidValue { field, .. } => field.contains("temperature"),
            _ => false,
        }));
    }
}
