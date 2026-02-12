//! Platform secrets and environment variable checks
//!
//! Validates that required secrets/environment variables are set for each platform.

use crate::types::{CheckCategory, CheckResult, DoctorCheck, FixResult, Platform};
use async_trait::async_trait;
use chrono::Utc;
use log::debug;
use std::env;

/// Validates that required secrets/env vars are set for each platform
pub struct SecretsCheck;

impl SecretsCheck {
    pub fn new() -> Self {
        Self
    }

    /// Check all platforms
    pub fn check_all(&self) -> Vec<SecretCheckResult> {
        Platform::all()
            .iter()
            .map(|platform| self.check_platform(*platform))
            .collect()
    }

    /// Check secrets for a specific platform
    pub fn check_platform(&self, platform: Platform) -> SecretCheckResult {
        debug!("Checking secrets for platform: {}", platform);

        let env_vars = match platform {
            Platform::Cursor => vec![EnvVarStatus {
                name: "CURSOR_API_KEY".to_string(),
                set: env::var("CURSOR_API_KEY").is_ok(),
                required: false,
                description: "API key for headless Cursor operations".to_string(),
            }],
            Platform::Codex => vec![EnvVarStatus {
                name: "CODEX_API_KEY".to_string(),
                set: env::var("CODEX_API_KEY").is_ok(),
                required: false,
                description: "API key for Codex CLI in CI environments".to_string(),
            }],
            Platform::Claude => vec![EnvVarStatus {
                name: "ANTHROPIC_API_KEY".to_string(),
                set: env::var("ANTHROPIC_API_KEY").is_ok(),
                required: false,
                description: "API key for Claude Admin API access".to_string(),
            }],
            Platform::Gemini => vec![
                EnvVarStatus {
                    name: "GEMINI_API_KEY".to_string(),
                    set: env::var("GEMINI_API_KEY").is_ok(),
                    required: false,
                    description: "API key for Google Gemini".to_string(),
                },
                EnvVarStatus {
                    name: "GOOGLE_API_KEY".to_string(),
                    set: env::var("GOOGLE_API_KEY").is_ok(),
                    required: false,
                    description: "Alternative API key for Google Gemini".to_string(),
                },
                EnvVarStatus {
                    name: "GOOGLE_CLOUD_PROJECT".to_string(),
                    set: env::var("GOOGLE_CLOUD_PROJECT").is_ok(),
                    required: false,
                    description: "Google Cloud project ID for Vertex AI".to_string(),
                },
            ],
            Platform::Copilot => vec![
                EnvVarStatus {
                    name: "GH_TOKEN".to_string(),
                    set: env::var("GH_TOKEN").is_ok(),
                    required: false,
                    description: "GitHub token for Copilot in CI".to_string(),
                },
                EnvVarStatus {
                    name: "GITHUB_TOKEN".to_string(),
                    set: env::var("GITHUB_TOKEN").is_ok(),
                    required: false,
                    description: "Alternative GitHub token for Copilot".to_string(),
                },
            ],
        };

        let overall_status = Self::determine_status(&env_vars);

        SecretCheckResult {
            platform,
            env_vars,
            _overall_status: overall_status,
        }
    }

    /// Determine overall status from environment variable statuses
    fn determine_status(env_vars: &[EnvVarStatus]) -> SecretStatus {
        let required_missing = env_vars.iter().any(|var| var.required && !var.set);
        let optional_missing = env_vars.iter().any(|var| !var.required && !var.set);

        if required_missing {
            SecretStatus::RequiredMissing
        } else if optional_missing {
            SecretStatus::OptionalMissing
        } else {
            SecretStatus::AllSet
        }
    }
}

impl Default for SecretsCheck {
    fn default() -> Self {
        Self::new()
    }
}

/// Result of checking secrets for a platform
#[derive(Debug, Clone)]
pub struct SecretCheckResult {
    pub platform: Platform,
    pub env_vars: Vec<EnvVarStatus>,
    pub _overall_status: SecretStatus,
}

/// Status of an environment variable
#[derive(Debug, Clone)]
pub struct EnvVarStatus {
    pub name: String,
    pub set: bool,
    pub required: bool,
    pub description: String,
}

/// Overall status of secrets for a platform
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SecretStatus {
    /// All secrets (required and optional) are set
    AllSet,
    /// Optional secrets are missing
    OptionalMissing,
    /// Required secrets are missing
    RequiredMissing,
}

impl SecretStatus {
    /// Check if this status indicates a problem
        #[allow(dead_code)]
    pub fn is_problem(&self) -> bool {
        matches!(self, Self::RequiredMissing)
    }
}

#[async_trait]
impl DoctorCheck for SecretsCheck {
    fn name(&self) -> &str {
        "platform-secrets"
    }

    fn category(&self) -> CheckCategory {
        CheckCategory::Environment
    }

    fn description(&self) -> &str {
        "Check that required environment variables and secrets are set for each platform"
    }

    async fn run(&self) -> CheckResult {
        let results = self.check_all();

        let mut has_required_missing = false;
        let mut has_optional_missing = false;
        let mut messages = Vec::new();

        for result in &results {
            let mut platform_messages = Vec::new();

            for var in &result.env_vars {
                if var.required && !var.set {
                    has_required_missing = true;
                    platform_messages.push(format!("  [X] {} (required): {}", var.name, var.description));
                } else if !var.set {
                    has_optional_missing = true;
                    platform_messages.push(format!("  [WARN]  {} (optional): {}", var.name, var.description));
                } else {
                    platform_messages.push(format!("  [OK] {} is set", var.name));
                }
            }

            if !platform_messages.is_empty() {
                messages.push(format!("{}:", result.platform));
                messages.extend(platform_messages);
            }
        }

        if has_required_missing {
            CheckResult {
                passed: false,
                message: "Required environment variables are missing".to_string(),
                details: Some(messages.join("\n")),
                can_fix: false,
                timestamp: Utc::now(),
            }
        } else if has_optional_missing {
            CheckResult {
                passed: true,
                message: "Optional environment variables missing (non-critical)".to_string(),
                details: Some(messages.join("\n")),
                can_fix: false,
                timestamp: Utc::now(),
            }
        } else {
            CheckResult {
                passed: true,
                message: "All platform environment variables are set".to_string(),
                details: Some(messages.join("\n")),
                can_fix: false,
                timestamp: Utc::now(),
            }
        }
    }

    async fn fix(&self, _dry_run: bool) -> Option<FixResult> {
        // Environment variables must be set by the user
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_secret_status_is_problem() {
        assert!(!SecretStatus::AllSet.is_problem());
        assert!(!SecretStatus::OptionalMissing.is_problem());
        assert!(SecretStatus::RequiredMissing.is_problem());
    }

    #[test]
    fn test_check_platform() {
        let check = SecretsCheck::new();
        let result = check.check_platform(Platform::Cursor);
        assert_eq!(result.platform, Platform::Cursor);
        assert!(!result.env_vars.is_empty());
    }

    #[test]
    fn test_check_all() {
        let check = SecretsCheck::new();
        let results = check.check_all();
        assert_eq!(results.len(), Platform::all().len());
    }

    #[tokio::test]
    async fn test_doctor_check_run() {
        let check = SecretsCheck::new();
        let result = check.run().await;
        // Should pass since all vars are optional
        assert!(result.passed);
    }

    #[test]
    fn test_determine_status() {
        let all_set = vec![
            EnvVarStatus {
                name: "VAR1".to_string(),
                set: true,
                required: true,
                description: "Test".to_string(),
            },
            EnvVarStatus {
                name: "VAR2".to_string(),
                set: true,
                required: false,
                description: "Test".to_string(),
            },
        ];
        assert_eq!(
            SecretsCheck::determine_status(&all_set),
            SecretStatus::AllSet
        );

        let optional_missing = vec![
            EnvVarStatus {
                name: "VAR1".to_string(),
                set: true,
                required: true,
                description: "Test".to_string(),
            },
            EnvVarStatus {
                name: "VAR2".to_string(),
                set: false,
                required: false,
                description: "Test".to_string(),
            },
        ];
        assert_eq!(
            SecretsCheck::determine_status(&optional_missing),
            SecretStatus::OptionalMissing
        );

        let required_missing = vec![EnvVarStatus {
            name: "VAR1".to_string(),
            set: false,
            required: true,
            description: "Test".to_string(),
        }];
        assert_eq!(
            SecretsCheck::determine_status(&required_missing),
            SecretStatus::RequiredMissing
        );
    }
}
