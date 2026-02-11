//! Configuration file checks

use crate::types::{CheckCategory, CheckResult, DoctorCheck, FixResult};
use async_trait::async_trait;
use chrono::Utc;
use std::path::PathBuf;

/// Check if config file exists
pub struct ConfigFileCheck;

impl ConfigFileCheck {
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
        let config_paths = vec![
            PathBuf::from("puppet-master.yaml"),
            PathBuf::from("puppet-master.yml"),
            PathBuf::from(".puppet-master/config.yaml"),
        ];

        for path in &config_paths {
            if path.exists() {
                return CheckResult {
                    passed: true,
                    message: "Config file found".to_string(),
                    details: Some(format!("Path: {:?}", path)),
                    can_fix: false,
                timestamp: Utc::now(),
                };
            }
        }

        CheckResult {
            passed: false,
            message: "Config file not found".to_string(),
            details: Some("Expected: puppet-master.yaml or puppet-master.yml".to_string()),
            can_fix: false,
        timestamp: Utc::now(),
        }
    }

    async fn fix(&self, _dry_run: bool) -> Option<FixResult> {
        None
    }
}

/// Check if config file is valid YAML
pub struct ConfigValidCheck;

impl ConfigValidCheck {
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
        let config_paths = vec![
            PathBuf::from("puppet-master.yaml"),
            PathBuf::from("puppet-master.yml"),
            PathBuf::from(".puppet-master/config.yaml"),
        ];

        for path in &config_paths {
            if path.exists() {
                match tokio::fs::read_to_string(path).await {
                    Ok(content) => {
                        match serde_yaml::from_str::<serde_yaml::Value>(&content) {
                            Ok(_) => {
                                return CheckResult {
                                    passed: true,
                                    message: "Config file is valid YAML".to_string(),
                                    details: Some(format!("Path: {:?}", path)),
                                    can_fix: false,
                                timestamp: Utc::now(),
                                };
                            }
                            Err(e) => {
                                return CheckResult {
                                    passed: false,
                                    message: "Config file is invalid YAML".to_string(),
                                    details: Some(format!("Error: {}", e)),
                                    can_fix: false,
                                timestamp: Utc::now(),
                                };
                            }
                        }
                    }
                    Err(e) => {
                        return CheckResult {
                            passed: false,
                            message: "Cannot read config file".to_string(),
                            details: Some(format!("Error: {}", e)),
                            can_fix: false,
                        timestamp: Utc::now(),
                        };
                    }
                }
            }
        }

        CheckResult {
            passed: false,
            message: "No config file found to validate".to_string(),
            details: None,
            can_fix: false,
        timestamp: Utc::now(),
        }
    }

    async fn fix(&self, _dry_run: bool) -> Option<FixResult> {
        None
    }
}
