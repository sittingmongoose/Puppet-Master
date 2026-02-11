//! Configuration modules
//!
//! Configuration management, validation, and secrets handling.

pub mod config_manager;
pub mod config_schema;
pub mod default_config;
pub mod secrets_manager;
pub mod config_override;

pub use config_manager::ConfigManager;
pub use config_schema::validate_config;
pub use default_config::default_config;
pub use secrets_manager::SecretsManager;
pub use config_override::{
    ConfigOverride, StartChainOverride, PlatformOverride, TierOverride,
    BudgetOverride, LoggingOverride, VerificationOverride, ValidatorOverride,
    apply_overrides,
};
