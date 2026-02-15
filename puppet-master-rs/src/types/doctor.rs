//! Doctor diagnostic and fix types.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

// DRY:DATA:CheckCategory
/// Category of a doctor check.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum CheckCategory {
    /// CLI tool checks.
    Cli,
    /// Git repository checks.
    Git,
    /// Project structure checks.
    Project,
    /// Configuration checks.
    Config,
    /// Environment checks.
    Environment,
}

impl std::fmt::Display for CheckCategory {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Cli => write!(f, "CLI"),
            Self::Git => write!(f, "Git"),
            Self::Project => write!(f, "Project"),
            Self::Config => write!(f, "Configuration"),
            Self::Environment => write!(f, "Environment"),
        }
    }
}

// DRY:DATA:CheckResult
/// Result of a doctor check.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CheckResult {
    /// Whether the check passed.
    pub passed: bool,
    /// Check message.
    pub message: String,
    /// Detailed information if failed.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<String>,
    /// Whether the issue can be auto-fixed.
    #[serde(default)]
    pub can_fix: bool,
    /// Timestamp of check.
    pub timestamp: DateTime<Utc>,
}

impl CheckResult {
    // DRY:FN:pass
    /// Creates a passing check result.
    pub fn pass(message: impl Into<String>) -> Self {
        Self {
            passed: true,
            message: message.into(),
            details: None,
            can_fix: false,
            timestamp: Utc::now(),
        }
    }

    // DRY:FN:fail
    /// Creates a failing check result.
    pub fn fail(message: impl Into<String>) -> Self {
        Self {
            passed: false,
            message: message.into(),
            details: None,
            can_fix: false,
            timestamp: Utc::now(),
        }
    }

    // DRY:FN:with_details
    /// Sets detailed information.
    pub fn with_details(mut self, details: impl Into<String>) -> Self {
        self.details = Some(details.into());
        self
    }

    // DRY:FN:with_fix
    /// Marks as fixable.
    pub fn with_fix(mut self) -> Self {
        self.can_fix = true;
        self
    }
}

/// A doctor check definition.
#[async_trait::async_trait]
pub trait DoctorCheck: Send + Sync {
    /// Unique check name/ID.
    fn name(&self) -> &str;

    /// Check category.
    fn category(&self) -> CheckCategory;

    /// Check description.
    fn description(&self) -> &str;

    /// Run the check.
    async fn run(&self) -> CheckResult;

    /// Attempt to fix the issue if possible.
    async fn fix(&self, dry_run: bool) -> Option<FixResult>;

    /// Returns whether this check has a fix available.
    fn has_fix(&self) -> bool {
        false
    }
}

// DRY:DATA:FixResult
/// Result of attempting to fix an issue.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FixResult {
    /// Whether the fix was applied successfully.
    pub success: bool,
    /// Result message.
    pub message: String,
    /// Detailed steps taken.
    #[serde(default)]
    pub steps: Vec<String>,
    /// Whether the issue is fixable.
    pub fixable: bool,
    /// Timestamp of fix attempt.
    pub timestamp: DateTime<Utc>,
}

impl FixResult {
    // DRY:FN:success
    /// Creates a successful fix result.
    pub fn success(message: impl Into<String>) -> Self {
        Self {
            success: true,
            message: message.into(),
            steps: Vec::new(),
            fixable: true,
            timestamp: Utc::now(),
        }
    }

    // DRY:FN:failure
    /// Creates a failed fix result.
    pub fn failure(message: impl Into<String>) -> Self {
        Self {
            success: false,
            message: message.into(),
            steps: Vec::new(),
            fixable: true,
            timestamp: Utc::now(),
        }
    }

    // DRY:FN:not_fixable
    /// Creates a not-fixable result.
    pub fn not_fixable() -> Self {
        Self {
            success: false,
            message: "This issue cannot be automatically fixed".to_string(),
            steps: Vec::new(),
            fixable: false,
            timestamp: Utc::now(),
        }
    }

    // DRY:FN:with_step
    /// Adds a step to the fix result.
    pub fn with_step(mut self, step: impl Into<String>) -> Self {
        self.steps.push(step.into());
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_check_result() {
        let result = CheckResult::pass("All checks passed").with_details("No issues found");

        assert!(result.passed);
        assert_eq!(result.message, "All checks passed");
        assert_eq!(result.details, Some("No issues found".to_string()));
    }

    #[test]
    fn test_check_result_fixable() {
        let result = CheckResult::fail("Check failed").with_fix();

        assert!(!result.passed);
        assert!(result.can_fix);
    }

    #[test]
    fn test_fix_result() {
        let result = FixResult::success("Fixed successfully")
            .with_step("Installed dependency")
            .with_step("Updated configuration");

        assert!(result.success);
        assert_eq!(result.steps.len(), 2);
    }

    #[test]
    fn test_fix_result_not_fixable() {
        let result = FixResult::not_fixable();

        assert!(!result.success);
        assert!(!result.fixable);
    }

    #[test]
    fn test_check_category_display() {
        assert_eq!(CheckCategory::Cli.to_string(), "CLI");
        assert_eq!(CheckCategory::Git.to_string(), "Git");
        assert_eq!(CheckCategory::Config.to_string(), "Configuration");
    }
}
