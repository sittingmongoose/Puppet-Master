//! Doctor module - System health checks and fixes
//!
//! Provides pluggable health check system for validating:
//! - CLI availability and versions
//! - Git configuration
//! - Runtime environment
//! - Project structure
//! - Network connectivity

mod check_registry;
mod checks;
mod doctor_reporter;
mod installation_manager;

pub use check_registry::{CheckRegistry, DoctorReport};
pub use doctor_reporter::DoctorReporter;
pub use installation_manager::{
    InstallResult, InstallationManager, InstallationStatus, OperatingSystem,
};

// Re-export check types
pub use crate::types::{CheckCategory, CheckResult, DoctorCheck, FixResult};
