//! Built-in health checks

pub mod cli_checks;
pub mod config_checks;
pub mod git_checks;
pub mod project_checks;
pub mod runtime_check;
pub mod secrets_check;
pub mod usage_check;

// Missing checks ported from TypeScript
pub mod platform_compatibility_check;
pub mod playwright_check;
pub mod wiring_check;
