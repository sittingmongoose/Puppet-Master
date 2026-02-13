//! Project structure checks

use crate::types::{CheckCategory, CheckResult, DoctorCheck, FixResult};
use async_trait::async_trait;
use chrono::Utc;
use std::path::PathBuf;

/// Check if working directory exists
pub struct WorkingDirCheck;

impl WorkingDirCheck {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl DoctorCheck for WorkingDirCheck {
    fn name(&self) -> &str {
        "working-directory"
    }

    fn category(&self) -> CheckCategory {
        CheckCategory::Project
    }

    fn description(&self) -> &str {
        "Check if working directory exists and is accessible"
    }

    async fn run(&self) -> CheckResult {
        let cwd = std::env::current_dir();

        match cwd {
            Ok(path) => CheckResult {
                passed: true,
                message: format!("Working directory: {:?}", path),
                details: None,
                can_fix: false,
                timestamp: Utc::now(),
            },
            Err(e) => CheckResult {
                passed: false,
                message: "Cannot access working directory".to_string(),
                details: Some(format!("Error: {}", e)),
                can_fix: false,
                timestamp: Utc::now(),
            },
        }
    }

    async fn fix(&self, _dry_run: bool) -> Option<FixResult> {
        None
    }
}

/// Check if PRD file exists
pub struct PrdFileCheck;

impl PrdFileCheck {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl DoctorCheck for PrdFileCheck {
    fn name(&self) -> &str {
        "prd-file"
    }

    fn category(&self) -> CheckCategory {
        CheckCategory::Project
    }

    fn description(&self) -> &str {
        "Check if PRD file (.puppet-master/prd.json) exists"
    }

    async fn run(&self) -> CheckResult {
        let prd_path = PathBuf::from(".puppet-master/prd.json");

        if prd_path.exists() {
            // Try to read and validate JSON
            match tokio::fs::read_to_string(&prd_path).await {
                Ok(content) => match serde_json::from_str::<serde_json::Value>(&content) {
                    Ok(_) => CheckResult {
                        passed: true,
                        message: "PRD file exists and is valid JSON".to_string(),
                        details: Some(format!("Path: {:?}", prd_path)),
                        can_fix: false,
                        timestamp: Utc::now(),
                    },
                    Err(e) => CheckResult {
                        passed: false,
                        message: "PRD file exists but is invalid JSON".to_string(),
                        details: Some(format!("Error: {}", e)),
                        can_fix: false,
                        timestamp: Utc::now(),
                    },
                },
                Err(e) => CheckResult {
                    passed: false,
                    message: "Cannot read PRD file".to_string(),
                    details: Some(format!("Error: {}", e)),
                    can_fix: false,
                    timestamp: Utc::now(),
                },
            }
        } else {
            CheckResult {
                passed: false,
                message: "PRD file not found".to_string(),
                details: Some("Run 'puppet-master init' to create a new project".to_string()),
                can_fix: false,
                timestamp: Utc::now(),
            }
        }
    }

    async fn fix(&self, _dry_run: bool) -> Option<FixResult> {
        None
    }
}

/// Check if state directory exists
pub struct StateDirectoryCheck;

impl StateDirectoryCheck {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl DoctorCheck for StateDirectoryCheck {
    fn name(&self) -> &str {
        "state-directory"
    }

    fn category(&self) -> CheckCategory {
        CheckCategory::Project
    }

    fn description(&self) -> &str {
        "Check if .puppet-master directory exists"
    }

    async fn run(&self) -> CheckResult {
        let state_dir = PathBuf::from(".puppet-master");

        if state_dir.exists() && state_dir.is_dir() {
            CheckResult {
                passed: true,
                message: "State directory exists".to_string(),
                details: Some(format!("Path: {:?}", state_dir)),
                can_fix: false,
                timestamp: Utc::now(),
            }
        } else {
            CheckResult {
                passed: false,
                message: "State directory not found".to_string(),
                details: Some("Directory .puppet-master is missing".to_string()),
                can_fix: true,
                timestamp: Utc::now(),
            }
        }
    }

    async fn fix(&self, dry_run: bool) -> Option<FixResult> {
        let state_dir = PathBuf::from(".puppet-master");

        if dry_run {
            return Some(FixResult {
                success: true,
                message: "Would create state directory".to_string(),
                steps: vec![format!("mkdir {:?}", state_dir)],
                fixable: true,
                timestamp: Utc::now(),
            });
        }

        match tokio::fs::create_dir_all(&state_dir).await {
            Ok(_) => Some(FixResult {
                success: true,
                message: "Created state directory".to_string(),
                steps: vec![format!("Created {:?}", state_dir)],
                fixable: true,
                timestamp: Utc::now(),
            }),
            Err(e) => Some(FixResult {
                success: false,
                message: format!("Failed to create state directory: {}", e),
                steps: vec![],
                fixable: true,
                timestamp: Utc::now(),
            }),
        }
    }
}
