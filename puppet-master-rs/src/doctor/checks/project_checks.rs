//! Project structure checks

use crate::types::{CheckCategory, CheckResult, DoctorCheck, FixResult};
use async_trait::async_trait;
use chrono::Utc;
use std::path::{Path, PathBuf};

const PRD_MISSING_GUIDANCE: &str =
    "Create .puppet-master/prd.json via Puppet Master's setup/start-chain flow.";

// DRY:FN:resolve_project_root_for_doctor -- Resolve project root for doctor checks using shared project path helpers
fn resolve_project_root_for_doctor(cwd: &Path) -> PathBuf {
    crate::utils::resolve_writable_state_root(cwd)
}

fn doctor_project_root() -> PathBuf {
    std::env::current_dir()
        .map(|cwd| resolve_project_root_for_doctor(&cwd))
        .unwrap_or_else(|_| PathBuf::from("."))
}

fn doctor_puppet_master_dir() -> PathBuf {
    crate::utils::puppet_master_dir(&doctor_project_root())
}

// DRY:DATA:WorkingDirCheck
/// Check if working directory exists
pub struct WorkingDirCheck;

impl WorkingDirCheck {
    // DRY:FN:new
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
                message: format!("Working directory: {}", path.display()),
                details: Some(format!(
                    "Resolved writable project/state root: {}",
                    resolve_project_root_for_doctor(&path).display()
                )),
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

// DRY:DATA:PrdFileCheck
/// Check if PRD file exists
pub struct PrdFileCheck;

impl PrdFileCheck {
    // DRY:FN:new
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
        let prd_path = doctor_puppet_master_dir().join("prd.json");

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
                details: Some(format!(
                    "{} Checked: {}",
                    PRD_MISSING_GUIDANCE,
                    prd_path.display()
                )),
                can_fix: false,
                timestamp: Utc::now(),
            }
        }
    }

    async fn fix(&self, _dry_run: bool) -> Option<FixResult> {
        None
    }
}

// DRY:DATA:StateDirectoryCheck
/// Check if state directory exists
pub struct StateDirectoryCheck;

impl StateDirectoryCheck {
    // DRY:FN:new
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
        let state_dir = doctor_puppet_master_dir();

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
                details: Some(format!("Directory is missing: {}", state_dir.display())),
                can_fix: true,
                timestamp: Utc::now(),
            }
        }
    }

    async fn fix(&self, dry_run: bool) -> Option<FixResult> {
        let state_dir = doctor_puppet_master_dir();
        let resolved_root = doctor_project_root();
        let directory_plan = vec![
            crate::utils::puppet_master_dir(&resolved_root),
            crate::utils::evidence_dir(&resolved_root),
            crate::utils::logs_dir(&resolved_root),
            crate::utils::checkpoints_dir(&resolved_root),
            crate::utils::usage_dir(&resolved_root),
            crate::utils::agents_dir(&resolved_root),
            crate::utils::memory_dir(&resolved_root),
            crate::utils::backups_dir(&resolved_root),
        ];

        if dry_run {
            return Some(FixResult {
                success: true,
                message: "Would create state directory".to_string(),
                steps: directory_plan
                    .iter()
                    .map(|path| format!("mkdir -p {}", path.display()))
                    .collect(),
                fixable: true,
                timestamp: Utc::now(),
            });
        }

        let create_result = tokio::task::spawn_blocking(move || {
            crate::utils::initialize_puppet_master_dirs(&resolved_root)
        })
        .await;

        match create_result {
            Ok(Ok(())) => Some(FixResult {
                success: true,
                message: "Created state directory".to_string(),
                steps: vec![format!("Created {}", state_dir.display())],
                fixable: true,
                timestamp: Utc::now(),
            }),
            Ok(Err(e)) => Some(FixResult {
                success: false,
                message: format!("Failed to create state directory: {}", e),
                steps: vec![],
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

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn resolves_workspace_parent_when_running_inside_puppet_master_rs() {
        let root = TempDir::new().unwrap();
        let pm_dir = root.path().join(".puppet-master");
        fs::create_dir_all(&pm_dir).unwrap();

        let crate_dir = root.path().join("puppet-master-rs");
        fs::create_dir_all(&crate_dir).unwrap();
        fs::write(
            crate_dir.join("Cargo.toml"),
            "[package]\nname='x'\nversion='0.1.0'",
        )
        .unwrap();

        let resolved = resolve_project_root_for_doctor(&crate_dir);
        assert_eq!(resolved, root.path());
    }

    #[test]
    fn does_not_emit_stale_init_guidance() {
        assert!(!PRD_MISSING_GUIDANCE.contains("puppet-master init"));
    }
}
