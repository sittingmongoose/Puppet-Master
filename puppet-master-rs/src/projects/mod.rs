//! Projects module - Known projects management and persistence
//!
//! Provides storage and retrieval of known projects beyond naive filesystem scan.

pub mod persistence;
pub mod status;

pub use persistence::{KnownProject, ProjectsPersistence};
pub use status::{InterviewStatus, OrchestratorStatus, ProjectStatus, ProjectStatusInspector};
