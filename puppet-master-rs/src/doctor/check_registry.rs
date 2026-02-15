//! Check registry - Manages and executes doctor checks

use crate::types::{CheckCategory, CheckResult, DoctorCheck};
use anyhow::Result;
use log::info;
use std::sync::Arc;

use super::checks::*;

// DRY:DATA:DoctorReport
/// Result of running all checks
#[derive(Debug, Clone)]
pub struct DoctorReport {
    pub checks: Vec<CheckReport>,
    pub passed: usize,
    pub failed: usize,
    pub warnings: usize,
}

impl DoctorReport {
    // DRY:FN:all_passed
    /// Check if all checks passed
    pub fn all_passed(&self) -> bool {
        self.failed == 0
    }

    // DRY:FN:any_failed
    /// Check if any check failed
    pub fn any_failed(&self) -> bool {
        self.failed > 0
    }
}

// DRY:DATA:CheckReport
/// Report for a single check
#[derive(Debug, Clone)]
pub struct CheckReport {
    pub name: String,
    pub category: CheckCategory,
    pub description: String,
    pub result: CheckResult,
}

// DRY:DATA:CheckRegistry
/// Registry of health checks
pub struct CheckRegistry {
    checks: Vec<Arc<dyn DoctorCheck>>,
}

impl CheckRegistry {
    // DRY:FN:new
    /// Create a new empty registry
    pub fn new() -> Self {
        Self { checks: Vec::new() }
    }

    // DRY:FN:register
    /// Register a check
    pub fn register(&mut self, check: Arc<dyn DoctorCheck>) {
        self.checks.push(check);
    }

    // DRY:FN:register_defaults
    /// Register all default checks
    pub fn register_defaults(&mut self) {
        // CLI checks
        self.register(Arc::new(cli_checks::CursorCheck::new()));
        self.register(Arc::new(cli_checks::CodexCheck::new()));
        self.register(Arc::new(cli_checks::ClaudeCheck::new()));
        self.register(Arc::new(cli_checks::GeminiCheck::new()));
        self.register(Arc::new(cli_checks::CopilotCheck::new()));

        // Git checks
        self.register(Arc::new(git_checks::GitInstalledCheck::new()));
        self.register(Arc::new(git_checks::GitConfiguredCheck::new()));
        self.register(Arc::new(git_checks::GitRepoCheck::new()));

        // Project checks
        self.register(Arc::new(project_checks::WorkingDirCheck::new()));
        self.register(Arc::new(project_checks::PrdFileCheck::new()));
        self.register(Arc::new(project_checks::StateDirectoryCheck::new()));

        // Config checks
        self.register(Arc::new(config_checks::ConfigFileCheck::new()));
        self.register(Arc::new(config_checks::ConfigValidCheck::new()));

        // Runtime checks
        self.register(Arc::new(usage_check::UsageCheck::new()));
        self.register(Arc::new(secrets_check::SecretsCheck::new()));
        self.register(Arc::new(runtime_check::RuntimeCheck::new()));

        // Additional checks
        self.register(Arc::new(playwright_check::PlaywrightCheck::new()));
        self.register(Arc::new(
            platform_compatibility_check::PlatformCompatibilityCheck::new(),
        ));
        self.register(Arc::new(wiring_check::WiringCheck::new()));
    }

    // DRY:FN:run_all
    /// Run all checks
    pub async fn run_all(&self) -> Result<DoctorReport> {
        info!("Running {} health checks", self.checks.len());

        let mut reports = Vec::new();
        let mut passed = 0;
        let mut failed = 0;
        let mut warnings = 0;

        for check in &self.checks {
            let result = check.run().await;

            if result.passed {
                passed += 1;
            } else {
                if result.can_fix {
                    warnings += 1;
                } else {
                    failed += 1;
                }
            }

            reports.push(CheckReport {
                name: check.name().to_string(),
                category: check.category(),
                description: check.description().to_string(),
                result,
            });
        }

        Ok(DoctorReport {
            checks: reports,
            passed,
            failed,
            warnings,
        })
    }

    // DRY:FN:run_category
    /// Run checks for a specific category
    pub async fn run_category(&self, category: CheckCategory) -> Result<DoctorReport> {
        let mut reports = Vec::new();
        let mut passed = 0;
        let mut failed = 0;
        let mut warnings = 0;

        for check in &self.checks {
            if check.category() != category {
                continue;
            }

            let result = check.run().await;

            if result.passed {
                passed += 1;
            } else {
                if result.can_fix {
                    warnings += 1;
                } else {
                    failed += 1;
                }
            }

            reports.push(CheckReport {
                name: check.name().to_string(),
                category: check.category(),
                description: check.description().to_string(),
                result,
            });
        }

        Ok(DoctorReport {
            checks: reports,
            passed,
            failed,
            warnings,
        })
    }

    // DRY:FN:fix_all
    /// Attempt to fix all fixable issues
    pub async fn fix_all(
        &self,
        dry_run: bool,
    ) -> Result<Vec<(String, Option<crate::types::FixResult>)>> {
        let mut fixes = Vec::new();

        for check in &self.checks {
            let result = check.run().await;
            if !result.passed && result.can_fix {
                let fix_result = check.fix(dry_run).await;
                fixes.push((check.name().to_string(), fix_result));
            }
        }

        Ok(fixes)
    }

    // DRY:FN:run_check
    /// Run a single check by name
    pub async fn run_check(&self, name: &str) -> Result<Option<CheckReport>> {
        for check in &self.checks {
            if check.name() == name {
                let result = check.run().await;
                return Ok(Some(CheckReport {
                    name: check.name().to_string(),
                    category: check.category(),
                    description: check.description().to_string(),
                    result,
                }));
            }
        }
        Ok(None)
    }

    // DRY:FN:fix_check
    /// Attempt to fix a single check by name
    pub async fn fix_check(
        &self,
        name: &str,
        dry_run: bool,
    ) -> Result<Option<(String, Option<crate::types::FixResult>)>> {
        for check in &self.checks {
            if check.name() == name {
                let fix_result = check.fix(dry_run).await;
                return Ok(Some((check.name().to_string(), fix_result)));
            }
        }
        Ok(None)
    }

    // DRY:FN:list_checks
    /// List all registered checks
    pub fn list_checks(&self) -> Vec<(String, CheckCategory, String)> {
        self.checks
            .iter()
            .map(|check| {
                (
                    check.name().to_string(),
                    check.category(),
                    check.description().to_string(),
                )
            })
            .collect()
    }
}

impl Default for CheckRegistry {
    fn default() -> Self {
        let mut registry = Self::new();
        registry.register_defaults();
        registry
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_registry_creation() {
        let registry = CheckRegistry::new();
        assert_eq!(registry.list_checks().len(), 0);
    }

    #[test]
    fn test_registry_defaults() {
        let registry = CheckRegistry::default();
        assert!(registry.list_checks().len() > 0);
    }

    #[tokio::test]
    async fn test_run_all() {
        let registry = CheckRegistry::default();
        let report = registry.run_all().await.unwrap();
        assert_eq!(
            report.passed + report.failed + report.warnings,
            report.checks.len()
        );
    }
}
