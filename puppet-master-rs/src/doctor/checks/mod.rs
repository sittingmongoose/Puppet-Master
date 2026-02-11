//! Built-in health checks

pub mod cli_checks;
pub mod git_checks;
pub mod project_checks;
pub mod config_checks;
pub mod usage_check;
pub mod secrets_check;
pub mod runtime_check;

// Missing checks ported from TypeScript
pub mod playwright_check;
pub mod platform_compatibility_check;
pub mod wiring_check;
