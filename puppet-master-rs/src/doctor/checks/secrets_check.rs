//! Platform secrets and environment variable checks
//!
//! Validates optional environment overrides used by legacy headless/CI flows.
//! Primary auth policy is subscription/browser login.

use crate::platforms::platform_specs;
use crate::types::{CheckCategory, CheckResult, DoctorCheck, FixResult, Platform};
use async_trait::async_trait;
use chrono::Utc;
use log::debug;
use std::env;

// DRY:DATA:SecretsCheck
/// Validates that required secrets/env vars are set for each platform
pub struct SecretsCheck;

impl SecretsCheck {
    // DRY:FN:new
    pub fn new() -> Self {
        Self
    }

    // DRY:FN:check_all
    /// Check all platforms
    pub fn check_all(&self) -> Vec<SecretCheckResult> {
        Platform::all()
            .iter()
            .map(|platform| self.check_platform(*platform))
            .collect()
    }

    // DRY:FN:check_platform
    /// Check secrets for a specific platform
    pub fn check_platform(&self, platform: Platform) -> SecretCheckResult {
        debug!("Checking secrets for platform: {}", platform);
        let auth_hint = Self::preferred_auth_hint(platform);
        let env_vars = Self::legacy_override_env_vars(platform)
            .iter()
            .map(|name| {
                let description = if *name == "GOOGLE_CLOUD_PROJECT" {
                    "Optional Gemini Vertex AI project identifier for CI/headless runs".to_string()
                } else {
                    format!("Optional legacy override; preferred auth: {auth_hint}")
                };
                EnvVarStatus {
                    name: (*name).to_string(),
                    set: env::var(name)
                        .map(|v| !v.trim().is_empty())
                        .unwrap_or(false),
                    required: false,
                    description,
                }
            })
            .collect::<Vec<_>>();

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

    // DRY:FN:legacy_override_env_vars — optional legacy env vars retained for CI/headless compatibility.
    fn legacy_override_env_vars(platform: Platform) -> &'static [&'static str] {
        match platform {
            Platform::Cursor => &["CURSOR_API_KEY"],
            Platform::Codex => &["CODEX_API_KEY", "OPENAI_API_KEY"],
            Platform::Claude => &["ANTHROPIC_API_KEY"],
            Platform::Gemini => &["GEMINI_API_KEY", "GOOGLE_API_KEY", "GOOGLE_CLOUD_PROJECT"],
            Platform::Copilot => &["GH_TOKEN", "GITHUB_TOKEN"],
        }
    }

    fn preferred_auth_hint(platform: Platform) -> String {
        let spec = platform_specs::get_spec(platform);
        if let Some(login_cmd) = spec.auth.login_command {
            if spec.auth.login_args.is_empty() {
                return format!("browser login via `{login_cmd}`");
            }
            return format!(
                "browser login via `{}`",
                std::iter::once(login_cmd)
                    .chain(spec.auth.login_args.iter().copied())
                    .collect::<Vec<_>>()
                    .join(" ")
            );
        }
        format!("interactive browser login in {}", spec.display_name)
    }
}

impl Default for SecretsCheck {
    fn default() -> Self {
        Self::new()
    }
}

// DRY:DATA:SecretCheckResult
/// Result of checking secrets for a platform
#[derive(Debug, Clone)]
pub struct SecretCheckResult {
    pub platform: Platform,
    pub env_vars: Vec<EnvVarStatus>,
    pub _overall_status: SecretStatus,
}

// DRY:DATA:EnvVarStatus
/// Status of an environment variable
#[derive(Debug, Clone)]
pub struct EnvVarStatus {
    pub name: String,
    pub set: bool,
    pub required: bool,
    pub description: String,
}

// DRY:DATA:SecretStatus
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
    // DRY:FN:is_problem
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
        "Check optional legacy environment overrides; subscription/browser auth is preferred"
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
                    platform_messages.push(format!(
                        "  [X] {} (required): {}",
                        var.name, var.description
                    ));
                } else if !var.set {
                    has_optional_missing = true;
                    platform_messages.push(format!(
                        "  [WARN]  {} (optional): {}",
                        var.name, var.description
                    ));
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
                message:
                    "Optional legacy env overrides missing (non-critical; browser auth preferred)"
                        .to_string(),
                details: Some(messages.join("\n")),
                can_fix: false,
                timestamp: Utc::now(),
            }
        } else {
            CheckResult {
                passed: true,
                message: "Optional legacy env overrides are configured".to_string(),
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
