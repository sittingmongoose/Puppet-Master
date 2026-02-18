//! Configuration file checks

use crate::config::config_discovery::{self, CONFIG_FILE_NAMES};
use crate::types::{CheckCategory, CheckResult, DoctorCheck, FixResult};
use async_trait::async_trait;
use chrono::Utc;

// DRY:DATA:ConfigFileCheck
/// Check if config file exists
pub struct ConfigFileCheck;

impl ConfigFileCheck {
    // DRY:FN:new
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl DoctorCheck for ConfigFileCheck {
    fn name(&self) -> &str {
        "config-file"
    }

    fn category(&self) -> CheckCategory {
        CheckCategory::Project
    }

    fn description(&self) -> &str {
        "Check if config file (puppet-master.yaml) exists"
    }

    async fn run(&self) -> CheckResult {
        match config_discovery::discover_config_path(None) {
            Some(path) => CheckResult {
                passed: true,
                message: "Config file found".to_string(),
                details: Some(format!("Path: {}", path.display())),
                can_fix: false,
                timestamp: Utc::now(),
            },
            None => {
                let expected = CONFIG_FILE_NAMES.join(", ");
                let locations = config_discovery::search_locations_summary();
                CheckResult {
                    passed: false,
                    message: "Config file not found".to_string(),
                    details: Some(format!(
                        "Expected one of: {}. {}",
                        expected, locations
                    )),
                    can_fix: false,
                    timestamp: Utc::now(),
                }
            }
        }
    }

    async fn fix(&self, _dry_run: bool) -> Option<FixResult> {
        None
    }
}

// DRY:DATA:ConfigValidCheck
/// Check if config file is valid YAML
pub struct ConfigValidCheck;

impl ConfigValidCheck {
    // DRY:FN:new
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl DoctorCheck for ConfigValidCheck {
    fn name(&self) -> &str {
        "config-valid"
    }

    fn category(&self) -> CheckCategory {
        CheckCategory::Project
    }

    fn description(&self) -> &str {
        "Check if config file is valid YAML"
    }

    async fn run(&self) -> CheckResult {
        match config_discovery::discover_config_path(None) {
            Some(path) => match tokio::fs::read_to_string(&path).await {
                Ok(content) => match serde_yaml::from_str::<serde_yaml::Value>(&content) {
                    Ok(_) => CheckResult {
                        passed: true,
                        message: "Config file is valid YAML".to_string(),
                        details: Some(format!("Path: {}", path.display())),
                        can_fix: false,
                        timestamp: Utc::now(),
                    },
                    Err(e) => CheckResult {
                        passed: false,
                        message: "Config file is invalid YAML".to_string(),
                        details: Some(format!("Error: {}", e)),
                        can_fix: false,
                        timestamp: Utc::now(),
                    },
                },
                Err(e) => CheckResult {
                    passed: false,
                    message: "Cannot read config file".to_string(),
                    details: Some(format!("Error: {}", e)),
                    can_fix: false,
                    timestamp: Utc::now(),
                },
            },
            None => {
                let locations = config_discovery::search_locations_summary();
                CheckResult {
                    passed: false,
                    message: "No config file found to validate".to_string(),
                    details: Some(locations),
                    can_fix: false,
                    timestamp: Utc::now(),
                }
            }
        }
    }

    async fn fix(&self, _dry_run: bool) -> Option<FixResult> {
        None
    }
}
