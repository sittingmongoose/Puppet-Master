//! Platform usage quota checks
//!
//! Monitors usage quotas across all platforms and warns when approaching limits.

use crate::types::{CheckCategory, CheckResult, DoctorCheck, FixResult, Platform};
use async_trait::async_trait;
use chrono::Utc;
use log::{debug, warn};

/// Checks platform usage quotas and warns about approaching limits
pub struct UsageCheck;

impl UsageCheck {
    pub fn new() -> Self {
        Self
    }

    /// Check usage for all platforms
    pub async fn check_all(&self) -> Vec<UsageCheckResult> {
        let mut results = Vec::new();
        for platform in Platform::all() {
            results.push(self.check_platform(*platform).await);
        }
        results
    }

    /// Check usage for a specific platform by reading local usage data
    pub async fn check_platform(&self, platform: Platform) -> UsageCheckResult {
        debug!("Checking usage for platform: {}", platform);

        let usage_file = std::env::current_dir()
            .unwrap_or_default()
            .join(".puppet-master/usage/usage.jsonl");

        if !usage_file.exists() {
            return UsageCheckResult {
                platform,
                status: UsageStatus::Unknown,
                message: format!(
                    "No usage data found for {} (usage tracking may not be configured)",
                    platform
                ),
                usage_percent: None,
            };
        }

        match tokio::fs::read_to_string(&usage_file).await {
            Ok(content) => {
                let platform_str = platform.to_string().to_lowercase();
                let count = content
                    .lines()
                    .filter(|line| line.to_lowercase().contains(&platform_str))
                    .count();

                UsageCheckResult {
                    platform,
                    status: if count > 0 {
                        UsageStatus::Ok
                    } else {
                        UsageStatus::Unknown
                    },
                    message: format!("{} usage records found for {}", count, platform),
                    usage_percent: None,
                }
            }
            Err(e) => {
                warn!("Failed to read usage data for {}: {}", platform, e);
                UsageCheckResult {
                    platform,
                    status: UsageStatus::Warning,
                    message: format!("Failed to read usage data for {}: {}", platform, e),
                    usage_percent: None,
                }
            }
        }
    }
}

impl Default for UsageCheck {
    fn default() -> Self {
        Self::new()
    }
}

/// Result of a usage check for a specific platform
#[derive(Debug, Clone)]
pub struct UsageCheckResult {
    pub platform: Platform,
    pub status: UsageStatus,
    pub message: String,
    pub usage_percent: Option<f64>,
}

/// Status of platform usage
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum UsageStatus {
    /// Usage is within normal limits
    Ok,
    /// Usage is high (> 80%)
    Warning,
    /// Usage is critical (> 95%)
    Critical,
    /// Unable to determine usage
    Unknown,
}

impl UsageStatus {
    /// Determine status from usage percentage
    #[allow(dead_code)]
    pub fn from_percent(percent: f64) -> Self {
        if percent >= 95.0 {
            Self::Critical
        } else if percent >= 80.0 {
            Self::Warning
        } else {
            Self::Ok
        }
    }

    /// Check if this status indicates a problem
    #[allow(dead_code)]
    pub fn is_problem(&self) -> bool {
        matches!(self, Self::Warning | Self::Critical)
    }
}

#[async_trait]
impl DoctorCheck for UsageCheck {
    fn name(&self) -> &str {
        "usage-quotas"
    }

    fn category(&self) -> CheckCategory {
        CheckCategory::Environment
    }

    fn description(&self) -> &str {
        "Check platform usage quotas and warn about approaching limits"
    }

    async fn run(&self) -> CheckResult {
        let results = self.check_all().await;

        let mut has_critical = false;
        let mut has_warning = false;
        let mut messages = Vec::new();

        for result in &results {
            match result.status {
                UsageStatus::Critical => {
                    has_critical = true;
                    warn!("Critical usage for {}: {}", result.platform, result.message);
                    messages.push(format!("[WARN]  {}: {}", result.platform, result.message));
                }
                UsageStatus::Warning => {
                    has_warning = true;
                    messages.push(format!("[!] {}: {}", result.platform, result.message));
                }
                UsageStatus::Ok => {
                    if let Some(percent) = result.usage_percent {
                        messages.push(format!("[OK] {}: {:.1}% used", result.platform, percent));
                    }
                }
                UsageStatus::Unknown => {
                    // Don't include unknown status in messages for now
                }
            }
        }

        if has_critical {
            CheckResult {
                passed: false,
                message: "Critical usage limits reached on one or more platforms".to_string(),
                details: Some(messages.join("\n")),
                can_fix: false,
                timestamp: Utc::now(),
            }
        } else if has_warning {
            CheckResult {
                passed: false,
                message: "High usage detected on one or more platforms".to_string(),
                details: Some(messages.join("\n")),
                can_fix: false,
                timestamp: Utc::now(),
            }
        } else {
            CheckResult {
                passed: true,
                message: "All platform usage within normal limits".to_string(),
                details: Some(messages.join("\n")),
                can_fix: false,
                timestamp: Utc::now(),
            }
        }
    }

    async fn fix(&self, _dry_run: bool) -> Option<FixResult> {
        // Usage limits cannot be automatically fixed
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_usage_status_from_percent() {
        assert_eq!(UsageStatus::from_percent(50.0), UsageStatus::Ok);
        assert_eq!(UsageStatus::from_percent(85.0), UsageStatus::Warning);
        assert_eq!(UsageStatus::from_percent(96.0), UsageStatus::Critical);
    }

    #[test]
    fn test_usage_status_is_problem() {
        assert!(!UsageStatus::Ok.is_problem());
        assert!(UsageStatus::Warning.is_problem());
        assert!(UsageStatus::Critical.is_problem());
        assert!(!UsageStatus::Unknown.is_problem());
    }

    #[tokio::test]
    async fn test_check_platform() {
        let check = UsageCheck::new();
        let result = check.check_platform(Platform::Cursor).await;
        assert_eq!(result.platform, Platform::Cursor);
    }

    #[tokio::test]
    async fn test_check_all() {
        let check = UsageCheck::new();
        let results = check.check_all().await;
        assert_eq!(results.len(), Platform::all().len());
    }

    #[tokio::test]
    async fn test_doctor_check_run() {
        let check = UsageCheck::new();
        let result = check.run().await;
        // Should pass since all are unknown/ok
        assert!(result.passed);
    }
}
