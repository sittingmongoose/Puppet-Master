//! Configuration modules
//!
//! Configuration management, validation, and secrets handling.

pub mod config_manager;
pub mod config_override;
pub mod config_schema;
pub mod default_config;
pub mod gui_config;
pub mod secrets_manager;

pub use config_manager::ConfigManager;
pub use config_override::{
    BudgetOverride, ConfigOverride, LoggingOverride, PlatformOverride, StartChainOverride,
    TierOverride, ValidatorOverride, VerificationOverride, apply_overrides,
};
pub use config_schema::validate_config;
pub use default_config::default_config;
pub use gui_config::{GitInfo, GuiConfig};
pub use secrets_manager::SecretsManager;
